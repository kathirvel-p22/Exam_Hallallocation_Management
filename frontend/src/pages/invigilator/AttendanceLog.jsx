// src/pages/invigilator/AttendanceLog.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge } from '../../components/ui';

export default function AttendanceLog() {
  const { data: dutyData } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const activeDuty = dutyData?.data?.duties?.[0];

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', activeDuty?.exam?.id],
    queryFn: () => apiGet(`/attendance/exam/${activeDuty.exam.id}?hallId=${activeDuty.hall.id}`),
    enabled: !!activeDuty?.exam?.id,
  });

  const att = data?.data?.attendance || [];
  const summary = data?.data?.summary || {};

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Roll Call" title="Attendance Log" subtitle={`${summary.present || 0} / ${summary.total || 0} students present`} />
      <div className="grid grid-cols-4 gap-3">
        {[['Total', summary.total, 'navy'],['Present', summary.present, 'green'],['Absent', summary.absent, 'red'],['Rate', `${summary.rate || 0}%`, 'gold']].map(([l,v,c]) => (
          <div key={l} className="card card-md text-center">
            <div className={`font-display text-3xl font-bold ${c==='green'?'text-emerald-exam':c==='red'?'text-ruby-exam':c==='gold'?'text-[#A8880A]':'text-navy'}`}>{v}</div>
            <div className="text-[11px] text-navy/40 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead><tr><th>Student</th><th>Reg. No</th><th>Dept</th><th>Seat</th><th>Status</th><th>Marked At</th></tr></thead>
          <tbody>
            {att.map(a => (
              <tr key={a.id}>
                <td className="font-bold">{a.student?.name}</td>
                <td className="font-mono text-[12px]">{a.student?.registerNo}</td>
                <td><Badge variant="navy">{a.student?.department?.code}</Badge></td>
                <td className="font-mono text-[12px]">{a.allocation?.seat?.seatNumber}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="font-mono text-[11px] text-navy/40">{a.markedAt ? new Date(a.markedAt).toLocaleTimeString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
