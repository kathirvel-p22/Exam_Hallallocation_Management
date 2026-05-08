// src/routes/user.routes.js - User Management Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(authenticate);

// GET /api/users - Get all users with pagination and filtering
router.get('/', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { page = 1, limit = 50, search, role, departmentId, institutionId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(req.user.role !== 'SUPER_ADMIN' && { institutionId: req.user.institutionId }),
    ...(institutionId && req.user.role === 'SUPER_ADMIN' && { institutionId }),
    ...(role && { role }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { invigilator: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        student: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        invigilator: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        institution: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    meta: { total, page: Number(page), limit: Number(limit) },
  });
});

// POST /api/users - Create new user
router.post('/', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const {
    email,
    password,
    role,
    name,
    registerNo,
    staffId,
    phone,
    departmentId,
    semester,
    academicYear,
    level,
    hasDisability,
    institutionId,
  } = req.body;

  // Validation
  if (!email || !password || !role || !name) {
    throw new ApiError(400, 'Email, password, role, and name are required');
  }

  if (!['STUDENT', 'INVIGILATOR', 'EXAM_ADMIN'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Determine institution
  const targetInstitutionId = req.user.role === 'SUPER_ADMIN' && institutionId 
    ? institutionId 
    : req.user.institutionId;

  // Get department if provided
  let department = null;
  if (departmentId) {
    department = await prisma.department.findFirst({
      where: { id: departmentId, institutionId: targetInstitutionId },
    });
    if (!department) {
      throw new ApiError(400, 'Department not found');
    }
  }

  try {
    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role,
        institutionId: targetInstitutionId,
      },
    });

    // Create profile based on role
    let profile = null;
    if (role === 'STUDENT') {
      if (!registerNo || !departmentId || !semester) {
        throw new ApiError(400, 'Register number, department, and semester are required for students');
      }

      // Check if register number already exists
      const existingStudent = await prisma.student.findUnique({
        where: { registerNo },
      });
      if (existingStudent) {
        throw new ApiError(400, 'Student with this register number already exists');
      }

      profile = await prisma.student.create({
        data: {
          userId: user.id,
          registerNo,
          name,
          phone,
          semester: Number(semester),
          academicYear: academicYear || '2024-25',
          level: level || 'UG',
          departmentId,
          hasDisability: hasDisability || false,
        },
        include: {
          department: { select: { name: true, code: true } },
        },
      });
    } else if (role === 'INVIGILATOR') {
      if (!staffId || !departmentId) {
        throw new ApiError(400, 'Staff ID and department are required for invigilators');
      }

      // Check if staff ID already exists
      const existingInvigilator = await prisma.invigilator.findUnique({
        where: { staffId },
      });
      if (existingInvigilator) {
        throw new ApiError(400, 'Invigilator with this staff ID already exists');
      }

      profile = await prisma.invigilator.create({
        data: {
          userId: user.id,
          staffId,
          name,
          phone,
          departmentId,
        },
        include: {
          department: { select: { name: true, code: true } },
        },
      });
    }

    // Return user with profile
    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        student: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        invigilator: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        institution: { select: { name: true, code: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser,
    });

    // Emit real-time event
    if (req.io) {
      const { emitToAdmins, emitToInstitution } = require('../sockets/socketManager');
      emitToAdmins(req.io, 'user:created', {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.student?.name || createdUser.invigilator?.name,
        createdBy: req.user.email
      });
      
      emitToInstitution(req.io, targetInstitutionId, 'user:created', {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.student?.name || createdUser.invigilator?.name
      });
    }
  } catch (error) {
    throw new ApiError(500, `Failed to create user: ${error.message}`);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { email, role, name, phone, departmentId, semester } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true, invigilator: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check permissions
  if (req.user.role !== 'SUPER_ADMIN' && user.institutionId !== req.user.institutionId) {
    throw new ApiError(403, 'Cannot modify users from other institutions');
  }

  try {
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email: email.toLowerCase() }),
      },
    });

    // Update profile based on role
    if (user.role === 'STUDENT' && user.student) {
      await prisma.student.update({
        where: { id: user.student.id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(departmentId && { departmentId }),
          ...(semester && { semester: Number(semester) }),
        },
      });
    } else if (user.role === 'INVIGILATOR' && user.invigilator) {
      await prisma.invigilator.update({
        where: { id: user.invigilator.id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(departmentId && { departmentId }),
        },
      });
    }

    // Return updated user with profile
    const result = await prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        invigilator: {
          include: {
            department: { select: { name: true, code: true } },
          },
        },
        institution: { select: { name: true, code: true } },
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });

    // Emit real-time event
    if (req.io) {
      const { emitToAdmins, emitToInstitution, emitToUser } = require('../sockets/socketManager');
      emitToAdmins(req.io, 'user:updated', {
        id: result.id,
        email: result.email,
        role: result.role,
        name: result.student?.name || result.invigilator?.name,
        updatedBy: req.user.email
      });
      
      emitToInstitution(req.io, result.institutionId, 'user:updated', {
        id: result.id,
        email: result.email,
        role: result.role,
        name: result.student?.name || result.invigilator?.name
      });

      // Notify the user themselves
      emitToUser(req.io, result.id, 'profile:updated', {
        message: 'Your profile has been updated',
        updatedBy: req.user.email
      });
    }
  } catch (error) {
    throw new ApiError(500, `Failed to update user: ${error.message}`);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true, invigilator: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check permissions
  if (req.user.role !== 'SUPER_ADMIN' && user.institutionId !== req.user.institutionId) {
    throw new ApiError(403, 'Cannot delete users from other institutions');
  }

  try {
    // Delete profile first (due to foreign key constraints)
    if (user.student) {
      await prisma.student.delete({ where: { id: user.student.id } });
    }
    if (user.invigilator) {
      await prisma.invigilator.delete({ where: { id: user.invigilator.id } });
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });

    // Emit real-time event
    if (req.io) {
      const { emitToAdmins, emitToInstitution } = require('../sockets/socketManager');
      emitToAdmins(req.io, 'user:deleted', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student?.name || user.invigilator?.name,
        deletedBy: req.user.email
      });
      
      emitToInstitution(req.io, user.institutionId, 'user:deleted', {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student?.name || user.invigilator?.name
      });
    }
  } catch (error) {
    throw new ApiError(500, `Failed to delete user: ${error.message}`);
  }
});

// POST /api/users/:id/reset-password - Reset user password
router.post('/:id/reset-password', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check permissions
  if (req.user.role !== 'SUPER_ADMIN' && user.institutionId !== req.user.institutionId) {
    throw new ApiError(403, 'Cannot reset password for users from other institutions');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

// GET /api/users/departments - Get departments for user creation
router.get('/departments', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { institutionId } = req.query;
  
  const targetInstitutionId = req.user.role === 'SUPER_ADMIN' && institutionId 
    ? institutionId 
    : req.user.institutionId;

  const departments = await prisma.department.findMany({
    where: { institutionId: targetInstitutionId },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });

  res.json({
    success: true,
    data: departments,
  });
});

module.exports = router;