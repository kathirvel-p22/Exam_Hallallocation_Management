// src/routes/notification.routes.js
const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const router = express.Router();
router.use(authenticate);

// GET /api/notifications - Get user notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Ensure user ID exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' }
      });
    }

    const where = {
      OR: [
        { userId: req.user.id },
        { userId: { equals: null } } // Global notifications - explicit null check for Prisma
      ],
      ...(type && { type }),
      ...(typeof isRead === 'string' && { isRead: isRead === 'true' })
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          OR: [{ userId: req.user.id }, { userId: { equals: null } }], 
          isRead: false 
        } 
      }),
    ]);

    res.json({ 
      success: true, 
      data: notifications, 
      meta: { total, page: Number(page), limit: Number(limit), unreadCount } 
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch notifications' }
    });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        OR: [{ userId: req.user.id }, { userId: { equals: null } }],
        isRead: false 
      },
      data: { isRead: true, readAt: new Date() },
    });

    // Emit real-time update
    req.io.to(`user:${req.user.id}`).emit('notifications:read-all');

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark notifications as read' }
    });
  }
});

// PATCH /api/notifications/:id/read - Mark specific notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    if (notification.userId && notification.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    await prisma.notification.update({ 
      where: { id: req.params.id }, 
      data: { isRead: true, readAt: new Date() } 
    });

    // Emit real-time update
    req.io.to(`user:${req.user.id}`).emit('notifications:read', { id: req.params.id });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to mark notification as read' }
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id }
  });

  if (!notification) {
    return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
  }

  if (notification.userId && notification.userId !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: 'Access denied' } });
  }

  await prisma.notification.delete({ where: { id: req.params.id } });

  // Emit real-time update
  req.io.to(`user:${req.user.id}`).emit('notifications:deleted', { id: req.params.id });

  res.json({ success: true, message: 'Notification deleted' });
});

// POST /api/notifications/send - Send notification (Admin only)
router.post('/send', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { title, message, type, channel, targetRole, targetUsers, institutionId, examId, urgent } = req.body;

  if (!title || !message) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Title and message are required' } 
    });
  }

  try {
    let targetUserIds = [];

    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      targetUserIds = targetUsers;
    } else {
      // Send to role/institution
      const whereUsers = {
        ...(req.user.role !== 'SUPER_ADMIN' && { institutionId: req.user.institutionId }),
        ...(institutionId && req.user.role === 'SUPER_ADMIN' && { institutionId }),
        ...(targetRole && targetRole !== 'ALL' && { role: targetRole }),
      };

      const users = await prisma.user.findMany({ 
        where: whereUsers, 
        select: { id: true, email: true, fcmToken: true, role: true } 
      });

      targetUserIds = users.map(u => u.id);
    }

    // Create notifications in database
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map(userId => ({
        userId,
        title,
        message,
        type: type || 'GENERAL',
        channel: channel || 'IN_APP',
        examId: examId || null,
        metadata: JSON.stringify({ urgent: urgent || false })
      })),
    });

    // Real-time broadcast
    const notificationData = {
      title,
      message,
      type: type || 'GENERAL',
      urgent: urgent || false,
      sentAt: new Date(),
      sender: req.user.email
    };

    // Send to specific users or broadcast to role/institution
    if (targetUsers && targetUsers.length > 0) {
      targetUsers.forEach(userId => {
        req.io.to(`user:${userId}`).emit('notification:new', notificationData);
      });
    } else {
      const room = targetRole === 'ALL' 
        ? `institution:${institutionId || req.user.institutionId}` 
        : `role:${targetRole}:${institutionId || req.user.institutionId}`;
      
      req.io.to(room).emit('notification:new', notificationData);
    }

    // Send email notifications if requested
    if (['EMAIL', 'ALL'].includes(channel)) {
      const users = await prisma.user.findMany({
        where: { id: { in: targetUserIds } },
        select: { email: true, fcmToken: true }
      });

      Promise.allSettled(
        users.map(user => 
          notificationService.sendEmail({
            to: user.email,
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">${title}</h2>
                <p style="font-size: 16px; line-height: 1.6;">${message}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #6b7280;">
                  This notification was sent from AcadeX Platform by ${req.user.email}
                </p>
              </div>
            `
          })
        )
      );
    }

    // Send push notifications if requested
    if (['PUSH', 'ALL'].includes(channel)) {
      const users = await prisma.user.findMany({
        where: { 
          id: { in: targetUserIds },
          fcmToken: { not: null }
        },
        select: { fcmToken: true }
      });

      Promise.allSettled(
        users.map(user => 
          notificationService.sendPushNotification({
            fcmToken: user.fcmToken,
            title,
            body: message,
            data: {
              type: type || 'GENERAL',
              urgent: String(urgent || false),
              examId: examId || null
            }
          })
        )
      );
    }

    logger.info(`Notification sent to ${targetUserIds.length} users by ${req.user.email}: ${title}`);

    res.json({ 
      success: true, 
      message: `Notification sent to ${targetUserIds.length} users`,
      data: { recipientCount: targetUserIds.length }
    });

  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to send notification' } 
    });
  }
});

// POST /api/notifications/broadcast - Broadcast system-wide notification (Super Admin only)
router.post('/broadcast', authorize('SUPER_ADMIN'), async (req, res) => {
  const { title, message, type, urgent } = req.body;

  if (!title || !message) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Title and message are required' } 
    });
  }

  try {
    // Get all active users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fcmToken: true }
    });

    // Create notifications for all users
    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type: type || 'SYSTEM',
        channel: 'ALL',
        metadata: JSON.stringify({ 
          urgent: urgent || false,
          broadcast: true,
          sender: req.user.email
        })
      })),
    });

    // Broadcast to all connected users
    const notificationData = {
      title,
      message,
      type: type || 'SYSTEM',
      urgent: urgent || false,
      broadcast: true,
      sentAt: new Date(),
      sender: req.user.email
    };

    req.io.emit('notification:broadcast', notificationData);

    logger.info(`System broadcast sent to ${users.length} users by ${req.user.email}: ${title}`);

    res.json({ 
      success: true, 
      message: `Broadcast sent to ${users.length} users`,
      data: { recipientCount: users.length }
    });

  } catch (error) {
    logger.error('Error sending broadcast:', error);
    res.status(500).json({ 
      success: false, 
      error: { message: 'Failed to send broadcast' } 
    });
  }
});

// GET /api/notifications/stats - Get notification statistics (Admin only)
router.get('/stats', authorize('EXAM_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const whereClause = {
    sentAt: { gte: startDate },
    ...(req.user.role !== 'SUPER_ADMIN' && {
      OR: [
        { userId: { in: await prisma.user.findMany({
          where: { institutionId: req.user.institutionId },
          select: { id: true }
        }).then(users => users.map(u => u.id)) }},
        { userId: null }
      ]
    })
  };

  const [totalSent, totalRead, byType, byDay] = await Promise.all([
    prisma.notification.count({ where: whereClause }),
    prisma.notification.count({ where: { ...whereClause, isRead: true } }),
    prisma.notification.groupBy({
      by: ['type'],
      where: whereClause,
      _count: { id: true }
    }),
    prisma.notification.groupBy({
      by: ['sentAt'],
      where: whereClause,
      _count: { id: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalSent,
      totalRead,
      readRate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.id
      })),
      byDay: byDay.map(item => ({
        date: item.sentAt,
        count: item._count.id
      }))
    }
  });
});

module.exports = router;
