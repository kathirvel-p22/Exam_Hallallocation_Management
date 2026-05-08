// src/pages/superadmin/SystemConfig.jsx
import { useState } from 'react';
import { SectionHeader, Toggle, Badge } from '../../components/ui';
import toast from 'react-hot-toast';

const SERVICES = [
  { id: 'db', name: 'PostgreSQL Database', desc: 'Supabase free tier · Primary data store', status: 'connected', url: 'https://supabase.com' },
  { id: 'redis', name: 'Redis Cache', desc: 'Upstash free tier · Session & cache', status: 'connected', url: 'https://upstash.com' },
  { id: 'fcm', name: 'Firebase FCM', desc: 'Free push notifications · Android & iOS', status: 'configured', url: 'https://firebase.google.com' },
  { id: 'groq', name: 'Groq LLaMA 3', desc: 'Free AI chatbot API · llama3-8b-8192', status: 'connected', url: 'https://groq.com' },
  { id: 'smtp', name: 'Gmail SMTP', desc: 'Free email delivery · nodemailer', status: 'configured', url: 'https://gmail.com' },
  { id: 'cloudinary', name: 'Cloudinary', desc: 'Free media storage · 25GB free tier', status: 'configured', url: 'https://cloudinary.com' },
  { id: 'socket', name: 'Socket.io', desc: 'Real-time WebSocket server · self-hosted', status: 'connected', url: null },
  { id: 'jobs', name: 'BullMQ Jobs', desc: 'Background job queue · Redis-backed', status: 'connected', url: null },
];

export default function SystemConfig() {
  const [settings, setSettings] = useState({ emailNotif: true, pushNotif: true, autoAlloc: false, maintenanceMode: false, analyticsEnabled: true, aiChatEnabled: true });

  const toggle = (key) => {
    setSettings(p => ({ ...p, [key]: !p[key] }));
    toast.success(`${key} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  const STATUS_COLORS = { connected: 'green', configured: 'amber', error: 'red', offline: 'red' };

  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Platform" title="System Configuration" subtitle="AcadeX v2.0 · Production settings and service health" />

      <div className="grid grid-cols-2 gap-5">
        {/* Service Health */}
        <div className="card card-md">
          <h3 className="font-display text-lg font-bold mb-5">Service Health Monitor</h3>
          <div className="space-y-3">
            {SERVICES.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl border border-navy/5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'connected' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.7)]' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px]">{s.name}</div>
                  <div className="text-[11px] text-navy/40">{s.desc}</div>
                </div>
                <Badge variant={STATUS_COLORS[s.status] || 'navy'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Settings toggles */}
        <div className="card card-md">
          <h3 className="font-display text-lg font-bold mb-5">Platform Settings</h3>
          <div className="space-y-4">
            {[
              ['emailNotif', 'Email Notifications', 'Send Gmail SMTP emails for hall tickets, reminders'],
              ['pushNotif', 'Push Notifications', 'Firebase FCM push alerts to mobile apps'],
              ['autoAlloc', 'Auto-Allocation on Publish', 'Automatically run allocation when exam is published'],
              ['analyticsEnabled', 'Analytics Tracking', 'Collect and display attendance analytics'],
              ['aiChatEnabled', 'AI Chat (Groq)', 'Enable Groq LLaMA 3 chatbot for students'],
              ['maintenanceMode', 'Maintenance Mode', 'Take platform offline for scheduled maintenance'],
            ].map(([key, label, desc]) => (
              <div key={key} className={`flex items-center justify-between py-3 border-b border-navy/5 ${key === 'maintenanceMode' && settings[key] ? 'bg-ruby-exam-light -mx-5 px-5 rounded-none' : ''}`}>
                <div>
                  <div className={`font-bold text-[13px] ${key === 'maintenanceMode' ? 'text-ruby-exam' : ''}`}>{label}</div>
                  <div className="text-[11px] text-navy/40">{desc}</div>
                </div>
                <Toggle checked={settings[key]} onChange={() => toggle(key)} />
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-navy/5 bg-cream -mx-5 -mb-5 px-5 py-4 rounded-b-2xl">
            <p className="text-[10px] text-navy/40 font-mono">AcadeX v2.0 · Node.js 20 · React 18 · Prisma 5 · Socket.io 4</p>
            <p className="text-[10px] text-navy/30 font-mono mt-1">© 2025 AcadeX Platform. Free & Open Source.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
