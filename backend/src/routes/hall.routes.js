// Enhanced hall management routes with utilization analytics
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

// GET /api/halls - Get all halls with filtering and analytics
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('minCapacity').optional().isInt({ min: 1 }),
    query('maxCapacity').optional().isInt({ min: 1 }),
    query('available').optional().isBoolean(),
    query('includeAnalytics').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const includeAnalytics = req.query.includeAnalytics === 'true';

      // Build where clause
      const where = {
        institutionId: req.user.institutionId
      };

      if (req.query.search) {
        where.OR = [
          { name: { contains: req.query.search, mode: 'insensitive' } },
          { code: { contains: req.query.search, mode: 'insensitive' } },
          { location: { contains: req.query.search, mode: 'insensitive' } }
        ];
      }

      if (req.query.minCapacity) {
        where.capacity = { ...where.capacity, gte: parseInt(req.query.minCapacity) };
      }

      if (req.query.maxCapacity) {
        where.capacity = { ...where.capacity, lte: parseInt(req.query.maxCapacity) };
      }

      const [halls, totalCount] = await Promise.all([
        prisma.hall.findMany({
          where,
          include: {
            _count: {
              select: {
                allocations: true
              }
            },
            ...(includeAnalytics && {
              allocations: {
                include: {
                  exam: {
                    select: {
                      title: true,
                      date: true,
                      status: true
                    }
                  }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            })
          },
          orderBy: { name: 'asc' },
          skip: offset,
          take: limit
        }),
        prisma.hall.count({ where })
      ]);

      // Calculate utilization if analytics requested
      if (includeAnalytics) {
        for (const hall of halls) {
          const totalAllocations = hall._count.allocations;
          const recentAllocations = hall.allocations.length;
          
          hall.analytics = {
            totalUsage: totalAllocations,
            utilizationRate: hall.capacity > 0 ? (totalAllocations / hall.capacity) * 100 : 0,
            recentExams: hall.allocations.map(alloc => ({
              examTitle: alloc.exam.title,
              examDate: alloc.exam.date,
              examStatus: alloc.exam.status
            }))
          };
          
          // Remove allocations from response to keep it clean
          delete hall.allocations;
        }
      }

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        success: true,
        data: {
          halls,
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
      logger.error('Error fetching halls:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch halls' }
      });
    }
  }
);

// GET /api/halls/:id - Get specific hall with detailed information
router.get('/:id',
  authenticate,
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const hall = await prisma.hall.findUnique({
        where: { id: req.params.id },
        include: {
          allocations: {
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  subject: true,
                  date: true,
                  startTime: true,
                  endTime: true,
                  status: true,
                  department: {
                    select: { name: true, code: true }
                  }
                }
              },
              student: {
                select: {
                  id: true,
                  name: true,
                  registerNo: true,
                  department: {
                    select: { name: true, code: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              allocations: true
            }
          }
        }
      });

      if (!hall) {
        return res.status(404).json({
          success: false,
          error: { message: 'Hall not found' }
        });
      }

      // Check access permissions
      if (hall.institutionId !== req.user.institutionId && !['SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' }
        });
      }

      // Calculate analytics
      const totalAllocations = hall._count.allocations;
      const currentAllocations = hall.allocations.filter(alloc => 
        alloc.exam.status === 'ACTIVE' || alloc.exam.status === 'SCHEDULED'
      ).length;

      hall.analytics = {
        totalUsage: totalAllocations,
        currentUsage: currentAllocations,
        utilizationRate: hall.capacity > 0 ? (totalAllocations / hall.capacity) * 100 : 0,
        availableSeats: hall.capacity - currentAllocations,
        upcomingExams: hall.allocations
          .filter(alloc => alloc.exam.status === 'SCHEDULED' && new Date(alloc.exam.date) > new Date())
          .slice(0, 5)
          .map(alloc => ({
            examId: alloc.exam.id,
            title: alloc.exam.title,
            date: alloc.exam.date,
            time: `${alloc.exam.startTime} - ${alloc.exam.endTime}`,
            department: alloc.exam.department.name
          }))
      };

      res.json({
        success: true,
        data: hall
      });
    } catch (error) {
      logger.error('Error fetching hall:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch hall' }
      });
    }
  }
);

