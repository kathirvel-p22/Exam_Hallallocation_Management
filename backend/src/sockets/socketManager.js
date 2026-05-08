// src/sockets/socketManager.js — Enhanced Real-time WebSocket Events
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Track connected clients
const connectedUsers = new Map(); // userId -> { socketId, role, hallId }
const userSockets = new Map(); // socketId -> user data

function initSocketManager(io) {
  // ── Authentication Middleware ──────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, institutionId: true, email: true },
      });
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket;
    logger.info(`Socket connected: ${user.email} [${user.role}] - ${socket.id}`);

    // Track user connection
    connectedUsers.set(user.id, { socketId: socket.id, role: user.role, hallId: null });
    userSockets.set(socket.id, user);

    // Join role-based rooms
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);
    socket.join(`role:${user.role}:${user.institutionId}`);
    socket.join(`institution:${user.institutionId}`);

    // Send connection confirmation
    socket.emit('connection:confirmed', {
      userId: user.id,
      role: user.role,
      institutionId: user.institutionId,
      connectedAt: new Date()
    });

    // Broadcast user online status
    socket.to(`institution:${user.institutionId}`).emit('user:online', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // ── NOTIFICATION SUBSCRIPTION ──────────────────────────
    socket.on('notifications:subscribe', () => {
      socket.join(`notifications:${user.id}`);
      socket.emit('notifications:subscribed');
    });

    // ── JOIN HALL ROOM ──────────────────────────────────────
    socket.on('join:hall', async ({ hallId }) => {
      if (!hallId) return;
      socket.join(`hall:${hallId}`);
      const info = connectedUsers.get(user.id);
      if (info) info.hallId = hallId;
      socket.emit('hall:joined', { hallId });
      logger.info(`${user.email} joined hall:${hallId}`);
    });

    // ── JOIN EXAM ROOM ──────────────────────────────────────
    socket.on('join:exam', ({ examId }) => {
      if (!examId) return;
      socket.join(`exam:${examId}`);
      socket.emit('exam:joined', { examId });
    });

    // ── JOIN CUSTOM ROOM ────────────────────────────────────
    socket.on('join:room', ({ room }) => {
      if (!room) return;
      socket.join(room);
      socket.emit('room:joined', { room });
    });

    socket.on('leave:room', ({ room }) => {
      if (!room) return;
      socket.leave(room);
      socket.emit('room:left', { room });
    });

    // ── QR SCAN / ATTENDANCE ────────────────────────────────
    socket.on('attendance:scan', async ({ allocationId, examId, status }) => {
      try {
        // Broadcast to exam room
        io.to(`exam:${examId}`).emit('attendance:updated', {
          allocationId, examId, status,
          markedAt: new Date().toISOString(),
          markedById: user.id,
        });

        // Update live counters
        const stats = await getLiveStats(examId);
        io.to(`exam:${examId}`).emit('exam:stats', stats);

        // Emit to admins
        emitToAdmins(io, 'attendance:marked', {
          allocationId, examId, status, markedBy: user.email
        });

      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('attendance:mark', async ({ allocationId, examId, status }) => {
      try {
        // Broadcast attendance update
        io.to(`exam:${examId}`).emit('attendance:marked', {
          allocationId, examId, status,
          markedAt: new Date(),
          markedBy: user.id
        });

        // Notify student if connected
        const allocation = await prisma.allocation.findUnique({
          where: { id: allocationId },
          include: { student: true }
        });

        if (allocation) {
          emitToUser(io, allocation.student.userId, 'attendance:status-update', {
            examId, status, markedAt: new Date()
          });
        }

        socket.emit('attendance:mark-confirmed', { allocationId, examId, status });
      } catch (err) {
        socket.emit('attendance:mark-error', { error: err.message });
      }
    });

    // ── INVIGILATOR CHECK-IN ────────────────────────────────
    socket.on('invigilator:checkin', async ({ dutyId, hallId }) => {
      try {
        await prisma.invigDuty.update({
          where: { id: dutyId },
          data: { checkInAt: new Date(), isConfirmed: true },
        });
        
        io.to(`hall:${hallId}`).emit('invigilator:arrived', {
          userId: user.id,
          email: user.email,
          hallId,
          time: new Date().toISOString(),
        });
        
        emitToAdmins(io, 'invigilator:arrived', { 
          userId: user.id, 
          email: user.email, 
          hallId 
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── ISSUE REPORTED ──────────────────────────────────────
    socket.on('issue:reported', ({ issue }) => {
      emitToAdmins(io, 'issue:new', {
        ...issue,
        reportedAt: new Date().toISOString(),
        reportedById: user.id,
        reportedBy: user.email,
      });
    });

    // ── CHAT MESSAGES ───────────────────────────────────────
    socket.on('chat:join-room', (roomId) => {
      socket.join(`chat:${roomId}`);
      socket.emit('chat:joined-room', { roomId });
    });

    socket.on('chat:leave-room', (roomId) => {
      socket.leave(`chat:${roomId}`);
      socket.emit('chat:left-room', { roomId });
    });

    socket.on('chat:send-message', ({ roomId, message, type }) => {
      socket.to(`chat:${roomId}`).emit('chat:new-message', {
        message,
        type: type || 'text',
        sender: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        timestamp: new Date()
      });
    });

    // ── ADMIN BROADCAST ─────────────────────────────────────
    socket.on('admin:broadcast', ({ message, targetRole, urgent }) => {
      if (!['EXAM_ADMIN', 'SUPER_ADMIN'].includes(user.role)) return;
      
      const room = targetRole && targetRole !== 'ALL' 
        ? `role:${targetRole}:${user.institutionId}` 
        : `institution:${user.institutionId}`;
      
      io.to(room).emit('admin:broadcast', {
        message,
        urgent: urgent || false,
        from: user.email,
        timestamp: new Date()
      });
    });

    socket.on('admin:monitor-start', () => {
      if (['EXAM_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        socket.join('admin:monitoring');
        socket.emit('admin:monitoring-started');
      }
    });

    socket.on('admin:monitor-stop', () => {
      socket.leave('admin:monitoring');
      socket.emit('admin:monitoring-stopped');
    });

    // ── SYSTEM EVENTS ───────────────────────────────────────
    socket.on('system:ping', () => {
      socket.emit('system:pong', { timestamp: new Date() });
    });

    socket.on('system:status', () => {
      socket.emit('system:status', {
        connected: true,
        userId: user.id,
        role: user.role,
        institutionId: user.institutionId,
        rooms: Array.from(socket.rooms),
        connectedUsers: connectedUsers.size,
        serverTime: new Date()
      });
    });

    // ── PING / HEARTBEAT ────────────────────────────────────
    socket.on('ping', () => socket.emit('pong', { time: Date.now() }));

    // ── DISCONNECT ──────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      connectedUsers.delete(user.id);
      userSockets.delete(socket.id);
      
      // Broadcast user offline status
      socket.to(`institution:${user.institutionId}`).emit('user:offline', {
        userId: user.id,
        email: user.email,
        role: user.role,
        disconnectedAt: new Date()
      });
      
      logger.info(`Socket disconnected: ${user.email} [${reason}]`);
    });

    // Emit online count update
    io.to(`institution:${user.institutionId}`).emit('users:online', {
      count: connectedUsers.size,
    });
  });

  logger.info('✅ Socket.io manager initialized');
}

async function getLiveStats(examId) {
  const [total, present, absent] = await Promise.all([
    prisma.attendance.count({ where: { examId } }),
    prisma.attendance.count({ where: { examId, status: 'PRESENT' } }),
    prisma.attendance.count({ where: { examId, status: 'ABSENT' } }),
  ]);
  return {
    examId, total, present, absent,
    rate: total > 0 ? Math.round((present / total) * 100) : 0,
    updatedAt: new Date().toISOString(),
  };
}

// Enhanced utility functions for external use
function emitToUser(io, userId, event, data) {
  const user = connectedUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
}

function emitToAdmins(io, event, data) {
  io.to('role:EXAM_ADMIN').to('role:SUPER_ADMIN').emit(event, data);
}

function emitToRole(io, role, institutionId, event, data) {
  io.to(`role:${role}:${institutionId}`).emit(event, data);
}

function emitToInstitution(io, institutionId, event, data) {
  io.to(`institution:${institutionId}`).emit(event, data);
}

function emitToExam(io, examId, event, data) {
  io.to(`exam:${examId}`).emit(event, data);
}

function emitToHall(io, hallId, event, data) {
  io.to(`hall:${hallId}`).emit(event, data);
}

function broadcastSystemWide(io, event, data) {
  io.emit(event, data);
}

function getConnectedUsers() {
  return Array.from(userSockets.values());
}

function getConnectedUsersByRole(role, institutionId) {
  return Array.from(userSockets.values()).filter(user => 
    user.role === role && user.institutionId === institutionId
  );
}

function isUserOnline(userId) {
  return connectedUsers.has(userId);
}

function getOnlineCount(institutionId) {
  return Array.from(userSockets.values()).filter(user => 
    user.institutionId === institutionId
  ).length;
}

module.exports = { 
  initSocketManager, 
  getLiveStats, 
  emitToUser, 
  emitToAdmins,
  emitToRole,
  emitToInstitution,
  emitToExam,
  emitToHall,
  broadcastSystemWide,
  getConnectedUsers,
  getConnectedUsersByRole,
  isUserOnline,
  getOnlineCount
};
