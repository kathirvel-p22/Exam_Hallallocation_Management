// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, differenceInSeconds } from 'date-fns';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge } from '../../components/ui';
import useAuthStore from '../../store/authStore';

function useCountdown(targetDate) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!targetDate) return;
    const update = () => setSecs(Math.max(0, differenceInSeconds(new Date(targetDate), new Date())));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return { h, m, s, total: secs };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user }  = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['student-profile'], queryFn: () => apiGet('/students/me/profile') });
  const student = data?.data;
  const profile = user?.student;

  const upcoming = (student?.allocations || []).filter(a => new Date(a.exam.date) >= new Date() && a.exam.status !== 'CANCELLED').sort((a,b) => new Date(a.exam.date) - new Date(b.exam.date));
  const next = upcoming[0];
  const { h, m, s, total } = useCountdown(next ? `${next.exam.date.slice(0,10)}T${next.exam.startTime}:00` : null);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="My Portal"
        title={`Hello, ${student?.name?.split(' ')[0] || 'Student'}! 👋`}
        subtitle={`${student?.department?.name} · Semester ${student?.semester} · ${student?.registerNo}`}
      />

      {/* Countdown */}
      {next && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card card-md bg-navy text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(212,175,55,1) 0%, transparent 60%)' }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-[10px] text-white/35 font-mono uppercase tracking-[2px] mb-2">Next Exam In</p>
              <div className="flex items-end gap-4">
                {[['Hours',h],['Minutes',m],['Seconds',s]].map(([l,v]) => (
                  <div key={l} className="text-center">
                    <div className="font-display text-[52px] font-bold text-gold leading-none">{String(v).padStart(2,'0')}</div>
                    <div className="text-[10px] text-white/30 font-mono uppercase mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold text-white mb-1">{next.exam.subjectName}</div>
              <div className="text-[13px] text-white/50 mb-1">{next.exam.subjectCode} · {next.exam.shift} Session</div>
              <div className="text-[13px] text-white/50 mb-1">{format(new Date(next.exam.date), 'EEEE, dd MMMM yyyy')} · {next.exam.startTime}</div>
              <div className="flex items-center gap-2 justify-end mt-3">
                <Badge variant="green">Hall: {next.hall?.name}</Badge>
                <Badge variant="gold">Seat: {next.seat?.seatNumber}</Badge>
              </div>
            </div>
          </div>
          {total === 0 && <div className="mt-4 text-center text-emerald-400 font-bold animate-pulse">🟢 Exam is starting NOW! Head to your hall.</div>}
        </motion.div>
      )}

      {/* Quick Action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '◎', label: 'Hall Ticket', sub: 'View & download QR', route: '/student/ticket', color: 'hover:border-gold/40 hover:bg-gold/5' },
          { icon: '◉', label: 'My Allocation', sub: 'Seat & hall details', route: '/student/allocation', color: 'hover:border-emerald-exam-border hover:bg-emerald-exam-light' },
          { icon: '◆', label: 'Schedule', sub: 'All upcoming exams', route: '/student/schedule', color: 'hover:border-navy/20 hover:bg-navy/5' },
          { icon: '◈', label: 'AI Assistant', sub: 'Ask exam questions', route: '/student/chat', color: 'hover:border-ruby-exam-border hover:bg-ruby-exam-light' },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.route)} className={`card card-md text-left transition-all border ${a.color}`}>
            <div className="text-3xl mb-3">{a.icon}</div>
            <div className="font-bold text-[14px]">{a.label}</div>
            <div className="text-[11px] text-navy/40 mt-1">{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Upcoming exams list */}
      <div className="card card-md">
        <h3 className="font-display text-lg font-bold mb-4">Upcoming Exams</h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-navy/30">No upcoming exams</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-3.5 bg-cream rounded-xl border border-navy/5">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex flex-col items-center justify-center shrink-0">
                  <div className="font-display text-lg font-bold text-navy leading-none">{format(new Date(a.exam.date), 'dd')}</div>
                  <div className="text-[9px] text-navy/40 font-mono uppercase">{format(new Date(a.exam.date), 'MMM')}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px]">{a.exam.subjectName}</div>
                  <div className="text-[12px] text-navy/50">{a.exam.subjectCode} · {a.exam.startTime} · {a.exam.shift}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="navy">{a.hall?.name}</Badge>
                  <Badge variant="gold">Seat {a.seat?.seatNumber}</Badge>
                  <StatusBadge status={a.exam.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
