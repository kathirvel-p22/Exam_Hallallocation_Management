// Institution and branding management routes
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// GET /api/institutions - Get all institutions (Super Admin and Exam Admin)
router.get('/', 
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  async (req, res) => {
    try {
      const institutions = await prisma.institution.findMany({
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              exams: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: institutions
      });
    } catch (error) {
      logger.error('Error fetching institutions:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch institutions' }
      });
    }
  }
);

// GET /api/institutions/:id - Get specific institution
router.get('/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const institution = await prisma.institution.findUnique({
        where: { id: req.params.id },
        include: {
          departments: {
            include: {
              _count: {
                select: {
                  students: true,
                  invigilators: true
                }
              }
            }
          },
          _count: {
            select: {
              users: true,
              exams: true,
              halls: true
            }
          }
        }
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      res.json({
        success: true,
        data: institution
      });
    } catch (error) {
      logger.error('Error fetching institution:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch institution' }
      });
    }
  }
);

// POST /api/institutions - Create new institution (Super Admin and Exam Admin)
router.post('/',
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  [
    body('name').isString().isLength({ min: 2, max: 100 }).trim(),
    body('code').isString().isLength({ min: 2, max: 10 }).trim(),
    body('address').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('website').optional().isURL(),
    body('branding').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, code, address, phone, email, website, branding } = req.body;

      // Check if institution code already exists
      const existingInstitution = await prisma.institution.findUnique({
        where: { code }
      });

      if (existingInstitution) {
        return res.status(400).json({
          success: false,
          error: { message: 'Institution code already exists' }
        });
      }

      const institution = await prisma.institution.create({
        data: {
          name,
          code,
          address,
          phone,
          email,
          website,
          branding: branding ? JSON.stringify(branding) : null
        }
      });

      logger.info(`Institution created: ${institution.name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Institution created successfully',
        data: institution
      });

      // Emit real-time event to Super Admins
      if (req.io) {
        const { broadcastSystemWide } = require('../sockets/socketManager');
        broadcastSystemWide(req.io, 'institution:created', {
          id: institution.id,
          name: institution.name,
          code: institution.code,
          createdBy: req.user.email
        });
      }
    } catch (error) {
      logger.error('Error creating institution:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create institution' }
      });
    }
  }
);

// PUT /api/institutions/:id - Update institution
router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString().isLength({ min: 2, max: 100 }).trim(),
    body('code').optional().isString().isLength({ min: 2, max: 10 }).trim(),
    body('address').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('website').optional().isURL(),
    body('branding').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // If branding is provided, stringify it
      if (updates.branding) {
        updates.branding = JSON.stringify(updates.branding);
      }

      const institution = await prisma.institution.update({
        where: { id },
        data: updates
      });

      logger.info(`Institution updated: ${institution.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Institution updated successfully',
        data: institution
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      logger.error('Error updating institution:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update institution' }
      });
    }
  }
);

// GET /api/institutions/:id/branding - Get institution branding
router.get('/:id/branding',
  authenticate,
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const institution = await prisma.institution.findUnique({
        where: { id: req.params.id },
        select: { branding: true, name: true, code: true }
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      let branding = null;
      if (institution.branding) {
        try {
          branding = JSON.parse(institution.branding);
        } catch (parseError) {
          logger.warn('Failed to parse institution branding:', parseError);
        }
      }

      res.json({
        success: true,
        data: {
          institution: {
            name: institution.name,
            code: institution.code
          },
          branding
        }
      });
    } catch (error) {
      logger.error('Error fetching institution branding:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch branding' }
      });
    }
  }
);

