// Verification script to test all demo credentials
const axios = require('axios');

const DEMO_CREDENTIALS = [
  { role: 'STUDENT', email: 'arjun@student.acadex.edu', password: 'Student@2025', expectedRedirect: '/student/dashboard' },
  { role: 'INVIGILATOR', email: 'priya.nair@acadex.edu', password: 'Invig@2025', expectedRedirect: '/invigilator/dashboard' },
  { role: 'EXAM_ADMIN', email: 'admin@acadex.edu', password: 'Admin@2025', expectedRedirect: '/admin/dashboard' },
  { role: 'SUPER_ADMIN', email: 'superadmin@acadex.edu', password: 'SuperAdmin@2025', expectedRedirect: '/superadmin/dashboard' }
];

async function testLogin(credentials) {
  try {
    console.log(`\n🔍 Testing ${credentials.role}: ${credentials.email}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    
    if (response.status === 200 && response.data.success) {
      const { user, accessToken } = response.data.data;
      console.log(`✅ ${credentials.role} login successful!`);
      console.log(`   - User: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Token: ${accessToken ? 'Present' : 'Missing'}`);
      console.log(`   - Expected redirect: ${credentials.expectedRedirect}`);
      console.log(`   - Profile: ${user.student ? 'Student profile' : user.invigilator ? 'Invigilator profile' : 'Admin profile'}`);
      return true;
    } else {
      console.log(`❌ ${credentials.role} login failed: Invalid response`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${credentials.role} login failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function verifyAllLogins() {
  console.log('🚀 AcadeX Login Verification Test');
  console.log('==================================');
  
  let successCount = 0;
  let totalCount = DEMO_CREDENTIALS.length;
  
  for (const credentials of DEMO_CREDENTIALS) {
    const success = await testLogin(credentials);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('\n📊 VERIFICATION RESULTS:');
  console.log('========================');
  console.log(`✅ Successful logins: ${successCount}/${totalCount}`);
  console.log(`❌ Failed logins: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ALL DEMO CREDENTIALS WORKING PERFECTLY!');
    console.log('🚀 The login system is fully functional!');
    console.log('\n🔗 Access the platform at: http://localhost:5000');
    console.log('📝 Use any of the demo credentials to test different roles');
  } else {
    console.log('\n⚠️  Some credentials failed - check server logs for details');
  }
}

// Run the verification
verifyAllLogins().catch(console.error);