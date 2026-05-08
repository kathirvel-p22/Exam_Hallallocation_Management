// src/components/layout/AppLayout.jsx — Base shell for all portals
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAuthStore from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';

export default function AppLayout({ config }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet('/notifications?limit=8'),
    refetchInterval: 30_000,
  });

  const unread = notifData?.meta?.unreadCount || 0;
  const profile = user?.student || user?.invigilator;
  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Current page title
  const currentPage = config.menu
    .flatMap(s => s.items)
    .find(i => location.pathname.endsWith(i.path));

  return (
    <div className="flex min-h-screen bg-[#F9F6EE]">
      {/* ── Sidebar ── */}
      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 bg-navy flex flex-col z-30 transition-all duration-300',
        sidebarOpen ? 'w-[258px]' : 'w-[68px]'
      )}>
        {/* Brand */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gold to-[#A8880A] rounded-xl flex items-center justify-center shrink-0 shadow-gold">
            <span className="font-display text-lg font-bold text-navy">A</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <div className="font-display text-xl font-bold text-white leading-none">AcadeX</div>
              <div className="text-[8px] text-white/25 font-mono uppercase tracking-[1.5px] mt-0.5">{config.tag}</div>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={clsx('ml-auto w-6 h-6 flex items-center justify-center text-white/30 hover:text-white transition-colors shrink-0', !sidebarOpen && 'mx-auto')}
          >
            <span className="text-[10px]">{sidebarOpen ? '◀' : '▶'}</span>
          </button>
        </div>

        {/* User info */}
        <div className="p-3 border-b border-white/5 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 border-2 border-white/10"
            style={{ background: config.avatarBg }}
          >
            {initials}
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{displayName}</div>
              <div className="text-[10px] text-white/35 truncate">{config.roleLabel}</div>
            </motion.div>
          )}
          {sidebarOpen && <div className="dot-green shrink-0" />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-none p-2.5 space-y-0.5">
          {config.menu.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <div className="text-[9px] font-black text-white/20 uppercase tracking-[2.5px] font-mono px-2.5 py-2.5">{section.label}</div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => clsx('sb-link', isActive && 'active', !sidebarOpen && 'justify-center px-0')}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-[13px]">{item.label}</motion.span>
                  )}
                  {sidebarOpen && item.badge && (
                    <span className={clsx('text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono', item.badgeClass || 'bg-ruby-exam text-white')}>{item.badge}</span>
                  )}
                  {sidebarOpen && item.isNew && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-exam text-white font-mono">NEW</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/5 space-y-0.5">
          <button
            onClick={() => navigate('/')}
            className={clsx('sb-link w-full', !sidebarOpen && 'justify-center px-0')}
          >
            <span className="sb-icon">⬡</span>
            {sidebarOpen && <span className="text-[13px]">Switch Portal</span>}
          </button>
          <button
            onClick={handleLogout}
            className={clsx('sb-link w-full text-ruby-exam/60 hover:bg-ruby-exam/10 hover:text-red-300', !sidebarOpen && 'justify-center px-0')}
          >
            <span className="sb-icon">⏻</span>
            {sidebarOpen && <span className="text-[13px]">Sign Out</span>}
          </button>
          {sidebarOpen && <div className="text-[9px] text-white/10 font-mono px-2.5 pt-1">AcadeX v2.0 © 2025</div>}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={clsx('flex flex-col flex-1 min-h-screen transition-all duration-300', sidebarOpen ? 'ml-[258px]' : 'ml-[68px]')}>
        {/* Topbar */}
        <header className="h-[62px] bg-white border-b border-navy/[0.08] sticky top-0 z-20 flex items-center px-7 gap-4 shadow-card">
          <div className="flex-1">
            <h1 className="font-display text-[22px] font-bold leading-tight">
              {currentPage?.label || config.menu[0]?.items[0]?.label || 'Dashboard'}
            </h1>
            <p className="text-[10px] text-navy/30 font-mono">
              AcadeX / {config.tag} / {currentPage?.label || '—'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-exam-light border border-emerald-exam-border rounded-full px-3 py-1.5 text-[10px] font-black text-emerald-exam font-mono">
              <span className="dot-green" />
              LIVE
            </div>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 rounded-xl bg-cream border border-navy/10 flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold transition-all"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-ruby-exam text-white text-[8px] font-black rounded-full flex items-center justify-center">{unread}</span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-card-hover border border-navy/10 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-navy/5 flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      {unread > 0 && <span className="badge-red badge">{unread} unread</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {(notifData?.data || []).slice(0, 6).map(n => (
                        <div key={n.id} className={clsx('flex gap-3 p-3.5 border-b border-navy/5 hover:bg-cream cursor-pointer', !n.isRead && 'bg-gold/5')}>
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-sm shrink-0">🔔</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate">{n.title}</p>
                            <p className="text-[11px] text-navy/50 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-navy/30 font-mono mt-1">{new Date(n.sentAt).toRelativeTimeString?.() || n.sentAt}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-gold rounded-full mt-1 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* User chip */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-cream border border-navy/10 rounded-xl cursor-pointer hover:border-gold/40 transition-all">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: config.avatarBg }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-[13px] font-bold leading-none">{displayName.split(' ')[0]}</div>
                <div className="text-[9px] text-navy/40 font-mono">{config.tag}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-7">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </div>

        <footer className="bg-navy text-white/20 text-center py-3.5 text-[11px] font-mono">
          AcadeX — Intelligent Examination Management · <span className="text-gold/50">v2.0</span> © 2025
        </footer>
      </main>
    </div>
  );
}
