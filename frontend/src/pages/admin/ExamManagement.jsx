// src/pages/admin/ExamManagement.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';
import { PageLoader, SectionHeader, StatusBadge, Badge, Modal, EmptyState } from '../../components/ui';

export default function ExamManagement() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ 
    subjectName: '', 
    subjectCode: '', 
    date: '', 
    shift: 'MORNING', 
    startTime: '09:00', 
    endTime: '12:00', 
    durationMins: 180, 
    semester: 3, 
    academicYear: '2024-25',
    level: 'UG',
    departmentIds: [],
    notes: ''
  });

  const { data, isLoading } = useQuery({ 
    queryKey: ['exams-all'], 
    queryFn: () => apiGet('/exams?limit=100') 
  });

  // Fetch departments for selection
  const { data: departmentsData } = useQuery({ 
    queryKey: ['departments'], 
    queryFn: () => apiGet('/users/departments') 
  });

  const createMutation = useMutation({
    mutationFn: (d) => apiPost('/exams', d),
    onSuccess: () => { 
      toast.success('Exam created successfully'); 
      qc.invalidateQueries(['exams-all']); 
      setShowCreate(false);
      resetForm();
    },
    onError: (e) => {
      console.error('Exam creation error:', e);
      toast.error(e.response?.data?.error?.message || 'Failed to create exam');
    },
  });

  const patchStatusMutation = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/exams/${id}/status`, { status }),
    onSuccess: () => { 
      toast.success('Status updated'); 
      qc.invalidateQueries(['exams-all']); 
    },
  });

  const exams = data?.data?.exams || data?.data || [];
  const departments = departmentsData?.data || [];

  const resetForm = () => {
    setForm({ 
      subjectName: '', 
      subjectCode: '', 
      date: '', 
      shift: 'MORNING', 
      startTime: '09:00', 
      endTime: '12:00', 
      durationMins: 180, 
      semester: 3, 
      academicYear: '2024-25',
      level: 'UG',
      departmentIds: [],
      notes: ''
    });
  };

  const handleCreateExam = () => {
    if (!form.subjectName || !form.subjectCode || !form.date || form.departmentIds.length === 0) {
      toast.error('Please fill in all required fields and select at least one department');
      return;
    }

    // Format the date properly
    const examDate = new Date(form.date).toISOString().split('T')[0];
    
    createMutation.mutate({
      ...form,
      date: examDate,
      durationMins: Number(form.durationMins),
      semester: Number(form.semester)
    });
  };

  const toggleDepartment = (deptId) => {
    setForm(prev => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter(id => id !== deptId)
        : [...prev.departmentIds, deptId]
    }));
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Administration" 
        title="Exam Management" 
        subtitle={`${exams.length} exams this year`}
        action={<button onClick={() => setShowCreate(true)} className="btn btn-gold">+ Create Exam</button>} 
      />

      <div className="card overflow-hidden">
        {exams.length === 0 ? (
          <EmptyState 
            icon="◎" 
            title="No exams yet" 
            description="Create your first exam to get started" 
            action={<button onClick={() => setShowCreate(true)} className="btn btn-gold">+ Create Exam</button>} 
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Departments</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="font-bold">{e.subjectName}</div>
                    <div className="text-[11px] text-navy/40 font-mono">
                      {e.subjectCode} · Sem {e.semester} · {e.level}
                    </div>
                  </td>
                  <td>
                    <div className="font-mono text-[12px]">
                      {format(new Date(e.date), 'dd MMM yyyy')}
                    </div>
                    <div className="text-[11px] text-navy/40">
                      {e.startTime}–{e.endTime} · {e.shift}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {e.departments?.map(d => (
                        <Badge key={d.id} variant="navy">
                          {d.department?.code}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="font-mono">{e._count?.allocations || 0}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      {e.status === 'DRAFT' && (
                        <button 
                          onClick={() => patchStatusMutation.mutate({ id: e.id, status: 'PUBLISHED' })} 
                          className="btn btn-success btn-xs"
                        >
                          Publish
                        </button>
                      )}
                      {e.status === 'PUBLISHED' && (
                        <button 
                          onClick={() => patchStatusMutation.mutate({ id: e.id, status: 'ONGOING' })} 
                          className="btn btn-xs bg-gold/10 text-[#A8880A] border border-gold/30"
                        >
                          Start
                        </button>
                      )}
                      {e.status === 'ONGOING' && (
                        <button 
                          onClick={() => patchStatusMutation.mutate({ id: e.id, status: 'COMPLETED' })} 
                          className="btn btn-xs bg-sky-50 text-sky-700 border border-sky-200"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Exam" maxWidth="max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Subject Name *</label>
              <input 
                className="field-input" 
                value={form.subjectName} 
                onChange={e => setForm(p => ({ ...p, subjectName: e.target.value }))} 
                placeholder="Data Structures & Algorithms" 
              />
            </div>
            <div>
              <label className="field-label">Subject Code *</label>
              <input 
                className="field-input" 
                value={form.subjectCode} 
                onChange={e => setForm(p => ({ ...p, subjectCode: e.target.value }))} 
                placeholder="CS2301" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="field-label">Date *</label>
              <input 
                type="date" 
                className="field-input" 
                value={form.date} 
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} 
              />
            </div>
            <div>
              <label className="field-label">Shift *</label>
              <select 
                className="field-input" 
                value={form.shift} 
                onChange={e => setForm(p => ({ ...p, shift: e.target.value }))}
              >
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div>
              <label className="field-label">Level</label>
              <select 
                className="field-input" 
                value={form.level} 
                onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
              >
                <option value="UG">Undergraduate</option>
                <option value="PG">Postgraduate</option>
                <option value="PHD">PhD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="field-label">Start Time *</label>
              <input 
                type="time" 
                className="field-input" 
                value={form.startTime} 
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} 
              />
            </div>
            <div>
              <label className="field-label">End Time *</label>
              <input 
                type="time" 
                className="field-input" 
                value={form.endTime} 
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} 
              />
            </div>
            <div>
              <label className="field-label">Duration (mins)</label>
              <input 
                type="number" 
                className="field-input" 
                value={form.durationMins} 
                onChange={e => setForm(p => ({ ...p, durationMins: e.target.value }))} 
                min={30} 
                max={480} 
              />
            </div>
            <div>
              <label className="field-label">Semester *</label>
              <select 
                className="field-input" 
                value={form.semester} 
                onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Academic Year</label>
            <input 
              className="field-input" 
              value={form.academicYear} 
              onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} 
              placeholder="2024-25" 
            />
          </div>

          <div>
            <label className="field-label">Departments * (Select at least one)</label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3">
              {departments.map(dept => (
                <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.departmentIds.includes(dept.id)}
                    onChange={() => toggleDepartment(dept.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{dept.name} ({dept.code})</span>
                </label>
              ))}
            </div>
            {form.departmentIds.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                Selected: {form.departmentIds.length} department(s)
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Notes</label>
            <textarea 
              className="field-input" 
              rows={3}
              value={form.notes} 
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} 
              placeholder="Additional instructions or notes for the exam..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setShowCreate(false)} 
            className="btn btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateExam}
            disabled={createMutation.isLoading}
            className="btn btn-gold flex-1 justify-center"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
