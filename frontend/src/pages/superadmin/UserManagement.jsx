// src/pages/superadmin/UserManagement.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';
import { PageLoader, SectionHeader, Badge, Modal } from '../../components/ui';

export default function UserManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [institutionFilter, setInstitutionFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createForm, setCreateForm] = useState({
    email: '', password: '', role: 'STUDENT', name: '', phone: '',
    registerNo: '', staffId: '', departmentId: '', semester: '', institutionId: ''
  });

  // Fetch users with filters
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter, institutionFilter],
    queryFn: () => apiGet(`/users?search=${search}&role=${roleFilter !== 'ALL' ? roleFilter : ''}&institutionId=${institutionFilter !== 'ALL' ? institutionFilter : ''}&limit=100`)
  });

  // Fetch institutions for filter
  const { data: institutionsData } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => apiGet('/institutions')
  });

  // Fetch departments for user creation
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', createForm.institutionId],
    queryFn: () => apiGet(`/users/departments?institutionId=${createForm.institutionId}`),
    enabled: !!createForm.institutionId
  });

  const users = usersData?.data || [];
  const institutions = institutionsData?.data || [];
  const departments = departmentsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => apiPost('/users', data),
    onSuccess: () => {
      toast.success('User created successfully');
      qc.invalidateQueries(['users']);
      setShowCreateModal(false);
      resetCreateForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiPut(`/users/${id}`, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      qc.invalidateQueries(['users']);
      setShowEditModal(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User deleted successfully');
      qc.invalidateQueries(['users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete user');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => apiPost(`/users/${id}/reset-password`, { newPassword }),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to reset password');
    }
  });

  const resetCreateForm = () => {
    setCreateForm({
      email: '', password: '', role: 'STUDENT', name: '', phone: '',
      registerNo: '', staffId: '', departmentId: '', semester: '', institutionId: ''
    });
  };

  const handleCreateUser = () => {
    if (!createForm.email || !createForm.password || !createForm.name || !createForm.institutionId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (createForm.role === 'STUDENT' && (!createForm.registerNo || !createForm.departmentId || !createForm.semester)) {
      toast.error('Register number, department, and semester are required for students');
      return;
    }

    if (createForm.role === 'INVIGILATOR' && (!createForm.staffId || !createForm.departmentId)) {
      toast.error('Staff ID and department are required for invigilators');
      return;
    }

    createMutation.mutate(createForm);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    if (confirm(`Are you sure you want to delete ${user.student?.name || user.invigilator?.name || user.email}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleResetPassword = (user) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):');
    if (newPassword && newPassword.length >= 6) {
      resetPasswordMutation.mutate({ id: user.id, newPassword });
    } else if (newPassword) {
      toast.error('Password must be at least 6 characters');
    }
  };

  const getUserDisplayName = (user) => {
    return user.student?.name || user.invigilator?.name || user.email;
  };

  const getUserIdentifier = (user) => {
    return user.student?.registerNo || user.invigilator?.staffId || 'N/A';
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Access Control" 
        title="User Management" 
        subtitle={`${users.length} platform users across institutions`}
        action={
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-gold"
          >
            + Add User
          </button>
        } 
      />

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="field-label">Search Users</label>
            <input 
              className="field-input" 
              placeholder="Search by name, email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div>
            <label className="field-label">Role</label>
            <select 
              className="field-input" 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="INVIGILATOR">Invigilators</option>
              <option value="EXAM_ADMIN">Exam Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
          </div>
          <div>
            <label className="field-label">Institution</label>
            <select 
              className="field-input" 
              value={institutionFilter} 
              onChange={e => setInstitutionFilter(e.target.value)}
            >
              <option value="ALL">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
                setInstitutionFilter('ALL');
              }}
              className="btn btn-ghost"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Register No / Staff ID</th>
              <th>Role</th>
              <th>Department</th>
              <th>Institution</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-exam/10 flex items-center justify-center text-emerald-exam text-[11px] font-black">
                      {getUserDisplayName(user).split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-[13px]">{getUserDisplayName(user)}</div>
                      <div className="text-[11px] text-navy/40">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-[12px]">{getUserIdentifier(user)}</td>
                <td>
                  <Badge variant={
                    user.role === 'SUPER_ADMIN' ? 'red' :
                    user.role === 'EXAM_ADMIN' ? 'orange' :
                    user.role === 'INVIGILATOR' ? 'blue' : 'green'
                  }>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  {user.student?.department?.name || user.invigilator?.department?.name ? (
                    <Badge variant="navy">
                      {user.student?.department?.code || user.invigilator?.department?.code}
                    </Badge>
                  ) : (
                    <span className="text-navy/40 text-[12px]">N/A</span>
                  )}
                </td>
                <td className="text-[12px]">{user.institution?.name || 'N/A'}</td>
                <td className="text-[12px] text-navy/40">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="btn btn-ghost btn-xs"
                      title="Edit User"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleResetPassword(user)}
                      className="btn btn-ghost btn-xs"
                      title="Reset Password"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="btn btn-ghost btn-xs text-red-600"
                      title="Delete User"
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

      {/* Create User Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Email *</label>
              <input 
                className="field-input" 
                type="email"
                value={createForm.email} 
                onChange={e => setCreateForm(p => ({...p, email: e.target.value}))}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="field-label">Password *</label>
              <input 
                className="field-input" 
                type="password"
                value={createForm.password} 
                onChange={e => setCreateForm(p => ({...p, password: e.target.value}))}
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Full Name *</label>
              <input 
                className="field-input" 
                value={createForm.name} 
                onChange={e => setCreateForm(p => ({...p, name: e.target.value}))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input 
                className="field-input" 
                value={createForm.phone} 
                onChange={e => setCreateForm(p => ({...p, phone: e.target.value}))}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Role *</label>
              <select 
                className="field-input" 
                value={createForm.role} 
                onChange={e => setCreateForm(p => ({...p, role: e.target.value}))}
              >
                <option value="STUDENT">Student</option>
                <option value="INVIGILATOR">Invigilator</option>
                <option value="EXAM_ADMIN">Exam Admin</option>
              </select>
            </div>
            <div>
              <label className="field-label">Institution *</label>
              <select 
                className="field-input" 
                value={createForm.institutionId} 
                onChange={e => setCreateForm(p => ({...p, institutionId: e.target.value}))}
              >
                <option value="">Select Institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role-specific fields */}
          {createForm.role === 'STUDENT' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label">Register Number *</label>
                <input 
                  className="field-input" 
                  value={createForm.registerNo} 
                  onChange={e => setCreateForm(p => ({...p, registerNo: e.target.value}))}
                  placeholder="e.g., 2024001"
                />
              </div>
              <div>
                <label className="field-label">Semester *</label>
                <select 
                  className="field-input" 
                  value={createForm.semester} 
                  onChange={e => setCreateForm(p => ({...p, semester: e.target.value}))}
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Department *</label>
                <select 
                  className="field-input" 
                  value={createForm.departmentId} 
                  onChange={e => setCreateForm(p => ({...p, departmentId: e.target.value}))}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {createForm.role === 'INVIGILATOR' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Staff ID *</label>
                <input 
                  className="field-input" 
                  value={createForm.staffId} 
                  onChange={e => setCreateForm(p => ({...p, staffId: e.target.value}))}
                  placeholder="e.g., STAFF001"
                />
              </div>
              <div>
                <label className="field-label">Department *</label>
                <select 
                  className="field-input" 
                  value={createForm.departmentId} 
                  onChange={e => setCreateForm(p => ({...p, departmentId: e.target.value}))}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setShowCreateModal(false)} 
            className="btn btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateUser}
            disabled={createMutation.isLoading}
            className="btn btn-gold flex-1 justify-center"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
          <div className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input 
                className="field-input" 
                type="email"
                defaultValue={selectedUser.email}
                onChange={e => setSelectedUser(p => ({...p, email: e.target.value}))}
              />
            </div>
            <div>
              <label className="field-label">Name</label>
              <input 
                className="field-input" 
                defaultValue={getUserDisplayName(selectedUser)}
                onChange={e => {
                  if (selectedUser.student) {
                    setSelectedUser(p => ({...p, student: {...p.student, name: e.target.value}}));
                  } else if (selectedUser.invigilator) {
                    setSelectedUser(p => ({...p, invigilator: {...p.invigilator, name: e.target.value}}));
                  }
                }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setShowEditModal(false)} 
              className="btn btn-ghost flex-1 justify-center"
            >
              Cancel
            </button>
            <button 
              onClick={() => updateMutation.mutate({ 
                id: selectedUser.id, 
                data: { 
                  email: selectedUser.email,
                  name: getUserDisplayName(selectedUser)
                } 
              })}
              disabled={updateMutation.isLoading}
              className="btn btn-gold flex-1 justify-center"
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
