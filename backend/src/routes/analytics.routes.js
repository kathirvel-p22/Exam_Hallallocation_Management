// src/routes/analytics.routes.js
const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { cache } = require('../config/redis');

const router = express.Router();
router.use(authenticate, authorize('EXAM_ADMIN', 'SUPER_ADMIN'));

// GET /api/analytics/dashboard — main admin dashboard stats
router.get('/dashboard', async (req, res) => {
  const cacheKey = `analytics:dashboard:${req.user.institutionId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json({ success: true, data: cached, cached: true });

  const institutionId = req.user.institutionId;

  const [
    totalExams, ongoingExams, totalStudents, totalHalls,
    totalInvigs, recentAllocations, attendanceSummary, hallUtilization,
  ] = await Promise.all([
    prisma.exam.count({ where: { institutionId } }),
    prisma.exam.count({ where: { institutionId, status: 'ONGOING' } }),
    prisma.student.count({ where: { user: { institutionId } } }),
    prisma.hall.count({ where: { institutionId, isActive: true } }),
    prisma.invigilator.count({ where: { user: { institutionId } } }),
    prisma.allocation.findMany({
      where: { exam: { institutionId } },
      include: { exam: { select: { subjectName: true, date: true, status: true } }, hall: { select: { name: true } } },
      orderBy: { allocatedAt: 'desc' },
      take: 5,
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      where: { exam: { institutionId } },
      _count: { status: true },
    }),
    prisma.hall.findMany({
      where: { institutionId, isActive: true },
      include: { _count: { select: { allocations: true } } },
    }),
  ]);

  const attStats = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
  attendanceSummary.forEach(s => { attStats[s.status] = s._count.status; });
  const attTotal = Object.values(attStats).reduce((a, b) => a + b, 0);

  const data = {
    kpis: {
      totalExams, ongoingExams, totalStudents, totalHalls,
      totalInvigs, attendanceRate: attTotal > 0 ? Math.round((attStats.PRESENT / attTotal) * 100) : 0,
    },
    attendance: { ...attStats, total: attTotal },
    recentAllocations,
    hallUtilization: hallUtilization.map(h => ({
      id: h.id, name: h.name,
      capacity: h.capacity, // Use hall capacity instead of seat count
      allocated: h._count.allocations,
      utilization: h.capacity > 0 ? Math.round((h._count.allocations / h.capacity) * 100) : 0,
    })),
  };

  await cache.set(cacheKey, data, 60); // cache 60s
  res.json({ success: true, data });
});

// GET /api/analytics/exam/:examId — detailed exam analytics
router.get('/exam/:examId', async (req, res) => {
  const examId = req.params.examId;

  const [exam, deptBreakdown, hallBreakdown, timelineData] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { allocations: true } } },
    }),
    prisma.attendance.groupBy({
      by: ['studentId'],
      where: { examId },
      _count: true,
    }),
    prisma.allocation.groupBy({
      by: ['hallId'],
      where: { examId },
      _count: { hallId: true },
    }),
    prisma.attendance.findMany({
      where: { examId, status: 'PRESENT' },
      orderBy: { markedAt: 'asc' },
      select: { markedAt: true },
      take: 200,
    }),
  ]);

  // Hall names
  const hallIds = hallBreakdown.map(h => h.hallId);
  const halls = await prisma.hall.findMany({ where: { id: { in: hallIds } }, select: { id: true, name: true } });
  const hallMap = Object.fromEntries(halls.map(h => [h.id, h.name]));

  // Department attendance - SQLite compatible
  const deptAttendance = await prisma.$queryRaw`
    SELECT d.name, d.code,
      COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) AS present,
      COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) AS absent,
      COUNT(*) AS total
    FROM Attendance a
    JOIN Student s ON a.studentId = s.id
    JOIN Department d ON s.departmentId = d.id
    WHERE a.examId = ${examId}
    GROUP BY d.id, d.name, d.code
    ORDER BY total DESC
  `;

  // Scan timeline (bucket by 5-min intervals)
  const timeline = {};
  timelineData.forEach(t => {
    if (!t.markedAt) return;
    const bucket = new Date(Math.floor(t.markedAt.getTime() / 300000) * 300000).toISOString();
    timeline[bucket] = (timeline[bucket] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      exam,
      deptAttendance,
      hallBreakdown: hallBreakdown.map(h => ({ hallId: h.hallId, hallName: hallMap[h.hallId], count: h._count.hallId })),
      scanTimeline: Object.entries(timeline).map(([time, count]) => ({ time, count })),
    },
  });
});

// GET /api/analytics/global — super admin cross-institution stats
router.get('/global', authorize('SUPER_ADMIN'), async (req, res) => {
  const [institutions, totalStudents, totalExams, totalAttendance] = await Promise.all([
    prisma.institution.findMany({
      include: {
        _count: { select: { halls: true, exams: true } },
        departments: { select: { id: true } },
      },
    }),
    prisma.student.count(),
    prisma.exam.count(),
    prisma.attendance.groupBy({ by: ['status'], _count: true }),
  ]);

  const attMap = Object.fromEntries(totalAttendance.map(a => [a.status, a._count]));
  const total = Object.values(attMap).reduce((a, b) => a + b, 0);

  res.json({
    success: true,
    data: {
      institutions,
      totals: { students: totalStudents, exams: totalExams, attendanceRate: total > 0 ? Math.round(((attMap.PRESENT || 0) / total) * 100) : 0 },
    },
  });
});

// GET /api/analytics/monthly — monthly trend data
router.get('/monthly', async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  // Monthly trend data - SQLite compatible
  const monthly = await prisma.$queryRaw`
    SELECT
      CAST(strftime('%m', e.date) AS INTEGER) AS month,
      COUNT(DISTINCT e.id) AS exams,
      COUNT(DISTINCT a.id) AS allocations,
      COUNT(DISTINCT CASE WHEN att.status = 'PRESENT' THEN att.id END) AS present,
      COUNT(DISTINCT att.id) AS total_att
    FROM Exam e
    LEFT JOIN Allocation a ON a.examId = e.id
    LEFT JOIN Attendance att ON att.examId = e.id
    WHERE e.institutionId = ${req.user.institutionId}
      AND strftime('%Y', e.date) = ${String(year)}
    GROUP BY strftime('%m', e.date)
    ORDER BY month
  `;

  res.json({ success: true, data: monthly });
});

module.exports = router;
