import React, { useState, useEffect } from 'react';
import { Lock, Plus, Shield, Key, FileText, Trash2, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Database, Zap, Cpu, History, TrendingUp, Search, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function SecureVault() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showRetrieveModal, setShowRetrieveModal] = useState<string | null>(null);
  const [generatedShares, setGeneratedShares] = useState<string[] | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dataType, setDataType] = useState('text');
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [patterns, setPatterns] = useState({
    masterPassword: '',
    securityPattern: '',
    recoveryPhrase: ''
  });
  
  const [retrievalShares, setRetrievalShares] = useState<string[]>([]);
  const [retrievedContent, setRetrievedContent] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`/api/secure/list/${user?.id}`);
      setItems(res.data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (threshold > totalShares) {
      setError('Threshold (K) cannot be greater than Total Shares (N)');
      return;
    }
    setActionLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/secure/store', {
        userId: user?.id,
        personalData: { title, content, dataType },
        userPatterns: patterns,
        totalShares,
        threshold
      });
      
      setGeneratedShares(res.data.allShares);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to store data');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/secure/delete/${id}`);
      setDeleteConfirmId(null);
      fetchItems();
    } catch (e) {
      console.error(e);
      setError('Failed to delete storage node');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    const validShares = retrievalShares.filter(s => s.trim() !== '');
    const currentItem = items.find(i => i.id === showRetrieveModal);
    const requiredThreshold = currentItem?.threshold || 3;
    
    if (validShares.length < requiredThreshold) {
      setError(`CRITICAL ERROR: Insufficient shares provided. System requires ${requiredThreshold} unique shares for neural reconstruction. Currently provided: ${validShares.length}`);
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/secure/retrieve', {
        storageId: showRetrieveModal,
        userShares: validShares
      });
      setRetrievedContent(res.data.content);
    } catch (e: any) {
      setError(e.response?.data?.message || 'DECRYPTION FAILURE: The provided shares do not match the cryptographic signature of this vault.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetAddForm = () => {
    setShowAddModal(false);
    setGeneratedShares(null);
    setTitle('');
    setContent('');
    setPatterns({ masterPassword: '', securityPattern: '', recoveryPhrase: '' });
    setTotalShares(5);
    setThreshold(3);
    fetchItems();
  };

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-1 bg-brand-blue rounded-full" />
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.4em]">Secure Node 0x7F</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">SECURE <span className="text-brand-blue">VAULT</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Multi-Part Shamir's Secret Sharing (SSS) Protocol</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary py-4 px-10 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="uppercase tracking-[0.2em] text-xs font-black">Initialize Storage</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-8 bg-brand-blue/5 border-brand-blue/20 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="p-5 bg-brand-blue/10 rounded-3xl border border-brand-blue/20 shadow-glow-blue/10">
          <Shield className="w-10 h-10 text-brand-blue" />
        </div>
        <div className="flex-1 space-y-2 text-center lg:text-left">
          <h3 className="text-xl font-black text-white tracking-tight">QUANTUM-RESISTANT NEURAL STORAGE</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            LinkCortexa utilizes an advanced implementation of SSS. Your data is fragmented into <span className="text-brand-blue font-bold">N parts</span>. 
            No single server or administrator can ever reconstruct your data without the <span className="text-brand-blue font-bold">K threshold</span> of shares.
          </p>
        </div>
        <div className="flex items-center gap-8 bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Nodes</p>
            <p className="text-2xl font-black text-white">{items.length}</p>
          </div>
          <div className="w-px h-12 bg-slate-800" />
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity</p>
            <p className="text-2xl font-black text-green-500">100%</p>
          </div>
        </div>
      </div>

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 glass-card animate-pulse bg-white/5" />
          ))
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-8 group hover:border-brand-blue/50 transition-all relative overflow-hidden flex flex-col justify-between h-full"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Database className="w-24 h-24" />
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20 group-hover:bg-brand-blue/20 transition-colors">
                      {item.dataType === 'password' ? <Key className="w-6 h-6 text-brand-blue" /> : <FileText className="w-6 h-6 text-brand-blue" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white truncate max-w-[160px] tracking-tight">{item.title}</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{item.dataType}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full text-[8px] font-black uppercase tracking-widest">
                      SSS-SECURED
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Terminate Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 group-hover:border-brand-blue/20 transition-colors">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Threshold (K)</p>
                    <p className="text-xl font-black text-white">{item.threshold}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 group-hover:border-brand-blue/20 transition-colors">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total (N)</p>
                    <p className="text-xl font-black text-white">{item.totalShares}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRetrieveModal(item.id);
                  setRetrievedContent(null);
                  setRetrievalShares(Array(item.threshold).fill(''));
                  setError('');
                }}
                className="mt-8 w-full py-4 bg-slate-900 hover:bg-brand-blue/10 border border-white/5 hover:border-brand-blue/50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn shadow-xl"
              >
                <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                Retrieve Fragmented Data
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 glass-card flex flex-col items-center justify-center text-center space-y-8 border-dashed border-2 border-white/5">
            <div className="w-24 h-24 rounded-3xl bg-brand-blue/5 flex items-center justify-center border border-brand-blue/10 relative">
              <Lock className="w-10 h-10 text-slate-800" />
              <div className="absolute inset-0 border-2 border-brand-blue/20 rounded-3xl animate-ping opacity-20" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white tracking-tight">VAULT OFFLINE</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">No encrypted fragments detected in the neural network. Initialize a new storage node to begin.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-4 px-12"
            >
              <Plus className="w-5 h-5" />
              <span className="uppercase tracking-[0.2em] text-xs font-black">Initialize Node</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetAddForm}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl glass-card border-white/10 shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-2xl">
                    <Plus className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">
                      {generatedShares ? 'RECONSTRUCTION FRAGMENTS' : 'INITIALIZE NEURAL STORAGE'}
                    </h2>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Protocol: SSS-AES-256-GCM</p>
                  </div>
                </div>
                <button onClick={resetAddForm} className="p-3 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-10 overflow-y-auto flex-1">
                {!generatedShares ? (
                  <form onSubmit={handleStore} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mb-4">Core Identification</h4>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Vault Label</label>
                              <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. PROJECT_OMEGA_KEYS"
                                className="input-field bg-slate-900/50 border-white/5"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Data Classification</label>
                              <select
                                value={dataType}
                                onChange={(e) => setDataType(e.target.value)}
                                className="input-field bg-slate-900/50 border-white/5 appearance-none cursor-pointer"
                              >
                                <option value="text">Standard Text Fragment</option>
                                <option value="password">Credential Set</option>
                                <option value="financial">Financial Ledger</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Raw Payload</label>
                              <textarea
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter the sensitive data for fragmentation..."
                                className="input-field bg-slate-900/50 border-white/5 h-48 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mb-4">SSS Configuration</h4>
                          <div className="p-8 bg-brand-blue/5 border border-brand-blue/10 rounded-3xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Cpu className="w-12 h-12 text-brand-blue" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Shares (N)</label>
                                <input
                                  type="number"
                                  min="2"
                                  max="10"
                                  value={totalShares}
                                  onChange={(e) => setTotalShares(parseInt(e.target.value))}
                                  className="input-field bg-slate-900/50 border-white/5 py-4 text-center text-xl font-black"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Threshold (K)</label>
                                <input
                                  type="number"
                                  min="2"
                                  max={totalShares}
                                  value={threshold}
                                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                                  className="input-field bg-slate-900/50 border-white/5 py-4 text-center text-xl font-black"
                                />
                              </div>
                            </div>
                            <div className="p-5 bg-brand-blue/10 rounded-2xl flex items-start gap-4 border border-brand-blue/20">
                              <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                              <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest leading-relaxed">
                                SECURITY ALERT: System will generate {totalShares} fragments. Any {threshold} fragments will be required for reconstruction. Losing more than {totalShares - threshold} fragments results in permanent data loss.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mb-4">Master Override Keys</h4>
                          <div className="space-y-4">
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                              <input
                                required
                                type="password"
                                placeholder="Master Access Password"
                                value={patterns.masterPassword}
                                onChange={(e) => setPatterns({ ...patterns, masterPassword: e.target.value })}
                                className="input-field bg-slate-900/50 border-white/5 pl-12"
                              />
                            </div>
                            <div className="relative">
                              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                              <input
                                required
                                type="password"
                                placeholder="Security Pattern Code"
                                value={patterns.securityPattern}
                                onChange={(e) => setPatterns({ ...patterns, securityPattern: e.target.value })}
                                className="input-field bg-slate-900/50 border-white/5 pl-12"
                              />
                            </div>
                            <div className="relative">
                              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                              <input
                                required
                                type="password"
                                placeholder="Emergency Recovery Phrase"
                                value={patterns.recoveryPhrase}
                                onChange={(e) => setPatterns({ ...patterns, recoveryPhrase: e.target.value })}
                                className="input-field bg-slate-900/50 border-white/5 pl-12"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-6 btn-primary shadow-[0_0_50px_-10px_rgba(59,130,246,0.4)]"
                    >
                      {actionLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Shield className="w-7 h-7" />}
                      <span className="uppercase tracking-[0.3em] text-sm font-black">
                        {actionLoading ? 'FRAGMENTING DATA...' : 'INITIALIZE CRYPTOGRAPHIC FRAGMENTATION'}
                      </span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl flex items-start gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <AlertCircle className="w-16 h-16 text-yellow-500" />
                      </div>
                      <div className="p-4 bg-yellow-500/10 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-yellow-500 tracking-tight uppercase">CRITICAL: FRAGMENT DISTRIBUTION</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mt-2 max-w-2xl">
                          The neural key has been fragmented into {totalShares} unique SSS shares. 
                          <span className="text-white font-bold"> YOU MUST SAVE THESE NOW.</span> LinkCortexa does not store these fragments. 
                          Loss of fragments below the threshold ({threshold}) results in permanent data entropy.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const allShares = (generatedShares || []).map((s, i) => `FRAGMENT_0x${i + 1}: ${s}`).join('\n');
                          navigator.clipboard.writeText(allShares);
                        }}
                        className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] font-black text-yellow-500 uppercase tracking-widest hover:bg-yellow-500/20 transition-all shrink-0"
                      >
                        Copy All Fragments
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedShares.map((share, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="glass-card p-6 space-y-4 relative group border-white/5 hover:border-brand-blue/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FRAGMENT_0x{i + 1}</span>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(share)}
                              className="p-2 text-slate-500 hover:text-brand-blue transition-colors hover:bg-brand-blue/10 rounded-lg"
                              title="Copy Fragment"
                            >
                              <Database className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="p-5 bg-slate-950/80 border border-white/5 rounded-2xl font-mono text-[10px] text-brand-blue break-all leading-relaxed shadow-inner">
                            {share}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button
                      onClick={resetAddForm}
                      className="w-full py-6 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-sm transition-all shadow-[0_0_50px_-10px_rgba(34,197,94,0.4)]"
                    >
                      CONFIRM FRAGMENT SECURITY & CLOSE SESSION
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Retrieve Modal */}
      <AnimatePresence>
        {showRetrieveModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRetrieveModal(null)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-card border-white/10 shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-2xl">
                    <Eye className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">NEURAL RECONSTRUCTION</h2>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">Protocol: Shamir's Secret Sharing</p>
                  </div>
                </div>
                <button onClick={() => setShowRetrieveModal(null)} className="p-3 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-10 overflow-y-auto flex-1 space-y-10">
                {!retrievedContent ? (
                  <form onSubmit={handleRetrieve} className="space-y-10">
                    <div className="p-8 bg-brand-blue/5 border border-brand-blue/20 rounded-3xl text-center space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
                      <div className="space-y-2 relative z-10">
                        <p className="text-sm text-slate-300 font-black uppercase tracking-[0.2em]">
                          THRESHOLD REQUIREMENT: <span className="text-brand-blue">{items.find(i => i.id === showRetrieveModal)?.threshold} FRAGMENTS</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                          Provide the minimum required fragments to reconstruct the cryptographic key.
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                          <span>Fragments Provided</span>
                          <span>{retrievalShares.filter(s => s.trim() !== '').length} / {items.find(i => i.id === showRetrieveModal)?.threshold}</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-dark/50 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (retrievalShares.filter(s => s.trim() !== '').length / (items.find(i => i.id === showRetrieveModal)?.threshold || 1)) * 100)}%` }}
                            className={cn(
                              "h-full transition-all duration-500",
                              retrievalShares.filter(s => s.trim() !== '').length >= (items.find(i => i.id === showRetrieveModal)?.threshold || 0) ? 'bg-green-500 shadow-glow-green' : 'bg-brand-blue shadow-glow-blue'
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {retrievalShares.map((share, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                                <span className="text-[10px] font-black text-brand-blue">{i + 1}</span>
                              </div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FRAGMENT_KEY_0x{i + 1}</label>
                            </div>
                            {retrievalShares.length > (items.find(i => i.id === showRetrieveModal)?.threshold || 1) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newShares = [...retrievalShares];
                                  newShares.splice(i, 1);
                                  setRetrievalShares(newShares);
                                }}
                                className="text-[9px] text-red-500 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
                              >
                                REMOVE_NODE
                              </button>
                            )}
                          </div>
                          <textarea
                            required
                            value={share}
                            onChange={(e) => {
                              const newShares = [...retrievalShares];
                              newShares[i] = e.target.value;
                              setRetrievalShares(newShares);
                            }}
                            placeholder={`Paste Fragment Key ${i + 1} (Hexadecimal)`}
                            className="input-field bg-slate-900/50 border-white/5 h-28 font-mono text-[10px] resize-none focus:bg-slate-900/80 transition-all"
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setRetrievalShares([...retrievalShares, ''])}
                        disabled={retrievalShares.length >= (items.find(i => i.id === showRetrieveModal)?.totalShares || 10)}
                        className="text-[10px] text-brand-blue hover:text-white font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all disabled:opacity-30 p-3 bg-brand-blue/5 rounded-xl border border-brand-blue/10 hover:border-brand-blue/30"
                      >
                        <Plus className="w-4 h-4" /> ADD_FRAGMENT_NODE
                      </button>
                      <button
                        type="button"
                        onClick={() => setRetrievalShares(Array(items.find(i => i.id === showRetrieveModal)?.threshold || 3).fill(''))}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-[0.2em] transition-colors"
                      >
                        RESET_TO_THRESHOLD
                      </button>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] text-center leading-relaxed"
                      >
                        {error}
                      </motion.div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-6 btn-primary shadow-[0_0_50px_-10px_rgba(59,130,246,0.4)]"
                    >
                      {actionLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Shield className="w-7 h-7" />}
                      <span className="uppercase tracking-[0.3em] text-sm font-black">{actionLoading ? 'RECONSTRUCTING...' : 'EXECUTE NEURAL RECONSTRUCTION'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-3xl flex items-center gap-6 text-green-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-2xl">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black tracking-tight uppercase">DECRYPTION SUCCESSFUL</h4>
                        <p className="text-[10px] opacity-80 font-black uppercase tracking-[0.3em]">Neural Fragments Reconstructed via SSS Protocol</p>
                      </div>
                    </div>
                    <div className="p-10 bg-slate-950/80 rounded-3xl border border-white/5 space-y-6 shadow-inner relative group">
                      <div className="absolute top-4 right-4">
                        <Database className="w-5 h-5 text-slate-800 group-hover:text-brand-blue transition-colors" />
                      </div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] block">RECONSTRUCTED_PAYLOAD</label>
                      <div className="text-white font-medium whitespace-pre-wrap break-all leading-relaxed text-lg tracking-tight">
                        {retrievedContent}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRetrieveModal(null)}
                      className="w-full py-6 bg-slate-900 hover:bg-white/5 border border-white/5 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-sm transition-all"
                    >
                      TERMINATE SECURE SESSION
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card border-red-500/20 shadow-[0_0_100px_-20px_rgba(239,68,68,0.2)] overflow-hidden p-8 text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto relative">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div className="absolute inset-0 border-2 border-red-500/20 rounded-3xl animate-ping opacity-20" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Terminate Node?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  CRITICAL: Terminating this storage node will permanently erase the encrypted fragments. This action is <span className="text-red-500 font-bold">irreversible</span>.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={actionLoading}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-glow-red flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Termination
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={actionLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-white/5 border border-white/5 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all"
                >
                  Abort Mission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
