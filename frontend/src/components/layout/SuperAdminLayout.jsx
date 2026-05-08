// src/components/layout/SuperAdminLayout.jsx
import AppLayout from './AppLayout';

export default function SuperAdminLayout() {
  return <AppLayout config={{
    tag: 'SUPER ADMIN', roleLabel: 'University Registrar',
    avatarBg: 'linear-gradient(135deg,#0B1437,#1E2D6B)',
    menu: [
      { label: 'OVERVIEW', items: [
        { path: '/superadmin/dashboard', icon: '◈', label: 'Dashboard' },
        { path: '/superadmin/campuses', icon: '◉', label: 'Campus Overview' },
        { path: '/superadmin/analytics', icon: '◆', label: 'Global Analytics' },
      ]},
      { label: 'ADMINISTRATION', items: [
        { path: '/superadmin/institutions', icon: '◎', label: 'Institutions' },
        { path: '/superadmin/users', icon: '◈', label: 'User Management' },
        { path: '/superadmin/config', icon: '◉', label: 'System Config' },
      ]},
    ],
  }} />;
}