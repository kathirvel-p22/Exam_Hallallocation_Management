// Allocation engine routes
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');
const { runAllocation } = require('../services/allocationEngine');
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

// POST /api/allocation/run - Run allocation engine
router.post('/run',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    body('examId').isString().notEmpty(),
    body('hallIds').isArray().notEmpty(),
    body('mixDepartments').optional().isBoolean(),
    body('reserveFrontForDisabled').optional().isBoolean(),
    body('sendNotifications').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        examId,
        hallIds,
        mixDepartments = true,
        reserveFrontForDisabled = true,
        sendNotifications = true
      } = req.body;

      // Run allocation engine
      const result = await runAllocation(examId, hallIds, {
        mixDepartments,
        reserveFrontForDisabled,
        sendNotifications,
        createdByEmail: req.user.email
      }, req.io);

      res.json({
        success: true,
        message: 'Allocation completed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error running allocation:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to run allocation' }
      });
    }
  }
);

// GET /api/allocation/student/my - Get current student's allocation
router.get('/student/my',
  authenticate,
  authorize(['STUDENT']),
  async (req, res) => {
    try {
      const studentId = req.user.student?.id;
      if (!studentId) {
        return res.status(404).json({
          success: false,
          error: { message: 'Student profile not found' }
        });
      }

      const allocations = await prisma.allocation.findMany({
        where: { studentId },
        include: {
          exam: {
            select: {
              id: true,
              subjectName: true,
              subjectCode: true,
              date: true,
              startTime: true,
              endTime: true,
              status: true
            }
          },
          hall: {
            select: {
              id: true,
              name: true,
              code: true,
              building: true,
              floor: true
            }
          },
          seat: {
            select: {
              id: true,
              seatNumber: true,
              row: true,
              column: true
            }
          },
          hallTickets: {
            select: {
              id: true,
              qrToken: true,
              qrCodeUrl: true,
              issuedAt: true,
              expiresAt: true,
              isRevoked: true
            },
            take: 1
          }
        },
        orderBy: { exam: { date: 'desc' } }
      });

      res.json({
        success: true,
        data: allocations
      });
    } catch (error) {
      logger.error('Error fetching student allocation:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch allocation' }
      });
    }
  }
);

// GET /api/allocation/exam/:examId - Get all allocations for an exam
router.get('/exam/:examId',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  async (req, res) => {
    try {
      const { examId } = req.params;
      const { page = 1, limit = 50, hallId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const where = { examId };
      if (hallId) where.hallId = hallId;

      const [allocations, total] = await Promise.all([
        prisma.allocation.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                name: true,
                registerNo: true,
                department: { select: { name: true, code: true } }
              }
            },
            hall: {
              select: {
                id: true,
                name: true,
                code: true,
                building: true,
                floor: true
              }
            },
            seat: {
              select: {
                id: true,
                seatNumber: true,
                row: true,
                column: true
              }
            }
          },
          skip: offset,
          take: parseInt(limit),
          orderBy: { student: { name: 'asc' } }
        }),
        prisma.allocation.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          allocations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching exam allocations:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch allocations' }
      });
    }
  }
);

// DELETE /api/allocation/:id - Remove an allocation
router.delete('/:id',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  async (req, res) => {
    try {
      await prisma.allocation.delete({
        where: { id: req.params.id }
      });

      res.json({
        success: true,
        message: 'Allocation removed successfully'
      });
    } catch (error) {
      logger.error('Error deleting allocation:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete allocation' }
      });
    }
  }
);

module.exports = router;
