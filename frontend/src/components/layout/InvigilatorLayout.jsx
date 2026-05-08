// src/components/layout/InvigilatorLayout.jsx
import AppLayout from './AppLayout';

export default function InvigilatorLayout() {
  return <AppLayout config={{
    tag: 'INVIGILATOR', roleLabel: 'Examination Invigilator',
    avatarBg: 'linear-gradient(135deg,#A81C3A,#7f1d1d)',
    menu: [
      { label: 'MY DUTY', items: [
        { path: '/invigilator/dashboard', icon: '◈', label: 'Dashboard' },
        { path: '/invigilator/scanner', icon: '◉', label: 'QR Scanner' },
        { path: '/invigilator/seatmap', icon: '◎', label: 'Seat Map' },
        { path: '/invigilator/attendance', icon: '◆', label: 'Attendance Log' },
      ]},
      { label: 'ACTIONS', items: [
        { path: '/invigilator/issue', icon: '◈', label: 'Report Issue' },
        { path: '/invigilator/history', icon: '◉', label: 'Duty History' },
      ]},
    ],
  }} />;
}
