// Test dashboard API endpoints
const axios = require('axios');

async function testDashboard() {
  try {
    // First login as exam admin
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mit.edu',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Test dashboard endpoint
    const dashRes = await axios.get('http://localhost:5000/api/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard API response:', JSON.stringify(dashRes.data, null, 2));
    
    // Test exams endpoint
    const examsRes = await axios.get('http://localhost:5000/api/exams?limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Exams API response:', JSON.stringify(examsRes.data, null, 2));
    
    // Test departments endpoint
    const deptRes = await axios.get('http://localhost:5000/api/users/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Departments API response:', JSON.stringify(deptRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard();