// src/pages/admin/Analytics.jsx
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { apiGet } from '../../services/api';
import { PageLoader, KpiCard, SectionHeader, CardHeader } from '../../components/ui';

export default function Analytics() {
  const { data: dash, isLoading }     = useQuery({ queryKey: ['admin-dash'],   queryFn: () => apiGet('/analytics/dashboard') });
  const { data: monthlyData }         = useQuery({ queryKey: ['monthly'],       queryFn: () => apiGet('/analytics/monthly') });

  if (isLoading) return <PageLoader />;
  const d = dash?.data;
  const monthly = (monthlyData?.data || []).map(m => ({
    month: ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m.month],
    exams: Number(m.exams), allocations: Number(m.allocations),
    rate: m.total_att > 0 ? Math.round((Number(m.present)/Number(m.total_att))*100) : 0,
  }));

  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Insights" title="Analytics Dashboard" subtitle="Historical examination performance data" />
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon="◎" label="Total Exams" value={d?.kpis?.totalExams || 0} color="navy" />
        <KpiCard icon="◈" label="Students" value={(d?.kpis?.totalStudents || 0).toLocaleString()} color="gold" />
        <KpiCard icon="⬡" label="Active Halls" value={d?.kpis?.totalHalls || 0} color="navy" />
        <KpiCard icon="✦" label="Attendance Rate" value={`${d?.kpis?.attendanceRate || 0}%`} color={d?.kpis?.attendanceRate > 80 ? 'green' : 'gold'} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card card-md">
          <CardHeader title="Monthly Exam & Allocation Trend" subtitle="Number of exams and allocations per month" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,20,55,.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Mulish', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="exams" fill="#0B1437" name="Exams" radius={[4,4,0,0]} />
              <Bar dataKey="allocations" fill="#D4AF37" name="Allocations" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card card-md">
          <CardHeader title="Monthly Attendance Rate" subtitle="% of students present per month" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,20,55,.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Mulish', fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 4, fill: '#D4AF37' }} name="Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card card-md">
        <CardHeader title="Monthly Performance Table" />
        <table className="tbl">
          <thead><tr><th>Month</th><th>Exams Held</th><th>Students Allocated</th><th>Attendance Rate</th></tr></thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.month}>
                <td className="font-bold">{m.month || '—'}</td>
                <td className="font-mono">{m.exams}</td>
                <td className="font-mono">{m.allocations}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-cream rounded-full"><div className="h-full rounded-full bg-gold" style={{ width: `${m.rate}%` }} /></div>
                    <span className="font-mono text-[12px] w-10 text-right">{m.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