// POST /api/halls - Create new hall
router.post('/',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    body('name').isString().isLength({ min: 2, max: 100 }).trim(),
    body('code').isString().isLength({ min: 2, max: 20 }).trim(),
    body('capacity').isInt({ min: 1, max: 1000 }),
    body('rows').isInt({ min: 1, max: 50 }),
    body('columns').isInt({ min: 1, max: 50 }),
    body('building').optional().isString().trim(),
    body('floor').optional().isInt({ min: 0, max: 50 }),
    body('facilities').optional().isArray(),
    body('description').optional().isString().trim(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        name,
        code,
        capacity,
        rows,
        columns,
        building,
        floor = 1,
        facilities = [],
        description,
        isActive = true
      } = req.body;

      // Check if hall code already exists in this institution
      const existingHall = await prisma.hall.findFirst({
        where: {
          code,
          institutionId: req.user.institutionId
        }
      });

      if (existingHall) {
        return res.status(400).json({
          success: false,
          error: { message: 'Hall code already exists in this institution' }
        });
      }

      // Create hall and seats in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the hall
        const hall = await tx.hall.create({
          data: {
            name,
            code,
            building,
            floor,
            capacity,
            rows,
            columns,
            facilities: JSON.stringify(facilities),
            isActive,
            institutionId: req.user.institutionId
          }
        });

        // Generate seats automatically
        const seats = [];
        for (let row = 1; row <= rows; row++) {
          for (let col = 1; col <= columns; col++) {
            const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.
            const seatNumber = `${rowLetter}-${String(col).padStart(2, '0')}`;
            
            seats.push({
              hallId: hall.id,
              seatNumber,
              row,
              column: col,
              isReserved: row === 1 // First row reserved for differently-abled
            });
          }
        }

        // Create all seats
        await tx.seat.createMany({
          data: seats
        });

        return hall;
      });

      logger.info(`Hall created: ${result.name} (${result.code}) with ${capacity} seats by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Hall created successfully with seats',
        data: {
          ...result,
          facilities: JSON.parse(result.facilities || '[]'),
          seatsCreated: capacity
        }
      });
    } catch (error) {
      logger.error('Error creating hall:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create hall' }
      });
    }
  }
);

// PUT /api/halls/:id - Update hall
router.put('/:id',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    param('id').isString().notEmpty(),
    body('name').optional().isString().isLength({ min: 2, max: 100 }).trim(),
    body('code').optional().isString().isLength({ min: 2, max: 20 }).trim(),
    body('capacity').optional().isInt({ min: 1, max: 1000 }),
    body('location').optional().isString().trim(),
    body('facilities').optional().isArray(),
    body('description').optional().isString().trim(),
    body('isActive').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // If facilities are provided, stringify them
      if (updates.facilities) {
        updates.facilities = JSON.stringify(updates.facilities);
      }

      const hall = await prisma.hall.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      logger.info(`Hall updated: ${hall.name} (${hall.code}) by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Hall updated successfully',
        data: {
          ...hall,
          facilities: JSON.parse(hall.facilities || '[]')
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Hall not found' }
        });
      }

      logger.error('Error updating hall:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update hall' }
      });
    }
  }
);

// GET /api/halls/:id/availability - Check hall availability
router.get('/:id/availability',
  authenticate,
  [
    param('id').isString().notEmpty(),
    query('date').optional().isISO8601(),
    query('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    query('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    query('days').optional().isInt({ min: 1, max: 365 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const hallId = req.params.id;
      const date = req.query.date ? new Date(req.query.date) : new Date();
      const days = parseInt(req.query.days) || 30;
      const startTime = req.query.startTime;
      const endTime = req.query.endTime;

      // Get hall details
      const hall = await prisma.hall.findUnique({
        where: { id: hallId },
        select: { id: true, name: true, code: true, capacity: true }
      });

      if (!hall) {
        return res.status(404).json({
          success: false,
          error: { message: 'Hall not found' }
        });
      }

      // Calculate date range
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + days);

      // Get existing allocations in the date range
      const allocations = await prisma.allocation.findMany({
        where: {
          hallId,
          exam: {
            date: {
              gte: date,
              lte: endDate
            }
          }
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
              status: true
            }
          }
        }
      });

      // Group allocations by date
      const allocationsByDate = {};
      allocations.forEach(allocation => {
        const examDate = allocation.exam.date.toISOString().split('T')[0];
        if (!allocationsByDate[examDate]) {
          allocationsByDate[examDate] = [];
        }
        allocationsByDate[examDate].push(allocation);
      });

      // Generate availability calendar
      const availability = [];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayAllocations = allocationsByDate[dateStr] || [];
        const occupiedSeats = dayAllocations.length;
        const availableSeats = hall.capacity - occupiedSeats;
        
        // Check time conflicts if specific time range provided
        let hasTimeConflict = false;
        if (startTime && endTime) {
          hasTimeConflict = dayAllocations.some(allocation => {
            const examStart = allocation.exam.startTime;
            const examEnd = allocation.exam.endTime;
            
            // Check for time overlap
            return (startTime < examEnd && endTime > examStart);
          });
        }

        availability.push({
          date: dateStr,
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
          isAvailable: availableSeats > 0 && !hasTimeConflict,
          availableSeats,
          occupiedSeats,
          utilizationRate: (occupiedSeats / hall.capacity) * 100,
          exams: dayAllocations.map(alloc => ({
            id: alloc.exam.id,
            title: alloc.exam.title,
            time: `${alloc.exam.startTime} - ${alloc.exam.endTime}`,
            status: alloc.exam.status,
            studentsAllocated: dayAllocations.filter(a => a.exam.id === alloc.exam.id).length
          })).filter((exam, index, self) => 
            index === self.findIndex(e => e.id === exam.id)
          )
        });
      }

      res.json({
        success: true,
        data: {
          hall: {
            id: hall.id,
            name: hall.name,
            code: hall.code,
            capacity: hall.capacity
          },
          dateRange: {
            start: date.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            days
          },
          availability
        }
      });
    } catch (error) {
      logger.error('Error checking hall availability:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to check hall availability' }
      });
    }
  }
);

// GET /api/halls/:id/analytics - Get detailed hall analytics
router.get('/:id/analytics',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [
    param('id').isString().notEmpty(),
    query('timeRange').optional().isIn(['7d', '30d', '90d', '1y'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const hallId = req.params.id;
      const timeRange = req.query.timeRange || '30d';

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const [hall, allocations, recentExams] = await Promise.all([
        prisma.hall.findUnique({
          where: { id: hallId },
          select: {
            id: true,
            name: true,
            code: true,
            capacity: true,
            location: true,
            facilities: true,
            createdAt: true
          }
        }),
        prisma.allocation.findMany({
          where: {
            hallId,
            exam: {
              date: { gte: startDate }
            }
          },
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
                department: {
                  select: { name: true, code: true }
                }
              }
            },
            student: {
              select: {
                department: {
                  select: { name: true, code: true }
                }
              }
            }
          }
        }),
        prisma.exam.findMany({
          where: {
            allocations: {
              some: { hallId }
            },
            date: { gte: startDate }
          },
          include: {
            department: { select: { name: true, code: true } },
            _count: { select: { allocations: true } }
          },
          orderBy: { date: 'desc' },
          take: 10
        })
      ]);

      if (!hall) {
        return res.status(404).json({
          success: false,
          error: { message: 'Hall not found' }
        });
      }

      // Calculate analytics
      const totalAllocations = allocations.length;
      const uniqueExams = new Set(allocations.map(a => a.exam.id)).size;
      const averageUtilization = totalAllocations > 0 ? (totalAllocations / (uniqueExams * hall.capacity)) * 100 : 0;

      // Department distribution
      const departmentStats = {};
      allocations.forEach(allocation => {
        const deptName = allocation.student.department.name;
        if (!departmentStats[deptName]) {
          departmentStats[deptName] = {
            name: deptName,
            code: allocation.student.department.code,
            count: 0
          };
        }
        departmentStats[deptName].count++;
      });

      // Usage by time slots
      const timeSlotStats = {};
      allocations.forEach(allocation => {
        const timeSlot = allocation.exam.startTime;
        if (!timeSlotStats[timeSlot]) {
          timeSlotStats[timeSlot] = 0;
        }
        timeSlotStats[timeSlot]++;
      });

      // Monthly usage trend
      const monthlyUsage = {};
      allocations.forEach(allocation => {
        const month = allocation.exam.date.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyUsage[month]) {
          monthlyUsage[month] = 0;
        }
        monthlyUsage[month]++;
      });

      const analytics = {
        hall: {
          ...hall,
          facilities: JSON.parse(hall.facilities || '[]')
        },
        overview: {
          totalAllocations,
          uniqueExams,
          averageUtilization: Math.round(averageUtilization * 100) / 100,
          timeRange,
          peakUsageTime: Object.keys(timeSlotStats).reduce((a, b) => 
            timeSlotStats[a] > timeSlotStats[b] ? a : b, Object.keys(timeSlotStats)[0]
          )
        },
        departmentDistribution: Object.values(departmentStats),
        timeSlotUsage: Object.entries(timeSlotStats).map(([time, count]) => ({
          time,
          count,
          percentage: (count / totalAllocations) * 100
        })),
        monthlyTrend: Object.entries(monthlyUsage).map(([month, count]) => ({
          month,
          count,
          utilization: (count / hall.capacity) * 100
        })),
        recentExams: recentExams.map(exam => ({
          id: exam.id,
          title: exam.title,
          date: exam.date,
          department: exam.department.name,
          studentsAllocated: exam._count.allocations,
          status: exam.status
        }))
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error fetching hall analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch hall analytics' }
      });
    }
  }
);

// DELETE /api/halls/:id - Delete hall
router.delete('/:id',
  authenticate,
  authorize(['EXAM_ADMIN', 'SUPER_ADMIN']),
  [param('id').isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      const hallId = req.params.id;

      // Check if hall has allocations
      const allocationCount = await prisma.allocation.count({
        where: { hallId }
      });

      if (allocationCount > 0) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'Cannot delete hall with existing allocations',
            details: { allocationCount }
          }
        });
      }

      const hall = await prisma.hall.delete({
        where: { id: hallId }
      });

      logger.info(`Hall deleted: ${hall.name} (${hall.code}) by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Hall deleted successfully'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'Hall not found' }
        });
      }

      logger.error('Error deleting hall:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete hall' }
      });
    }
  }
);

module.exports = router;