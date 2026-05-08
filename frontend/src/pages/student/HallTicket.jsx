// src/pages/student/HallTicket.jsx
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader, Badge } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function HallTicket() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['my-alloc'], queryFn: () => apiGet('/allocation/student/my') });
  const [qrUrls, setQrUrls] = useState({});
  const [activeTicket, setActiveTicket] = useState(0);

  const allocations = (data?.data || []).filter(a => a.hallTicket && !a.hallTicket.isRevoked);

  // Generate QR images
  useEffect(() => {
    allocations.forEach(async (a) => {
      if (!qrUrls[a.id] && a.hallTicket?.qrToken) {
        try {
          const url = await QRCode.toDataURL(a.hallTicket.qrToken, {
            errorCorrectionLevel: 'M', width: 200, margin: 2,
            color: { dark: '#0B1437', light: '#FFFFFF' },
          });
          setQrUrls(prev => ({ ...prev, [a.id]: url }));
        } catch {}
      }
    });
  }, [allocations.length]);

  const handleDownloadPDF = async (a) => {
    toast('Generating PDF…');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ format: 'a5' });

      // Header
      doc.setFillColor(11, 20, 55);
      doc.rect(0, 0, 148, 35, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(212, 175, 55);
      doc.text('AcadeX', 14, 16);
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('OFFICIAL HALL ADMISSION TICKET', 14, 24);

      // Student details
      doc.setTextColor(11, 20, 55);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const student = data?.data?.[0]?.student;
      doc.text(a.exam.subjectName, 14, 48);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${a.exam.subjectCode} · ${format(new Date(a.exam.date), 'dd MMM yyyy')} · ${a.exam.startTime}–${a.exam.endTime}`, 14, 56);

      const fields = [
        ['Hall', a.hall?.name], ['Building', a.hall?.building],
        ['Seat Number', a.seat?.seatNumber], ['Shift', a.exam.shift],
      ];
      let y = 68;
      doc.setFontSize(8);
      fields.forEach(([l, v]) => {
        doc.setTextColor(150, 150, 150);
        doc.text(l.toUpperCase(), 14, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(11, 20, 55);
        doc.text(v || '', 55, y);
        doc.setFont('helvetica', 'normal');
        y += 10;
      });

      // QR code
      if (qrUrls[a.id]) {
        doc.addImage(qrUrls[a.id], 'PNG', 95, 44, 42, 42);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Show this QR to invigilator', 95, 92);
      }

      // Instructions
      doc.setFillColor(249, 246, 238);
      doc.rect(14, 108, 120, 40, 'F');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const instructions = ['✓ Report 15 minutes before exam start', '✓ Carry college/govt photo ID', '✓ Show QR code to invigilator', '✗ No phones or electronic devices allowed'];
      instructions.forEach((ins, i) => doc.text(ins, 17, 116 + i * 7));

      doc.save(`HallTicket_${a.exam.subjectCode}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Digital Ticket" title="QR Hall Ticket" subtitle="Tap a ticket to view, then download as PDF or share via WhatsApp" />

      {/* Exam selector tabs */}
      {allocations.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allocations.map((a, i) => (
            <button key={a.id} onClick={() => setActiveTicket(i)} className={`px-4 py-2 rounded-xl text-[12px] font-bold border-[1.5px] transition-all ${activeTicket === i ? 'bg-navy text-gold border-navy' : 'border-navy/10 hover:border-gold/40'}`}>
              {a.exam.subjectCode}
            </button>
          ))}
        </div>
      )}

      {allocations.length === 0 ? (
        <div className="card card-md text-center py-16 text-navy/30">
          <div className="text-5xl mb-3 opacity-30">◎</div>
          <p className="font-display text-xl">No hall tickets generated yet</p>
          <p className="text-sm mt-2">Tickets appear after seat allocation is complete</p>
        </div>
      ) : (() => {
        const a = allocations[activeTicket] || allocations[0];
        return (
          <div className="max-w-lg mx-auto">
            <div className="ticket shadow-card-hover">
              {/* Ticket header */}
              <div className="ticket-header">
                <div className="ticket-logo">A</div>
                <div>
                  <div className="font-display text-xl font-bold text-white">AcadeX Platform</div>
                  <div className="text-[9px] text-white/35 font-mono uppercase tracking-[2px] mt-0.5">Official Hall Admission Ticket</div>
                </div>
                <Badge variant="green" dot className="ml-auto">VALID</Badge>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="font-display text-2xl font-bold mb-1">{a.exam.subjectName}</h3>
                <p className="text-[13px] text-navy/50 mb-5">{a.exam.subjectCode} · {format(new Date(a.exam.date), 'EEEE, dd MMMM yyyy')} · {a.exam.startTime}–{a.exam.endTime}</p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[['Hall', a.hall?.name, '⬡'], ['Building', `${a.hall?.building}, Fl ${a.hall?.floor}`, '◉'], ['Seat Number', a.seat?.seatNumber, '◎'], ['Shift', a.exam.shift, '◈']].map(([l,v,i]) => (
                    <div key={l} className="bg-cream rounded-xl p-3.5">
                      <div className="text-[10px] text-navy/40 font-mono uppercase tracking-widest mb-1">{i} {l}</div>
                      <div className="font-bold text-[16px]">{v}</div>
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center py-5 bg-cream rounded-2xl border border-navy/5 mb-5">
                  {qrUrls[a.id] ? (
                    <img src={qrUrls[a.id]} alt="QR Code" className="w-[180px] h-[180px] rounded-xl border-4 border-gold p-2" />
                  ) : (
                    <div className="w-[180px] h-[180px] rounded-xl bg-navy/5 flex items-center justify-center animate-pulse">
                      <span className="text-4xl text-navy/20">◎</span>
                    </div>
                  )}
                  <p className="text-[11px] text-navy/40 mt-3 text-center">Show this QR code to your invigilator<br />for attendance verification</p>
                  <p className="text-[10px] text-navy/25 font-mono mt-1">Expires: {a.hallTicket?.expiresAt ? format(new Date(a.hallTicket.expiresAt), 'dd MMM yyyy HH:mm') : '24 hours'}</p>
                </div>

                {/* Instructions */}
                <div className="bg-cream rounded-xl p-4 mb-5">
                  <p className="text-[11px] font-black text-navy mb-3 uppercase tracking-widest font-mono">Important Instructions</p>
                  {['Report 15 minutes before start time','Carry this QR ticket (phone or print)','Carry valid college / government ID','No electronic devices inside the hall','No study materials or books allowed'].map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-navy/60 mb-1.5">
                      <span className="text-gold shrink-0">{i < 3 ? '✓' : '✕'}</span>{ins}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => handleDownloadPDF(a)} className="btn btn-gold flex-1 justify-center">⬇ Download PDF</button>
                  <button onClick={() => { const url = `https://wa.me/?text=My AcadeX Hall Ticket: ${a.exam.subjectName}, Hall ${a.hall?.name}, Seat ${a.seat?.seatNumber}`; window.open(url, '_blank'); }} className="btn btn-ghost flex-1 justify-center">📤 Share</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
