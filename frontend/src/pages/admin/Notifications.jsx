// src/pages/admin/Notifications.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';

export default function Notifications() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', message: '', type: 'GENERAL', channel: 'ALL', targetRole: 'ALL' });
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => apiGet('/notifications?limit=20') });

  const sendMutation = useMutation({
    mutationFn: (d) => apiPost('/notifications/send', d),
    onSuccess: (r) => { toast.success(r.message || 'Notification sent'); qc.invalidateQueries(['notifications']); setForm(p => ({ ...p, title: '', message: '' })); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const notifs = data?.data || [];
  if (isLoading) return <PageLoader />;

  const TYPE_COLORS = { URGENT: 'red', GENERAL: 'navy', EXAM_REMINDER: 'gold', VENUE_CHANGE: 'amber', ALLOCATION_PUBLISHED: 'green' };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Communication" title="Notifications Center" subtitle="Broadcast messages to students, invigilators, or all users" />

      <div className="grid grid-cols-3 gap-5">
        {/* Compose */}
        <div className="col-span-2 card card-md">
          <h3 className="font-display text-lg font-bold mb-5">Compose Notification</h3>
          <div className="space-y-4">
            <div><label className="field-label">Title</label><input className="field-input" placeholder="Hall Ticket Ready for Semester 5 Students" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="field-label">Message</label><textarea className="field-textarea" placeholder="Your examination hall ticket is now available. Log in to the Student Portal to view and download your QR hall ticket." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="field-label">Type</label>
                <select className="field-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['GENERAL','URGENT','EXAM_REMINDER','VENUE_CHANGE','ALLOCATION_PUBLISHED'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="field-label">Channel</label>
                <select className="field-select" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                  <option>ALL</option><option>IN_APP</option><option>EMAIL</option><option>PUSH</option>
                </select>
              </div>
              <div><label className="field-label">Target</label>
                <select className="field-select" value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}>
                  <option>ALL</option><option>STUDENT</option><option>INVIGILATOR</option><option>EXAM_ADMIN</option>
                </select>
              </div>
            </div>
            <button onClick={() => sendMutation.mutate(form)} disabled={!form.title || !form.message || sendMutation.isPending} className="btn btn-gold justify-center w-full">
              {sendMutation.isPending ? '⟳ Sending...' : '▶ Send Notification'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {[['Total Sent', notifs.length],['Unread', data?.meta?.unreadCount || 0],['This Week', notifs.filter(n => new Date(n.sentAt) > new Date(Date.now()-7*864e5)).length]].map(([l,v]) => (
            <div key={l} className="card card-md flex items-center justify-between">
              <span className="text-[13px] text-navy/60">{l}</span>
              <span className="font-display text-2xl font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-navy/5"><h3 className="font-display text-lg font-bold">Recent Notifications</h3></div>
        <table className="tbl">
          <thead><tr><th>Title</th><th>Type</th><th>Channel</th><th>Sent</th><th>Read</th></tr></thead>
          <tbody>
            {notifs.map(n => (
              <tr key={n.id}>
                <td>
                  <div className="font-bold text-[13px]">{n.title}</div>
                  <div className="text-[11px] text-navy/40 line-clamp-1">{n.message}</div>
                </td>
                <td><Badge variant={TYPE_COLORS[n.type] || 'navy'}>{n.type.replace('_',' ')}</Badge></td>
                <td><Badge variant="sky">{n.channel}</Badge></td>
                <td className="text-[12px] font-mono text-navy/40">{new Date(n.sentAt).toLocaleDateString()}</td>
                <td><Badge variant={n.isRead ? 'green' : 'amber'}>{n.isRead ? 'Read' : 'Unread'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
