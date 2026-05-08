// src/components/ui/index.jsx — All reusable UI components
import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'gold' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-2' };
  const colors = { gold: 'border-gold border-t-transparent', white: 'border-white border-t-transparent', navy: 'border-navy border-t-transparent' };
  return <div className={clsx('rounded-full animate-spin', sizes[size], colors[color])} />;
}

// ── PageLoader ───────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-xs text-navy/40 mt-3 font-mono">Loading...</p>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-30">{icon}</div>}
      <p className="font-display text-xl font-semibold text-navy/60 mb-2">{title}</p>
      {description && <p className="text-sm text-navy/40 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────
export function Badge({ children, variant = 'navy', dot = false, className }) {
  const variants = {
    gold: 'badge-gold', navy: 'badge-navy', green: 'badge-green',
    red: 'badge-red', amber: 'badge-amber', sky: 'badge-sky', live: 'badge-live',
  };
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', variant === 'green' || variant === 'live' ? 'bg-emerald-500' : variant === 'red' ? 'bg-ruby-exam' : 'bg-gold')} />}
      {children}
    </span>
  );
}

// ── Status badge ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    ONGOING: { label: 'Ongoing', variant: 'live', dot: true },
    PUBLISHED: { label: 'Published', variant: 'green' },
    DRAFT: { label: 'Draft', variant: 'navy' },
    COMPLETED: { label: 'Completed', variant: 'sky' },
    CANCELLED: { label: 'Cancelled', variant: 'red' },
    PRESENT: { label: 'Present', variant: 'green', dot: true },
    ABSENT: { label: 'Absent', variant: 'red' },
    LATE: { label: 'Late', variant: 'amber' },
    ON_DUTY: { label: 'On Duty', variant: 'live', dot: true },
    AVAILABLE: { label: 'Available', variant: 'amber' },
  };
  const cfg = map[status] || { label: status, variant: 'navy' };
  return <Badge variant={cfg.variant} dot={cfg.dot}>{cfg.label}</Badge>;
}

// ── Progress bar ─────────────────────────────────────────────
export function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const auto = pct > 85 ? 'bg-ruby-exam' : pct > 65 ? 'bg-gold' : 'bg-emerald-exam';
  return (
    <div className="progress-track">
      <motion.div
        className={clsx('progress-bar', color || auto)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────
export function KpiCard({ icon, label, value, delta, deltaUp, color = 'gold', onClick }) {
  const colorMap = {
    gold: { stripe: 'bg-gold', icon: 'bg-gold/10 text-[#A8880A]' },
    navy: { stripe: 'bg-navy', icon: 'bg-navy/10 text-navy' },
    green: { stripe: 'bg-emerald-exam', icon: 'bg-emerald-exam-light text-emerald-exam' },
    red: { stripe: 'bg-ruby-exam', icon: 'bg-ruby-exam-light text-ruby-exam' },
  };
  const c = colorMap[color] || colorMap.gold;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={clsx('kpi', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className={clsx('kpi-stripe', c.stripe)} />
      <div className={clsx('kpi-icon', c.icon)}>{icon}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {delta && (
        <div className={clsx('kpi-delta', deltaUp ? 'text-emerald-exam' : 'text-navy/40')}>
          {deltaUp ? '↑' : '→'} {delta}
        </div>
      )}
    </motion.div>
  );
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={clsx('card card-lg w-full max-h-[90vh] overflow-y-auto', maxWidth)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold transition-all">✕</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Confirmation dialog ──────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-navy/60 mb-5">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn btn-ghost flex-1 justify-center">Cancel</button>
        <button onClick={onConfirm} className={clsx('btn flex-1 justify-center', danger ? 'btn-danger' : 'btn-gold')}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ── Table wrapper ────────────────────────────────────────────
export function DataTable({ columns, data, isLoading, emptyMessage = 'No records found' }) {
  if (isLoading) return <PageLoader />;
  if (!data?.length) return <EmptyState icon="📋" title={emptyMessage} />;
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr>{columns.map((c, i) => <th key={i}>{c.header}</th>)}</tr></thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              {columns.map((c, ci) => (
                <td key={ci}>{c.cell ? c.cell(row) : row[c.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Alert ────────────────────────────────────────────────────
export function Alert({ variant = 'info', children, className }) {
  const variants = { success: 'alert-success', warning: 'alert-warning', error: 'alert-error', info: 'alert-info' };
  const icons = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' };
  return (
    <div className={clsx('alert', variants[variant], className)}>
      <span className="shrink-0 font-bold">{icons[variant]}</span>
      <span>{children}</span>
    </div>
  );
}

// ── Form field ───────────────────────────────────────────────
export const Field = forwardRef(({ label, error, hint, required, children, ...props }, ref) => (
  <div className="mb-4">
    {label && <label className="field-label">{label}{required && <span className="text-ruby-exam ml-1">*</span>}</label>}
    {children || <input ref={ref} className="field-input" {...props} />}
    {hint && !error && <p className="text-[11px] text-navy/40 mt-1">{hint}</p>}
    {error && <p className="field-error">✕ {error}</p>}
  </div>
));

// ── Toggle ───────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={clsx('w-10 h-[22px] rounded-full transition-colors duration-200', checked ? 'bg-emerald-exam' : 'bg-navy/20')}>
          <div className={clsx('absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200', checked ? 'translate-x-[22px]' : 'translate-x-[2px]')} />
        </div>
      </div>
      {label && <span className="text-sm font-semibold">{label}</span>}
    </label>
  );
}

// ── Chip/Tag ─────────────────────────────────────────────────
export function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all duration-200',
        active ? 'bg-gold/10 text-[#A8880A] border-gold/50 font-bold' : 'bg-cream text-navy/50 border-navy/10 hover:border-gold/30'
      )}
    >
      {label}
    </button>
  );
}

// ── Section header ───────────────────────────────────────────
export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {eyebrow && <p className="text-[10px] font-black text-[#A8880A] uppercase tracking-[3px] font-mono mb-2 flex items-center gap-2"><span className="w-6 h-0.5 bg-gold inline-block" />{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-navy/50 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card header ──────────────────────────────────────────────
export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx('flex items-center justify-between mb-5', className)}>
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {subtitle && <p className="text-[11px] text-navy/40 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
