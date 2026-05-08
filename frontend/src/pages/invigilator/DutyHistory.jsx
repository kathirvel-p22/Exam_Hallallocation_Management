// src/pages/invigilator/DutyHistory.jsx
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge } from '../../components/ui';

export default function DutyHistory() {
  const { data, isLoading } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const duties = data?.data?.duties || [];
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="History" title="Duty History" subtitle={`${duties.length} duties assigned`} />
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead><tr><th>Exam</th><th>Hall</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
          <tbody>
            {duties.map(d => (
              <tr key={d.id}>
                <td><div className="font-bold">{d.exam.subjectName}</div><div className="text-[11px] text-navy/40 font-mono">{d.exam.subjectCode}</div></td>
                <td>{d.hall?.name}</td>
                <td className="font-mono text-[12px]">{format(new Date(d.exam.date), 'dd MMM yyyy')}</td>
                <td className="font-mono text-[12px]">{d.checkInAt ? format(new Date(d.checkInAt), 'HH:mm') : '—'}</td>
                <td className="font-mono text-[12px]">{d.checkOutAt ? format(new Date(d.checkOutAt), 'HH:mm') : '—'}</td>
                <td><StatusBadge status={d.exam.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
