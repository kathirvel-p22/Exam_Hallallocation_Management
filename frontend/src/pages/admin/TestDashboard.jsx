// Test Dashboard Component
import React from 'react';

export default function TestDashboard() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#10B981', 
      color: 'white', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        🎯 TEST DASHBOARD - ROUTING IS WORKING!
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        If you see this green page, the routing to /admin/dashboard is working correctly.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        color: '#10B981', 
        padding: '20px', 
        borderRadius: '10px',
        display: 'inline-block',
        fontWeight: 'bold'
      }}>
        ✅ SUCCESS: AdminDashboard route is functional!
      </div>
      <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
        This is a temporary test component. The real dashboard will be restored shortly.
      </p>
    </div>
  );
}