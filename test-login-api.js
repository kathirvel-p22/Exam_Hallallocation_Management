// Quick test script to verify login API
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing login API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'arjun@student.acadex.edu',
      password: 'Student@2025'
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    const { accessToken, user } = response.data.data;
    console.log('✅ Access token received:', !!accessToken);
    console.log('✅ User data:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasStudent: !!user.student,
      hasProfile: !!user.profile
    });
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();