// src/components/layout/StudentLayout.jsx
import AppLayout from './AppLayout';
export default function StudentLayout() {
  return <AppLayout config={{
    tag: 'STUDENT PORTAL', roleLabel: 'Undergraduate Student',
    avatarBg: 'linear-gradient(135deg,#0D6B4E,#065f46)',
    menu: [
      { label: 'MY PORTAL', items: [
        { path: '/student/dashboard', icon: '◈', label: 'Dashboard' },
        { path: '/student/allocation', icon: '◉', label: 'My Allocation' },
        { path: '/student/ticket', icon: '◎', label: 'Hall Ticket' },
        { path: '/student/schedule', icon: '◆', label: 'Exam Schedule' },
        { path: '/student/contacts', icon: '◈', label: 'Invigilator Contacts' },
      ]},
      { label: 'SUPPORT', items: [
        { path: '/student/chat', icon: '◉', label: 'AI Assistant', isNew: true },
        { path: '/student/notifications', icon: '◈', label: 'Notifications' },
      ]},
    ],
  }} />;
}
