// src/pages/invigilator/QRScanner.jsx
import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiPost, apiGet } from '../../services/api';
import { SectionHeader, PageLoader, Badge } from '../../components/ui';

export default function QRScanner() {
  const [scanLog, setScanLog]   = useState([]);
  const [manual, setManual]     = useState('');
  const [result, setResult]     = useState(null); // null | { success, student, seat, hall }
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef();

  const { data: dutyData, isLoading } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const activeDuty = dutyData?.data?.duties?.find(d => d.exam.status === 'ONGOING' || d.exam.status === 'PUBLISHED');

  const scanMutation = useMutation({
    mutationFn: ({ qrToken, hallId }) => apiPost('/attendance/scan', { qrToken, hallId }),
    onSuccess: (res) => {
      const d = res.data;
      const entry = { id: Date.now(), studentName: d.student?.name, regNo: d.student?.registerNo, seat: d.seat, hall: d.hall, time: new Date().toLocaleTimeString(), success: true };
      setScanLog(prev => [entry, ...prev].slice(0, 30));
      setResult({ success: true, ...d });
      toast.success(`✓ ${d.student?.name} marked PRESENT`);
    },
    onError: (err) => {
      const entry = { id: Date.now(), error: err.response?.data?.message || 'Scan failed', time: new Date().toLocaleTimeString(), success: false };
      setScanLog(prev => [entry, ...prev].slice(0, 30));
      setResult({ success: false, error: entry.error });
      toast.error(entry.error);
    },
  });

  const triggerScan = (token) => {
    if (!activeDuty?.hall?.id) { toast.error('No active duty found'); return; }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      scanMutation.mutate({ qrToken: token, hallId: activeDuty.hall.id });
    }, 800);
  };

  const handleManualSubmit = () => {
    if (!manual.trim()) return;
    triggerScan(manual.trim());
    setManual('');
  };

  // Simulate scan (in production: use jsQR with camera)
  const handleSimulatedScan = () => {
    toast('📷 Camera scanner — use jsQR in production.\nUsing demo token for now.');
    const demoToken = 'demo_token_' + Date.now();
    triggerScan(demoToken);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Attendance" title="QR Scanner" subtitle={activeDuty ? `${activeDuty.exam.subjectName} — ${activeDuty.hall?.name}` : 'No active duty'} />

      <div className="grid grid-cols-3 gap-5">
        {/* Scanner */}
        <div className="col-span-2 space-y-4">
          {/* Scanner box */}
          <div
            onClick={handleSimulatedScan}
            className={`card card-md flex flex-col items-center justify-center py-14 cursor-pointer transition-all select-none ${scanning ? 'border-2 border-gold animate-pulse' : 'hover:border-gold/50 hover:bg-gold/5'}`}
          >
            <AnimatePresence mode="wait">
              {scanning ? (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="font-bold text-gold text-lg">Scanning…</p>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`flex flex-col items-center gap-3 ${result.success ? 'text-emerald-exam' : 'text-ruby-exam'}`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${result.success ? 'bg-emerald-exam-light' : 'bg-ruby-exam-light'}`}>
                    {result.success ? '✓' : '✕'}
                  </div>
                  {result.success ? (
                    <div className="text-center">
                      <div className="font-display text-2xl font-bold text-emerald-exam">{result.student?.name}</div>
                      <div className="text-[12px] text-emerald-exam/70">{result.student?.registerNo} — Seat {result.seat}</div>
                    </div>
                  ) : (
                    <div className="text-ruby-exam font-bold text-center">{result.error}</div>
                  )}
                  <p className="text-[12px] text-navy/40 mt-2">Tap to scan next student</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <div className="text-7xl opacity-20">◎</div>
                  <div className="font-bold text-xl text-navy/50">Tap to Scan QR Code</div>
                  <div className="text-[12px] text-navy/30">Camera scanner · jsQR library in production</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manual Entry */}
          <div className="card card-md">
            <h4 className="font-bold text-[13px] mb-3">Manual Token Entry</h4>
            <div className="flex gap-3">
              <input className="field-input flex-1" placeholder="Paste QR token string here…" value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualSubmit()} />
              <button onClick={handleManualSubmit} disabled={!manual.trim() || scanMutation.isPending} className="btn btn-gold px-5">Verify</button>
            </div>
          </div>
        </div>

        {/* Scan Log */}
        <div className="card card-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[13px]">Scan Log</h4>
            <span className="badge badge-navy font-mono">{scanLog.length} scans</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-none">
            {scanLog.length === 0 ? (
              <div className="text-center py-8 text-navy/30 text-sm">No scans yet</div>
            ) : scanLog.map(s => (
              <div key={s.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${s.success ? 'bg-emerald-exam-light border-emerald-exam-border' : 'bg-ruby-exam-light border-ruby-exam-border'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${s.success ? 'bg-emerald-exam' : 'bg-ruby-exam'}`}>{s.success ? '✓' : '✕'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate">{s.success ? s.studentName : 'Failed'}</div>
                  <div className="text-[10px] text-navy/40 font-mono">{s.success ? `${s.regNo} · ${s.seat}` : s.error?.slice(0,30)}</div>
                </div>
                <span className="text-[9px] text-navy/30 font-mono shrink-0">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
