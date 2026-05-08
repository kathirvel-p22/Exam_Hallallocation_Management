// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const PORTALS = [
  { role: 'EXAM_ADMIN', label: 'Exam Admin', sub: 'Manage allocations & monitor halls', route: '/admin/dashboard', icon: '🛡', features: ['Smart allocation engine','Live hall dashboard','Reports & exports'], color: 'from-gold/20 to-gold/5', border: 'border-gold/30', btn: 'btn-gold' },
  { role: 'SUPER_ADMIN', label: 'Super Admin', sub: 'University-level oversight', route: '/superadmin/dashboard', icon: '👑', features: ['Multi-campus control','Global analytics','System config'], color: 'from-navy/10 to-navy/5', border: 'border-navy/20', btn: 'btn-navy' },
  { role: 'INVIGILATOR', label: 'Invigilator', sub: 'QR scan & attendance marking', route: '/invigilator/dashboard', icon: '📋', features: ['Live QR scanner','Real-time seat map','Issue reporting'], color: 'from-ruby-exam-light to-white', border: 'border-ruby-exam-border', btn: 'btn-danger' },
  { role: 'STUDENT', label: 'Student', sub: 'Hall ticket & exam schedule', route: '/student/dashboard', icon: '🎓', features: ['Digital QR hall ticket','Exam countdown','AI assistant'], color: 'from-emerald-exam-light to-white', border: 'border-emerald-exam-border', btn: 'btn-success' },
];

