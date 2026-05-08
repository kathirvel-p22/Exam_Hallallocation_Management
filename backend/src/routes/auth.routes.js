// src/routes/auth.routes.js
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate');
const { login, refresh, logout, getMe, updateFcmToken, changePassword, signup } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', validate(schemas.login), login);
router.post('/signup', validate(schemas.signup), signup);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/fcm-token', authenticate, updateFcmToken);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
