// src/pages/admin/AllocationEngine.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../../services/api';
import { PageLoader, SectionHeader } from '../../components/ui';

export default function AllocationEngine() {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedHalls, setSelectedHalls] = useState([]);
  const [mixDepts, setMixDepts] = useState(true);
  const [reserveDisabled, setReserveDisabled] = useState(true);
  const [sendNotifs, setSendNotifs] = useState(true);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);

  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => apiGet('/exams?status=DRAFT&limit=50'),
    retry: false
  });

  const { data: hallsData, isLoading: hallsLoading } = useQuery({
    queryKey: ['halls'],
    queryFn: () => apiGet('/halls'),
    retry: false
  });

  // Fix: API returns { success, data: { exams/halls, pagination } }
  const exams = examsData?.data?.exams || [];
  const halls = hallsData?.data?.halls || [];

  const allocateMutation = useMutation({
    mutationFn: (payload) => apiPost('/allocation/run', payload),
    onSuccess: (data) => {
      setProgress(null);
      setResult(data.data);
      toast.success(`✦ Allocation complete! ${data.data?.studentsAllocated || 0} students allocated`);
    },
    onError: (err) => {
      setProgress(null);
      toast.error(err.response?.data?.message || 'Allocation failed');
    },
  });

  const toggleHall = (id) => setSelectedHalls(prev =>
    prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
  );

  const handleRun = () => {
    if (!selectedExam) return toast.error('Select an exam first');
    if (selectedHalls.length === 0) return toast.error('Select at least one hall');

    setResult(null);
    setProgress({ step: 1, total: 7, message: 'Starting allocation engine...', percent: 15 });

    allocateMutation.mutate({
      examId: selectedExam,
      hallIds: selectedHalls,
      mixDepartments: mixDepts,
      reserveFrontForDisabled: reserveDisabled,
      sendNotifications: sendNotifs
    });
  };

  if (examsLoading || hallsLoading) return <PageLoader />;

  const totalCapacity = halls
    .filter(h => selectedHalls.includes(h.id))
    .reduce((a, h) => a + (h._count?.seats || h.capacity || 0), 0);

  const selExam = exams.find(e => e.id === selectedExam);

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
      ✅ ALLOCATION ENGINE IS WORKING - {exams.length} exams, {halls.length} halls available
    </div>
  );

  return (
    <div className="space-y-7">
      {debugBanner}

      <SectionHeader
        eyebrow="Smart Engine"
        title="Allocation Engine"
        subtitle="Automated department-mixing seat assignment"
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Config Panel */}
        <div className="col-span-2 space-y-5">
          {/* Exam Selector */}
          <div className="card card-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold">1. Select Exam</h3>
                <p className="text-[11px] text-navy/40 mt-0.5">Choose the exam to allocate seats for</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {exams.length === 0 ? (
                <div className="text-center py-6 text-navy/30 text-sm">
                  No exams in DRAFT status
                </div>
              ) : exams.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedExam(e.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] text-left transition-all ${selectedExam === e.id
                      ? 'border-gold bg-gold/5 shadow-lg'
                      : 'border-navy/10 hover:border-gold/40'
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${selectedExam === e.id ? 'bg-gold border-gold' : 'border-navy/20'
                    }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px]">{e.subjectName}</div>
                    <div className="text-[11px] text-navy/40 font-mono">
                      {e.subjectCode} · {new Date(e.date).toLocaleDateString()} · {e.shift} · Sem {e.semester}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {e.departments?.map(d => (
                      <span key={d.id} className="px-2 py-1 bg-navy/10 text-navy/70 rounded text-xs font-semibold">
                        {d.department?.code}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Hall Selector */}
          <div className="card card-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold">2. Select Halls</h3>
                <p className="text-[11px] text-navy/40 mt-0.5">Choose one or more halls to fill</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {halls.map(h => (
                <button
                  key={h.id}
                  onClick={() => toggleHall(h.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] text-left transition-all ${selectedHalls.includes(h.id)
                      ? 'border-gold bg-gold/5'
                      : 'border-navy/10 hover:border-gold/40'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${selectedHalls.includes(h.id)
                      ? 'bg-gold border-gold text-navy'
                      : 'border-navy/20'
                    }`}>
                    {selectedHalls.includes(h.id) && <span className="text-[9px] font-black">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px]">{h.name}</div>
                    <div className="text-[10px] text-navy/40 font-mono">
                      {h.building} · Cap: {h.capacity}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedHalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-navy/5 flex items-center justify-between text-[12px]">
                <span className="text-navy/40">
                  {selectedHalls.length} hall{selectedHalls.length > 1 ? 's' : ''} selected
                </span>
                <span className="font-mono font-bold">{totalCapacity} seats available</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="card card-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-lg font-bold">3. Allocation Options</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-navy/5">
                <div>
                  <div className="font-bold text-[13px]">Mix Departments</div>
                  <div className="text-[11px] text-navy/40">
                    Interleave students from different departments to prevent malpractice
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mixDepts}
                    onChange={e => setMixDepts(e.target.checked)}
                    className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-navy/5">
                <div>
                  <div className="font-bold text-[13px]">Reserve Front Seats for Differently-Abled</div>
                  <div className="text-[11px] text-navy/40">
                    Students with disabilities are automatically assigned front accessible seats
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reserveDisabled}
                    onChange={e => setReserveDisabled(e.target.checked)}
                    className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-bold text-[13px]">Send Notifications</div>
                  <div className="text-[11px] text-navy/40">
                    Email + push hall ticket to every student after allocation
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNotifs}
                    onChange={e => setSendNotifs(e.target.checked)}
                    className="w-4 h-4 text-gold bg-gray-100 border-gray-300 rounded focus:ring-gold"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — summary + run */}
        <div className="space-y-5">
          {/* Summary card */}
          <div className="card card-md bg-navy text-white">
            <h3 className="font-display text-lg font-bold text-white mb-4">Allocation Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-white/40">Exam</span>
                <span className="font-bold truncate max-w-[60%] text-right">
                  {selExam?.subjectName || '—'}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/40">Departments</span>
                <span className="font-bold">{selExam?.departments?.length || 0}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/40">Halls Selected</span>
                <span className="font-bold">{selectedHalls.length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/40">Total Capacity</span>
                <span className="font-bold font-mono">{totalCapacity}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/40">Dept Mixing</span>
                <span className={`font-bold ${mixDepts ? 'text-gold' : 'text-white/40'}`}>
                  {mixDepts ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-white/10">
              <button
                onClick={handleRun}
                disabled={!!progress || allocateMutation.isPending}
                className="btn btn-gold btn-lg w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {progress ? '⟳ Running...' : '✦ Run Allocation'}
              </button>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="card card-md">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[13px]">Processing...</h4>
                <span className="text-[11px] font-mono text-navy/40">
                  Step {progress.step}/{progress.total}
                </span>
              </div>
              <div className="h-2 bg-cream rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-gold to-[#A8880A] rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent || 0}%` }}
                />
              </div>
              <p className="text-[12px] text-navy/60">{progress.message}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card card-md border border-emerald-exam-border bg-emerald-exam-light">
              <div className="text-emerald-exam font-black text-[11px] font-mono mb-3">
                ✓ ALLOCATION COMPLETE
              </div>
              <div className="space-y-2">
                {[
                  ['Students Allocated', result.studentsAllocated],
                  ['Halls Used', result.hallsUsed],
                  ['Tickets Generated', result.ticketsGenerated],
                  ['Duration', `${result.durationSeconds}s`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-[13px]">
                    <span className="text-emerald-exam/70">{l}</span>
                    <span className="font-bold text-emerald-exam">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="card card-md p-4">
        <h4 className="font-bold mb-2">Allocation Engine Debug:</h4>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({
            examsCount: exams.length,
            hallsCount: halls.length,
            selectedExam: selectedExam || 'None',
            selectedHalls: selectedHalls.length,
            totalCapacity,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}