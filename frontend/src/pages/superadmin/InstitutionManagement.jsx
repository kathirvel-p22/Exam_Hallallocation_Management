// src/pages/superadmin/InstitutionManagement.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';
import { PageLoader, SectionHeader, Badge, Modal } from '../../components/ui';

export default function InstitutionManagement() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    code: '', 
    address: '', 
    phone: '', 
    email: '', 
    website: '' 
  });
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['institutions'], 
    queryFn: () => apiGet('/institutions') 
  });
  
  const createMutation = useMutation({ 
    mutationFn: d => apiPost('/institutions', d), 
    onSuccess: () => { 
      toast.success('Institution created successfully'); 
      qc.invalidateQueries(['institutions']); 
      setShow(false); 
      setForm({ name: '', code: '', address: '', phone: '', email: '', website: '' });
    },
    onError: (error) => {
      console.error('Institution creation error:', error);
      const message = error.response?.data?.error?.message || 'Failed to create institution';
      toast.error(message);
    }
  });
  
  const toggleMutation = useMutation({ 
    mutationFn: id => apiPatch(`/institutions/${id}/toggle`), 
    onSuccess: () => {
      toast.success('Institution status updated');
      qc.invalidateQueries(['institutions']);
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to update status';
      toast.error(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: id => apiDelete(`/institutions/${id}`),
    onSuccess: () => {
      toast.success('Institution deleted successfully');
      qc.invalidateQueries(['institutions']);
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to delete institution';
      toast.error(message);
    }
  });
  
  const institutions = data?.data || [];
  
  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    createMutation.mutate(form);
  };
  
  if (isLoading) return <PageLoader />;
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Governance" 
        title="Institution Management" 
        subtitle={`${institutions.length} registered institutions`}
        action={<button onClick={() => setShow(true)} className="btn btn-gold">+ Add Institution</button>} 
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead>
              <tr>
                <th className="min-w-[200px]">Institution</th>
                <th className="min-w-[80px]">Code</th>
                <th className="min-w-[150px]">Contact</th>
                <th className="min-w-[60px]">Users</th>
                <th className="min-w-[60px]">Exams</th>
                <th className="min-w-[80px]">Status</th>
                <th className="min-w-[140px]">Actions</th>
              </tr>
            </thead>
          <tbody>
            {institutions.map(inst => (
              <tr key={inst.id}>
                <td className="font-bold">{inst.name}</td>
                <td className="font-mono"><Badge variant="navy">{inst.code}</Badge></td>
                <td className="text-[12px] text-navy/50">
                  {inst.email && <div>{inst.email}</div>}
                  {inst.phone && <div>{inst.phone}</div>}
                </td>
                <td className="font-mono">{inst._count?.users || 0}</td>
                <td className="font-mono">{inst._count?.exams || 0}</td>
                <td><Badge variant={inst.isActive ? 'green' : 'red'}>{inst.isActive ? 'Active' : 'Inactive'}</Badge></td>
                <td>
                  <div className="flex gap-1 min-w-[140px]">
                    <button 
                      onClick={() => toggleMutation.mutate(inst.id)} 
                      className="btn btn-ghost btn-xs text-xs px-2"
                      disabled={toggleMutation.isLoading}
                    >
                      {inst.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${inst.name}? This action cannot be undone.`)) {
                          deleteMutation.mutate(inst.id);
                        }
                      }}
                      className="btn btn-ghost btn-xs text-xs px-2 text-red-600 hover:bg-red-50"
                      disabled={deleteMutation.isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
      
      <Modal open={show} onClose={() => setShow(false)} title="Add Institution">
        <div className="space-y-4">
          <div>
            <label className="field-label">Institution Name *</label>
            <input 
              className="field-input" 
              value={form.name} 
              onChange={e => setForm(p => ({...p, name: e.target.value}))}
              placeholder="Enter institution name"
            />
          </div>
          
          <div>
            <label className="field-label">Institution Code *</label>
            <input 
              className="field-input" 
              value={form.code} 
              onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))}
              placeholder="e.g., MIT, ANNA"
              maxLength={10}
            />
          </div>
          
          <div>
            <label className="field-label">Address</label>
            <input 
              className="field-input" 
              value={form.address} 
              onChange={e => setForm(p => ({...p, address: e.target.value}))}
              placeholder="Enter full address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Phone</label>
              <input 
                className="field-input" 
                value={form.phone} 
                onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="Contact number"
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input 
                className="field-input" 
                type="email"
                value={form.email} 
                onChange={e => setForm(p => ({...p, email: e.target.value}))}
                placeholder="contact@institution.edu"
              />
            </div>
          </div>
          
          <div>
            <label className="field-label">Website</label>
            <input 
              className="field-input" 
              value={form.website} 
              onChange={e => setForm(p => ({...p, website: e.target.value}))}
              placeholder="https://www.institution.edu"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setShow(false)} 
            className="btn btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
            className="btn btn-gold flex-1 justify-center"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Institution'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
