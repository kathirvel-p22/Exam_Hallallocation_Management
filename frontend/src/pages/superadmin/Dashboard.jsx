// src/pages/superadmin/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, KpiCard, SectionHeader, CardHeader, Badge } from '../../components/ui';

export default function SADashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['global-analytics'], queryFn: () => apiGet('/analytics/global') });
  const d = data?.data;
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Global View" title="Super Admin Dashboard" subtitle="University-wide examination management overview" />
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon="⬡" label="Institutions" value={d?.institutions?.length || 0} color="navy" />
        <KpiCard icon="◈" label="Total Students" value={(d?.totals?.students || 0).toLocaleString()} color="gold" />
        <KpiCard icon="◎" label="Total Exams" value={d?.totals?.exams || 0} color="navy" />
        <KpiCard icon="✦" label="Attendance Rate" value={`${d?.totals?.attendanceRate || 0}%`} color={d?.totals?.attendanceRate > 80 ? 'green' : 'gold'} />
      </div>
      <div className="card card-md">
        <CardHeader title="Institutions Overview" />
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {(d?.institutions || []).map(inst => (
            <div key={inst.id} className="bg-cream rounded-2xl p-5 border border-navy/5">
              <h3 className="font-bold text-[14px] mb-1">{inst.name}</h3>
              <p className="text-[11px] text-navy/40 font-mono mb-4">{inst.code} · {inst.city}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['Halls', inst._count?.halls], ['Exams', inst._count?.exams], ['Users', inst._count?.users]].map(([l,v]) => (
                  <div key={l} className="bg-white rounded-xl p-2"><div className="font-bold text-[15px]">{v}</div><div className="text-[9px] text-navy/40">{l}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
