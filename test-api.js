// Test API responses
const axios = require('axios');

async function testAPIs() {
  try {
    // Login first
    console.log('🔐 Logging in as exam admin...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@acadex.edu',
      password: 'Admin@2025'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login successful');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test dashboard API
    console.log('\n📊 Testing dashboard API...');
    const dashRes = await axios.get('http://localhost:5000/api/analytics/dashboard', { headers });
    console.log('Dashboard response:', JSON.stringify(dashRes.data, null, 2));
    
    // Test exams API
    console.log('\n📋 Testing exams API...');
    const examsRes = await axios.get('http://localhost:5000/api/exams?limit=5', { headers });
    console.log('Exams response:', JSON.stringify(examsRes.data, null, 2));
    
    // Test monthly API
    console.log('\n📈 Testing monthly API...');
    const monthlyRes = await axios.get('http://localhost:5000/api/analytics/monthly', { headers });
    console.log('Monthly response:', JSON.stringify(monthlyRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAPIs();