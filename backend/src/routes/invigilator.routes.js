// src/routes/invigilator.routes.js
const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(authenticate);

// GET /api/invigilators
router.get('/', authorize('EXAM_ADMIN', 'SUPER_ADMIN', 'INVIGILATOR'), async (req, res) => {
  const where = { user: { institutionId: req.user.institutionId } };
  const invigs = await prisma.invigilator.findMany({
    where,
    include: {
      department: { select: { name: true, code: true } },
      user: { select: { email: true } },
      duties: {
        where: { exam: { status: { in: ['PUBLISHED', 'ONGOING'] } } },
        include: { hall: { select: { name: true } }, exam: { select: { subjectName: true, date: true, status: true } } },
        take: 3,
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: invigs });
});

// GET /api/invigilators/me — invigilator's own profile + duties
router.get('/me', authorize('INVIGILATOR'), async (req, res) => {
  const invig = await prisma.invigilator.findUnique({
    where: { id: req.user.invigilator?.id },
    include: {
      department: true,
      user: { select: { email: true } },
      duties: {
        include: {
          exam: true,
          hall: { include: { seats: { take: 10 } } },
        },
        orderBy: { exam: { date: 'asc' } },
      },
    },
  });
  res.json({ success: true, data: invig });
});

// POST /api/invigilators/assign — assign invigilator to exam+hall
router.post('/assign', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { invigilatorId, examId, hallId } = req.body;
  const duty = await prisma.invigDuty.upsert({
    where: { invigilatorId_examId: { invigilatorId, examId } },
    update: { hallId },
    create: { invigilatorId, examId, hallId },
    include: { invigilator: true, hall: true, exam: true },
  });
  res.json({ success: true, message: 'Invigilator assigned', data: duty });
});

// PATCH /api/invigilators/checkin — check in for duty
router.patch('/checkin', authorize('INVIGILATOR'), async (req, res) => {
  const { dutyId } = req.body;
  const duty = await prisma.invigDuty.update({
    where: { id: dutyId },
    data: { checkInAt: new Date(), isConfirmed: true },
  });
  req.io.to('role:EXAM_ADMIN').emit('invigilator:checkin', { dutyId, invigilatorId: req.user.invigilator?.id, time: new Date() });
  res.json({ success: true, message: 'Checked in', data: duty });
});

// PATCH /api/invigilators/checkout
router.patch('/checkout', authorize('INVIGILATOR'), async (req, res) => {
  const { dutyId } = req.body;
  const duty = await prisma.invigDuty.update({ where: { id: dutyId }, data: { checkOutAt: new Date() } });
  res.json({ success: true, data: duty });
});

// POST /api/invigilators/issue — report exam issue
router.post('/issue', authorize('INVIGILATOR'), async (req, res) => {
  const { examId, type, severity, description, studentRegNo } = req.body;
  const issue = await prisma.examIssue.create({
    data: {
      examId,
      invigilatorId: req.user.invigilator?.id,
      type,
      severity: severity || 'MEDIUM',
      description,
      studentRegNo,
    },
  });
  req.io.to('role:EXAM_ADMIN').to('role:SUPER_ADMIN').emit('issue:new', { issue, reportedAt: new Date() });
  res.status(201).json({ success: true, message: 'Issue reported', data: issue });
});

// GET /api/invigilators/issues
router.get('/issues', authorize('EXAM_ADMIN', 'SUPER_ADMIN', 'INVIGILATOR'), async (req, res) => {
  const where = req.user.role === 'INVIGILATOR'
    ? { invigilatorId: req.user.invigilator?.id }
    : {};
  const issues = await prisma.examIssue.findMany({
    where,
    include: { exam: { select: { subjectName: true } }, invigilator: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: issues });
});

// PATCH /api/invigilators/issues/:id/resolve
router.patch('/issues/:id/resolve', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { resolutionNote } = req.body;
  const issue = await prisma.examIssue.update({
    where: { id: req.params.id },
    data: { status: 'RESOLVED', resolvedById: req.user.id, resolvedAt: new Date(), resolutionNote },
  });
  res.json({ success: true, data: issue });
});

module.exports = router;
