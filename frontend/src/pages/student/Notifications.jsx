// src/pages/student/Notifications.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';

const TYPE_ICON = { URGENT:'🚨', EXAM_REMINDER:'⏰', ALLOCATION_PUBLISHED:'✅', VENUE_CHANGE:'📍', GENERAL:'🔔', ATTENDANCE_ALERT:'📋' };
const TYPE_COLOR = { URGENT:'red', EXAM_REMINDER:'amber', ALLOCATION_PUBLISHED:'green', GENERAL:'navy', VENUE_CHANGE:'amber', ATTENDANCE_ALERT:'sky' };

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => apiGet('/notifications?limit=50') });
  const readAllMutation = useMutation({ mutationFn: () => apiPatch('/notifications/read-all', {}), onSuccess: () => qc.invalidateQueries(['notifications']) });

  const notifs = data?.data || [];
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Inbox" title="Notifications" subtitle={`${data?.meta?.unreadCount || 0} unread`}
        action={data?.meta?.unreadCount > 0 && <button onClick={() => readAllMutation.mutate()} className="btn btn-ghost btn-sm">Mark all read</button>} />
      <div className="card overflow-hidden divide-y divide-navy/5">
        {notifs.length === 0 ? (
          <div className="p-12 text-center text-navy/30"><div className="text-4xl mb-3">🔔</div>No notifications yet</div>
        ) : notifs.map(n => (
          <div key={n.id} className={`flex gap-4 p-4 hover:bg-cream cursor-pointer transition-all ${!n.isRead ? 'bg-gold/5' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-lg shrink-0">{TYPE_ICON[n.type] || '🔔'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-[13px]">{n.title}</span>
                <Badge variant={TYPE_COLOR[n.type] || 'navy'}>{n.type.replace('_',' ')}</Badge>
              </div>
              <p className="text-[12px] text-navy/60 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-navy/30 font-mono mt-1.5">{new Date(n.sentAt).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
            </div>
            {!n.isRead && <div className="w-2 h-2 bg-gold rounded-full mt-2 shrink-0 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}
