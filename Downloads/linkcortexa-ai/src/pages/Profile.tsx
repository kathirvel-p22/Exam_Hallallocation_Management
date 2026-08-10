import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Activity, Lock, Settings, ChevronRight, Fingerprint, Globe, Database, History, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { name: 'Total Scans', value: user?.scansCount || 0, icon: Activity, color: 'text-brand-blue' },
    { name: 'Threats Blocked', value: user?.threatsBlocked || 0, icon: Shield, color: 'text-red-500' },
    { name: 'Account Age', value: '2 days', icon: Calendar, color: 'text-purple-500' },
  ];

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'security', name: 'Security Settings', icon: Lock },
    { id: 'admin', name: 'Admin Panel', icon: Settings, hidden: user?.role !== 'admin' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Card */}
      <div className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-brand-blue/20 via-purple-500/20 to-brand-blue/20 relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-64 h-64 bg-brand-blue/30 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/30 rounded-full blur-[120px]"
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Globe className="w-96 h-96 text-white" />
          </div>

          <div className="absolute -bottom-16 left-10 p-2 bg-brand-dark rounded-3xl border border-brand-border shadow-2xl">
            <div className="w-32 h-32 bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-brand-dark overflow-hidden relative group">
              <User className="w-16 h-16 text-slate-700 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        <div className="pt-20 pb-10 px-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white tracking-tight">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">System Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-[0.2em]">
                {user?.role} ACCESS LEVEL
              </span>
              <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">
                SSS ENCRYPTED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-primary px-8">Edit Profile</button>
            <button className="p-3 bg-brand-surface border border-brand-border rounded-xl text-slate-400 hover:text-white hover:border-brand-blue/50 transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Menu */}
        <div className="space-y-4">
          <div className="glass-card p-2">
            {menuItems.filter(t => !t.hidden).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all group mb-1 last:mb-0",
                  activeTab === tab.id 
                    ? "bg-brand-blue text-white shadow-glow-blue/20" 
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-slate-500 group-hover:text-white")} />
                  <span className="text-sm font-bold tracking-tight">{tab.name}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === tab.id ? "rotate-90" : "opacity-0 group-hover:opacity-100")} />
              </button>
            ))}
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Status</h3>
            <div className="space-y-3">
              {[
                { label: '2FA Auth', status: 'Enabled', color: 'text-green-500' },
                { label: 'SSS Protocol', status: 'Active', color: 'text-brand-blue' },
                { label: 'Hardware Key', status: 'Linked', color: 'text-purple-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.label}</span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", item.color)}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={stat.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-8 group hover:border-brand-blue/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-brand-dark/50 rounded-xl border border-brand-border group-hover:border-brand-blue/20 transition-colors">
                          <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <Activity className="w-4 h-4 text-slate-800" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.name}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Activity Log */}
                <div className="glass-card p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Recent Security Activity</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last 24 Hours</p>
                    </div>
                    <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">View All</button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { action: 'Vault Access Authorized', time: '2 mins ago', icon: Lock, color: 'text-brand-blue' },
                      { action: 'URL Scan Completed', time: '15 mins ago', icon: Search, color: 'text-green-500' },
                      { action: 'Threat Blocked: Phishing', time: '1 hour ago', icon: Shield, color: 'text-red-500' },
                      { action: 'Blockchain Log Verified', time: '3 hours ago', icon: History, color: 'text-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-brand-dark/30 rounded-2xl border border-brand-border/50 hover:border-brand-blue/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg bg-slate-900 border border-brand-border", item.color)}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white">{item.action}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 space-y-8"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Security Configuration</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage your neural protection layers</p>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Change Keyphrase', desc: 'Update your neural access password', icon: Lock },
                    { label: 'Two-Factor Auth', desc: 'Add an extra layer of biometric verification', icon: Fingerprint },
                    { label: 'Active Sessions', desc: 'Monitor and manage your active login nodes', icon: Globe },
                    { label: 'Security Keys', desc: 'Manage physical hardware security tokens', icon: Database },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-6 bg-brand-dark/30 rounded-2xl border border-brand-border hover:border-brand-blue/30 transition-all group cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-slate-900 rounded-xl border border-brand-border group-hover:border-brand-blue/20 transition-colors">
                          <item.icon className="w-6 h-6 text-slate-500 group-hover:text-brand-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-brand-blue transition-colors" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
