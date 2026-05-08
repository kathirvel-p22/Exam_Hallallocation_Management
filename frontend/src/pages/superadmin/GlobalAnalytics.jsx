// src/pages/superadmin/GlobalAnalytics.jsx
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, KpiCard } from '../../components/ui';

export default function GlobalAnalytics() {
  const { data, isLoading } = useQuery({ queryKey: ['global-analytics'], queryFn: () => apiGet('/analytics/global') });
  if (isLoading) return <PageLoader />;
  const d = data?.data;
  const chartData = (d?.institutions || []).map(i => ({ name: i.name.split(' ').slice(-1)[0], exams: i._count?.exams, halls: i._count?.halls }));
  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Analytics" title="Global Analytics" subtitle="Cross-institution examination statistics" />
      <div className="grid grid-cols-3 gap-4">
        <KpiCard icon="◎" label="Institutions" value={d?.institutions?.length || 0} color="navy" />
        <KpiCard icon="◈" label="Students" value={(d?.totals?.students || 0).toLocaleString()} color="gold" />
        <KpiCard icon="✦" label="Attendance Rate" value={`${d?.totals?.attendanceRate || 0}%`} color={d?.totals?.attendanceRate > 80 ? 'green' : 'gold'} />
      </div>
      <div className="card card-md">
        <h3 className="font-display text-lg font-bold mb-5">Exams & Halls per Institution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,20,55,.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Mulish', fontSize: 12 }} />
            <Bar dataKey="exams" fill="#0B1437" name="Exams" radius={[4,4,0,0]} />
            <Bar dataKey="halls" fill="#D4AF37" name="Halls" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
