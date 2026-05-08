// Enhanced exam management routes with analytics
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

// GET /api/exams - Get all exams with filtering and pagination
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
    query('department').optional().isString(),
    query('search').optional().isString(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Build where clause
      const where = {
        institutionId: req.user.institutionId
      };

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.department) {
        where.departments = {
          some: {
            department: {
              code: req.query.department
            }
          }
        };
      }

      if (req.query.search) {
        where.OR = [
          { title: { contains: req.query.search, mode: 'insensitive' } },
          { subject: { contains: req.query.search, mode: 'insensitive' } }
        ];
      }

      if (req.query.dateFrom || req.query.dateTo) {
        where.date = {};
        if (req.query.dateFrom) {
          where.date.gte = new Date(req.query.dateFrom);
        }
        if (req.query.dateTo) {
          where.date.lte = new Date(req.query.dateTo);
        }
      }

      const [exams, totalCount] = await Promise.all([
        prisma.exam.findMany({
          where,
          include: {
            departments: {
              include: {
                department: { select: { name: true, code: true } }
              }
            },
            _count: {
              select: {
                allocations: true
              }
            }
          },
          orderBy: { date: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.exam.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        success: true,
        data: {
          exams,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching exams:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch exams' }
      });
    }
  }
);

// GET /api/exams/:id - Get specific exam with detailed information
router.get('/:id',
  authenticate,
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const exam = await prisma.exam.findUnique({
        where: { id: req.params.id },
        include: {
          departments: {
            include: {
              department: { select: { name: true, code: true } }
            }
          },
          allocations: {
            include: {
              student: {
                include: {
                  user: { select: { email: true } },
                  department: { select: { name: true, code: true } }
                }
              },
              hall: { select: { name: true, code: true, capacity: true } }
            }
          },
          _count: {
            select: {
              allocations: true
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: { message: 'Exam not found' }
        });
      }

      // Check access permissions
      if (exam.institutionId !== req.user.institutionId && !['SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' }
        });
      }

      res.json({
        success: true,
        data: exam
      });
    } catch (error) {
      logger.error('Error fetching exam:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch exam' }
      });
    }
  }
);

// POST /api/exams - Create new exam
router.post('/',
  authenticate,
  authorize('EXAM_ADMIN', 'SUPER_ADMIN'),
  [
    body('subjectName').isString().isLength({ min: 3, max: 200 }).trim(),
    body('subjectCode').isString().isLength({ min: 2, max: 20 }).trim(),
    body('date').isISO8601(),
    body('shift').isIn(['MORNING', 'AFTERNOON', 'EVENING']),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('durationMins').isInt({ min: 30, max: 480 }),
    body('semester').isInt({ min: 1, max: 8 }),
    body('academicYear').isString().matches(/^\d{4}-\d{2}$/),
    body('level').optional().isIn(['UG', 'PG', 'PHD']),
    body('departmentIds').isArray().notEmpty(),
    body('notes').optional().isString(),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        subjectName,
        subjectCode,
        date,
        shift,
        startTime,
        endTime,
        durationMins,
        semester,
        academicYear,
        level = 'UG',
        departmentIds,
        notes,
        status = 'DRAFT'
      } = req.body;

      // Verify departments belong to user's institution
      const departments = await prisma.department.findMany({
        where: { 
          id: { in: departmentIds },
          institutionId: req.user.institutionId
        }
      });

      if (departments.length !== departmentIds.length) {
        return res.status(400).json({
          success: false,
          error: { message: 'One or more departments are invalid' }
        });
      }

      // Validate time logic
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      
      if (endDateTime <= startDateTime) {
        return res.status(400).json({
          success: false,
          error: { message: 'End time must be after start time' }
        });
      }

      // Create exam with transaction to include departments
      const exam = await prisma.$transaction(async (tx) => {
        const newExam = await tx.exam.create({
          data: {
            subjectName,
            subjectCode,
            date: new Date(date),
            shift,
            startTime,
            endTime,
            durationMins,
            semester,
            academicYear,
            level,
            institutionId: req.user.institutionId,
            createdByEmail: req.user.email,
            notes,
            status
          }
        });

        // Create exam-department relationships
        await tx.examDepartment.createMany({
          data: departmentIds.map(deptId => ({
            examId: newExam.id,
            departmentId: deptId,
            studentCount: 0 // Will be updated when allocations are made
          }))
        });

        return newExam;
      });

      // Fetch the created exam with departments
      const examWithDepartments = await prisma.exam.findUnique({
        where: { id: exam.id },
        include: {
          departments: {
            include: {
              department: { select: { name: true, code: true } }
            }
          }
        }
      });

      logger.info(`Exam created: ${exam.subjectName} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        data: examWithDepartments
      });

      // Emit real-time event
      if (req.io) {
        const { emitToAdmins, emitToInstitution, emitToRole } = require('../sockets/socketManager');
        
        // Notify admins
        emitToAdmins(req.io, 'exam:created', {
          id: exam.id,
          subjectName: exam.subjectName,
          subjectCode: exam.subjectCode,
          date: exam.date,
          createdBy: req.user.email
        });
        
        // Notify institution users
        emitToInstitution(req.io, req.user.institutionId, 'exam:created', {
          id: exam.id,
          subjectName: exam.subjectName,
          subjectCode: exam.subjectCode,
          date: exam.date,
          semester: exam.semester
        });

        // Notify students specifically
        emitToRole(req.io, 'STUDENT', req.user.institutionId, 'exam:new', {
          id: exam.id,
          subjectName: exam.subjectName,
          date: exam.date,
          semester: exam.semester,
          message: 'New exam scheduled'
        });
      }
    } catch (error) {
      logger.error('Error creating exam:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create exam' }
      });
    }
  }
);

// PUT /api/exams/:id - Update exam
router.put('/:id',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    param('id').isString().notEmpty(),
    body('title').optional().isString().isLength({ min: 3, max: 200 }).trim(),
    body('subject').optional().isString().isLength({ min: 2, max: 100 }).trim(),
    body('date').optional().isISO8601(),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('duration').optional().isInt({ min: 30, max: 480 }),
    body('totalMarks').optional().isInt({ min: 1, max: 1000 }),
    body('instructions').optional().isString(),
    body('status').optional().isIn(['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convert date if provided
      if (updates.date) {
        updates.date = new Date(updates.date);
      }

      const exam = await prisma.exam.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          departments: {
            include: {
              department: { select: { name: true, code: true } }
            }
          }
        }
      });

      logger.info(`Exam updated: ${exam.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Exam updated successfully',
        data: exam
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Exam not found' }
        });
      }

      logger.error('Error updating exam:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update exam' }
      });
    }
  }
);

