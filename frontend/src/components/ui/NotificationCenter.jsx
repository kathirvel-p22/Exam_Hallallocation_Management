// src/components/ui/NotificationCenter.jsx - Real-time Notification System
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useSocket } from '../../socket/useSocket';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const user = useAuthStore(state => state.user);
  const qc = useQueryClient();
  const socket = useSocket();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => apiGet(`/notifications?type=${filter !== 'ALL' ? filter : ''}&limit=50`),
    refetchInterval: 30000 // Refetch every 30 seconds as backup
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  // Mark as read mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id) => apiPatch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications'])
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiPatch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries(['notifications'])
  });

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      // Show toast for new notifications
      toast.success(notification.title, {
        duration: 5000,
        icon: notification.urgent ? '🚨' : '📢'
      });
      
      // Invalidate queries to refresh the list
      qc.invalidateQueries(['notifications']);
    };

    const handleBroadcast = (notification) => {
      toast.success(`System: ${notification.title}`, {
        duration: 8000,
        icon: '📢'
      });
      qc.invalidateQueries(['notifications']);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:broadcast', handleBroadcast);
    socket.on('notifications:read-all', () => qc.invalidateQueries(['notifications']));
    socket.on('notifications:read', () => qc.invalidateQueries(['notifications']));
    socket.on('notifications:deleted', () => qc.invalidateQueries(['notifications']));

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:broadcast', handleBroadcast);
      socket.off('notifications:read-all');
      socket.off('notifications:read');
      socket.off('notifications:deleted');
    };
  }, [socket, qc]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EXAM': return '📝';
      case 'ALLOCATION': return '🎯';
      case 'ATTENDANCE': return '✅';
      case 'SYSTEM': return '⚙️';
      case 'URGENT': return '🚨';
      default: return '📢';
    }
  };

  const getNotificationColor = (type, isRead) => {
    const opacity = isRead ? 'opacity-60' : '';
    switch (type) {
      case 'URGENT': return `bg-red-50 border-red-200 text-red-800 ${opacity}`;
      case 'EXAM': return `bg-blue-50 border-blue-200 text-blue-800 ${opacity}`;
      case 'SYSTEM': return `bg-purple-50 border-purple-200 text-purple-800 ${opacity}`;
      default: return `bg-gray-50 border-gray-200 text-gray-800 ${opacity}`;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3">
              {['ALL', 'EXAM', 'SYSTEM', 'URGENT'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === type 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.sentAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(notification.type, notification.isRead)}`}>
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}