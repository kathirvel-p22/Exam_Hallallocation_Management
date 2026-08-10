import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, Lock, Database, User, LogOut, BarChart3, History, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'URL Scanner', path: '/scanner', icon: Search },
    { name: 'Threats', path: '/threats', icon: Database },
    { name: 'Secure Vault', path: '/vault', icon: Lock },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Blockchain Logs', path: '/blockchain', icon: History },
    { name: 'Browser Extension', path: '/extension', icon: Globe },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-brand-surface border border-brand-border rounded-lg text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-brand-dark border-r border-brand-border flex flex-col"
          >
            {/* Logo Section */}
            <div className="p-6 border-b border-brand-border">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-brand-blue rounded-xl shadow-glow-blue group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-white uppercase">LinkCortexa</span>
                  <span className="text-[8px] font-bold text-brand-blue uppercase tracking-[0.3em]">AI Security</span>
                </div>
              </Link>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    location.pathname === item.path
                      ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    location.pathname === item.path ? "text-brand-blue" : "text-slate-500 group-hover:text-white"
                  )} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-brand-border space-y-4">
              <div className="p-4 bg-brand-surface/50 border border-brand-border rounded-2xl flex flex-col gap-1">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
