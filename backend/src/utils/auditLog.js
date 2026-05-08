// src/utils/auditLog.js
const prisma = require('../config/prisma');
const logger = require('./logger');

async function audit(req, action, resource, resourceId = null, oldValue = null, newValue = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || 'system',
        action,
        resource,
        resourceId,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers?.['user-agent']?.slice(0, 200),
      },
    });
  } catch (err) {
    logger.warn('Audit log failed (non-critical):', err.message);
  }
}

module.exports = { audit };
