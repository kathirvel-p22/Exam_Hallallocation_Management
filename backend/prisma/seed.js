// prisma/seed.js — AcadeX Demo Data Seeder
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AcadeX database...');

  // ── Institution ──
  const inst = await prisma.institution.upsert({
    where: { code: 'ACADEX-DEMO' },
    update: {},
    create: {
      name: 'AcadeX Demo University',
      code: 'ACADEX-DEMO',
      address: '123 Education Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      website: 'https://acadex.edu',
    },
  });
  console.log('✓ Institution created');

  // ── Departments ──
  const deptData = [
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Electronics & Communication', code: 'ECE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Electrical & Electronics', code: 'EEE' },
    { name: 'Civil Engineering', code: 'CIVIL' },
    { name: 'Master of Business Administration', code: 'MBA' },
  ];
  const depts = {};
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { code_institutionId: { code: d.code, institutionId: inst.id } },
      update: {},
      create: { ...d, institutionId: inst.id },
    });
    depts[d.code] = dept;
  }
  console.log('✓ Departments created');

  // ── Users ──
  const hash = async (pw) => bcrypt.hash(pw, 12);

  // Super Admin
  const saUser = await prisma.user.upsert({
    where: { email: 'superadmin@acadex.edu' },
    update: {},
    create: {
      email: 'superadmin@acadex.edu',
      passwordHash: await hash('SuperAdmin@2025'),
      role: 'SUPER_ADMIN',
      institutionId: inst.id,
    },
  });

  // Exam Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acadex.edu' },
    update: {},
    create: {
      email: 'admin@acadex.edu',
      passwordHash: await hash('Admin@2025'),
      role: 'EXAM_ADMIN',
      institutionId: inst.id,
    },
  });

  // Invigilators
  const invigData = [
    { email: 'priya.nair@acadex.edu', staffId: 'FAC001', name: 'Dr. Priya Nair', deptCode: 'CSE' },
    { email: 'arun.selvan@acadex.edu', staffId: 'FAC002', name: 'Prof. Arun Selvan', deptCode: 'ECE' },
    { email: 'kavitha.r@acadex.edu', staffId: 'FAC003', name: 'Dr. Kavitha R', deptCode: 'MECH' },
    { email: 'mohan.das@acadex.edu', staffId: 'FAC004', name: 'Prof. Mohan Das', deptCode: 'IT' },
  ];
  const invigs = [];
  for (const iv of invigData) {
    const u = await prisma.user.upsert({
      where: { email: iv.email },
      update: {},
      create: {
        email: iv.email,
        passwordHash: await hash('Invig@2025'),
        role: 'INVIGILATOR',
        institutionId: inst.id,
      },
    });
    const invig = await prisma.invigilator.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        staffId: iv.staffId,
        name: iv.name,
        phone: `98765432${10 + invigs.length}`,
        departmentId: depts[iv.deptCode].id,
      },
    });
    invigs.push(invig);
  }

  // Students
  const studentData = [
    { email: 'arjun@student.acadex.edu', regNo: '21CS001', name: 'Arjun Sharma', dept: 'CSE', sem: 3 },
    { email: 'priya.m@student.acadex.edu', regNo: '21EC002', name: 'Priya Mehta', dept: 'ECE', sem: 3 },
    { email: 'ravi.k@student.acadex.edu', regNo: '21CS003', name: 'Ravi Kumar', dept: 'CSE', sem: 3 },
    { email: 'anita.s@student.acadex.edu', regNo: '21IT004', name: 'Anita Singh', dept: 'IT', sem: 3 },
    { email: 'deepak.r@student.acadex.edu', regNo: '21ME005', name: 'Deepak R', dept: 'MECH', sem: 3 },
    { email: 'lakshmi.p@student.acadex.edu', regNo: '21EE006', name: 'Lakshmi P', dept: 'EEE', sem: 3 },
    { email: 'meena.v@student.acadex.edu', regNo: '21CS007', name: 'Meena V', dept: 'CSE', sem: 3 },
    { email: 'kiran.s@student.acadex.edu', regNo: '21EC008', name: 'Kiran S', dept: 'ECE', sem: 3 },
    { email: 'suresh.k@student.acadex.edu', regNo: '21IT009', name: 'Suresh K', dept: 'IT', sem: 3 },
    { email: 'divya.m@student.acadex.edu', regNo: '21ME010', name: 'Divya M', dept: 'MECH', sem: 3 },
  ];
  const students = [];
  for (const s of studentData) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: await hash('Student@2025'),
        role: 'STUDENT',
        institutionId: inst.id,
      },
    });
    const student = await prisma.student.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        registerNo: s.regNo,
        name: s.name,
        semester: s.sem,
        academicYear: '2024-25',
        departmentId: depts[s.dept].id,
      },
    });
    students.push(student);
  }
  console.log('✓ Users created (1 super admin, 1 exam admin, 4 invigilators, 10 students)');

  // ── Halls ──
  const hallData = [
    { name: 'Hall A', code: 'HALL-A', building: 'Block 1', floor: 1, capacity: 60, rows: 6, columns: 10, facilities: JSON.stringify(['AC', 'CCTV', 'Water']) },
    { name: 'Hall B', code: 'HALL-B', building: 'Block 1', floor: 2, capacity: 50, rows: 5, columns: 10, facilities: JSON.stringify(['CCTV', 'Fan']) },
    { name: 'Hall C', code: 'HALL-C', building: 'Block 2', floor: 1, capacity: 80, rows: 8, columns: 10, facilities: JSON.stringify(['AC', 'CCTV', 'Projector']) },
    { name: 'CS Lab', code: 'CS-LAB', building: 'Block 3', floor: 1, capacity: 40, rows: 4, columns: 10, facilities: JSON.stringify(['AC', 'Computers']) },
    { name: 'Hall D', code: 'HALL-D', building: 'Block 2', floor: 2, capacity: 60, rows: 6, columns: 10, facilities: JSON.stringify(['CCTV', 'Fan']) },
    { name: 'Seminar Hall', code: 'SEM-HALL', building: 'Block 4', floor: 1, capacity: 120, rows: 10, columns: 12, facilities: JSON.stringify(['AC', 'CCTV', 'Stage', 'Projector']) },
  ];
  const halls = {};
  for (const h of hallData) {
    const hall = await prisma.hall.upsert({
      where: { code_institutionId: { code: h.code, institutionId: inst.id } },
      update: {},
      create: { ...h, institutionId: inst.id },
    });
    halls[h.code] = hall;
    // Create seats
    const existingSeats = await prisma.seat.count({ where: { hallId: hall.id } });
    if (existingSeats === 0) {
      const seatRows = [];
      for (let r = 0; r < h.rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 0; c < h.columns; c++) {
          seatRows.push({
            hallId: hall.id,
            seatNumber: `${rowLetter}-${String(c + 1).padStart(2, '0')}`,
            row: r + 1,
            column: c + 1,
            isReserved: r === 0 && c === 0, // First seat reserved for differently-abled
          });
        }
      }
      await prisma.seat.createMany({ data: seatRows });
    }
  }
  console.log('✓ Halls and seats created');

  // ── Exams ──
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 1);

  const exam = await prisma.exam.create({
    data: {
      subjectName: 'Data Structures & Algorithms',
      subjectCode: 'CS2301',
      date: examDate,
      shift: 'MORNING',
      startTime: '09:00',
      endTime: '12:00',
      durationMins: 180,
      semester: 3,
      academicYear: '2024-25',
      level: 'UG',
      status: 'PUBLISHED',
      institutionId: inst.id,
      createdByEmail: 'admin@acadex.edu',
      departments: {
        create: [
          { departmentId: depts['CSE'].id, studentCount: 4 },
          { departmentId: depts['ECE'].id, studentCount: 3 },
          { departmentId: depts['IT'].id, studentCount: 2 },
          { departmentId: depts['MECH'].id, studentCount: 1 },
        ],
      },
    },
  });

  // ── Allocations ──
  const hallASeats = await prisma.seat.findMany({
    where: { hallId: halls['HALL-A'].id },
    orderBy: [{ row: 'asc' }, { column: 'asc' }],
    take: students.length,
  });

  for (let i = 0; i < students.length; i++) {
    const alloc = await prisma.allocation.create({
      data: {
        examId: exam.id,
        studentId: students[i].id,
        hallId: halls['HALL-A'].id,
        seatId: hallASeats[i].id,
        status: 'COMPLETED',
      },
    });
    // Attendance (some present, some absent)
    await prisma.attendance.create({
      data: {
        allocationId: alloc.id,
        studentId: students[i].id,
        examId: exam.id,
        status: i < 7 ? 'PRESENT' : 'ABSENT',
        markedAt: i < 7 ? new Date() : null,
        method: i < 7 ? 'QR_SCAN' : null,
      },
    });
    // Hall Ticket
    const jwt = require('jsonwebtoken');
    const qrToken = jwt.sign(
      { studentId: students[i].id, examId: exam.id, allocationId: alloc.id, seat: hallASeats[i].seatNumber },
      process.env.QR_TOKEN_SECRET || 'qr_secret',
      { expiresIn: '24h' }
    );
    await prisma.hallTicket.create({
      data: {
        studentId: students[i].id,
        examId: exam.id,
        allocationId: alloc.id,
        qrToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  // ── Invigilator Duties ──
  await prisma.invigDuty.create({
    data: {
      invigilatorId: invigs[0].id,
      examId: exam.id,
      hallId: halls['HALL-A'].id,
      isConfirmed: true,
      checkInAt: new Date(),
    },
  });

  console.log('✓ Exam, allocations, hall tickets, attendance created');

  console.log('\n✅ Seed complete!\n');
  console.log('═══ Login Credentials ═══');
  console.log('Super Admin : superadmin@acadex.edu / SuperAdmin@2025');
  console.log('Exam Admin  : admin@acadex.edu      / Admin@2025');
  console.log('Invigilator : priya.nair@acadex.edu / Invig@2025');
  console.log('Student     : arjun@student.acadex.edu / Student@2025');
  console.log('════════════════════════');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
