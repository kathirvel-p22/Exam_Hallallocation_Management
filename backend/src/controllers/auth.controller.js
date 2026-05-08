// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { cache, getRedis } = require('../config/redis');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function generateTokens(userId, role) {
  const payload = { userId, role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
}

function buildUserProfile(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    student: user.student || null,
    invigilator: user.invigilator || null,
    profile: user.student || user.invigilator || null,
  };
}

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      student: {
        include: { department: { select: { name: true, code: true } } },
      },
      invigilator: {
        include: { department: { select: { name: true, code: true } } },
      },
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Update last login (commented out as field doesn't exist in current schema)
  // await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  // Cache user
  await cache.set(`user:${user.id}`, buildUserProfile(user), 300);

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  logger.info(`User logged in: ${user.email} [${user.role}]`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      user: buildUserProfile(user),
    },
  });
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token is invalid or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new ApiError(401, 'User not found');

  // Rotate refresh token
  const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role);

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });
  await prisma.refreshToken.create({
    data: { token: newRefresh, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
  res.json({ success: true, data: { accessToken } });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  const token = req.token;
  const refreshToken = req.cookies?.refreshToken;

  // Blacklist access token
  if (token) {
    const decoded = jwt.decode(token);
    const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;
    if (ttl > 0) await getRedis().setex(`blacklist:${token}`, ttl, '1');
  }

  // Revoke refresh token
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  // Clear user cache
  await cache.del(`user:${req.user.id}`);

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      student: { include: { department: true } },
      invigilator: { include: { department: true } },
      institution: { select: { name: true, code: true } },
    },
  });
  res.json({ success: true, data: user });
};

// PUT /api/auth/update-fcm
const updateFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  await prisma.user.update({ where: { id: req.user.id }, data: { fcmToken } });
  await cache.del(`user:${req.user.id}`);
  res.json({ success: true, message: 'FCM token updated' });
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'Invalid password data');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash: hash } });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId: req.user.id },
    data: { isRevoked: true },
  });

  res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
};

// POST /api/auth/signup
const signup = async (req, res) => {
  const { email, password, name, role = 'STUDENT' } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Get default institution
  const institution = await prisma.institution.findFirst();
  if (!institution) {
    throw new ApiError(500, 'No institution found. Please contact administrator.');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role,
      institutionId: institution.id,
    },
  });

  // Create profile based on role
  let studentProfile = null;
  if (role === 'STUDENT') {
    const defaultDept = await prisma.department.findFirst({
      where: { institutionId: institution.id },
    });
    
    if (defaultDept) {
      studentProfile = await prisma.student.create({
        data: {
          userId: user.id,
          registerNo: `REG${Date.now()}`,
          name,
          semester: 1,
          academicYear: '2024-25',
          departmentId: defaultDept.id,
        },
        include: {
          department: { select: { name: true, code: true } },
        },
      });
    }
  }

  // Add the profile to the user object for buildUserProfile
  user.student = studentProfile;

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  logger.info(`New user registered: ${user.email} [${user.role}]`);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      accessToken,
      user: buildUserProfile(user),
    },
  });
};

module.exports = { login, refresh, logout, getMe, updateFcmToken, changePassword, signup };
