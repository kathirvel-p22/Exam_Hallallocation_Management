// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { cache } = require('../config/redis');
const { ApiError } = require('./errorHandler');

// ── Verify JWT access token ──────────────────────────────────
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    // Check blacklist
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) throw new ApiError(401, 'Token has been revoked');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Token expired');
      throw new ApiError(401, 'Invalid token');
    }

    // Cache user lookup for performance
    let user = await cache.get(`user:${decoded.userId}`);
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true, email: true, role: true,
          institutionId: true,
          student: { select: { id: true, registerNo: true, name: true, semester: true, departmentId: true } },
          invigilator: { select: { id: true, staffId: true, name: true, departmentId: true } },
        },
      });
      if (user) await cache.set(`user:${decoded.userId}`, user, 300);
    }

    if (!user) throw new ApiError(401, 'User not found');

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};

// ── Role-based access control ────────────────────────────────
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied. Required: ${roles.join(' or ')}`));
  }
  next();
};

// ── Optional auth (doesn't fail if no token) ─────────────────
const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, institutionId: true },
    });
    if (user) req.user = user;
  } catch {}
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
