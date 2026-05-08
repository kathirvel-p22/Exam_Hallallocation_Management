// src/App.jsx — Main App with Router and Branding
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { BrandingProvider } from './components/providers/BrandingProvider';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import InvigilatorLayout from './components/layout/InvigilatorLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DebugAuth from './pages/DebugAuth';
import LoginTest from './pages/LoginTest';
import NotFoundPage from './pages/NotFoundPage';

// Admin pages
import TestDashboard from './pages/admin/TestDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import LiveMonitor from './pages/admin/LiveMonitor';
import ExamManagement from './pages/admin/ExamManagement';
import HallManagement from './pages/admin/HallManagement';
import AllocationEngine from './pages/admin/AllocationEngine';
import InvigilatorManagement from './pages/admin/InvigilatorManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ReportsPage from './pages/admin/Reports';
import AnalyticsPage from './pages/admin/Analytics';
import NotificationsPage from './pages/admin/Notifications';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import MyAllocation from './pages/student/MyAllocation';
import HallTicket from './pages/student/HallTicket';
import ExamSchedule from './pages/student/ExamSchedule';
import InvigilatorContacts from './pages/student/InvigilatorContacts';
import AIChat from './pages/student/AIChat';
import StudentNotifications from './pages/student/Notifications';

// Invigilator pages
import InvigDashboard from './pages/invigilator/Dashboard';
import QRScanner from './pages/invigilator/QRScanner';
import SeatMapPage from './pages/invigilator/SeatMap';
import AttendanceLog from './pages/invigilator/AttendanceLog';
import ReportIssue from './pages/invigilator/ReportIssue';
import DutyHistory from './pages/invigilator/DutyHistory';

// Super Admin pages
import SADashboard from './pages/superadmin/Dashboard';
import CampusOverview from './pages/superadmin/CampusOverview';
import GlobalAnalytics from './pages/superadmin/GlobalAnalytics';
import InstitutionManagement from './pages/superadmin/InstitutionManagement';
import UserManagement from './pages/superadmin/UserManagement';
import SystemConfig from './pages/superadmin/SystemConfig';

// ── Protected Route ──────────────────────────────────────────
function ProtectedRoute({ allowedRoles }) {
  const store = useAuthStore();
  const { user, isInitialized } = store;
  const isAuthenticated = store.isAuthenticated();
  
  if (!isInitialized) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6EE]">
      <div className="text-center">
        <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-navy">
          <span className="font-display text-2xl font-bold text-gold">A</span>
        </div>
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-navy/40 mt-3 font-mono">Loading AcadeX...</p>
      </div>
    </div>
  );
}

// ── Role-based redirect ──────────────────────────────────────
function RoleRedirect() {
  const { user } = useAuthStore();
  const map = {
    EXAM_ADMIN: '/admin/dashboard',
    SUPER_ADMIN: '/superadmin/dashboard',
    INVIGILATOR: '/invigilator/dashboard',
    STUDENT: '/student/dashboard',
  };
  return <Navigate to={map[user?.role] || '/login'} replace />;
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => { fetchMe(); }, []);

  return (
    <BrandingProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { 
              background: 'var(--color-primary, #075985)', 
              color: 'white', 
              borderRadius: '12px', 
              fontSize: '13px', 
              fontFamily: 'Calibri, sans-serif' 
            },
            success: { iconTheme: { primary: 'var(--color-secondary, #eab308)', secondary: 'var(--color-primary, #075985)' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/debug" element={<DebugAuth />} />
          <Route path="/test-login" element={<LoginTest />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Auth redirect */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<RoleRedirect />} />
          </Route>

          {/* ── Admin ── */}
          <Route element={<ProtectedRoute allowedRoles={['EXAM_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="live" element={<LiveMonitor />} />
              <Route path="exams" element={<ExamManagement />} />
              <Route path="halls" element={<HallManagement />} />
              <Route path="allocation" element={<AllocationEngine />} />
              <Route path="invigilators" element={<InvigilatorManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* ── Student ── */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="allocation" element={<MyAllocation />} />
              <Route path="ticket" element={<HallTicket />} />
              <Route path="schedule" element={<ExamSchedule />} />
              <Route path="contacts" element={<InvigilatorContacts />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="notifications" element={<StudentNotifications />} />
            </Route>
          </Route>

          {/* ── Invigilator ── */}
          <Route element={<ProtectedRoute allowedRoles={['INVIGILATOR']} />}>
            <Route path="/invigilator" element={<InvigilatorLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InvigDashboard />} />
              <Route path="scanner" element={<QRScanner />} />
              <Route path="seatmap" element={<SeatMapPage />} />
              <Route path="attendance" element={<AttendanceLog />} />
              <Route path="issue" element={<ReportIssue />} />
              <Route path="history" element={<DutyHistory />} />
            </Route>
          </Route>

          {/* ── Super Admin ── */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SADashboard />} />
              <Route path="campuses" element={<CampusOverview />} />
              <Route path="analytics" element={<GlobalAnalytics />} />
              <Route path="institutions" element={<InstitutionManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="config" element={<SystemConfig />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </BrandingProvider>
  );
}
