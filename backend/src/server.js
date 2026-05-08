// src/server.js — AcadeX Express + Socket.io Server (Unified Frontend + Backend)
'use strict';

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { Server } = require('socket.io');
const { connectRedis } = require('./config/redis');
const { initSocketManager } = require('./sockets/socketManager');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes/index.routes');
const logger = require('./utils/logger');

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Core Middleware ─────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'res.cloudinary.com'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:'],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ── Global Rate Limit ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health' || req.path.startsWith('/assets'),
});
app.use(globalLimiter);

// ── Attach io to request ────────────────────────────────────
app.use((req, _res, next) => { req.io = io; next(); });

// ── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ── Serve Frontend Static Files ─────────────────────────────
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// ── Health Check ────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  let dbOk = false;
  try { await prisma.$queryRaw`SELECT 1`; dbOk = true; }
  catch {}
  finally { prisma.$disconnect(); }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    mode: 'unified',
    services: { database: dbOk ? 'connected' : 'error', api: 'running', frontend: 'served' },
  });
});

// ── Frontend Fallback (SPA Support) ─────────────────────────
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Error Handlers ──────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io Initialization ────────────────────────────────
initSocketManager(io);

// ── Start Server ────────────────────────────────────────────
async function startServer() {
  try {
    await connectRedis();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      logger.info(`🚀 AcadeX Unified Server running on http://localhost:${PORT}`);
      logger.info(`🌐 Frontend served from: ${frontendPath}`);
      logger.info(`🔌 Socket.io ready`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🎯 Access the platform at: http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// ── Graceful Shutdown ───────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => { logger.error('Unhandled Rejection:', reason); });
process.on('uncaughtException', (err) => { logger.error('Uncaught Exception:', err); process.exit(1); });

startServer();

module.exports = { app, io };
