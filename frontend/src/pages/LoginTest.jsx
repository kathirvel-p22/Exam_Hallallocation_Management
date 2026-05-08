// Simple login test page to debug auth store
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginTest() {
  const navigate = useNavigate();
  const store = useAuthStore();
  const { login, user, accessToken, isLoading } = store;
  const [email, setEmail] = useState('arjun@student.acadex.edu');
  const [password, setPassword] = useState('Student@2025');
  const [result, setResult] = useState(null);
  const [authState, setAuthState] = useState({});

  // Update auth state display
  useEffect(() => {
    const updateState = () => {
      const isAuthenticated = store.isAuthenticated();
      setAuthState({
        user: !!user,
        accessToken: !!accessToken,
        isAuthenticated,
        userRole: user?.role,
        localStorage: localStorage.getItem('acadex-auth')
      });
    };
    updateState();
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [user, accessToken, store]);

  const handleLogin = async () => {
    console.log('🔍 Starting login test...');
    try {
      const loginResult = await login(email, password);
      console.log('✅ Login completed:', loginResult);
      setResult(loginResult);
      
      // Check auth state multiple times
      setTimeout(() => {
        console.log('🔍 Auth state check after 100ms:', {
          user: !!user,
          accessToken: !!accessToken,
          isAuthenticated
        });
      }, 100);
      
      setTimeout(() => {
        const isAuth = store.isAuthenticated();
        console.log('🔍 Auth state check after 500ms:', {
          user: !!user,
          accessToken: !!accessToken,
          isAuthenticated: isAuth
        });
        
        if (isAuth && user) {
          console.log('🔄 Redirecting to dashboard...');
          navigate('/student/dashboard');
        } else {
          console.log('❌ Not authenticated, cannot redirect');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      setResult({ error: error.message });
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('acadex-auth');
    window.location.reload();
  };

  const forceRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Test Login'}
          </button>
        </div>
        
        <div className="mt-6 space-y-2">
          <div><strong>Is Authenticated:</strong> {authState.isAuthenticated ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Has User:</strong> {authState.user ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Has Token:</strong> {authState.accessToken ? '✅ Yes' : '❌ No'}</div>
          <div><strong>User Role:</strong> {authState.userRole || 'None'}</div>
          <div><strong>LocalStorage:</strong> {authState.localStorage ? '✅ Has Data' : '❌ Empty'}</div>
        </div>
        
        {result && (
          <div className="mt-4">
            <strong>Login Result:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto max-h-32">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/debug')}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Debug Page
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Login Page
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearStorage}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Clear Storage
            </button>
            <button
              onClick={forceRefresh}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}