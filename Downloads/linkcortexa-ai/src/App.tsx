import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import AdvancedScanner from './pages/AdvancedScanner';
import SecureVault from './pages/SecureVault';
import Threats from './pages/Threats';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import BlockchainLogs from './pages/BlockchainLogs';
import Extension from './pages/Extension';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-brand-dark text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing LinkCortexa AI...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark text-slate-300 font-sans selection:bg-brand-blue/30">
      {user && <Sidebar />}
      <main className={user ? "lg:pl-64 min-h-screen" : ""}>
        <div className={user ? "container mx-auto px-6 py-10 max-w-7xl" : ""}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/scanner" element={user ? <AdvancedScanner /> : <Navigate to="/login" />} />
            <Route path="/vault" element={user ? <SecureVault /> : <Navigate to="/login" />} />
            <Route path="/threats" element={user ? <Threats /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/blockchain" element={user ? <BlockchainLogs /> : <Navigate to="/login" />} />
            <Route path="/extension" element={user ? <Extension /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
