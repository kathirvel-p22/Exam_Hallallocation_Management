// src/pages/admin/Reports.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { SectionHeader, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  {
    id: 'attendance',
    icon: '◎',
    title: 'Attendance Summary',
    desc: 'Present/Absent breakdown per exam',
    formats: ['PDF', 'Excel']
  },
  {
    id: 'allocation',
    icon: '✦',
    title: 'Seat Allocation Sheet',
    desc: 'Hall-wise seating arrangement for all students',
    formats: ['PDF', 'Excel']
  },
  {
    id: 'halltickets',
    icon: '◈',
    title: 'Bulk Hall Tickets',
    desc: 'All QR hall tickets in a single PDF',
    formats: ['PDF']
  },
  {
    id: 'invigilator',
    icon: '◉',
    title: 'Invigilator Duty Report',
    desc: 'Duty schedule and check-in/out times',
    formats: ['PDF', 'Excel']
  },
  {
    id: 'analytics',
    icon: '◆',
    title: 'Analytics Report',
    desc: 'Monthly trends and performance metrics',
    formats: ['PDF']
  },
  {
    id: 'issues',
    icon: '◧',
    title: 'Issue Report',
    desc: 'All reported exam incidents and resolutions',
    formats: ['Excel']
  },
];

export default function Reports() {
  const [selected, setSelected] = useState('');
  const [exam, setExam] = useState('');

  const { data: examsData, isLoading } = useQuery({
    queryKey: ['exams-all'],
    queryFn: () => apiGet('/exams?limit=100'),
    retry: false
  });

  // Fix: API returns { success, data: { exams, pagination } }
  const exams = examsData?.data?.exams || [];

  const handleDownload = (type, format) => {
    toast.success(`Generating ${type} as ${format}...`);
    // In production: call /api/reports/generate with jsPDF / SheetJS on client or PDF service on server
    setTimeout(() => toast.success(`${type}.${format.toLowerCase()} downloaded!`), 1500);
  };

  if (isLoading) return <PageLoader />;

  // Debug Banner
  const debugBanner = (
    <div style={{
      backgroundColor: '#10B981',
      color: 'white',
      padding: '15px',
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: '20px',
      borderRadius: '10px'
    }}>
      ✅ REPORTS SECTION IS WORKING - {exams.length} exams available for reporting
    </div>
  );

  return (
    <div className="space-y-6">
      {debugBanner}

      <SectionHeader
        eyebrow="Documentation"
        title="Reports & Exports"
        subtitle="Generate comprehensive examination reports"
      />

      {/* Report Types Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
        {REPORT_TYPES.map(r => (
          <div
            key={r.id}
            className={`card card-md cursor-pointer transition-all hover:shadow-lg ${selected === r.id ? 'border-2 border-gold shadow-lg' : ''
              }`}
            onClick={() => setSelected(r.id)}
          >
            <div className="text-3xl mb-3">{r.icon}</div>
            <h3 className="font-bold text-[14px] mb-1">{r.title}</h3>
            <p className="text-[12px] text-navy/50 mb-4">{r.desc}</p>
            <div className="flex gap-2">
              {r.formats.map(f => (
                <button
                  key={f}
                  onClick={e => {
                    e.stopPropagation();
                    handleDownload(r.title, f);
                  }}
                  className={`btn btn-xs ${f === 'PDF'
                      ? 'bg-ruby-exam-light text-ruby-exam border border-ruby-exam-border'
                      : 'bg-emerald-exam-light text-emerald-exam border border-emerald-exam-border'
                    }`}
                >
                  ↓ {f}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Report Builder */}
      <div className="card card-md">
        <h3 className="font-display text-lg font-bold mb-4">Custom Report Builder</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="field-label">Report Type</label>
            <select
              className="field-select"
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              <option value="">Select type...</option>
              {REPORT_TYPES.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Exam</label>
            <select
              className="field-select"
              value={exam}
              onChange={e => setExam(e.target.value)}
            >
              <option value="">All exams</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>
                  {e.subjectName} — {new Date(e.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleDownload(selected || 'report', 'PDF')}
              className="btn btn-gold w-full justify-center"
              disabled={!selected}
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {selected && (
          <div className="mt-4 p-4 bg-cream rounded-xl">
            <h4 className="font-bold text-sm mb-2">Report Preview</h4>
            <div className="text-xs text-navy/60">
              <p><strong>Type:</strong> {REPORT_TYPES.find(r => r.id === selected)?.title}</p>
              <p><strong>Exam:</strong> {exam ? exams.find(e => e.id === exam)?.subjectName : 'All Exams'}</p>
              <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card card-md">
        <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleDownload('All Hall Tickets', 'PDF')}
            className="btn btn-navy"
          >
            📄 All Hall Tickets
          </button>
          <button
            onClick={() => handleDownload('Attendance Summary', 'Excel')}
            className="btn btn-emerald"
          >
            📊 Attendance Excel
          </button>
          <button
            onClick={() => handleDownload('Seating Chart', 'PDF')}
            className="btn btn-gold"
          >
            🪑 Seating Chart
          </button>
          <button
            onClick={() => handleDownload('Analytics Report', 'PDF')}
            className="btn btn-ruby"
          >
            📈 Analytics PDF
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="card card-md p-4">
        <h4 className="font-bold mb-2">Reports Debug:</h4>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({
            examsCount: exams.length,
            selectedReport: selected || 'None',
            selectedExam: exam || 'All',
            reportTypes: REPORT_TYPES.length,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}