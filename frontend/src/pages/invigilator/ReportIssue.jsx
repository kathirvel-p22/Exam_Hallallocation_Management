// src/pages/invigilator/ReportIssue.jsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiPost, apiGet } from '../../services/api';
import { SectionHeader, Badge } from '../../components/ui';

export default function ReportIssue() {
  const qc = useQueryClient();
  const { data: dutyData } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const { data: issuesData } = useQuery({ queryKey: ['issues'], queryFn: () => apiGet('/invigilators/issues') });
  const activeDuty = dutyData?.data?.duties?.[0];

  const [form, setForm] = useState({ type:'MALPRACTICE', severity:'MEDIUM', description:'', studentRegNo:'' });

  const issueMutation = useMutation({
    mutationFn: (d) => apiPost('/invigilators/issue', { ...d, examId: activeDuty?.exam?.id }),
    onSuccess: () => { toast.success('Issue reported to exam admin'); qc.invalidateQueries(['issues']); setForm({ type:'MALPRACTICE', severity:'MEDIUM', description:'', studentRegNo:'' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to report issue'),
  });

  const SEVERITY_COLORS = { LOW:'navy', MEDIUM:'amber', HIGH:'red', CRITICAL:'red' };
  const STATUS_COLORS = { OPEN:'amber', IN_PROGRESS:'sky', RESOLVED:'green', DISMISSED:'navy' };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Incident" title="Report Issue" subtitle="Report exam violations or emergencies to the exam admin" />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card card-md">
          <h3 className="font-display text-lg font-bold mb-5">New Issue Report</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="field-label">Issue Type</label>
              <select className="field-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                {['MALPRACTICE','MEDICAL_EMERGENCY','WRONG_STUDENT','SEATING_DISPUTE','TECHNICAL','ABSENT_INVIGILATOR','OTHER'].map(t => <option key={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div><label className="field-label">Severity</label>
              <div className="flex gap-2 mt-1.5">
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => (
                  <button key={s} type="button" onClick={() => setForm(p=>({...p,severity:s}))}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black border-[1.5px] transition-all ${form.severity===s ? 'bg-navy text-white border-navy' : 'border-navy/10 text-navy/50 hover:border-navy/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4"><label className="field-label">Student Register No. (if applicable)</label><input className="field-input" placeholder="21CS001" value={form.studentRegNo} onChange={e=>setForm(p=>({...p,studentRegNo:e.target.value}))} /></div>
          <div className="mb-5"><label className="field-label">Description</label><textarea className="field-textarea min-h-[100px]" placeholder="Describe the incident in detail. Include seat number, time, and any witnesses…" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
          <button onClick={() => issueMutation.mutate(form)} disabled={!form.description || !activeDuty || issueMutation.isPending} className="btn btn-danger w-full justify-center">
            {issueMutation.isPending ? '⟳ Reporting…' : '⚠ Submit Issue Report'}
          </button>
          {!activeDuty && <p className="text-[11px] text-ruby-exam mt-2 text-center">No active duty assigned</p>}
        </div>

        <div className="card card-md">
          <h3 className="font-bold text-[13px] mb-4">Past Reports ({issuesData?.data?.length || 0})</h3>
          <div className="space-y-3">
            {(issuesData?.data || []).map(i => (
              <div key={i.id} className="p-3 bg-cream rounded-xl border border-navy/5">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant={SEVERITY_COLORS[i.severity] || 'navy'}>{i.severity}</Badge>
                  <Badge variant={STATUS_COLORS[i.status] || 'navy'}>{i.status}</Badge>
                </div>
                <div className="text-[12px] font-bold mt-2">{i.type.replace('_',' ')}</div>
                <div className="text-[11px] text-navy/50 mt-0.5 line-clamp-2">{i.description}</div>
                <div className="text-[10px] text-navy/30 font-mono mt-1.5">{new Date(i.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
