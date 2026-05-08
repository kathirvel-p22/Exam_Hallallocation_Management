// src/services/allocationEngine.js — Smart Dept-Mixing Allocation Algorithm
const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');
const qrService = require('./qrService');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * AcadeX Smart Allocation Engine
 *
 * Algorithm:
 * 1. Fetch all eligible students for the exam
 * 2. Group by department
 * 3. Interleave using round-robin (no 2 same-dept students adjacent)
 * 4. For each hall: fill seats row-by-row
 * 5. Reserve front-row seats for differently-abled students
 * 6. Generate QR hall tickets for each student
 * 7. Emit real-time progress via Socket.io
 * 8. Send push notifications on completion
 */
async function runAllocation(examId, hallIds, options = {}, io = null) {
  const {
    mixDepartments = true,
    reserveFrontForDisabled = true,
    sendNotifications = true,
    createdByEmail = 'system',
  } = options;

  const startTime = Date.now();
  const emit = (event, data) => io?.emit(event, { examId, ...data });

  emit('allocation:progress', { step: 1, total: 7, message: 'Loading exam and student data...', percent: 5 });

  // ── Fetch Exam ──
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { departments: { include: { department: true } } },
  });
  if (!exam) throw new ApiError(404, 'Exam not found');
  if (exam.status === 'ONGOING' || exam.status === 'COMPLETED') {
    throw new ApiError(400, 'Cannot allocate for an ongoing or completed exam');
  }

  // ── Delete existing allocations ──
  emit('allocation:progress', { step: 2, total: 7, message: 'Clearing previous allocations...', percent: 15 });
  await prisma.allocation.deleteMany({ where: { examId } });
  await prisma.hallTicket.deleteMany({ where: { examId } });

  // ── Fetch Students ──
  const deptIds = exam.departments.map(d => d.departmentId);
  const students = await prisma.student.findMany({
    where: { departmentId: { in: deptIds } },
    include: { department: { select: { id: true, code: true } }, user: { select: { fcmToken: true, email: true } } },
    orderBy: { registerNo: 'asc' },
  });

  if (students.length === 0) throw new ApiError(400, 'No students found for this exam');

  emit('allocation:progress', { step: 3, total: 7, message: `Found ${students.length} students — running mixing algorithm...`, percent: 30 });

  // ── Fetch Hall Seats ──
  const hallSeatsMap = {};
  let totalCapacity = 0;
  for (const hallId of hallIds) {
    const seats = await prisma.seat.findMany({
      where: { hallId, isActive: true },
      orderBy: [{ row: 'asc' }, { column: 'asc' }],
    });
    hallSeatsMap[hallId] = seats;
    totalCapacity += seats.length;
  }

  if (totalCapacity < students.length) {
    throw new ApiError(400, `Insufficient capacity. Need ${students.length} seats, have ${totalCapacity}`);
  }

  // ── Department Mixing Algorithm ──
  let orderedStudents;
  if (mixDepartments) {
    const deptGroups = {};
    students.forEach(s => {
      const code = s.department.code;
      if (!deptGroups[code]) deptGroups[code] = [];
      deptGroups[code].push(s);
    });

    // Sort disabled students to be assigned first (front seats)
    const disabled = students.filter(s => s.hasDisability);
    const abled = students.filter(s => !s.hasDisability);

    // Round-robin interleave departments
    const groups = Object.values(deptGroups).filter(g => g.length > 0);
    const mixed = [];
    let i = 0;
    while (mixed.length < abled.length) {
      const group = groups[i % groups.length];
      const regular = group.filter(s => !s.hasDisability);
      if (regular.length > 0) {
        const s = regular.shift();
        mixed.push(s);
        group.splice(group.indexOf(s), 1);
        if (group.length === 0) groups.splice(i % groups.length, 1);
      }
      i++;
      if (groups.length === 0) break;
    }

    orderedStudents = [...disabled, ...mixed];
  } else {
    orderedStudents = students;
  }

  emit('allocation:progress', { step: 4, total: 7, message: 'Assigning seats to students...', percent: 50 });

  // ── Assign Seats ──
  const allocations = [];
  let studentIdx = 0;

  for (const hallId of hallIds) {
    const seats = [...hallSeatsMap[hallId]];
    // Put reserved seats first if reserving for disabled
    const reservedSeats = reserveFrontForDisabled ? seats.filter(s => s.isReserved) : [];
    const normalSeats = seats.filter(s => !s.isReserved);
    const orderedSeats = [...reservedSeats, ...normalSeats];

    for (const seat of orderedSeats) {
      if (studentIdx >= orderedStudents.length) break;
      allocations.push({
        examId,
        studentId: orderedStudents[studentIdx].id,
        hallId,
        seatId: seat.id,
        status: 'COMPLETED',
      });
      studentIdx++;
    }
    if (studentIdx >= orderedStudents.length) break;
  }

  // ── Bulk Insert Allocations ──
  emit('allocation:progress', { step: 5, total: 7, message: 'Saving allocations to database...', percent: 65 });
  await prisma.allocation.createMany({ data: allocations, skipDuplicates: true });

  // ── Fetch created allocations for ticket generation ──
  const createdAllocs = await prisma.allocation.findMany({
    where: { examId },
    include: {
      student: { include: { user: true } },
      hall: true,
      seat: true,
    },
  });

  // ── Generate Hall Tickets with QR ──
  emit('allocation:progress', { step: 6, total: 7, message: 'Generating encrypted QR hall tickets...', percent: 78 });

  const ticketData = [];
  for (const alloc of createdAllocs) {
    const { token, expiresAt } = qrService.generateQRToken({
      studentId: alloc.studentId,
      examId,
      allocationId: alloc.id,
      seatNumber: alloc.seat.seatNumber,
      hallId: alloc.hallId,
    });
    ticketData.push({
      studentId: alloc.studentId,
      examId,
      allocationId: alloc.id,
      qrToken: token,
      expiresAt,
    });
  }

  await prisma.hallTicket.createMany({ data: ticketData, skipDuplicates: true });

  // Create attendance records (all ABSENT initially)
  await prisma.attendance.createMany({
    data: createdAllocs.map(a => ({
      allocationId: a.id,
      studentId: a.studentId,
      examId,
      status: 'ABSENT',
    })),
    skipDuplicates: true,
  });

  // ── Update exam status ──
  await prisma.exam.update({ where: { id: examId }, data: { status: 'PUBLISHED' } });

  // ── Send Notifications ──
  if (sendNotifications) {
    emit('allocation:progress', { step: 7, total: 7, message: 'Sending notifications to students...', percent: 90 });
    try {
      const studentUsers = createdAllocs.map(a => ({
        userId: a.student.userId,
        email: a.student.user.email,
        fcmToken: a.student.user.fcmToken,
        studentName: a.student.name,
        hallName: a.hall.name,
        seatNumber: a.seat.seatNumber,
      }));

      await notificationService.sendBulkAllocationNotification(exam, studentUsers);
    } catch (notifErr) {
      logger.warn('Notification delivery failed (non-critical):', notifErr.message);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  const result = {
    examId,
    studentsAllocated: createdAllocs.length,
    hallsUsed: [...new Set(createdAllocs.map(a => a.hallId))].length,
    ticketsGenerated: ticketData.length,
    durationSeconds: parseFloat(duration),
    hallBreakdown: hallIds.map(hId => ({
      hallId: hId,
      count: createdAllocs.filter(a => a.hallId === hId).length,
    })),
  };

  emit('allocation:complete', { ...result, message: `Allocation complete in ${duration}s` });

  logger.info(`Allocation complete for exam ${examId}: ${createdAllocs.length} students in ${duration}s`);
  return result;
}

module.exports = { runAllocation };
