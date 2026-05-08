// Quick test to verify login credentials
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testCredentials() {
  console.log('🔍 Testing login credentials...\n');
  
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  const testPasswords = {
    'superadmin@acadex.edu': 'SuperAdmin@2025',
    'admin@acadex.edu': 'Admin@2025',
    'priya.nair@acadex.edu': 'Invig@2025',
    'arjun@student.acadex.edu': 'Student@2025',
  };

  for (const user of users) {
    const testPassword = testPasswords[user.email];
    if (testPassword) {
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log(`${user.email} (${user.role}): ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
  }

  console.log('\n📧 All user emails in database:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });
}

testCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());