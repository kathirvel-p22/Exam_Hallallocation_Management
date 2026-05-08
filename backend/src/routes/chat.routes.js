// src/routes/chat.routes.js
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { chat } = require('../services/chatService');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(authenticate);

// POST /api/chat — AI chatbot
router.post('/', authorize('STUDENT'), async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) throw new ApiError(400, 'messages array required');
  const reply = await chat(messages, req.user.student?.id);
  res.json({ success: true, data: { reply, model: process.env.GROQ_MODEL || 'llama3-8b-8192' } });
});

module.exports = router;
