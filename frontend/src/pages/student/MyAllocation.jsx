// src/pages/student/MyAllocation.jsx
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge, StatusBadge } from '../../components/ui';

export default function MyAllocation() {
  const { data, isLoading } = useQuery({ queryKey: ['my-alloc'], queryFn: () => apiGet('/allocation/student/my') });
  const allocations = data?.data || [];
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="My Exams" title="My Allocations" subtitle="Your seat assignments for all scheduled exams" />
      {allocations.length === 0 ? (
        <div className="card card-md text-center py-12 text-navy/30">No allocations found for your account</div>
      ) : allocations.map(a => (
        <div key={a.id} className="card card-md">
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="font-display text-xl font-bold">{a.exam.subjectName}</h3>
              <p className="text-[13px] text-navy/50 mt-1">{a.exam.subjectCode} · {format(new Date(a.exam.date), 'EEEE, dd MMMM yyyy')} · {a.exam.startTime}–{a.exam.endTime}</p>
            </div>
            <StatusBadge status={a.exam.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[['Hall', a.hall?.name, '⬡'], ['Building', `${a.hall?.building}, Fl ${a.hall?.floor}`, '◉'], ['Seat Number', a.seat?.seatNumber, '◎'], ['Attendance', a.attendance?.status || 'ABSENT', '✓']].map(([l,v,i]) => (
              <div key={l} className="bg-cream rounded-xl p-3.5">
                <div className="text-[10px] text-navy/40 font-mono uppercase tracking-widest mb-1">{l}</div>
                <div className="font-bold text-[15px] flex items-center gap-1.5"><span className="text-gold">{i}</span>{v}</div>
              </div>
            ))}
          </div>
          {/* Invigilators */}
          {a.hall?.duties?.length > 0 && (
            <div>
              <p className="text-[10px] text-navy/40 font-mono uppercase tracking-widest mb-2">Invigilators</p>
              <div className="flex flex-wrap gap-2">
                {a.hall.duties.map(d => (
                  <div key={d.invigilator?.id} className="flex items-center gap-2 bg-cream border border-navy/10 rounded-xl px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-ruby-exam/10 flex items-center justify-center text-ruby-exam text-[10px] font-black">{d.invigilator?.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                    <div>
                      <div className="font-bold text-[12px]">{d.invigilator?.name}</div>
                      <div className="text-[10px] text-navy/40">{d.invigilator?.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
