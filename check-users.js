// Check users in database
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📋 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        institutionId: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Institution: ${user.institutionId}`);
    });
    
    // Check institutions
    console.log('\n🏛️ Checking institutions...');
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        code: true
      }
    });
    
    console.log(`Found ${institutions.length} institutions:`);
    institutions.forEach(inst => {
      console.log(`- ${inst.name} (${inst.code}) - ID: ${inst.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();