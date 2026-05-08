// src/pages/invigilator/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiGet, apiPatch } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge } from '../../components/ui';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function InvigDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const checkInMutation = useMutation({
    mutationFn: ({ dutyId }) => apiPatch('/invigilators/checkin', { dutyId }),
    onSuccess: () => { toast.success('Checked in successfully'); qc.invalidateQueries(['invig-me']); },
  });

  const invig = data?.data;
  const duties = invig?.duties || [];
  const upcoming = duties.filter(d => d.exam.status !== 'COMPLETED' && d.exam.status !== 'CANCELLED');
  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Duty Board" title={`Good day, ${invig?.name?.split(' ')[0] || 'Invigilator'}!`}
        subtitle={`${invig?.staffId} · ${invig?.department?.name}`} />

      <div className="grid grid-cols-3 gap-4">
        {[['Active Duties', upcoming.length, '◉', 'green'], ['Dept', invig?.department?.code, '◈', 'gold'], ['Staff ID', invig?.staffId, '◎', 'navy']].map(([l,v,i,c]) => (
          <div key={l} className="card card-md flex items-center gap-4">
            <div className={`text-2xl text-${c === 'green' ? 'emerald-exam' : c === 'gold' ? '[#A8880A]' : 'navy/40'}`}>{i}</div>
            <div><div className="font-display text-2xl font-bold">{v}</div><div className="text-[11px] text-navy/40">{l}</div></div>
          </div>
        ))}
      </div>

      <div className="card card-md">
        <h3 className="font-display text-lg font-bold mb-4">Assigned Duties</h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-navy/30">No upcoming duties assigned</div>
        ) : upcoming.map(d => (
          <div key={d.id} className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-navy/5 mb-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px]">{d.exam.subjectName}</div>
              <div className="text-[12px] text-navy/50">{d.exam.subjectCode} · {format(new Date(d.exam.date), 'dd MMM yyyy')} · {d.exam.startTime} · {d.exam.shift}</div>
              <div className="text-[12px] text-navy/50 mt-0.5">Hall: {d.hall?.name} · {d.hall?.building}</div>
            </div>
            <StatusBadge status={d.exam.status} />
            {!d.checkInAt ? (
              <button onClick={() => checkInMutation.mutate({ dutyId: d.id })} className="btn btn-success btn-sm">Check In</button>
            ) : (
              <Badge variant="green" dot>Checked In {format(new Date(d.checkInAt), 'HH:mm')}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
