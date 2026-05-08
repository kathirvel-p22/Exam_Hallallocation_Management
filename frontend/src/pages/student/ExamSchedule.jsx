// src/pages/student/ExamSchedule.jsx
import { useQuery } from '@tanstack/react-query';
import { format, isPast, isToday } from 'date-fns';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge } from '../../components/ui';

export default function ExamSchedule() {
  const { data, isLoading } = useQuery({ queryKey: ['my-alloc'], queryFn: () => apiGet('/allocation/student/my') });
  const allocations = (data?.data || []).sort((a,b) => new Date(a.exam.date) - new Date(b.exam.date));
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Timeline" title="Exam Schedule" subtitle={`${allocations.length} exams in your schedule`} />
      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/40 to-transparent" />
        <div className="space-y-5">
          {allocations.map((a, i) => {
            const date = new Date(a.exam.date);
            const done = isPast(date) && !isToday(date);
            return (
              <div key={a.id} className="flex gap-5 pl-2">
                <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 z-10 border-2 ${done ? 'bg-navy/5 border-navy/20' : isToday(date) ? 'bg-gold border-gold' : 'bg-white border-gold/40'}`}>
                  <div className={`font-display text-lg font-bold leading-none ${done ? 'text-navy/30' : isToday(date) ? 'text-navy' : 'text-navy'}`}>{format(date, 'dd')}</div>
                  <div className={`text-[8px] font-mono uppercase ${done ? 'text-navy/20' : 'text-navy/50'}`}>{format(date, 'MMM')}</div>
                </div>
                <div className={`card card-md flex-1 transition-all ${done ? 'opacity-50' : ''} ${isToday(date) ? 'border-2 border-gold shadow-gold' : ''}`}>
                  {isToday(date) && <div className="text-[10px] text-gold font-black font-mono mb-2">⟳ TODAY</div>}
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-[15px]">{a.exam.subjectName}</h3>
                      <p className="text-[12px] text-navy/50 mt-0.5">{a.exam.subjectCode} · {a.exam.startTime}–{a.exam.endTime} · {a.exam.shift}</p>
                    </div>
                    <StatusBadge status={done ? 'COMPLETED' : a.exam.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="navy">Hall: {a.hall?.name}</Badge>
                    <Badge variant="gold">Seat: {a.seat?.seatNumber}</Badge>
                    <Badge variant="sky">Sem {a.exam.semester}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
