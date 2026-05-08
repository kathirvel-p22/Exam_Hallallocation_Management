// src/services/notificationService.js — Firebase FCM + Nodemailer
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// ── Email Transporter ────────────────────────────────────────
let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

// ── Firebase Admin ───────────────────────────────────────────
let firebaseApp = null;
function getFirebase() {
  if (!firebaseApp && process.env.FIREBASE_PROJECT_ID) {
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        firebaseApp = admin.apps[0];
      }
    } catch (err) {
      logger.warn('Firebase init failed:', err.message);
    }
  }
  return firebaseApp;
}

// ── HTML Email Template ──────────────────────────────────────
function buildHallTicketEmail({ studentName, examName, date, shift, hall, seat, qrDataUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #F9F6EE; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(11,20,55,.12); }
  .header { background: linear-gradient(135deg, #0B1437, #1E2D6B); padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
  .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #D4AF37, #A8880A); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #0B1437; }
  .brand { color: white; }
  .brand-name { font-size: 22px; font-weight: 800; }
  .brand-sub { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 2px; letter-spacing: 1px; }
  .body { padding: 32px; }
  .greeting { font-size: 18px; font-weight: 700; color: #0B1437; margin-bottom: 8px; }
  .subtitle { color: #7B8DB8; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }
  .exam-card { background: #F9F6EE; border: 1px solid rgba(212,175,55,.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .exam-name { font-size: 18px; font-weight: 800; color: #0B1437; margin-bottom: 8px; }
  .exam-meta { font-size: 13px; color: #7B8DB8; line-height: 1.7; }
  .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .detail-box { background: #F9F6EE; border-radius: 10px; padding: 14px; }
  .detail-label { font-size: 10px; color: #B8C3DC; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
  .detail-value { font-size: 16px; font-weight: 800; color: #0B1437; margin-top: 4px; }
  .qr-section { text-align: center; margin: 24px 0; }
  .qr-section img { border-radius: 12px; border: 3px solid #D4AF37; padding: 8px; }
  .qr-note { font-size: 12px; color: #7B8DB8; margin-top: 10px; }
  .instructions { background: #F9F6EE; border-radius: 12px; padding: 20px; }
  .inst-title { font-size: 13px; font-weight: 800; color: #0B1437; margin-bottom: 10px; }
  .inst-item { font-size: 12px; color: #7B8DB8; padding: 5px 0; display: flex; gap: 8px; }
  .footer { background: #0B1437; padding: 20px 32px; text-align: center; }
  .footer-text { color: rgba(255,255,255,.35); font-size: 12px; line-height: 1.7; }
  .gold { color: #D4AF37; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">A</div>
    <div class="brand">
      <div class="brand-name">AcadeX Platform</div>
      <div class="brand-sub">OFFICIAL HALL ADMISSION TICKET</div>
    </div>
  </div>
  <div class="body">
    <div class="greeting">Hello, ${studentName}!</div>
    <div class="subtitle">Your examination hall ticket is ready. Please carry this QR code (digital or printed) on your exam day.</div>
    <div class="exam-card">
      <div class="exam-name">${examName}</div>
      <div class="exam-meta">📅 ${date} &nbsp;·&nbsp; ⏰ ${shift} Session &nbsp;·&nbsp; 🏛️ ${hall}</div>
    </div>
    <div class="details-grid">
      <div class="detail-box"><div class="detail-label">Examination Hall</div><div class="detail-value">${hall}</div></div>
      <div class="detail-box"><div class="detail-label">Seat Number</div><div class="detail-value">${seat}</div></div>
    </div>
    ${qrDataUrl ? `<div class="qr-section"><img src="${qrDataUrl}" width="200" height="200" alt="QR Hall Ticket"><div class="qr-note">Show this QR code to your invigilator at the hall entrance</div></div>` : ''}
    <div class="instructions">
      <div class="inst-title">📋 Important Instructions</div>
      <div class="inst-item">✅ Report 15 minutes before the exam start time</div>
      <div class="inst-item">✅ Carry a valid college / government photo ID</div>
      <div class="inst-item">✅ Show this QR code to the invigilator for attendance marking</div>
      <div class="inst-item">🚫 Electronic devices (phones, smartwatches) are not allowed inside</div>
      <div class="inst-item">🚫 No study materials or books inside the hall</div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-text">This is an automated email from <span class="gold">AcadeX Platform</span><br>Do not reply to this email. For support, contact your exam administrator.</div>
  </div>
</div>
</body>
</html>`;
}

// ── Send individual email ────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER) {
    logger.warn(`Email skipped (SMTP not configured): ${to}`);
    return { success: false, reason: 'SMTP not configured' };
  }
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `"AcadeX" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Email failed to ${to}:`, err.message);
    return { success: false, reason: err.message };
  }
}

// ── Send FCM Push ────────────────────────────────────────────
async function sendPushNotification({ fcmToken, title, body, data = {} }) {
  const app = getFirebase();
  if (!app || !fcmToken) return { success: false, reason: 'FCM not configured or no token' };
  try {
    const admin = require('firebase-admin');
    const res = await admin.messaging(app).send({
      token: fcmToken,
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      android: { priority: 'high', notification: { sound: 'default', channelId: 'acadex_exams' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
    return { success: true, messageId: res };
  } catch (err) {
    logger.error('FCM push failed:', err.message);
    return { success: false, reason: err.message };
  }
}

// ── Bulk allocation notifications ────────────────────────────
async function sendBulkAllocationNotification(exam, studentUsers) {
  const results = { email: { sent: 0, failed: 0 }, push: { sent: 0, failed: 0 } };

  const emailPromises = studentUsers.map(async (u) => {
    const html = buildHallTicketEmail({
      studentName: u.studentName,
      examName: exam.subjectName,
      date: new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      shift: exam.shift,
      hall: u.hallName,
      seat: u.seatNumber,
    });
    const r = await sendEmail({ to: u.email, subject: `🎓 Hall Ticket: ${exam.subjectName} — ${exam.subjectCode}`, html });
    r.success ? results.email.sent++ : results.email.failed++;
  });

  const pushPromises = studentUsers
    .filter(u => u.fcmToken)
    .map(async (u) => {
      const r = await sendPushNotification({
        fcmToken: u.fcmToken,
        title: '📋 Hall Ticket Ready!',
        body: `${exam.subjectName}: Hall ${u.hallName}, Seat ${u.seatNumber}`,
        data: { type: 'ALLOCATION', examId: exam.id },
      });
      r.success ? results.push.sent++ : results.push.failed++;
    });

  await Promise.allSettled([...emailPromises, ...pushPromises]);
  logger.info(`Notifications: Email ${results.email.sent}/${studentUsers.length}, Push ${results.push.sent}/${studentUsers.filter(u=>u.fcmToken).length}`);
  return results;
}

// ── Send exam reminder ────────────────────────────────────────
async function sendExamReminder(exam, studentUsers) {
  const pushPromises = studentUsers
    .filter(u => u.fcmToken)
    .map(u => sendPushNotification({
      fcmToken: u.fcmToken,
      title: '⏰ Exam Reminder!',
      body: `${exam.subjectName} starts in 1 hour. Hall: ${u.hallName}, Seat: ${u.seatNumber}`,
      data: { type: 'REMINDER', examId: exam.id },
    }));
  await Promise.allSettled(pushPromises);
}

module.exports = {
  sendEmail,
  sendPushNotification,
  sendBulkAllocationNotification,
  sendExamReminder,
  buildHallTicketEmail,
};
