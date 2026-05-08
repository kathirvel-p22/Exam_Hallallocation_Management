// src/services/chatService.js — Groq LLaMA 3 AI Chatbot
const Groq = require('groq-sdk');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

let groqClient = null;
function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// Build student context for AI
async function buildStudentContext(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: { select: { name: true, code: true } },
      allocations: {
        include: {
          exam: true,
          hall: { include: { duties: { include: { invigilator: { select: { name: true, phone: true } } } } } },
          seat: true,
        },
        orderBy: { allocatedAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!student) return null;

  const upcoming = student.allocations.filter(
    a => new Date(a.exam.date) >= new Date() && a.exam.status !== 'CANCELLED'
  );

  return {
    name: student.name,
    registerNo: student.registerNo,
    department: student.department.name,
    semester: student.semester,
    upcomingExams: upcoming.map(a => ({
      subject: a.exam.subjectName,
      code: a.exam.subjectCode,
      date: new Date(a.exam.date).toLocaleDateString('en-IN'),
      shift: a.exam.shift,
      startTime: a.exam.startTime,
      hall: a.hall.name,
      seat: a.seat.seatNumber,
      building: a.hall.building,
      floor: a.hall.floor,
      invigilators: a.hall.duties.map(d => ({
        name: d.invigilator.name,
        phone: d.invigilator.phone,
      })),
    })),
  };
}

const SYSTEM_PROMPT = (ctx) => `You are ExamBot, the AI assistant for the AcadeX examination management platform.
You help students with examination-related queries. Be concise, friendly, and accurate.

Student Context:
- Name: ${ctx?.name || 'Unknown'}
- Register No: ${ctx?.registerNo || 'N/A'}
- Department: ${ctx?.department || 'N/A'} | Semester: ${ctx?.semester || 'N/A'}
- Upcoming Exams: ${JSON.stringify(ctx?.upcomingExams || [], null, 2)}

Your capabilities:
1. Answer questions about hall allocation, seat numbers, exam timings
2. Provide invigilator contact information
3. Explain exam rules and what to bring
4. Help with downloading or understanding the hall ticket
5. General exam guidance

Rules:
- Only answer exam and academic-related questions
- If asked about something outside your scope, politely redirect
- Format responses clearly using bullet points when listing items
- Keep responses concise (under 150 words unless detailed info is needed)
- Always refer to the student's actual data from context when available`;

// Fallback responses when Groq is unavailable
const FALLBACK_RULES = [
  { keywords: ['hall', 'room', 'where'], reply: (ctx) => ctx?.upcomingExams?.[0] ? `You're assigned to **${ctx.upcomingExams[0].hall}** (${ctx.upcomingExams[0].building}, Floor ${ctx.upcomingExams[0].floor}) for ${ctx.upcomingExams[0].subject}.` : "Please check your allocation in the 'My Allocation' section." },
  { keywords: ['seat', 'seat number'], reply: (ctx) => ctx?.upcomingExams?.[0] ? `Your seat number is **${ctx.upcomingExams[0].seat}** in ${ctx.upcomingExams[0].hall}.` : "Your seat details are in 'My Allocation'." },
  { keywords: ['time', 'when', 'start'], reply: (ctx) => ctx?.upcomingExams?.[0] ? `Your exam **${ctx.upcomingExams[0].subject}** is on ${ctx.upcomingExams[0].date} at **${ctx.upcomingExams[0].startTime}** (${ctx.upcomingExams[0].shift} session).` : "Check the exam schedule for timing." },
  { keywords: ['invigilat', 'contact', 'phone'], reply: (ctx) => ctx?.upcomingExams?.[0]?.invigilators?.[0] ? `Your invigilator is **${ctx.upcomingExams[0].invigilators[0].name}** — Phone: **${ctx.upcomingExams[0].invigilators[0].phone}**` : "See 'Invigilator Contacts' for their details." },
  { keywords: ['ticket', 'qr', 'download'], reply: () => "Go to **Hall Ticket** in the left menu to view and download your QR code as PDF. You can also share it via WhatsApp." },
  { keywords: ['bring', 'carry', 'need'], reply: () => "Bring: (1) This QR hall ticket (phone or print), (2) College ID or govt photo ID, (3) Pen/pencil. 🚫 No phones, calculators, or study materials allowed inside." },
];

async function chat(messages, studentId) {
  const ctx = studentId ? await buildStudentContext(studentId) : null;
  const groq = getGroq();

  if (!groq) {
    // Fallback to rule-based responses
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const match = FALLBACK_RULES.find(r => r.keywords.some(k => lastMsg.includes(k)));
    return match ? match.reply(ctx) : "I can help with your hall allocation, seat number, exam timing, and invigilator contacts. What would you like to know?";
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT(ctx) },
        ...messages.slice(-10), // last 10 messages for context
      ],
      max_tokens: 400,
      temperature: 0.7,
      stream: false,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (err) {
    logger.warn('Groq API error, falling back to rules:', err.message);
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const match = FALLBACK_RULES.find(r => r.keywords.some(k => lastMsg.includes(k)));
    return match ? match.reply(ctx) : "AI service temporarily unavailable. Please check your allocation details in the 'My Allocation' section.";
  }
}

module.exports = { chat, buildStudentContext };
