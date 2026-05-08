// src/config/redis.js — Redis with in-memory fallback
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
const memoryStore = new Map();

const memoryClient = {
  get: async (key) => memoryStore.get(key) || null,
  set: async (key, value, ...args) => {
    let ttl = null;
    for (let i = 0; i < args.length; i++) {
      if ((args[i] === 'EX' || args[i] === 'ex') && args[i + 1]) {
        ttl = parseInt(args[i + 1]) * 1000;
      }
    }
    memoryStore.set(key, value);
    if (ttl) setTimeout(() => memoryStore.delete(key), ttl);
    return 'OK';
  },
  del: async (key) => { memoryStore.delete(key); return 1; },
  exists: async (key) => memoryStore.has(key) ? 1 : 0,
  expire: async () => 1,
  ttl: async () => -1,
  keys: async (pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return [...memoryStore.keys()].filter(k => regex.test(k));
  },
  incr: async (key) => {
    const val = parseInt(memoryStore.get(key) || '0') + 1;
    memoryStore.set(key, String(val));
    return val;
  },
  setex: async (key, seconds, value) => {
    memoryStore.set(key, value);
    setTimeout(() => memoryStore.delete(key), seconds * 1000);
    return 'OK';
  },
  ping: async () => 'PONG',
  quit: async () => 'OK',
};

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    logger.warn('⚠️  REDIS_URL not set — using in-memory store (not suitable for production)');
    redisClient = memoryClient;
    return;
  }
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    redisClient.on('error', (err) => {
      logger.warn('Redis connection error, falling back to memory store:', err.message);
      redisClient = memoryClient;
    });
    await redisClient.ping();
    logger.info('✅ Redis connected');
  } catch {
    logger.warn('⚠️  Redis unavailable — using in-memory store');
    redisClient = memoryClient;
  }
}

function getRedis() {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
}

// Cache helpers
const cache = {
  async get(key) {
    const v = await getRedis().get(key);
    if (!v) return null;
    try { return JSON.parse(v); } catch { return v; }
  },
  async set(key, value, ttlSeconds = 300) {
    return getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  },
  async del(key) { return getRedis().del(key); },
  async delPattern(pattern) {
    const keys = await getRedis().keys(pattern);
    if (keys.length) await Promise.all(keys.map(k => getRedis().del(k)));
  },
};

module.exports = { connectRedis, getRedis, cache };
