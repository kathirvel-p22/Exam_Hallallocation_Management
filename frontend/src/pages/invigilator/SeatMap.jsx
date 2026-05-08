// src/pages/invigilator/SeatMap.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader } from '../../components/ui';

export default function SeatMap() {
  const [selected, setSelected] = useState(null);
  const { data: dutyData, isLoading } = useQuery({ queryKey: ['invig-me'], queryFn: () => apiGet('/invigilators/me') });
  const activeDuty = dutyData?.data?.duties?.find(d => d.exam.status === 'ONGOING' || d.exam.status === 'PUBLISHED');

  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', activeDuty?.hall?.id, activeDuty?.exam?.id],
    queryFn: () => apiGet(`/halls/${activeDuty.hall.id}/seats?examId=${activeDuty.exam.id}`),
    enabled: !!activeDuty?.hall?.id,
  });

  const seats = seatsData?.data || [];
  const rows  = [...new Set(seats.map(s => s.row))].sort((a,b)=>a-b);

  if (isLoading || seatsLoading) return <PageLoader />;

  const getStatus = (seat) => {
    const alloc = seat.allocations?.[0];
    if (!alloc) return 'empty';
    return alloc.attendance?.status === 'PRESENT' ? 'present' : 'absent';
  };

  const present = seats.filter(s => s.allocations?.[0]?.attendance?.status === 'PRESENT').length;
  const absent  = seats.filter(s => s.allocations?.[0] && s.allocations?.[0]?.attendance?.status !== 'PRESENT').length;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Hall View" title="Live Seat Map" subtitle={activeDuty ? `${activeDuty.hall?.name} — ${activeDuty.exam?.subjectName}` : 'No active duty'} />

      <div className="grid grid-cols-4 gap-3">
        {[['Total Seats', seats.length, 'navy'],['Present', present, 'green'],['Absent', absent, 'red'],['Empty', seats.filter(s=>!s.allocations?.[0]).length, 'navy']].map(([l,v,c]) => (
          <div key={l} className="card card-md text-center"><div className={`font-display text-3xl font-bold ${c==='green'?'text-emerald-exam':c==='red'?'text-ruby-exam':'text-navy'}`}>{v}</div><div className="text-[11px] text-navy/40 mt-1">{l}</div></div>
        ))}
      </div>

      <div className="card card-md">
        <div className="flex gap-4 flex-wrap mb-5">
          {[['Present', 'seat-present'], ['Absent / Unscanned', 'seat-absent'], ['Empty Seat', 'seat-empty']].map(([l, cls]) => (
            <div key={l} className="flex items-center gap-2 text-[12px]"><div className={`seat w-6 h-6 ${cls}`} />{l}</div>
          ))}
        </div>
        <div className="text-center mb-3 text-[11px] text-navy/40 font-mono">← BLACKBOARD →</div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {rows.map(row => {
              const rowSeats = seats.filter(s => s.row === row);
              return (
                <div key={row} className="flex gap-1.5 mb-1.5 items-center">
                  <span className="text-[10px] text-navy/30 font-mono w-5 shrink-0">{String.fromCharCode(64+row)}</span>
                  {rowSeats.map(s => {
                    const st = getStatus(s);
                    const alloc = s.allocations?.[0];
                    return (
                      <button key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)}
                        title={alloc ? `${alloc.student?.name} (${alloc.student?.registerNo})` : 'Empty'}
                        className={`seat w-8 h-8 seat-${st} ${selected?.id === s.id ? 'ring-2 ring-gold ring-offset-1' : ''}`}>
                        {s.column}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {selected && (
          <div className="mt-5 pt-4 border-t border-navy/5 p-3.5 bg-cream rounded-xl">
            <p className="text-[10px] text-navy/40 font-mono mb-2">SELECTED SEAT: {selected.seatNumber}</p>
            {selected.allocations?.[0] ? (
              <div className="text-[13px]"><strong>{selected.allocations[0].student?.name}</strong> · {selected.allocations[0].student?.registerNo} · {selected.allocations[0].student?.department?.code}</div>
            ) : <div className="text-navy/40 text-[13px]">Empty seat</div>}
          </div>
        )}
      </div>
    </div>
  );
}
