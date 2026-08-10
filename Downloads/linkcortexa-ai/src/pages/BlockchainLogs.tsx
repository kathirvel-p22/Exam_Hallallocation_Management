import React, { useState } from 'react';
import { History, Shield, Lock, Database, Search, User, CheckCircle, AlertTriangle, Activity, Database as DatabaseIcon, Globe, Fingerprint, RefreshCw, Cpu, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const mockLogs = [
  { id: '0x1a2b3c', action: 'URL_SCAN', status: 'COMPLETED', timestamp: '2026-04-06 14:30:22', hash: '8f2e...4a1b', type: 'SCAN' },
  { id: '0x4d5e6f', action: 'VAULT_STORE', status: 'ENCRYPTED', timestamp: '2026-04-06 14:15:45', hash: 'c3d4...9e8f', type: 'VAULT' },
  { id: '0x7g8h9i', action: 'THREAT_DETECTED', status: 'BLOCKED', timestamp: '2026-04-06 14:02:10', hash: 'a1b2...3c4d', type: 'THREAT' },
  { id: '0x0j1k2l', action: 'USER_LOGIN', status: 'AUTHORIZED', timestamp: '2026-04-06 13:55:30', hash: 'e5f6...7g8h', type: 'AUTH' },
  { id: '0x3m4n5o', action: 'VAULT_RETRIEVE', status: 'DECRYPTED', timestamp: '2026-04-06 13:40:12', hash: 'i9j0...1k2l', type: 'VAULT' },
  { id: '0x6p7q8r', action: 'URL_SCAN', status: 'COMPLETED', timestamp: '2026-04-06 13:25:05', hash: 'm3n4...5o6p', type: 'SCAN' },
  { id: '0x9s0t1u', action: 'THREAT_DETECTED', status: 'BLOCKED', timestamp: '2026-04-06 13:10:55', hash: 'q7r8...9s0t', type: 'THREAT' },
  { id: '0x2v3w4x', action: 'USER_LOGOUT', status: 'SUCCESS', timestamp: '2026-04-06 12:55:20', hash: 'u1v2...3w4x', type: 'AUTH' },
];

export default function BlockchainLogs() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const verificationSteps = [
    { label: 'Initializing Security Node', icon: Cpu },
    { label: 'Fetching Block Hashes', icon: DatabaseIcon },
    { label: 'Verifying Merkle Tree Integrity', icon: Activity },
    { label: 'Validating Cryptographic Signatures', icon: Fingerprint },
    { label: 'Cross-referencing Network Consensus', icon: Globe },
    { label: 'Finalizing Audit Report', icon: Shield },
  ];

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationStep(0);
    setShowResult(false);

    for (let i = 0; i < verificationSteps.length; i++) {
      setVerificationStep(i);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
    }

    setIsVerifying(false);
    setShowResult(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">Blockchain Audit Logs</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Immutable Security Ledger & Transaction History</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Network Synchronized</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Blocks', value: '1,248', icon: DatabaseIcon, color: 'text-brand-blue' },
          { label: 'Network Hashrate', value: '45.2 TH/s', icon: Activity, color: 'text-purple-500' },
          { label: 'Avg Block Time', value: '1.2s', icon: History, color: 'text-green-500' },
          { label: 'Security Node', value: 'Active', icon: Shield, color: 'text-brand-blue' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-brand-dark/50 rounded-lg border border-brand-border">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Real-time</p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-brand-blue" />
            <h2 className="text-lg font-bold text-white">Transaction Ledger</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Block Hash..." 
                className="bg-brand-dark/50 border border-brand-border rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-blue/50 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-dark/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Block ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hash Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {mockLogs.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-brand-blue font-bold">{log.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-900 rounded-lg border border-brand-border group-hover:border-brand-blue/30 transition-colors">
                        {log.type === 'SCAN' && <Search className="w-3.5 h-3.5 text-brand-blue" />}
                        {log.type === 'VAULT' && <Lock className="w-3.5 h-3.5 text-purple-500" />}
                        {log.type === 'THREAT' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        {log.type === 'AUTH' && <Fingerprint className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <span className="text-xs font-bold text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "status-badge",
                      log.status === 'COMPLETED' || log.status === 'SUCCESS' || log.status === 'AUTHORIZED' || log.status === 'ENCRYPTED' || log.status === 'DECRYPTED'
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-medium">{log.timestamp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-600">{log.hash}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/50" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-brand-border bg-brand-dark/30 flex items-center justify-between">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Showing 8 of 1,248 transactions</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-brand-dark border border-brand-border rounded-lg text-[10px] font-black text-slate-500 hover:text-white hover:border-brand-blue/50 transition-all uppercase tracking-widest">Prev</button>
            <button className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-[10px] font-black text-brand-blue uppercase tracking-widest">1</button>
            <button className="px-3 py-1 bg-brand-dark border border-brand-border rounded-lg text-[10px] font-black text-slate-500 hover:text-white hover:border-brand-blue/50 transition-all uppercase tracking-widest">2</button>
            <button className="px-3 py-1 bg-brand-dark border border-brand-border rounded-lg text-[10px] font-black text-slate-500 hover:text-white hover:border-brand-blue/50 transition-all uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border-brand-blue/20 flex items-center gap-6">
        <div className="p-4 bg-brand-blue/20 rounded-2xl border border-brand-blue/30">
          <Shield className="w-8 h-8 text-brand-blue" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Immutable Audit Trail</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Every action within LinkCortexa AI is cryptographically signed and recorded on our private blockchain ledger. This ensures absolute transparency and prevents unauthorized modification of security logs.</p>
        </div>
        <button 
          onClick={handleVerify}
          disabled={isVerifying}
          className={cn(
            "btn-primary whitespace-nowrap flex items-center gap-2",
            isVerifying && "opacity-50 cursor-not-allowed"
          )}
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify Ledger
            </>
          )}
        </button>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {(isVerifying || showResult) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
              onClick={() => !isVerifying && setShowResult(false)}
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
                  animate={{ width: isVerifying ? `${(verificationStep + 1) / verificationSteps.length * 100}%` : '100%' }}
                />
              </div>

              {isVerifying ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Ledger Verification</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Cryptographic Integrity Check in Progress</p>
                  </div>

                  <div className="space-y-4">
                    {verificationSteps.map((step, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                        verificationStep === i ? "bg-brand-blue/10 border-brand-blue/30" : 
                        verificationStep > i ? "bg-green-500/5 border-green-500/20 opacity-50" : 
                        "bg-white/5 border-white/5 opacity-30"
                      )}>
                        <div className={cn(
                          "p-2 rounded-lg",
                          verificationStep === i ? "bg-brand-blue/20 text-brand-blue" : 
                          verificationStep > i ? "bg-green-500/20 text-green-500" : 
                          "bg-slate-800 text-slate-600"
                        )}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          verificationStep === i ? "text-white" : 
                          verificationStep > i ? "text-slate-400" : 
                          "text-slate-600"
                        )}>{step.label}</span>
                        {verificationStep > i && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                        {verificationStep === i && <RefreshCw className="w-4 h-4 text-brand-blue animate-spin ml-auto" />}
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
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Verification Successful</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-[0.3em]">Ledger Integrity Confirmed</p>
                  </div>

                  <div className="p-6 bg-brand-dark/50 border border-brand-border rounded-2xl space-y-4 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Verified Blocks</span>
                      <span className="text-white">1,248</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Merkle Root Hash</span>
                      <span className="text-brand-blue font-mono">0x7f...8e2a</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>Network Consensus</span>
                      <span className="text-green-500">100% (12 Nodes)</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowResult(false)}
                    className="w-full py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-glow-blue hover:bg-brand-blue/90 transition-all"
                  >
                    Close Report
                  </button>
                </div>
              )}

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
