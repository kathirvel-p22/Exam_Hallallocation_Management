import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminKey: ''
  });

  useEffect(() => {
    if (logoClicks >= 5) {
      setShowAdminSecret(true);
      setLogoClicks(0);
      // Auto-hide after 15 seconds if not used
      const timer = setTimeout(() => {
        if (!isAdminMode) setShowAdminSecret(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks, isAdminMode]);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      setLogoClicks(prev => prev + 1);
    } else {
      setLogoClicks(1);
    }
    setLastClickTime(now);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      if (isAdminMode) endpoint = '/api/auth/admin-login';
      
      const res = await axios.post(endpoint, formData);
      login(res.data.token, res.data.user);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] overflow-hidden relative font-sans">
      {/* Advanced Cyber Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        
        {/* Scanning Line Effect */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent z-0"
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center space-y-6 mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            className="inline-flex p-5 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] cursor-pointer relative group overflow-hidden"
          >
            <Shield className="w-14 h-14 text-white relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl" />
            </motion.div>
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white">
              LINK<span className="text-brand-blue">CORTEXA</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-slate-800" />
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Neural Threat Intelligence</p>
              <div className="h-[1px] w-8 bg-slate-800" />
            </div>
          </div>
        </div>

        <div className="glass-card p-1 bg-white/5 border-white/10 shadow-2xl relative">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-blue/50 -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-blue/50 translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-blue/50 -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-blue/50 translate-x-1 translate-y-1" />

          <div className="p-8 space-y-8">
            <AnimatePresence mode="wait">
              {showAdminSecret && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsAdminMode(!isAdminMode);
                      setIsRegister(false);
                    }}
                    className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all group ${
                      isAdminMode 
                      ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]' 
                      : 'border-slate-700 text-slate-500 hover:border-brand-blue/50 hover:text-brand-blue/50'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${isAdminMode ? 'animate-pulse' : ''}`} />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">
                      {isAdminMode ? 'TERMINATE ADMIN SESSION' : 'INITIALIZE ADMIN OVERRIDE'}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAdminMode && (
              <div className="flex p-1.5 bg-slate-900/80 border border-white/5 rounded-2xl mb-2">
                <button
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all tracking-widest ${!isRegister ? 'bg-brand-blue text-white shadow-glow-blue/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ACCESS
                </button>
                <button
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all tracking-widest ${isRegister ? 'bg-brand-blue text-white shadow-glow-blue/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ENROLL
                </button>
              </div>
            )}

            {isAdminMode && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                <div className="inline-flex p-4 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.4)]">
                  <Fingerprint className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">ADMIN TERMINAL</h2>
                  <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-[0.3em] mt-1">Level 7 Authorization Required</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="popLayout">
                {isRegister && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field pl-12 bg-slate-900/50 border-white/5 focus:border-brand-blue/50 focus:bg-slate-900/80 transition-all"
                        placeholder="Subject Identifier"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {isAdminMode ? 'Admin Credential' : 'System Email'}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-12 bg-slate-900/50 border-white/5 focus:border-brand-blue/50 focus:bg-slate-900/80 transition-all"
                    placeholder={isAdminMode ? "root@linkcortexa.ai" : "operator@system.io"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural Keyphrase</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12 bg-slate-900/50 border-white/5 focus:border-brand-blue/50 focus:bg-slate-900/80 transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {isAdminMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Hardware Security Key</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 group-focus-within:text-red-400 transition-colors" />
                    <input
                      required
                      type="password"
                      value={formData.adminKey}
                      onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                      className="input-field pl-12 border-red-500/20 bg-red-500/5 focus:ring-red-500/30 focus:border-red-500/50 focus:bg-red-500/10 transition-all"
                      placeholder="X-SECURE-OVERRIDE"
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-4"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="leading-relaxed">{error}</p>
                </motion.div>
              )}

              <button
                disabled={loading}
                type="submit"
                className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center space-x-3 group shadow-2xl relative overflow-hidden ${
                  isAdminMode 
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' 
                  : 'bg-brand-blue hover:bg-brand-blue/90 shadow-brand-blue/30'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
                <span className="uppercase tracking-[0.2em] text-xs">
                  {loading ? 'AUTHENTICATING...' : isAdminMode ? 'AUTHORIZE OVERRIDE' : isRegister ? 'INITIALIZE IDENTITY' : 'ESTABLISH CONNECTION'}
                </span>
              </button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Link</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse delay-75" />
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Cortex</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-150" />
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Secure</span>
                </div>
              </div>
              <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.5em]">
                ENCRYPTED END-TO-END VIA SSS PROTOCOL
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
            <Shield className="w-4 h-4 text-slate-500" />
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <Lock className="w-4 h-4 text-slate-500" />
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <Fingerprint className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
            &copy; 2026 LinkCortexa AI &bull; Global Security Node
          </p>
        </div>
      </motion.div>
    </div>
  );
}
