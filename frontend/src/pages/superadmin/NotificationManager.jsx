// src/pages/superadmin/NotificationManager.jsx - Super Admin Notification Management
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../../services/api';
import { PageLoader, SectionHeader, Badge, Modal } from '../../components/ui';

export default function NotificationManager() {
  const qc = useQueryClient();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    channel: 'ALL',
    targetRole: 'ALL',
    targetUsers: [],
    institutionId: '',
    urgent: false
  });
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    urgent: false
  });

  // Fetch notification statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => apiGet('/notifications/stats?days=7')
  });

  // Fetch institutions for targeting
  const { data: institutionsData } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => apiGet('/institutions')
  });

  // Fetch users for specific targeting
  const { data: usersData } = useQuery({
    queryKey: ['users-for-notifications'],
    queryFn: () => apiGet('/users?limit=200'),
    enabled: sendForm.targetRole !== 'ALL'
  });

  const institutions = institutionsData?.data || [];
  const users = usersData?.data || [];
  const stats = statsData?.data || {};

  // Send notification mutation
  const sendMutation = useMutation({
    mutationFn: (data) => apiPost('/notifications/send', data),
    onSuccess: (response) => {
      toast.success(`Notification sent to ${response.data.recipientCount} users`);
      qc.invalidateQueries(['notification-stats']);
      setShowSendModal(false);
      resetSendForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to send notification');
    }
  });

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (data) => apiPost('/notifications/broadcast', data),
    onSuccess: (response) => {
      toast.success(`Broadcast sent to ${response.data.recipientCount} users`);
      qc.invalidateQueries(['notification-stats']);
      setShowBroadcastModal(false);
      resetBroadcastForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to send broadcast');
    }
  });

  const resetSendForm = () => {
    setSendForm({
      title: '',
      message: '',
      type: 'GENERAL',
      channel: 'ALL',
      targetRole: 'ALL',
      targetUsers: [],
      institutionId: '',
      urgent: false
    });
  };

  const resetBroadcastForm = () => {
    setBroadcastForm({
      title: '',
      message: '',
      type: 'SYSTEM',
      urgent: false
    });
  };

  const handleSendNotification = () => {
    if (!sendForm.title || !sendForm.message) {
      toast.error('Title and message are required');
      return;
    }

    const payload = {
      ...sendForm,
      ...(sendForm.targetUsers.length > 0 && { targetUsers: sendForm.targetUsers })
    };

    sendMutation.mutate(payload);
  };

  const handleBroadcast = () => {
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Title and message are required');
      return;
    }

    broadcastMutation.mutate(broadcastForm);
  };

  const toggleUserSelection = (userId) => {
    setSendForm(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  if (statsLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Communication" 
        title="Notification Manager" 
        subtitle="Send notifications and broadcasts across the platform"
        action={
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSendModal(true)} 
              className="btn btn-blue"
            >
              📤 Send Notification
            </button>
            <button 
              onClick={() => setShowBroadcastModal(true)} 
              className="btn btn-gold"
            >
              📢 System Broadcast
            </button>
          </div>
        } 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalSent || 0}</div>
          <div className="text-sm text-gray-600">Total Sent (7 days)</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalRead || 0}</div>
          <div className="text-sm text-gray-600">Total Read</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.readRate || 0}%</div>
          <div className="text-sm text-gray-600">Read Rate</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.byType?.length || 0}</div>
          <div className="text-sm text-gray-600">Notification Types</div>
        </div>
      </div>

      {/* Notification Types Breakdown */}
      {stats.byType && stats.byType.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Notifications by Type (Last 7 days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.byType.map(item => (
              <div key={item.type} className="text-center">
                <div className="text-xl font-bold text-gray-800">{item.count}</div>
                <Badge variant="navy">{item.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setSendForm(prev => ({
                ...prev,
                title: 'Exam Schedule Update',
                message: 'Please check your exam schedule for any updates.',
                type: 'EXAM',
                targetRole: 'STUDENT'
              }));
              setShowSendModal(true);
            }}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 text-left"
          >
            <div className="text-lg mb-2">📝</div>
            <div className="font-medium">Exam Notification</div>
            <div className="text-sm text-gray-600">Send to all students</div>
          </button>
          
          <button 
            onClick={() => {
              setSendForm(prev => ({
                ...prev,
                title: 'Duty Assignment',
                message: 'You have been assigned invigilation duty. Please check your schedule.',
                type: 'GENERAL',
                targetRole: 'INVIGILATOR'
              }));
              setShowSendModal(true);
            }}
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 text-left"
          >
            <div className="text-lg mb-2">👥</div>
            <div className="font-medium">Duty Assignment</div>
            <div className="text-sm text-gray-600">Send to invigilators</div>
          </button>
          
          <button 
            onClick={() => {
              setBroadcastForm(prev => ({
                ...prev,
                title: 'System Maintenance',
                message: 'The system will be under maintenance from 2:00 AM to 4:00 AM.',
                type: 'SYSTEM',
                urgent: true
              }));
              setShowBroadcastModal(true);
            }}
            className="p-4 border border-red-200 rounded-lg hover:bg-red-50 text-left"
          >
            <div className="text-lg mb-2">🚨</div>
            <div className="font-medium">System Alert</div>
            <div className="text-sm text-gray-600">Urgent broadcast</div>
          </button>
        </div>
      </div>

      {/* Send Notification Modal */}
      <Modal open={showSendModal} onClose={() => setShowSendModal(false)} title="Send Notification" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Title *</label>
              <input 
                className="field-input" 
                value={sendForm.title} 
                onChange={e => setSendForm(p => ({...p, title: e.target.value}))}
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select 
                className="field-input" 
                value={sendForm.type} 
                onChange={e => setSendForm(p => ({...p, type: e.target.value}))}
              >
                <option value="GENERAL">General</option>
                <option value="EXAM">Exam</option>
                <option value="ALLOCATION">Allocation</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Message *</label>
            <textarea 
              className="field-input" 
              rows={4}
              value={sendForm.message} 
              onChange={e => setSendForm(p => ({...p, message: e.target.value}))}
              placeholder="Enter your message here..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="field-label">Target Role</label>
              <select 
                className="field-input" 
                value={sendForm.targetRole} 
                onChange={e => setSendForm(p => ({...p, targetRole: e.target.value}))}
              >
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students</option>
                <option value="INVIGILATOR">Invigilators</option>
                <option value="EXAM_ADMIN">Exam Admins</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>
            </div>
            <div>
              <label className="field-label">Channel</label>
              <select 
                className="field-input" 
                value={sendForm.channel} 
                onChange={e => setSendForm(p => ({...p, channel: e.target.value}))}
              >
                <option value="IN_APP">In-App Only</option>
                <option value="EMAIL">Email Only</option>
                <option value="PUSH">Push Only</option>
                <option value="ALL">All Channels</option>
              </select>
            </div>
            <div>
              <label className="field-label">Institution</label>
              <select 
                className="field-input" 
                value={sendForm.institutionId} 
                onChange={e => setSendForm(p => ({...p, institutionId: e.target.value}))}
              >
                <option value="">All Institutions</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="urgent"
              checked={sendForm.urgent}
              onChange={e => setSendForm(p => ({...p, urgent: e.target.checked}))}
              className="rounded"
            />
            <label htmlFor="urgent" className="text-sm font-medium">Mark as urgent</label>
          </div>

          {/* Specific User Selection */}
          {sendForm.targetRole !== 'ALL' && users.length > 0 && (
            <div>
              <label className="field-label">Specific Users (Optional)</label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-3">
                {users.filter(user => sendForm.targetRole === 'ALL' || user.role === sendForm.targetRole).map(user => (
                  <label key={user.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendForm.targetUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {user.student?.name || user.invigilator?.name || user.email} 
                      <span className="text-gray-500 ml-1">({user.role})</span>
                    </span>
                  </label>
                ))}
              </div>
              {sendForm.targetUsers.length > 0 && (
                <div className="text-sm text-green-600 mt-1">
                  {sendForm.targetUsers.length} user(s) selected
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setShowSendModal(false)} 
            className="btn btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button 
            onClick={handleSendNotification}
            disabled={sendMutation.isLoading}
            className="btn btn-blue flex-1 justify-center"
          >
            {sendMutation.isLoading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </Modal>

      {/* Broadcast Modal */}
      <Modal open={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} title="System Broadcast">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="font-medium text-yellow-800">System-wide Broadcast</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              This will send a notification to ALL users across ALL institutions. Use with caution.
            </p>
          </div>

          <div>
            <label className="field-label">Title *</label>
            <input 
              className="field-input" 
              value={broadcastForm.title} 
              onChange={e => setBroadcastForm(p => ({...p, title: e.target.value}))}
              placeholder="System broadcast title"
            />
          </div>

          <div>
            <label className="field-label">Message *</label>
            <textarea 
              className="field-input" 
              rows={4}
              value={broadcastForm.message} 
              onChange={e => setBroadcastForm(p => ({...p, message: e.target.value}))}
              placeholder="Enter your broadcast message here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Type</label>
              <select 
                className="field-input" 
                value={broadcastForm.type} 
                onChange={e => setBroadcastForm(p => ({...p, type: e.target.value}))}
              >
                <option value="SYSTEM">System</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="URGENT">Urgent</option>
                <option value="ANNOUNCEMENT">Announcement</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={broadcastForm.urgent}
                  onChange={e => setBroadcastForm(p => ({...p, urgent: e.target.checked}))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Mark as urgent</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setShowBroadcastModal(false)} 
            className="btn btn-ghost flex-1 justify-center"
          >
            Cancel
          </button>
          <button 
            onClick={handleBroadcast}
            disabled={broadcastMutation.isLoading}
            className="btn btn-gold flex-1 justify-center"
          >
            {broadcastMutation.isLoading ? 'Broadcasting...' : 'Send Broadcast'}
          </button>
        </div>
      </Modal>
    </div>
  );
}