// PUT /api/institutions/:id/branding - Update institution branding
router.put('/:id/branding',
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  [
    param('id').isString().notEmpty(),
    body('branding').isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { branding } = req.body;

      const institution = await prisma.institution.update({
        where: { id },
        data: {
          branding: JSON.stringify(branding)
        }
      });

      logger.info(`Institution branding updated: ${institution.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Branding updated successfully',
        data: {
          branding: JSON.parse(institution.branding)
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      logger.error('Error updating institution branding:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update branding' }
      });
    }
  }
);

// GET /api/institutions/:id/analytics - Get institution analytics
router.get('/:id/analytics',
  authenticate,
  authorize('SUPER_ADMIN', 'EXAM_ADMIN'),
  [
    param('id').isString().notEmpty(),
    query('timeRange').optional().isIn(['24h', '7d', '30d', '90d'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const timeRange = req.query.timeRange || '30d';

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Get analytics data
      const [
        totalStudents,
        totalInvigilators,
        totalExams,
        totalHalls,
        recentExams,
        departmentStats
      ] = await Promise.all([
        prisma.student.count({
          where: { user: { institutionId: id } }
        }),
        prisma.invigilator.count({
          where: { user: { institutionId: id } }
        }),
        prisma.exam.count({
          where: { institutionId: id }
        }),
        prisma.hall.count({
          where: { institutionId: id }
        }),
        prisma.exam.findMany({
          where: {
            institutionId: id,
            createdAt: { gte: startDate }
          },
          include: {
            department: { select: { name: true } },
            _count: { select: { allocations: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.department.findMany({
          where: { institutionId: id },
          include: {
            _count: {
              select: {
                students: true,
                invigilators: true,
                exams: true
              }
            }
          }
        })
      ]);

      // Calculate attendance rate (mock calculation)
      const attendanceRate = 94.2; // In real app, calculate from actual attendance data

      const analytics = {
        overview: {
          totalStudents,
          totalInvigilators,
          totalExams,
          totalHalls,
          attendanceRate,
          timeRange
        },
        recentExams: recentExams.map(exam => ({
          id: exam.id,
          title: exam.title,
          department: exam.department.name,
          date: exam.date,
          allocations: exam._count.allocations,
          createdAt: exam.createdAt
        })),
        departmentStats: departmentStats.map(dept => ({
          name: dept.name,
          code: dept.code,
          students: dept._count.students,
          invigilators: dept._count.invigilators,
          exams: dept._count.exams
        }))
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error fetching institution analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch analytics' }
      });
    }
  }
);

// PATCH /api/institutions/:id/toggle - Toggle institution status (Super Admin only)
router.patch('/:id/toggle',
  authenticate,
  authorize('SUPER_ADMIN'),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get current status
      const institution = await prisma.institution.findUnique({
        where: { id },
        select: { isActive: true, name: true }
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      // Toggle status
      const updatedInstitution = await prisma.institution.update({
        where: { id },
        data: { isActive: !institution.isActive }
      });

      const action = updatedInstitution.isActive ? 'activated' : 'suspended';
      logger.info(`Institution ${action}: ${institution.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: `Institution ${action} successfully`,
        data: updatedInstitution
      });

      // Emit real-time event
      if (req.io) {
        const { broadcastSystemWide } = require('../sockets/socketManager');
        broadcastSystemWide(req.io, 'institution:status_changed', {
          id: updatedInstitution.id,
          name: institution.name,
          isActive: updatedInstitution.isActive,
          action,
          changedBy: req.user.email
        });
      }
    } catch (error) {
      logger.error('Error toggling institution status:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to toggle institution status' }
      });
    }
  }
);

// DELETE /api/institutions/:id - Delete institution (Super Admin only)
router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if institution has users
      const userCount = await prisma.user.count({
        where: { institutionId: id }
      });

      if (userCount > 0) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'Cannot delete institution with existing users',
            details: { userCount }
          }
        });
      }

      await prisma.institution.delete({
        where: { id }
      });

      logger.info(`Institution deleted: ${id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Institution deleted successfully'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Institution not found' }
        });
      }

      logger.error('Error deleting institution:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete institution' }
      });
    }
  }
);

module.exports = router;