const FEATURES = [
  { icon: '✦', title: 'Smart Allocation Engine', desc: 'Dept-mixing algorithm assigns thousands of students in under 2 seconds, zero manual work.', tag: 'CORE' },
  { icon: '◎', title: 'Encrypted QR Hall Tickets', desc: 'JWT-secured QR codes with time-limited validity. One scan marks attendance live.', tag: 'SECURITY' },
  { icon: '◉', title: 'Live Monitoring Dashboard', desc: 'WebSocket-powered real-time view of all halls. Every scan updates instantly.', tag: 'REAL-TIME' },
  { icon: '◈', title: 'Invigilator Directory', desc: 'Students can one-tap call their invigilator. Admins broadcast to all staff instantly.', tag: 'COMMUNICATION' },
  { icon: '◆', title: 'AI Exam Assistant', desc: 'Groq LLaMA 3 chatbot with full student context. Answers queries 24/7 for free.', tag: 'AI · FREE' },
  { icon: '◧', title: 'Analytics & Reporting', desc: 'Attendance trends, hall utilization, absenteeism patterns — export as PDF or Excel.', tag: 'ANALYTICS' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handlePortalClick = (portal) => {
    if (isAuthenticated && user?.role === portal.role) {
      navigate(portal.route);
    } else {
      navigate('/login', { state: { role: portal.role } });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      {/* Nav */}
      <nav className="sticky top-0 bg-white border-b border-navy/[0.08] z-50 shadow-card">
        <div className="max-w-7xl mx-auto px-8 h-[74px] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-navy rounded-[13px] flex items-center justify-center shadow-navy">
              <span className="font-display text-[21px] font-bold text-gold">A</span>
            </div>
            <div>
              <div className="font-display text-[26px] font-bold text-navy leading-none">Acade<span className="text-gold">X</span></div>
              <div className="text-[9px] text-navy/30 font-mono tracking-[2px] uppercase">Intelligent Exam Management</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['Features', 'About', 'Documentation', 'Support'].map(l => (
              <button key={l} className="px-4 py-2 text-[13px] font-semibold text-navy/60 hover:text-navy rounded-lg hover:bg-navy/5 transition-all">{l}</button>
            ))}
            <button onClick={() => navigate('/login')} className="btn btn-gold btn-sm ml-2">
              Access Portal →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy relative overflow-hidden py-24 px-8">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 80% at -10% 50%, rgba(212,175,55,.07) 0%, transparent 60%)', backgroundSize: '100% 100%' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,.025) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="max-w-7xl mx-auto flex gap-16 items-center relative z-10">
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2.5 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-7">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)] animate-pulse" />
              <span className="text-[11px] font-black text-gold font-mono tracking-[1.5px]">REAL-TIME · ACADEMIC YEAR 2025–26</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display text-[clamp(44px,5.5vw,76px)] font-bold text-white leading-[1.05] tracking-tight mb-5">
              The <span className="text-gold">Intelligent</span><br />Exam Hall<br /><em className="text-white/60">Management</em> Platform
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/50 text-[16px] leading-[1.8] max-w-[520px] mb-9">
              AcadeX transforms chaotic manual examination hall allocation into a seamless, automated, real-time experience — from AI-powered seat assignments to QR-based attendance.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex items-center gap-10 mb-9">
              {[['10K+','Students'],['99.9%','Accuracy'],['<2s','Allocation'],['₹0','Cost']].map(([v, l]) => (
                <div key={l}><div className="font-display text-[34px] font-bold text-gold leading-none">{v}</div><div className="text-[11px] text-white/35 mt-1">{l}</div></div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
              <button onClick={() => navigate('/login')} className="btn btn-gold btn-lg">🎓 Enter Your Portal</button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.06)', color: 'white', border: '1px solid rgba(255,255,255,.14)' }}>▶ Watch Demo</button>
            </motion.div>
          </div>

          {/* Portal tiles */}
          <div className="w-[420px] shrink-0">
            <p className="text-[9px] text-white/25 font-mono tracking-[2.5px] uppercase text-center mb-3">— Select Your Role —</p>
            <div className="grid grid-cols-2 gap-3">
              {PORTALS.map((p, i) => (
                <motion.div
                  key={p.role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handlePortalClick(p)}
                  className="bg-white/[0.12] border border-white/[0.25] rounded-2xl p-6 cursor-pointer hover:bg-white/[0.18] hover:border-white/40 transition-all group backdrop-blur-sm"
                >
                  <div className="text-[32px] mb-4">{p.icon}</div>
                  <div className="font-display text-[18px] font-bold text-white mb-2">{p.label}</div>
                  <div className="text-[13px] text-white/80 leading-snug mb-4">{p.sub}</div>
                  <div className="space-y-2 mb-5">
                    {p.features.map(f => <div key={f} className="text-[12px] text-white/70 flex items-center gap-2">
                      <span className="text-gold">•</span> {f}
                    </div>)}
                  </div>
                  <button className="w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-[1px] transition-all bg-gold/20 text-gold border border-gold/30 group-hover:bg-gold group-hover:text-navy">
                    Enter →
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-gold overflow-hidden py-3">
        <div className="flex gap-16 animate-[tick_35s_linear_infinite] whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...Array(2)].flatMap(() => ['✦ Smart Auto-Allocation','◎ Encrypted QR Hall Tickets','◉ Real-Time Live Monitoring','◈ Firebase Push Notifications','◆ AI-Powered Chatbot (Groq)','◧ PDF & Excel Reports','· One-Tap Invigilator Contacts','· Department Mixing Algorithm']).map((t, i) => (
            <span key={i} className="text-[12px] font-black text-navy">{t}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <p className="text-[10px] font-black text-[#A8880A] uppercase tracking-[3px] font-mono mb-3 flex items-center gap-2"><span className="w-8 h-0.5 bg-gold" />Platform Capabilities</p>
        <h2 className="font-display text-[clamp(32px,3.5vw,48px)] font-bold mb-4">Everything an institution needs,<br /><em className="text-navy-300">all in one unified place</em></h2>
        <p className="text-[15px] text-navy/50 leading-[1.75] max-w-[560px] mb-14">AcadeX covers the entire examination lifecycle — from initial exam creation to post-exam analytics — replacing every manual process with an intelligent workflow.</p>
        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="card-hover card card-md group">
              <div className="w-12 h-12 rounded-xl bg-gold/10 text-[#A8880A] flex items-center justify-center text-xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-[15px] mb-2">{f.title}</h3>
              <p className="text-[13px] text-navy/55 leading-relaxed">{f.desc}</p>
              <span className="badge badge-gold mt-3">{f.tag}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-navy py-16 grid grid-cols-4">
        {[['10K+','Students Supported','ACROSS INSTITUTIONS'],['99.9%','Allocation Accuracy','ZERO MANUAL ERRORS'],['4','Intelligent Portals','ROLE-BASED ACCESS'],['₹0','Monthly Cost','100% FREE STACK']].map(([v,l,s]) => (
          <div key={l} className="text-center border-r border-white/[0.07] last:border-r-0 px-5">
            <div className="font-display text-[48px] font-bold text-gold leading-none">{v}</div>
            <div className="text-[13px] text-white/45 mt-2">{l}</div>
            <div className="text-[10px] text-white/20 font-mono mt-1">{s}</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
