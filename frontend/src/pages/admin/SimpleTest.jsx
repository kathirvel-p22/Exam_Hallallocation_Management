// Simple test page
export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1 style={{ color: 'darkblue', fontSize: '24px' }}>
        🎯 SIMPLE TEST PAGE - IF YOU SEE THIS, FRONTEND IS WORKING!
      </h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        This is a basic test page to verify the frontend is loading correctly.
      </p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '2px solid green' }}>
        <strong>✅ SUCCESS: Frontend is rendering React components!</strong>
      </div>
    </div>
  );
}