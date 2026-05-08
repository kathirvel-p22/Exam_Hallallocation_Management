// src/pages/admin/HallManagement.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../../services/api';
import { PageLoader, SectionHeader } from '../../components/ui';

export default function HallManagement() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    building: '',
    floor: 1,
    capacity: 60,
    rows: 6,
    columns: 10,
    facilities: []
  });

  const { data, isLoading } = useQuery({
    queryKey: ['halls'],
    queryFn: () => apiGet('/halls'),
    retry: false
  });

  const createMutation = useMutation({
    mutationFn: (d) => apiPost('/halls', d),
    onSuccess: () => {
      toast.success('Hall created with seats');
      qc.invalidateQueries(['halls']);
      setShowCreate(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <PageLoader />;

  // Fix: API returns { success, data: { halls, pagination } }
  const halls = data?.data?.halls || [];

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
      ✅ HALL MANAGEMENT IS WORKING - {halls.length} halls loaded
    </div>
  );

  const FACILITIES = ['AC', 'CCTV', 'Projector', 'Fan', 'Water', 'Computers', 'Stage'];
  const toggleFacility = (f) => setForm(p => ({
    ...p,
    facilities: p.facilities.includes(f) ? p.facilities.filter(x => x !== f) : [...p.facilities, f]
  }));

  return (
    <div className="space-y-6">
      {debugBanner}

      <SectionHeader
        eyebrow="Infrastructure"
        title="Hall Management"
        subtitle={`${halls.length} examination halls configured`}
        action={<button onClick={() => setShowCreate(true)} className="btn btn-gold">+ Add Hall</button>}
      />

      {/* Halls Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
        {halls.length === 0 ? (
          <div className="col-span-full card card-md p-8 text-center">
            <div className="text-4xl mb-4 opacity-30">🏛️</div>
            <h3 className="font-bold text-lg mb-2">No Halls Configured</h3>
            <p className="text-navy/60 mb-4">Create your first examination hall to get started</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-gold">+ Add First Hall</button>
          </div>
        ) : halls.map(h => {
          const total = h.capacity || 0;
          const used = h._count?.allocations || 0;
          const pct = total > 0 ? Math.round(used / total * 100) : 0;
          const facilities = h.facilities ? (typeof h.facilities === 'string' ? JSON.parse(h.facilities) : h.facilities) : [];

          return (
            <div key={h.id} className="card card-md hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center font-mono text-sm font-bold text-navy/50">
                  {h.code?.slice(-2) || 'H'}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${used > 0 ? 'bg-emerald-exam-light text-emerald-exam' : 'bg-navy/10 text-navy/50'}`}>
                  {used > 0 ? 'In Use' : 'Available'}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold">{h.name}</h3>
              <p className="text-[12px] text-navy/40 mt-1 mb-4">
                {h.building} · Floor {h.floor} · {h.rows}×{h.columns} grid
              </p>

              <div className="mb-2">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-navy/50">Utilization</span>
                  <span className="font-mono font-bold">{used}/{total} ({pct}%)</span>
                </div>
                <div className="w-full bg-cream rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {facilities.map(f => (
                  <span key={f} className="px-2 py-1 bg-navy/10 text-navy/70 rounded text-xs font-semibold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Hall Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card card-lg w-full max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">Add New Hall</h3>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-xl bg-cream flex items-center justify-center text-navy/50 hover:bg-gold/10 hover:text-gold transition-all">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Hall Name</label>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Hall A"
                />
              </div>
              <div>
                <label className="field-label">Code</label>
                <input
                  className="field-input"
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="HALL-A"
                />
              </div>
              <div>
                <label className="field-label">Building</label>
                <input
                  className="field-input"
                  value={form.building}
                  onChange={e => setForm(p => ({ ...p, building: e.target.value }))}
                  placeholder="Block 1"
                />
              </div>
              <div>
                <label className="field-label">Floor</label>
                <input
                  type="number"
                  className="field-input"
                  value={form.floor}
                  onChange={e => setForm(p => ({ ...p, floor: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="field-label">Rows</label>
                <input
                  type="number"
                  className="field-input"
                  value={form.rows}
                  onChange={e => setForm(p => ({ ...p, rows: Number(e.target.value), capacity: Number(e.target.value) * form.columns }))}
                />
              </div>
              <div>
                <label className="field-label">Columns</label>
                <input
                  type="number"
                  className="field-input"
                  value={form.columns}
                  onChange={e => setForm(p => ({ ...p, columns: Number(e.target.value), capacity: form.rows * Number(e.target.value) }))}
                />
              </div>

              <div className="col-span-2">
                <label className="field-label">Facilities</label>
                <div className="flex flex-wrap gap-2">
                  {FACILITIES.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all ${form.facilities.includes(f)
                          ? 'bg-gold/10 text-[#A8880A] border-gold/50'
                          : 'bg-cream text-navy/50 border-navy/10'
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 bg-cream rounded-xl p-3 text-[12px] text-navy/50">
                This will auto-generate <strong>{form.rows * form.columns} seats</strong> (A-01 through {String.fromCharCode(64 + form.rows)}-{String(form.columns).padStart(2, '0')})
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                className="btn btn-gold flex-1 justify-center"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Hall'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="card card-md p-4">
        <h4 className="font-bold mb-2">Hall Management Debug:</h4>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({
            hallsCount: halls.length,
            apiData: data ? 'Available' : 'Not Available',
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}