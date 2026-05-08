// src/pages/AuthPage.jsx - Combined Login/Signup Page
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Spinner } from '../components/ui';

const ROLE_DEMOS = {
  EXAM_ADMIN:   { email: 'admin@acadex.edu',           password: 'Admin@2025',      label: 'Exam Admin',   color: '#D4AF37', icon: '🛡' },
  SUPER_ADMIN:  { email: 'superadmin@acadex.edu',      password: 'SuperAdmin@2025', label: 'Super Admin',  color: '#0B1437', icon: '👑' },
  INVIGILATOR:  { email: 'priya.nair@acadex.edu',      password: 'Invig@2025',      label: 'Invigilator',  color: '#A81C3A', icon: '📋' },
  STUDENT:      { email: 'arjun@student.acadex.edu',   password: 'Student@2025',    label: 'Student',      color: '#0D6B4E', icon: '🎓' },
};

const ROLE_REDIRECT = {
  EXAM_ADMIN:  '/admin/dashboard',
  SUPER_ADMIN: '/superadmin/dashboard',
  INVIGILATOR: '/invigilator/dashboard',
  STUDENT:     '/student/dashboard',
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useAuthStore();
  const { login, signup, isLoading, user } = store;
  const [isSignup, setIsSignup] = useState(false);
  const hintRole = location.state?.role;

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  // Already logged-in → redirect
  useEffect(() => {
    const isAuthenticated = store.isAuthenticated();
    console.log('🔍 AuthPage useEffect triggered:', { isAuthenticated, user: !!user, userRole: user?.role });
    if (isAuthenticated && user) {
      const redirectPath = ROLE_REDIRECT[user.role] || '/dashboard';
      console.log('🔄 User is authenticated, redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, store]);

  // Pre-fill demo credentials if arriving from portal card
  useEffect(() => {
    if (hintRole && ROLE_DEMOS[hintRole] && !isSignup) {
      setValue('email', ROLE_DEMOS[hintRole].email);
      setValue('password', ROLE_DEMOS[hintRole].password);
    }
  }, [hintRole, isSignup, setValue]);

  const onSubmit = async (data) => {
    console.log('🔍 Form submit:', { ...data, password: '***' });
    try {
      let result;
      if (isSignup) {
        result = await signup(data.email.trim().toLowerCase(), data.password, data.name, data.role || 'STUDENT');
        toast.success(`Welcome to AcadeX, ${data.name}!`);
      } else {
        console.log('📡 Calling login function...');
        result = await login(data.email.trim().toLowerCase(), data.password);
        console.log('✅ Login result:', result);
        toast.success(`Welcome back, ${result.user.student?.name || result.user.invigilator?.name || data.email.split('@')[0]}!`);
      }
      
      const redirectPath = ROLE_REDIRECT[result.user.role] || '/dashboard';
      console.log('🔄 Attempting redirect to:', redirectPath);
      console.log('🔄 User role:', result.user.role);
      console.log('🔄 Available redirects:', ROLE_REDIRECT);
      console.log('🔄 Current location:', location.pathname);
      
      // Force immediate navigation without delay
      console.log('🔄 Executing navigation to:', redirectPath);
      navigate(redirectPath, { replace: true });
      console.log('🔄 Navigation called');
      
    } catch (err) {
      console.error('❌ Auth error:', err);
      toast.error(err.response?.data?.message || `${isSignup ? 'Signup' : 'Login'} failed. Please try again.`);
    }
  };

  const fillDemo = (role) => {
    const d = ROLE_DEMOS[role];
    setValue('email', d.email);
    setValue('password', d.password);
    setIsSignup(false);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    reset();
  };

  return (
    <div className="min-h-screen flex bg-[#F9F6EE]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[48%] bg-navy flex-col relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 30% 60%, rgba(212,175,55,.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-auto">
            <div className="w-12 h-12 bg-gold rounded-[14px] flex items-center justify-center shadow-gold">
              <span className="font-display text-[22px] font-bold text-navy">A</span>
            </div>
            <div>
              <div className="font-display text-[28px] font-bold text-white leading-none">Acade<span className="text-gold">X</span></div>
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-[2px]">Exam Management</div>
            </div>
          </div>

          {/* Main copy */}
          <div className="mb-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[clamp(36px,3.5vw,54px)] font-bold text-white leading-[1.1] mb-5">
              Secure. Smart.<br /><em className="text-gold">Seamless.</em>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/45 text-[15px] leading-[1.75] max-w-[380px]">
              AcadeX gives every stakeholder — admin, invigilator, and student — a purpose-built portal for a frictionless examination experience.
            </motion.p>

            {/* Feature list */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 space-y-3.5">
              {[
                { icon: '✦', text: 'AI-powered department-mixing allocation engine' },
                { icon: '◎', text: 'JWT-encrypted QR hall tickets with live scan' },
                { icon: '◉', text: 'Real-time Socket.io hall monitoring dashboard' },
                { icon: '◈', text: 'Groq LLaMA 3 chatbot for student support' },
              ].map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 text-[13px] text-white/50">
                  <span className="text-gold text-[11px]">{f.icon}</span>
                  {f.text}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mt-8">
            {[['10K+','Students'],['99.9%','Accuracy'],['₹0','Cost']].map(([v, l]) => (
              <div key={l} className="bg-white/[0.03] px-5 py-4 text-center">
                <div className="font-display text-2xl font-bold text-gold">{v}</div>
                <div className="text-[10px] text-white/25 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-navy rounded-[12px] flex items-center justify-center">
              <span className="font-display text-lg font-bold text-gold">A</span>
            </div>
            <span className="font-display text-2xl font-bold text-navy">AcadeX</span>
          </div>

          <h3 className="font-display text-[32px] font-bold text-navy mb-1">
            {isSignup ? 'Create Account' : 'Welcome back'}
          </h3>
          <p className="text-[14px] text-navy/45 mb-7">
            {isSignup ? 'Join AcadeX to access your portal' : 'Sign in to your portal to continue'}
          </p>

          {/* Demo role chips - only show for login */}
          {!isSignup && (
            <div className="mb-6">
              <p className="text-[9px] font-black text-navy/30 uppercase tracking-[2px] font-mono mb-3">Quick demo access ↓</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLE_DEMOS).map(([role, d]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-[1.5px] border-navy/10 hover:border-[color] bg-white text-left transition-all hover:bg-[rgba(212,175,55,.04)] group"
                    style={{ '--color': d.color }}
                  >
                    <span>{d.icon}</span>
                    <div>
                      <div className="text-[12px] font-bold text-navy">{d.label}</div>
                      <div className="text-[10px] text-navy/35 font-mono truncate">{d.email.split('@')[0]}@…</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-navy/10" />
            <span className="text-[11px] text-navy/30 font-mono">
              {isSignup ? 'or create new account' : 'or enter credentials'}
            </span>
            <div className="flex-1 h-px bg-navy/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignup && (
              <div>
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="field-input"
                  {...register('name', {
                    required: isSignup ? 'Name is required' : false,
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                {errors.name && <p className="field-error">✕ {errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                placeholder="you@institution.edu"
                autoComplete="email"
                className="field-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="field-error">✕ {errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="field-label m-0">Password</label>
                {!isSignup && (
                  <button type="button" className="text-[11px] text-gold hover:text-[#A8880A] font-semibold">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder={isSignup ? 'Create a strong password' : 'Enter your password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="field-input"
                {...register('password', { 
                  required: 'Password is required', 
                  minLength: { value: isSignup ? 8 : 6, message: `Min ${isSignup ? 8 : 6} characters` } 
                })}
              />
              {errors.password && <p className="field-error">✕ {errors.password.message}</p>}
            </div>

            {isSignup && (
              <div>
                <label className="field-label">Role</label>
                <select className="field-select" {...register('role')}>
                  <option value="STUDENT">Student</option>
                  <option value="INVIGILATOR">Invigilator</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-gold btn-lg w-full justify-center mt-2">
              {isLoading ? (
                <><Spinner size="sm" color="navy" /> {isSignup ? 'Creating Account…' : 'Signing in…'}</>
              ) : (
                isSignup ? 'Create Account →' : 'Sign In →'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[13px] text-navy/60 hover:text-navy transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-center text-[12px] text-navy/35 mt-7 leading-relaxed">
            {isSignup ? (
              'By creating an account, you agree to our terms of service.'
            ) : (
              'Access is restricted to authorized institutional users.'
            )}
          </p>

          <button onClick={() => navigate('/')} className="w-full text-center text-[12px] text-navy/40 hover:text-navy mt-4 transition-colors">
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}