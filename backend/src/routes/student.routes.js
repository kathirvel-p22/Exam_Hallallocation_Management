// src/routes/student.routes.js
const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(authenticate);

// GET /api/students — list students (admin/invigilator)
router.get('/', authorize('EXAM_ADMIN', 'SUPER_ADMIN', 'INVIGILATOR'), async (req, res) => {
  const { page = 1, limit = 50, search, departmentId, semester } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    user: { institutionId: req.user.institutionId },
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { registerNo: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(departmentId && { departmentId }),
    ...(semester && { semester: Number(semester) }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where, skip, take: Number(limit),
      include: { department: { select: { name: true, code: true } }, user: { select: { email: true } } },
      orderBy: { registerNo: 'asc' },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({ success: true, data: students, meta: { total, page: Number(page), limit: Number(limit) } });
});

// GET /api/students/:id
router.get('/:id', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      department: true,
      user: { select: { email: true } },
      allocations: { include: { exam: true, hall: true, seat: true, attendance: true }, orderBy: { exam: { date: 'desc' } }, take: 10 },
    },
  });
  if (!student) throw new ApiError(404, 'Student not found');
  res.json({ success: true, data: student });
});

// GET /api/students/me/profile — student's own profile
router.get('/me/profile', authorize('STUDENT'), async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.user.student?.id },
    include: {
      department: true,
      user: { select: { email: true } },
      allocations: {
        include: {
          exam: true,
          hall: { include: { duties: { include: { invigilator: { select: { name: true, phone: true, staffId: true, department: { select: { name: true } } } } } } } },
          seat: true,
          attendance: true,
          hallTickets: { select: { qrToken: true, issuedAt: true, expiresAt: true, isRevoked: true } },
        },
        orderBy: { exam: { date: 'asc' } },
      },
    },
  });
  res.json({ success: true, data: student });
});

// POST /api/students/import — bulk import via JSON array
router.post('/import', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0) throw new ApiError(400, 'students array required');

  const bcrypt = require('bcryptjs');
  const results = { created: 0, skipped: 0, errors: [] };

  for (const s of students) {
    try {
      const existing = await prisma.student.findUnique({ where: { registerNo: s.registerNo } });
      if (existing) { results.skipped++; continue; }

      const dept = await prisma.department.findFirst({ where: { code: s.deptCode, institutionId: req.user.institutionId } });
      if (!dept) { results.errors.push({ registerNo: s.registerNo, error: `Dept ${s.deptCode} not found` }); continue; }

      const user = await prisma.user.create({
        data: {
          email: s.email,
          passwordHash: await bcrypt.hash(s.password || 'Student@2025', 12),
          role: 'STUDENT',
          institutionId: req.user.institutionId,
        },
      });
      await prisma.student.create({
        data: {
          userId: user.id, registerNo: s.registerNo, name: s.name,
          semester: Number(s.semester), academicYear: s.academicYear || '2024-25',
          level: s.level || 'UG', departmentId: dept.id,
          hasDisability: s.hasDisability || false,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push({ registerNo: s.registerNo, error: err.message });
    }
  }

  res.json({ success: true, message: `Import complete: ${results.created} created, ${results.skipped} skipped`, data: results });
});

// PATCH /api/students/:id — update student
router.patch('/:id', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const student = await prisma.student.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: student });
});

module.exports = router;
