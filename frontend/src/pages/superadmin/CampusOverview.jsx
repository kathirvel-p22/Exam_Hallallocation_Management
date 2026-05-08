// src/pages/superadmin/CampusOverview.jsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';
export default function CampusOverview() {
  const { data, isLoading } = useQuery({ queryKey: ['global-analytics'], queryFn: () => apiGet('/analytics/global') });
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Campuses" title="Campus Overview" subtitle="All registered institutions" />
      <div className="space-y-4">
        {(data?.data?.institutions || []).map(inst => (
          <div key={inst.id} className="card card-md">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-display text-xl font-bold">{inst.name}</h3><p className="text-[12px] text-navy/40 mt-1">{inst.address}{inst.city ? `, ${inst.city}` : ''} · {inst.code}</p></div>
              <Badge variant={inst.isActive ? 'green' : 'red'}>{inst.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {[['Departments', inst.departments?.length], ['Halls', inst._count?.halls], ['Exams', inst._count?.exams], ['Users', inst._count?.users]].map(([l,v]) => (
                <div key={l} className="bg-cream rounded-xl px-4 py-2.5 text-center"><div className="font-bold text-[15px]">{v}</div><div className="text-[10px] text-navy/40">{l}</div></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
