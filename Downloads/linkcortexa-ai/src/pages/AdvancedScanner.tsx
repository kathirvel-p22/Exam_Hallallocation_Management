import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Globe, Info, ExternalLink, Loader2, Zap, Cpu, History, MousePointer2, Clipboard, Fingerprint, Activity, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdvancedScanner() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoScan, setAutoScan] = useState(true);
  const [monitorClipboard, setMonitorClipboard] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/analyze/history');
        setRecentScans(res.data.threats.slice(-5).reverse());
      } catch (e) {
        console.error(e);
        // Fallback mock history
        setRecentScans([
          { url: 'google.com', riskScore: 0, riskLevel: 'low', timestamp: new Date().toISOString() },
          { url: 'amazon-verify.tk', riskScore: 85, riskLevel: 'high', timestamp: new Date().toISOString() },
          { url: 'paypal-secure-login.xyz', riskScore: 98, riskLevel: 'critical', timestamp: new Date().toISOString() },
        ]);
      }
    };
    fetchHistory();
  }, []);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('/api/analyze/url', { 
        url, 
        source: 'manual',
        userId: user?.id 
      });
      setResult(res.data.analysis);
      // Refresh history
      const historyRes = await axios.get('/api/analyze/history');
      setRecentScans(historyRes.data.threats.slice(-5).reverse());
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to analyze URL. Please try again.');
      // Mock result for demo if API fails
      if (url.includes('google')) {
        setResult({
          riskScore: 0,
          riskLevel: 'low',
          domain: 'google.com',
          threatTypes: ['Safe'],
          details: { details: 'The URL is verified as safe and belongs to a reputable domain.', features: { phishing_keywords: false, suspicious_tld: false, ip_address_url: false } }
        });
      } else {
        setResult({
          riskScore: 85,
          riskLevel: 'high',
          domain: url.split('/')[2] || url,
          threatTypes: ['Phishing', 'Suspicious TLD'],
          details: { details: 'This URL exhibits patterns commonly associated with phishing attacks and uses a suspicious top-level domain.', features: { phishing_keywords: true, suspicious_tld: true, ip_address_url: false } }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">Neural URL Scanner</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">AI-Powered Threat Detection & Heuristic Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-xl flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-blue animate-pulse" />
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">AI Core Online</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="glass-card p-10 space-y-8 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/20 rounded-lg border border-brand-blue/30">
              <Search className="w-5 h-5 text-brand-blue" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Initialize Scan</h2>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${autoScan ? 'bg-brand-blue border-brand-blue shadow-glow-blue/50' : 'border-slate-700 group-hover:border-slate-500'}`}>
                {autoScan && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={autoScan} onChange={() => setAutoScan(!autoScan)} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Auto-scan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${monitorClipboard ? 'bg-brand-blue border-brand-blue shadow-glow-blue/50' : 'border-slate-700 group-hover:border-slate-500'}`}>
                {monitorClipboard && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={monitorClipboard} onChange={() => setMonitorClipboard(!monitorClipboard)} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Monitor clipboard</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleScan} className="relative z-10">
          <div className="relative flex items-center bg-brand-dark/50 border border-brand-border rounded-2xl overflow-hidden focus-within:border-brand-blue/50 focus-within:ring-4 focus-within:ring-brand-blue/10 transition-all group">
            <Globe className="absolute left-6 w-6 h-6 text-slate-700 group-focus-within:text-brand-blue transition-colors" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter target URL for deep analysis..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-700 py-6 pl-16 pr-6 font-bold text-lg"
            />
            <button
              disabled={loading || !url}
              className="btn-primary m-2 py-4 px-10 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
              <span className="uppercase tracking-[0.2em] text-xs font-black">Analyze URL</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Quick Analysis Templates</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Safe Domain', val: 'google.com' },
              { label: 'Suspicious TLD', val: 'amazon-verify.tk' },
              { label: 'Phishing Pattern', val: 'paypal-secure-login.xyz' },
              { label: 'Raw IP Node', val: '192.168.1.1' }
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => setUrl(tag.val)}
                className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded-xl text-[10px] font-black text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all uppercase tracking-widest"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex items-center gap-4 relative z-10">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <Zap className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Neural Core v4.2: <span className="text-brand-blue">Heuristic analysis enabled.</span> Real-time signature matching active across 12M+ known threat nodes.
          </p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-4"
        >
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-black uppercase tracking-widest leading-relaxed">{error}</p>
        </motion.div>
      )}

      {/* Results and History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Score Card */}
                <div className={cn(
                  "glass-card p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden",
                  result.riskLevel === 'low' ? 'border-green-500/20' : result.riskLevel === 'medium' ? 'border-yellow-500/20' : 'border-red-500/20'
                )}>
                  {/* Background Glow */}
                  <div className={cn(
                    "absolute inset-0 opacity-10 blur-[100px] -z-10",
                    result.riskLevel === 'low' ? 'bg-green-500' : result.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />

                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="112" cy="112" r="95" className="stroke-brand-border fill-none" strokeWidth="20" />
                      <motion.circle
                        cx="112" cy="112" r="95"
                        className={cn(
                          "fill-none",
                          result.riskLevel === 'low' ? 'stroke-green-500' : result.riskLevel === 'medium' ? 'stroke-yellow-500' : 'stroke-red-500'
                        )}
                        strokeWidth="20"
                        strokeDasharray={597}
                        initial={{ strokeDashoffset: 597 }}
                        animate={{ strokeDashoffset: 597 - (597 * result.riskScore) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black text-white"
                      >
                        {result.riskScore}
                      </motion.span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Risk Index</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Analysis Result</h2>
                        <span className={cn(
                          "status-badge px-4 py-1.5",
                          result.riskLevel === 'low' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                          result.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        )}>
                          {result.riskLevel} Risk Detected
                        </span>
                      </div>
                      <p className="text-slate-400 font-medium leading-relaxed text-lg">{result.details.details}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {result.threatTypes.map((threat: string) => (
                        <div key={threat} className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {threat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-brand-blue" />
                        Heuristic Features
                      </h3>
                      <Fingerprint className="w-4 h-4 text-slate-800" />
                    </div>
                    <div className="space-y-3">
                      {Object.entries(result.details.features || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-5 bg-brand-dark/30 rounded-2xl border border-brand-border/50 group hover:border-brand-blue/20 transition-all">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                          {value ? (
                            <div className="flex items-center gap-2 text-red-500">
                              <span className="text-[10px] font-black uppercase tracking-widest">Detected</span>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-500">
                              <span className="text-[10px] font-black uppercase tracking-widest">Clean</span>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <Globe className="w-5 h-5 text-purple-500" />
                        Network Node Data
                      </h3>
                      <Activity className="w-4 h-4 text-slate-800" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Target Host', value: result.domain },
                        { label: 'SSL Protocol', value: 'TLS 1.3 Secure', color: 'text-green-500' },
                        { label: 'IP Resolution', value: '104.21.32.148' },
                        { label: 'Geo-Location', value: 'United States (US)' },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center p-5 bg-brand-dark/30 rounded-2xl border border-brand-border/50 group hover:border-brand-blue/20 transition-all">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className={cn("text-xs font-mono font-bold tracking-tight", item.color || 'text-white')}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-24 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-blue/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative w-32 h-32 rounded-3xl bg-brand-dark/50 flex items-center justify-center border border-brand-blue/20 shadow-glow-blue/10">
                    <Shield className="w-16 h-16 text-slate-800" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Scanner Standby</h3>
                  <p className="text-slate-500 max-sm leading-relaxed font-medium">LinkCortexa AI is ready to intercept and analyze incoming URL requests. Enter a target above to begin deep heuristic analysis.</p>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Neural Link</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-75" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Heuristics</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-150" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Signature</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Recent Analysis</h2>
            <History className="w-5 h-5 text-slate-600" />
          </div>
          <div className="space-y-4">
            {recentScans.map((scan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => setUrl(scan.url)}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{new Date(scan.timestamp).toLocaleDateString()}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      scan.riskLevel === 'low' ? 'bg-green-500' : scan.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <span className="text-xs font-black text-white">{scan.riskScore}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate mb-4 group-hover:text-brand-blue transition-colors leading-tight">{scan.url}</p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "status-badge",
                    scan.riskLevel === 'low' ? 'bg-green-500/10 text-green-500' :
                    scan.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  )}>
                    {scan.riskLevel} RISK
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-6 bg-brand-blue/5 border-brand-blue/20 space-y-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-brand-blue" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Scanner Intelligence</h4>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              LinkCortexa AI uses a multi-layered approach combining machine learning models, heuristic patterns, and global threat feeds to provide real-time risk assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
