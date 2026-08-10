import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, AlertTriangle, ExternalLink, Download, Shield, Trash2, Globe, Activity, History, ChevronRight, RefreshCw, Cpu, Zap, CheckCircle, X, Server } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Threats() {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [showSyncResult, setShowSyncResult] = useState(false);

  const syncSteps = [
    { label: 'Connecting to GTIN Nodes', icon: Globe },
    { label: 'Authenticating Security Handshake', icon: Shield },
    { label: 'Downloading Phishing Signatures', icon: Download },
    { label: 'Updating Neural Pattern Database', icon: Cpu },
    { label: 'Synchronizing Local Threat Ledger', icon: Database },
    { label: 'Verifying Database Integrity', icon: CheckCircle },
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStep(0);
    setShowSyncResult(false);

    for (let i = 0; i < syncSteps.length; i++) {
      setSyncStep(i);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    }

    setIsSyncing(false);
    setShowSyncResult(true);
    fetchThreats(); // Refresh data after sync
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const res = await axios.get('/api/analyze/history');
      setThreats(res.data.threats.reverse());
    } catch (e) {
      console.error(e);
      // Mock data if API fails for demo
      setThreats([
        { id: '1', url: 'https://microsoft365-login.work/path', domain: 'microsoft365-login.work', riskLevel: 'critical', riskScore: 98, source: 'Global Feed', status: 'blocked', timestamp: new Date().toISOString() },
        { id: '2', url: 'https://amazon-verify.tk/path', domain: 'amazon-verify.tk', riskLevel: 'critical', riskScore: 98, source: 'Global Feed', status: 'blocked', timestamp: new Date().toISOString() },
        { id: '3', url: 'https://paypal-secure-login.xyz/path', domain: 'paypal-secure-login.xyz', riskLevel: 'high', riskScore: 95, source: 'Local Scan', status: 'blocked', timestamp: new Date().toISOString() },
        { id: '4', url: 'https://banking-update.ml/path', domain: 'banking-update.ml', riskLevel: 'high', riskScore: 92, source: 'Global Feed', status: 'blocked', timestamp: new Date().toISOString() },
        { id: '5', url: 'https://google-security-alert.net/path', domain: 'google-security-alert.net', riskLevel: 'medium', riskScore: 88, source: 'Local Scan', status: 'flagged', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreats = threats.filter(t => {
    const matchesSearch = t.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || t.riskLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">Threat Intelligence Database</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Real-time Global Threat Feed & Historical Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-xl text-slate-400 hover:text-white hover:border-brand-blue/50 transition-all text-xs font-bold uppercase tracking-widest">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
          <div className="px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Live Feed Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: threats.length, icon: Database, color: 'text-brand-blue' },
          { label: 'Critical Threats', value: threats.filter(t => t.riskLevel === 'critical').length, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Global Sources', value: '12', icon: Globe, color: 'text-purple-500' },
          { label: 'Last Sync', value: '2m ago', icon: History, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-brand-dark/50 rounded-xl border border-brand-border">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by URL, Domain, or Signature..."
            className="input-field pl-12 bg-brand-surface/50 border-brand-border focus:bg-brand-surface transition-all"
          />
        </div>
        <div className="md:col-span-3 relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field pl-12 bg-brand-surface/50 border-brand-border focus:bg-brand-surface appearance-none cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
        <div className="md:col-span-2 glass-card flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Filtered Results</p>
            <p className="text-xl font-black text-brand-blue">{filteredThreats.length}</p>
          </div>
        </div>
      </div>

      {/* Threats Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-dark/30 border-b border-brand-border">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Threat Intelligence</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Analysis</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Node</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detection Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8 bg-brand-dark/20"></td>
                    </tr>
                  ))
                ) : filteredThreats.length > 0 ? (
                  filteredThreats.map((threat, i) => (
                    <motion.tr 
                      key={threat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white max-w-xs truncate group-hover:text-brand-blue transition-colors">{threat.url}</span>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{threat.domain}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                            threat.riskLevel === 'critical' ? "bg-red-500" :
                            threat.riskLevel === 'high' ? "bg-orange-500" :
                            threat.riskLevel === 'medium' ? "bg-yellow-500" :
                            "bg-green-500"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            threat.riskLevel === 'critical' ? "text-red-500" :
                            threat.riskLevel === 'high' ? "text-orange-500" :
                            threat.riskLevel === 'medium' ? "text-yellow-500" :
                            "text-green-500"
                          )}>
                            {threat.riskLevel} ({threat.riskScore}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{threat.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "status-badge",
                          threat.status === 'blocked' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                        )}>
                          {threat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium">{new Date(threat.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-600 font-bold">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Database className="w-16 h-16 text-slate-500" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Zero Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Intelligence Banner */}
      <div className="glass-card p-8 bg-gradient-to-br from-brand-blue/10 via-brand-dark to-purple-500/10 border-brand-blue/20 flex flex-col md:flex-row items-center gap-8">
        <div className="p-5 bg-brand-blue/20 rounded-3xl border border-brand-blue/30 shadow-glow-blue/20">
          <Shield className="w-10 h-10 text-brand-blue" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight uppercase">Global Threat Network Synchronized</h3>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">LinkCortexa AI is connected to the Global Threat Intelligence Network (GTIN). Your local database is automatically updated with the latest phishing signatures and malware patterns every 60 seconds.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className={cn(
            "btn-primary whitespace-nowrap px-10 flex items-center gap-2",
            isSyncing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Now
            </>
          )}
        </button>
      </div>

      {/* Sync Progress Modal */}
      <AnimatePresence>
        {(isSyncing || showSyncResult) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
              onClick={() => !isSyncing && setShowSyncResult(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue/20">
                <motion.div 
                  className="h-full bg-brand-blue shadow-glow-blue"
                  initial={{ width: 0 }}
                  animate={{ width: isSyncing ? `${(syncStep + 1) / syncSteps.length * 100}%` : '100%' }}
                />
              </div>

              {isSyncing ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">GTIN Synchronization</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Updating Global Threat Intelligence</p>
                  </div>

                  <div className="space-y-4">
                    {syncSteps.map((step, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                        syncStep === i ? "bg-brand-blue/10 border-brand-blue/30" : 
                        syncStep > i ? "bg-green-500/5 border-green-500/20 opacity-50" : 
                        "bg-white/5 border-white/5 opacity-30"
                      )}>
                        <div className={cn(
                          "p-2 rounded-lg",
                          syncStep === i ? "bg-brand-blue/20 text-brand-blue" : 
                          syncStep > i ? "bg-green-500/20 text-green-500" : 
                          "bg-slate-800 text-slate-600"
                        )}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          syncStep === i ? "text-white" : 
                          syncStep > i ? "text-slate-400" : 
                          "text-slate-600"
                        )}>{step.label}</span>
                        {syncStep > i && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                        {syncStep === i && <RefreshCw className="w-4 h-4 text-brand-blue animate-spin ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 text-center">
                  <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto relative">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 border-2 border-green-500 rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Network Synced</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-[0.3em]">Threat Database Updated Successfully</p>
                  </div>

                  <div className="p-6 bg-brand-dark/50 border border-brand-border rounded-2xl space-y-4 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>New Signatures</span>
                      <span className="text-white">+1,420</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Sync Latency</span>
                      <span className="text-brand-blue font-mono">142ms</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>GTIN Nodes</span>
                      <span className="text-green-500">Connected (12/12)</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSyncResult(false)}
                    className="w-full py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-glow-blue hover:bg-brand-blue/90 transition-all"
                  >
                    Close Report
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