// GET /api/exams/:id/analytics - Get exam analytics
router.get('/:id/analytics',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const examId = req.params.id;

      const [exam, allocations, attendanceData] = await Promise.all([
        prisma.exam.findUnique({
          where: { id: examId },
          include: {
            department: { select: { name: true, code: true } },
            _count: { select: { allocations: true } }
          }
        }),
        prisma.allocation.findMany({
          where: { examId },
          include: {
            student: {
              include: {
                department: { select: { name: true, code: true } }
              }
            },
            hall: { select: { name: true, capacity: true } }
          }
        }),
        // Mock attendance data - in real app, get from attendance table
        Promise.resolve([])
      ]);

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: { message: 'Exam not found' }
        });
      }

      // Calculate analytics
      const totalAllocated = allocations.length;
      const hallStats = {};
      const departmentStats = {};

      allocations.forEach(allocation => {
        // Hall statistics
        const hallName = allocation.hall.name;
        if (!hallStats[hallName]) {
          hallStats[hallName] = {
            name: hallName,
            capacity: allocation.hall.capacity,
            allocated: 0,
            utilization: 0
          };
        }
        hallStats[hallName].allocated++;
        hallStats[hallName].utilization = (hallStats[hallName].allocated / hallStats[hallName].capacity) * 100;

        // Department statistics
        const deptName = allocation.student.department.name;
        if (!departmentStats[deptName]) {
          departmentStats[deptName] = {
            name: deptName,
            code: allocation.student.department.code,
            students: 0
          };
        }
        departmentStats[deptName].students++;
      });

      const analytics = {
        exam: {
          id: exam.id,
          title: exam.title,
          subject: exam.subject,
          date: exam.date,
          status: exam.status,
          department: exam.department
        },
        overview: {
          totalAllocated,
          attendanceRate: 94.2, // Mock data - calculate from actual attendance
          averageScore: null, // Would be calculated after exam completion
          completionRate: exam.status === 'COMPLETED' ? 98.5 : null
        },
        hallUtilization: Object.values(hallStats),
        departmentDistribution: Object.values(departmentStats),
        timeline: {
          created: exam.createdAt,
          lastUpdated: exam.updatedAt,
          examDate: exam.date,
          status: exam.status
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error fetching exam analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch exam analytics' }
      });
    }
  }
);

