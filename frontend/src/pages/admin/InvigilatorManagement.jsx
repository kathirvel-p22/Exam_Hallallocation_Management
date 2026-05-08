// src/pages/admin/InvigilatorManagement.jsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge, StatusBadge } from '../../components/ui';

export default function InvigilatorManagement() {
  const { data, isLoading } = useQuery({ queryKey: ['invigs'], queryFn: () => apiGet('/invigilators') });
  const invigs = data?.data || [];
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Staff" title="Invigilator Management" subtitle={`${invigs.length} registered invigilators`} />
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Staff ID</th><th>Department</th><th>Email</th><th>Active Duties</th><th>Availability</th></tr></thead>
          <tbody>
            {invigs.map(iv => (
              <tr key={iv.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-ruby-exam/10 flex items-center justify-center text-ruby-exam text-[11px] font-black">{iv.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                    <div className="font-bold text-[13px]">{iv.name}</div>
                  </div>
                </td>
                <td className="font-mono text-[12px]">{iv.staffId}</td>
                <td><Badge variant="navy">{iv.department?.code}</Badge></td>
                <td className="text-[12px] text-navy/50">{iv.user?.email}</td>
                <td className="font-mono">{iv.duties?.length || 0}</td>
                <td><Badge variant={iv.isAvailable ? 'green' : 'red'}>{iv.isAvailable ? 'Available' : 'On Duty'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
