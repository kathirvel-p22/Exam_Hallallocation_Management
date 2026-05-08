// src/pages/admin/LiveMonitor.jsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader } from '../../components/ui';
import useSocket from '../../socket/useSocket';

export default function LiveMonitor() {
  const [liveTime, setLiveTime] = useState(new Date());
  const [scanFeed, setScanFeed] = useState([]);

  const { data: hallsData, isLoading } = useQuery({
    queryKey: ['halls'],
    queryFn: () => apiGet('/halls'),
    refetchInterval: 30_000,
    retry: false
  });

  const { data: examsData } = useQuery({
    queryKey: ['live-exams'],
    queryFn: () => apiGet('/exams?status=ONGOING'),
    refetchInterval: 30_000,
    retry: false
  });

  // Tick clock
  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fix: API returns { success, data: { halls, pagination } } and { success, data: { exams, ... } }
  const halls = hallsData?.data?.halls || [];
  const exams = examsData?.data?.exams || examsData?.data || [];

  const { isConnected } = useSocket({
    onAttendanceUpdate: (data) => {
      setScanFeed(prev => [{
        id: Date.now(),
        studentName: data.studentName || 'Student',
        seatNumber: data.seatNumber,
        hallId: data.hallId,
        time: new Date(data.markedAt).toLocaleTimeString(),
        status: data.status,
      }, ...prev].slice(0, 25));
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-7">
      {/* Debug Banner */}
      <div style={{
        backgroundColor: '#10B981',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '20px',
        borderRadius: '10px'
      }}>
        ✅ LIVE MONITOR IS WORKING - Real-time hall monitoring system
        <br />
        <small>Socket: {isConnected ? 'Connected' : 'Disconnected'} | Halls: {halls.length} | Exams: {exams.length}</small>
      </div>

      <SectionHeader
        eyebrow="Real-Time"
        title="Live Hall Monitor"
        subtitle={`Last updated: ${liveTime.toLocaleTimeString()}`}
        action={
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-black font-mono border ${isConnected ? 'bg-emerald-exam-light text-emerald-exam border-emerald-exam-border' : 'bg-ruby-exam-light text-ruby-exam border-ruby-exam-border'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-ruby-exam'}`} />
              {isConnected ? 'SOCKET LIVE' : 'RECONNECTING'}
            </div>
          </div>
        }
      />

      {/* Live KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-emerald-exam">{exams.length}</div>
          <div className="text-sm text-navy/60 mt-2">Ongoing Exams</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-gold">{halls.filter(h => h._count?.allocations > 0).length}</div>
          <div className="text-sm text-navy/60 mt-2">Active Halls</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-navy">{scanFeed.length}</div>
          <div className="text-sm text-navy/60 mt-2">Live Scans</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-ruby-exam">{halls.reduce((a, h) => a + (h.duties?.length || 0), 0)}</div>
          <div className="text-sm text-navy/60 mt-2">On Duty</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Hall Cards */}
        <div className="col-span-2 space-y-3">
          <h3 className="font-display text-lg font-bold">Active Halls</h3>
          {halls.length === 0 ? (
            <div className="card card-md flex items-center justify-center h-32 text-navy/30">
              No halls configured
            </div>
          ) : halls.map((hall, i) => {
            const isActive = hall.duties?.some(d => d.exam?.status === 'ONGOING');
            return (
              <div key={hall.id} className="card card-md p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center font-mono text-[11px] font-bold text-navy/50">
                      {hall.code?.slice(-2) || 'H' + (i + 1)}
                    </div>
                    <div>
                      <div className="font-bold text-[15px]">{hall.name}</div>
                      <div className="text-[11px] text-navy/40">
                        {hall.building} · Floor {hall.floor} · Cap: {hall.capacity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-exam-light text-emerald-exam' : 'bg-navy/10 text-navy/50'}`}>
                      {isActive ? '● Active' : 'Idle'}
                    </span>
                  </div>
                </div>

                {/* Attendance Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-navy/50">Allocated</span>
                    <span className="font-bold">{hall._count?.allocations || 0}/{hall.capacity}</span>
                  </div>
                  <div className="w-full bg-cream rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${hall.capacity > 0 ? Math.min(100, (hall._count?.allocations || 0) / hall.capacity * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Invigilators */}
                {hall.duties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-navy/5">
                    {hall.duties.map(d => (
                      <div key={d.invigilator?.id} className="flex items-center gap-1.5 bg-cream rounded-lg px-2.5 py-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-semibold">{d.invigilator?.name || 'Invigilator'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Scan Feed */}
        <div className="card card-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Live Scan Feed</h3>
            <span className="text-[10px] text-navy/30 font-mono">REAL-TIME</span>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {scanFeed.length === 0 ? (
              <div className="text-center py-12 text-navy/30 text-sm">
                <div className="text-4xl mb-3 opacity-30">◎</div>
                Waiting for QR scans...
              </div>
            ) : scanFeed.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 p-2.5 bg-emerald-exam-light border border-emerald-exam-border rounded-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-exam flex items-center justify-center text-white text-[11px] shrink-0">✓</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate">{s.studentName}</div>
                  <div className="text-[10px] text-emerald-exam/70 font-mono">Seat {s.seatNumber} · {s.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-navy/5 text-center text-[11px] text-navy/30 font-mono">
            {scanFeed.length} scans this session
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="card card-md p-4">
        <h4 className="font-bold mb-2">Live Monitor Debug:</h4>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({
            socketConnected: isConnected,
            hallsCount: halls.length,
            ongoingExams: exams.length,
            scanFeedCount: scanFeed.length,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}