// src/pages/admin/StudentManagement.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';

export default function StudentManagement() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['students', search], queryFn: () => apiGet(`/students?search=${search}&limit=100`), keepPreviousData: true });
  const students = data?.data || [];
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Roster" title="Student Management" subtitle={`${data?.meta?.total || 0} registered students`}
        action={
          <div className="flex gap-3">
            <input className="field-input w-64" placeholder="Search name or reg. no…" value={search} onChange={e=>setSearch(e.target.value)} />
            <button className="btn btn-ghost">Import CSV</button>
          </div>
        }
      />
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead><tr><th>Student</th><th>Register No.</th><th>Department</th><th>Semester</th><th>Level</th><th>Status</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-exam/10 flex items-center justify-center text-emerald-exam text-[11px] font-black">{s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                    <div>
                      <div className="font-bold text-[13px]">{s.name}</div>
                      <div className="text-[11px] text-navy/40">{s.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-[12px]">{s.registerNo}</td>
                <td><Badge variant="navy">{s.department?.code}</Badge></td>
                <td className="font-mono">Sem {s.semester}</td>
                <td><Badge variant="sky">{s.level}</Badge></td>
                <td><Badge variant={s.user?.isActive ? 'green' : 'red'}>{s.user?.isActive ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
