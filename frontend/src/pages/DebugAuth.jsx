// Debug page to check auth state
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function DebugAuth() {
  const store = useAuthStore();
  const { user, accessToken, isInitialized } = store;
  const isAuthenticated = store.isAuthenticated();

  useEffect(() => {
    console.log('🔍 Auth Debug State:');
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- isInitialized:', isInitialized);
    console.log('- accessToken:', accessToken ? 'EXISTS' : 'MISSING');
    console.log('- user:', user);
    
    if (user) {
      console.log('- user.role:', user.role);
      console.log('- user.student:', user.student);
      console.log('- user.profile:', user.profile);
    }
  }, [user, accessToken, isAuthenticated, isInitialized]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
          </div>
          
          <div>
            <strong>Is Initialized:</strong> {isInitialized ? '✅ Yes' : '❌ No'}
          </div>
          
          <div>
            <strong>Access Token:</strong> {accessToken ? '✅ Exists' : '❌ Missing'}
          </div>
          
          <div>
            <strong>User:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Local Storage:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(localStorage.getItem('acadex-auth'), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}