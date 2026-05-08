// src/middleware/validate.js — Zod schema validation middleware
const { z } = require('zod');
const { ApiError } = require('./errorHandler');

const validate = (schema) => async (req, _res, next) => {
  try {
    const result = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = result.body || req.body;
    req.query = result.query || req.query;
    req.params = result.params || req.params;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new ApiError(400, 'Validation failed', err.errors.map(e => ({
        field: e.path.slice(1).join('.'),
        message: e.message,
      }))));
    } else {
      next(err);
    }
  }
};

// ── Common Schemas ───────────────────────────────────────────
const schemas = {
  login: z.object({
    body: z.object({
      email: z.string().email('Valid email required'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),
  signup: z.object({
    body: z.object({
      email: z.string().email('Valid email required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      role: z.enum(['STUDENT', 'INVIGILATOR']).default('STUDENT'),
    }),
  }),
  createExam: z.object({
    body: z.object({
      subjectName: z.string().min(2).max(200),
      subjectCode: z.string().min(2).max(20),
      date: z.string().datetime(),
      shift: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM'),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM'),
      durationMins: z.number().min(30).max(360).default(180),
      semester: z.number().min(1).max(10),
      academicYear: z.string().regex(/^\d{4}-\d{2}$/),
      level: z.enum(['UG', 'PG', 'PHD']).default('UG'),
      departmentIds: z.array(z.string()).min(1, 'At least one department required'),
      notes: z.string().max(1000).optional(),
    }),
  }),
  runAllocation: z.object({
    body: z.object({
      examId: z.string().cuid(),
      hallIds: z.array(z.string().cuid()).min(1),
      mixDepartments: z.boolean().default(true),
      reserveFrontForDisabled: z.boolean().default(true),
      sendNotifications: z.boolean().default(true),
    }),
  }),
  scanQR: z.object({
    body: z.object({
      qrToken: z.string().min(10),
      hallId: z.string().cuid(),
    }),
  }),
  createNotification: z.object({
    body: z.object({
      title: z.string().min(2).max(200),
      message: z.string().min(5).max(2000),
      type: z.enum(['ALLOCATION_PUBLISHED', 'EXAM_REMINDER', 'VENUE_CHANGE', 'ATTENDANCE_ALERT', 'GENERAL', 'URGENT']),
      channel: z.enum(['IN_APP', 'EMAIL', 'PUSH', 'ALL']).default('ALL'),
      targetRole: z.enum(['ALL', 'STUDENT', 'INVIGILATOR', 'EXAM_ADMIN']).default('ALL'),
      examId: z.string().cuid().optional(),
    }),
  }),
  paginationQuery: z.object({
    query: z.object({
      page: z.string().transform(Number).default('1'),
      limit: z.string().transform(Number).default('20'),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }),
  }),
};

module.exports = { validate, schemas };
