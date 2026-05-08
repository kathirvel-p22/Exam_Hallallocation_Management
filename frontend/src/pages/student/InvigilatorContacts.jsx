// src/pages/student/InvigilatorContacts.jsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';

export default function InvigilatorContacts() {
  const { data, isLoading } = useQuery({ queryKey: ['my-alloc'], queryFn: () => apiGet('/allocation/student/my') });
  const allocs = data?.data || [];
  const invigilators = allocs.flatMap(a => (a.hall?.duties || []).map(d => ({ ...d.invigilator, examName: a.exam.subjectName, hallName: a.hall?.name }))).filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i);
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Staff Directory" title="Invigilator Contacts" subtitle="Contact your hall invigilators" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {invigilators.map(iv => (
          <div key={iv.id} className="card card-md flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-ruby-exam/10 flex items-center justify-center text-ruby-exam text-[17px] font-black shrink-0">{iv.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px]">{iv.name}</div>
              <div className="text-[11px] text-navy/40 mt-0.5">{iv.staffId} · {iv.department?.name}</div>
              <div className="text-[11px] text-navy/40">{iv.examName} — {iv.hallName}</div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <a href={`tel:${iv.phone}`} className="btn btn-success btn-sm">📞 Call</a>
              <button className="btn btn-ghost btn-sm">💬 Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
