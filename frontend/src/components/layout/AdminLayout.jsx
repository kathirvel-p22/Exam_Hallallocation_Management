// src/components/layout/AdminLayout.jsx
import AppLayout from './AppLayout';
export default function AdminLayout() {
  return <AppLayout config={{
    tag: 'EXAM ADMIN', roleLabel: 'Exam Controller',
    avatarBg: 'linear-gradient(135deg,#D4AF37,#A8880A)',
    menu: [
      { label: 'OVERVIEW', items: [
        { path: '/admin/dashboard', icon: '◈', label: 'Dashboard' },
        { path: '/admin/live', icon: '◉', label: 'Live Monitor', badge: 'LIVE', badgeClass: 'bg-emerald-exam text-white' },
        { path: '/admin/analytics', icon: '◆', label: 'Analytics' },
      ]},
      { label: 'MANAGEMENT', items: [
        { path: '/admin/exams', icon: '◎', label: 'Exam Management' },
        { path: '/admin/halls', icon: '⬡', label: 'Hall Management' },
        { path: '/admin/allocation', icon: '✦', label: 'Allocation Engine' },
        { path: '/admin/invigilators', icon: '◈', label: 'Invigilators' },
        { path: '/admin/students', icon: '◉', label: 'Students' },
      ]},
      { label: 'TOOLS', items: [
        { path: '/admin/reports', icon: '◧', label: 'Reports' },
        { path: '/admin/notifications', icon: '◈', label: 'Notifications' },
      ]},
    ],
  }} />;
}
