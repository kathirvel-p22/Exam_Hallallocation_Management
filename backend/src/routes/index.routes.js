// src/routes/index.routes.js — All API Routes
const express = require('express');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./auth.routes');
const examRoutes = require('./exam.routes');
const hallRoutes = require('./hall.routes');
const allocationRoutes = require('./allocation.routes');
const studentRoutes = require('./student.routes');
const invigilatorRoutes = require('./invigilator.routes');
const attendanceRoutes = require('./attendance.routes');
const notificationRoutes = require('./notification.routes');
const chatRoutes = require('./chat.routes');
const analyticsRoutes = require('./analytics.routes');
const institutionRoutes = require('./institution.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// ── Auth Rate Limiter ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
  standardHeaders: true,
});

// ── Routes ─────────────────────────────────────────────────
router.use('/auth', authLimiter, authRoutes);
router.use('/exams', examRoutes);
router.use('/halls', hallRoutes);
router.use('/allocation', allocationRoutes);
router.use('/students', studentRoutes);
router.use('/invigilators', invigilatorRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/institutions', institutionRoutes);
router.use('/users', userRoutes);

// ── API Info ───────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AcadeX API v2.0',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'GET  /api/exams',
      'POST /api/exams',
      'GET  /api/halls',
      'POST /api/allocation/run',
      'POST /api/attendance/scan',
      'GET  /api/analytics/dashboard',
      'POST /api/chat',
      'GET  /api/notifications',
      'GET  /api/users',
      'POST /api/users',
      'PUT  /api/users/:id',
      'DELETE /api/users/:id',
    ],
  });
});

module.exports = router;
