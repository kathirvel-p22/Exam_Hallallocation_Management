// src/services/qrService.js — JWT-secured QR Code Service
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { ApiError } = require('../middleware/errorHandler');

const QR_SECRET = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET;
const QR_EXPIRES_IN = '24h';

/**
 * Generate a signed QR token for a hall ticket
 */
function generateQRToken(payload) {
  const token = jwt.sign(
    {
      type: 'HALL_TICKET',
      studentId: payload.studentId,
      examId: payload.examId,
      allocationId: payload.allocationId,
      seatNumber: payload.seatNumber,
      hallId: payload.hallId,
      iat: Math.floor(Date.now() / 1000),
    },
    QR_SECRET,
    { expiresIn: QR_EXPIRES_IN }
  );

  const decoded = jwt.decode(token);
  return {
    token,
    expiresAt: new Date(decoded.exp * 1000),
  };
}

/**
 * Verify and decode a QR token
 */
function verifyQRToken(token) {
  try {
    const decoded = jwt.verify(token, QR_SECRET);
    if (decoded.type !== 'HALL_TICKET') {
      throw new ApiError(400, 'Invalid QR code type');
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'TokenExpiredError') throw new ApiError(400, 'QR code has expired');
    throw new ApiError(400, 'Invalid or tampered QR code');
  }
}

/**
 * Generate a QR code image as Base64 data URL
 */
async function generateQRImage(token, options = {}) {
  const qrData = JSON.stringify({ t: token.slice(-32), v: 1 }); // shortened for QR density
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.9,
    margin: 2,
    color: {
      dark: options.darkColor || '#0B1437',
      light: '#FFFFFF',
    },
    width: options.width || 256,
    ...options,
  });
}

/**
 * Generate QR code as Buffer (for PDF embedding)
 */
async function generateQRBuffer(token, options = {}) {
  return QRCode.toBuffer(token, {
    errorCorrectionLevel: 'M',
    type: 'png',
    margin: 2,
    width: options.width || 256,
  });
}

module.exports = { generateQRToken, verifyQRToken, generateQRImage, generateQRBuffer };
