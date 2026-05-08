// src/routes/attendance.routes.js
const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate');
const { ApiError } = require('../middleware/errorHandler');
const { verifyQRToken } = require('../services/qrService');

const router = express.Router();
router.use(authenticate);

// POST /api/attendance/scan — QR code scan by invigilator
router.post('/scan', authorize('INVIGILATOR', 'EXAM_ADMIN'), validate(schemas.scanQR), async (req, res) => {
  const { qrToken, hallId } = req.body;

  // Verify JWT token
  const decoded = verifyQRToken(qrToken);

  // Verify hall matches
  if (decoded.hallId !== hallId) {
    throw new ApiError(400, `Student is not allocated to this hall. Their hall: ${decoded.hallId}`);
  }

  // Fetch allocation
  const allocation = await prisma.allocation.findUnique({
    where: { id: decoded.allocationId },
    include: { student: true, seat: true, hall: true },
  });

  if (!allocation) throw new ApiError(404, 'Allocation not found');

  // Check hall ticket revocation
  const ticket = await prisma.hallTicket.findFirst({
    where: { allocationId: decoded.allocationId },
  });
  if (ticket?.isRevoked) throw new ApiError(400, 'Hall ticket has been revoked');

  // Mark attendance
  const attendance = await prisma.attendance.upsert({
    where: { allocationId: decoded.allocationId },
    update: {
      status: 'PRESENT',
      markedAt: new Date(),
      markedById: req.user.id,
      method: 'QR_SCAN',
    },
    create: {
      allocationId: decoded.allocationId,
      studentId: allocation.studentId,
      examId: allocation.examId,
      status: 'PRESENT',
      markedAt: new Date(),
      markedById: req.user.id,
      method: 'QR_SCAN',
    },
  });

  // Emit real-time update
  req.io.to(`exam:${allocation.examId}`).emit('attendance:updated', {
    allocationId: allocation.id,
    examId: allocation.examId,
    studentId: allocation.studentId,
    studentName: allocation.student.name,
    seatNumber: allocation.seat.seatNumber,
    hallId: allocation.hallId,
    status: 'PRESENT',
    markedAt: attendance.markedAt,
  });

  res.json({
    success: true,
    message: 'Attendance marked successfully',
    data: {
      student: { name: allocation.student.name, registerNo: allocation.student.registerNo },
      seat: allocation.seat.seatNumber,
      hall: allocation.hall.name,
      status: 'PRESENT',
      markedAt: attendance.markedAt,
    },
  });
});

// POST /api/attendance/manual — manual mark by invigilator/admin
router.post('/manual', authorize('INVIGILATOR', 'EXAM_ADMIN'), async (req, res) => {
  const { allocationId, status, notes } = req.body;

  if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const allocation = await prisma.allocation.findUnique({ where: { id: allocationId }, include: { student: true } });
  if (!allocation) throw new ApiError(404, 'Allocation not found');

  const attendance = await prisma.attendance.upsert({
    where: { allocationId },
    update: { status, markedAt: new Date(), markedById: req.user.id, method: 'MANUAL', notes },
    create: { allocationId, studentId: allocation.studentId, examId: allocation.examId, status, markedAt: new Date(), markedById: req.user.id, method: 'MANUAL', notes },
  });

  req.io.to(`exam:${allocation.examId}`).emit('attendance:updated', {
    allocationId, examId: allocation.examId, status, markedAt: attendance.markedAt,
  });

  res.json({ success: true, message: 'Attendance updated', data: attendance });
});

// GET /api/attendance/exam/:examId — exam attendance summary
router.get('/exam/:examId', authorize('INVIGILATOR', 'EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { hallId } = req.query;

  const where = {
    examId: req.params.examId,
    ...(hallId && { allocation: { hallId } }),
  };

  const [attendance, stats] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        student: { include: { department: { select: { name: true, code: true } } } },
        allocation: { include: { seat: true, hall: { select: { name: true } } } },
      },
      orderBy: { allocation: { seat: { seatNumber: 'asc' } } },
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      where: { examId: req.params.examId },
      _count: { status: true },
    }),
  ]);

  const summary = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
  stats.forEach(s => {
    const key = s.status.toLowerCase();
    summary[key] = s._count.status;
    summary.total += s._count.status;
  });
  summary.rate = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;

  res.json({ success: true, data: { attendance, summary } });
});

// GET /api/attendance/student/my — student's own attendance
router.get('/student/my', authorize('STUDENT'), async (req, res) => {
  const attendance = await prisma.attendance.findMany({
    where: { studentId: req.user.student?.id },
    include: { allocation: { include: { exam: true, hall: true, seat: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: attendance });
});

module.exports = router;
