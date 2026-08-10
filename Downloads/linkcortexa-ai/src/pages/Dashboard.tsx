import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, Lock, Database, AlertTriangle, CheckCircle, Activity, TrendingUp, Globe, Zap, Cpu, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const chartData = [
  { name: 'Tue', threats: 2, scans: 12 },
  { name: 'Wed', threats: 1, scans: 18 },
  { name: 'Thu', threats: 4, scans: 15 },
  { name: 'Fri', threats: 3, scans: 22 },
  { name: 'Sat', threats: 7, scans: 30 },
  { name: 'Sun', threats: 5, scans: 25 },
  { name: 'Mon', threats: 8, scans: 40 },
];

const pieData = [
  { name: 'Safe', value: 12, color: '#10b981' },
  { name: 'Suspicious', value: 12, color: '#f59e0b' },
  { name: 'Phishing', value: 10, color: '#f43f5e' },
  { name: 'Malware', value: 16, color: '#a855f7' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 50,
    threatsToday: 19,
    threatsThisWeek: 38,
    blockchainLogs: 50,
    avgRiskScore: 48
  });
  const [recentThreats, setRecentThreats] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/analyze/history');
        const threats = res.data.threats || [];
        setRecentThreats(threats.slice(-5).reverse());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">Security Overview</h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Real-time Threat Intelligence Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Welcome back</p>
            <p className="text-brand-blue font-bold">{user?.name}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-xl">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Scans', value: stats.totalScans, sub: 'All time', icon: Globe, color: 'text-brand-blue' },
          { label: 'Threats Today', value: stats.threatsToday, sub: 'Last 24 hours', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Threats This Week', value: stats.threatsThisWeek, sub: 'Last 7 days', icon: TrendingUp, color: 'text-orange-500' },
          { label: 'Blockchain Logs', value: stats.blockchainLogs, sub: 'Tamper-proof records', icon: Database, color: 'text-purple-500' },
          { label: 'Avg Risk Score', value: `${stats.avgRiskScore}/100`, sub: 'Composite score', icon: Activity, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Threat Activity</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">7-Day Detection Trend</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-blue" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Scans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Threats</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#00A3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="space-y-1 mb-8">
            <h3 className="text-lg font-bold text-white">Threat Breakdown</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status Distribution</p>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">50</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <History className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            </div>
            <Link to="/threats" className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:underline">View All Logs</Link>
          </div>
          <div className="divide-y divide-brand-border">
            {recentThreats.length > 0 ? (
              recentThreats.map((threat, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      threat.riskLevel === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">{threat.url}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{new Date(threat.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`status-badge ${
                      threat.riskLevel === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {threat.riskLevel}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{threat.riskScore}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No recent threats detected</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-brand-blue shadow-glow-blue border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h4 className="font-bold">Blockchain Security Active</h4>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Network: Ethereum Mainnet</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white uppercase tracking-widest">
                  <span>Sync Status</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
              <Link to="/blockchain" className="w-full py-3 bg-white text-brand-blue rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                Verify Logs <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-blue" />
              Vault Security Status
            </h3>
            <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/20 rounded-lg">
                  <Shield className="w-4 h-4 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">SSS Protocol Active</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black">Shamir's Secret Sharing</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Encryption Level</span>
                  <span className="text-brand-blue">AES-256-GCM</span>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Fragmentation</span>
                  <span className="text-brand-blue">N/K Threshold</span>
                </div>
              </div>
              <Link to="/vault" className="block w-full py-2 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-brand-blue text-center rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                Manage Vault
              </Link>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-blue" />
              System Resources
            </h3>
            <div className="space-y-6">
              {[
                { label: 'AI Processing', value: 24, color: 'bg-brand-blue' },
                { label: 'Vault Encryption', value: 12, color: 'bg-purple-500' },
                { label: 'Network Load', value: 45, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-brand-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
