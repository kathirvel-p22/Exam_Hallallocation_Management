// Quick test to check user profile
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  console.log('🔍 Checking user: mpkathir2204@gmail.com\n');
  
  const user = await prisma.user.findUnique({
    where: { email: 'mpkathir2204@gmail.com' },
    include: {
      student: {
        include: { department: true },
      },
      invigilator: {
        include: { department: true },
      },
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log('✅ User found:');
  console.log('- Email:', user.email);
  console.log('- Role:', user.role);
  console.log('- Institution ID:', user.institutionId);
  console.log('- Student Profile:', user.student ? 'EXISTS' : 'MISSING');
  console.log('- Invigilator Profile:', user.invigilator ? 'EXISTS' : 'MISSING');

  if (user.student) {
    console.log('\n📚 Student Details:');
    console.log('- Name:', user.student.name);
    console.log('- Register No:', user.student.registerNo);
    console.log('- Semester:', user.student.semester);
    console.log('- Department:', user.student.department?.name);
  }

  if (user.invigilator) {
    console.log('\n👨‍🏫 Invigilator Details:');
    console.log('- Name:', user.invigilator.name);
    console.log('- Staff ID:', user.invigilator.staffId);
    console.log('- Department:', user.invigilator.department?.name);
  }
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());