// POST /api/exams/:id/allocate - Run allocation engine for exam
router.post('/:id/allocate',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    param('id').isString().notEmpty(),
    body('strategy').optional().isIn(['DEPARTMENT_MIXING', 'RANDOM', 'ALPHABETICAL', 'ROLL_NUMBER']),
    body('mixingRatio').optional().isFloat({ min: 0, max: 1 }),
    body('preferences').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const examId = req.params.id;
      const { strategy = 'DEPARTMENT_MIXING', mixingRatio = 0.7, preferences = {} } = req.body;

      // Get exam details
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          departments: {
            include: {
              department: true
            }
          },
          allocations: true
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: { message: 'Exam not found' }
        });
      }

      // Check if already allocated
      if (exam.allocations.length > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Exam already has allocations. Clear existing allocations first.' }
        });
      }

      // Get eligible students (from exam departments)
      const deptIds = exam.departments.map(ed => ed.departmentId);
      const students = await prisma.student.findMany({
        where: {
          departmentId: { in: deptIds },
          user: { institutionId: req.user.institutionId }
        },
        include: {
          user: { select: { email: true } }
        }
      });

      // Get available halls
      const halls = await prisma.hall.findMany({
        where: { institutionId: req.user.institutionId },
        orderBy: { capacity: 'desc' }
      });

      if (halls.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No halls available for allocation' }
        });
      }

      // Simple allocation algorithm (can be enhanced)
      const allocations = [];
      let currentHallIndex = 0;
      let currentSeatNumber = 1;

      // Shuffle students based on strategy
      let sortedStudents = [...students];
      switch (strategy) {
        case 'RANDOM':
          sortedStudents = students.sort(() => Math.random() - 0.5);
          break;
        case 'ALPHABETICAL':
          sortedStudents = students.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'ROLL_NUMBER':
          sortedStudents = students.sort((a, b) => a.registerNo.localeCompare(b.registerNo));
          break;
        default: // DEPARTMENT_MIXING
          sortedStudents = students.sort(() => Math.random() - 0.5);
      }

      for (const student of sortedStudents) {
        const hall = halls[currentHallIndex];
        
        allocations.push({
          examId,
          studentId: student.id,
          hallId: hall.id,
          seatNumber: currentSeatNumber.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        currentSeatNumber++;
        
        // Move to next hall if current hall is full
        if (currentSeatNumber > hall.capacity) {
          currentHallIndex++;
          currentSeatNumber = 1;
          
          // Check if we have more halls
          if (currentHallIndex >= halls.length) {
            logger.warn(`Not enough hall capacity for all students in exam ${examId}`);
            break;
          }
        }
      }

      // Create allocations in database
      await prisma.allocation.createMany({
        data: allocations
      });

      // Update exam status
      await prisma.exam.update({
        where: { id: examId },
        data: { status: 'SCHEDULED' }
      });

      logger.info(`Allocation completed for exam ${exam.title}: ${allocations.length} students allocated`);

      res.json({
        success: true,
        message: 'Allocation completed successfully',
        data: {
          totalAllocated: allocations.length,
          totalStudents: students.length,
          strategy,
          hallsUsed: currentHallIndex + 1
        }
      });
    } catch (error) {
      logger.error('Error running allocation:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to run allocation' }
      });
    }
  }
);

// DELETE /api/exams/:id/allocations - Clear exam allocations
router.delete('/:id/allocations',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const examId = req.params.id;

      const deletedCount = await prisma.allocation.deleteMany({
        where: { examId }
      });

      // Update exam status back to draft
      await prisma.exam.update({
        where: { id: examId },
        data: { status: 'DRAFT' }
      });

      logger.info(`Cleared ${deletedCount.count} allocations for exam ${examId}`);

      res.json({
        success: true,
        message: 'Allocations cleared successfully',
        data: { deletedCount: deletedCount.count }
      });
    } catch (error) {
      logger.error('Error clearing allocations:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to clear allocations' }
      });
    }
  }
);

// DELETE /api/exams/:id - Delete exam
router.delete('/:id',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const examId = req.params.id;

      // Check if exam has allocations
      const allocationCount = await prisma.allocation.count({
        where: { examId }
      });

      if (allocationCount > 0) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'Cannot delete exam with existing allocations',
            details: { allocationCount }
          }
        });
      }

      await prisma.exam.delete({
        where: { id: examId }
      });

      logger.info(`Exam deleted: ${examId} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Exam deleted successfully'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Exam not found' }
        });
      }

      logger.error('Error deleting exam:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete exam' }
      });
    }
  }
);

module.exports = router;