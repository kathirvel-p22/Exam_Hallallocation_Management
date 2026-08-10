import React from 'react';
import { BarChart3, PieChart, TrendingUp, Shield, Globe, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const areaData = [
  { name: 'Mon', phishing: 12, malware: 18, suspicious: 10 },
  { name: 'Tue', phishing: 15, malware: 22, suspicious: 12 },
  { name: 'Wed', phishing: 10, malware: 15, suspicious: 8 },
  { name: 'Thu', phishing: 18, malware: 25, suspicious: 15 },
  { name: 'Fri', phishing: 22, malware: 30, suspicious: 20 },
  { name: 'Sat', phishing: 15, malware: 20, suspicious: 12 },
  { name: 'Sun', phishing: 10, malware: 15, suspicious: 8 },
];

const barData = [
  { name: 'US', value: 45 },
  { name: 'UK', value: 32 },
  { name: 'DE', value: 28 },
  { name: 'FR', value: 24 },
  { name: 'CN', value: 18 },
  { name: 'RU', value: 15 },
];

const radarData = [
  { subject: 'Phishing', A: 120, B: 110, fullMark: 150 },
  { subject: 'Malware', A: 98, B: 130, fullMark: 150 },
  { subject: 'Suspicious', A: 86, B: 130, fullMark: 150 },
  { subject: 'Safe', A: 99, B: 100, fullMark: 150 },
  { subject: 'Blocked', A: 85, B: 90, fullMark: 150 },
  { subject: 'Avg Risk', A: 65, B: 85, fullMark: 150 },
];

export default function Analytics() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-white tracking-tight">Analytics & Intelligence</h1>
        <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Threat Intelligence Insights & Patterns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Scans', value: '50', icon: Globe, color: 'text-brand-blue' },
          { label: 'Phishing', value: '10', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Malware', value: '16', icon: Activity, color: 'text-purple-500' },
          { label: 'Suspicious', value: '12', icon: TrendingUp, color: 'text-orange-500' },
          { label: 'Safe', value: '12', icon: CheckCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 text-center"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Threats by Country</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top Attacking Origins</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2937" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#1F2937'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Threat Profile</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Dimensional Risk Analysis</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Threat Intensity"
                  dataKey="A"
                  stroke="#00A3FF"
                  fill="#00A3FF"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highest Risk URLs */}
      <div className="glass-card p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Highest Risk URLs Detected</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top 5 by Risk Score</p>
        </div>
        <div className="space-y-4">
          {[
            { url: 'https://microsoft365-login.work/path', score: 98, type: 'malware' },
            { url: 'https://amazon-verify.tk/path', score: 98, type: 'phishing' },
            { url: 'https://paypal-secure-login.xyz/path', score: 95, type: 'phishing' },
            { url: 'https://banking-update.ml/path', score: 92, type: 'malware' },
            { url: 'https://google-security-alert.net/path', score: 88, type: 'suspicious' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-brand-dark/30 rounded-2xl border border-brand-border/50 hover:border-brand-blue/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-brand-blue transition-colors">
                  #{i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-md">{item.url}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.url.split('/')[2]} • {item.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-red-500">{item.score}</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Risk</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
