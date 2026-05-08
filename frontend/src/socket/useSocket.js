// src/socket/useSocket.js — Enhanced Real-time Socket Connection
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
let socketInstance = null;

export function getSocket() { return socketInstance; }

export function useSocket({
  onAttendanceUpdate,
  onExamStats,
  onIssueNew,
  onNotification,
  onAllocationProgress,
  onAllocationComplete,
  onInvigilatorArrived,
  autoJoinExam,
  autoJoinHall,
} = {}) {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const socketRef = useRef(null);
  const reconnectRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setIsConnected(false);
      }
      return;
    }

    // Reuse existing connection if token hasn't changed
    if (socketInstance?.connected && socketInstance.auth?.token === accessToken) {
      socketRef.current = socketInstance;
      setupListeners(socketInstance);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    socketInstance = socket;
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setIsConnected(true);
      reconnectRef.current = 0;
      
      // Auto-join rooms
      if (autoJoinExam) socket.emit('join:exam', { examId: autoJoinExam });
      if (autoJoinHall) socket.emit('join:hall', { hallId: autoJoinHall });
      
      // Subscribe to notifications
      socket.emit('notifications:subscribe');
      
      // Join role-based monitoring for admins
      if (['EXAM_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        socket.emit('admin:monitor-start');
      }
    });

    socket.on('connect_error', (err) => {
      console.error('🔌 Socket connection error:', err);
      setIsConnected(false);
      reconnectRef.current++;
      if (reconnectRef.current <= 3) {
        toast.error('Connection issues. Retrying...', { duration: 2000 });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') socket.connect();
    });

    // Connection confirmation
    socket.on('connection:confirmed', (data) => {
      console.log('✅ Connection confirmed:', data);
      toast.success('Connected to real-time updates', { duration: 2000 });
    });

    setupListeners(socket);

    return () => {
      removeListeners(socket);
    };
  }, [isAuthenticated, accessToken, user]);

  function setupListeners(socket) {
    // Original listeners
    if (onAttendanceUpdate) socket.on('attendance:updated', onAttendanceUpdate);
    if (onExamStats) socket.on('exam:stats', onExamStats);
    if (onIssueNew) socket.on('issue:new', onIssueNew);
    if (onAllocationProgress) socket.on('allocation:progress', onAllocationProgress);
    if (onAllocationComplete) socket.on('allocation:complete', onAllocationComplete);
    if (onInvigilatorArrived) socket.on('invigilator:arrived', onInvigilatorArrived);

    // Enhanced notification handling
    socket.on('notification:new', (data) => {
      console.log('📢 New notification:', data);
      
      const toastOptions = {
        duration: data.urgent ? 8000 : 5000,
        icon: data.urgent ? '🚨' : '📢',
        style: data.urgent ? {
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626'
        } : {}
      };
      
      toast.success(data.title, toastOptions);
      
      if (onNotification) onNotification(data);
      
      // Browser notification for urgent messages
      if (data.urgent && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/favicon.svg'
        });
      }
    });

    socket.on('notification:broadcast', (data) => {
      console.log('📢 System broadcast:', data);
      toast.success(`System: ${data.title}`, {
        duration: 10000,
        icon: '📢',
        style: {
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          color: '#1D4ED8'
        }
      });
      if (onNotification) onNotification(data);
    });

    // User presence tracking
    socket.on('user:online', (userData) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userData.userId);
        return [...filtered, userData];
      });
    });

    socket.on('user:offline', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    // Real-time updates for different entities
    socket.on('user:created', (data) => {
      if (['SUPER_ADMIN', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success(`New user created: ${data.email}`, { icon: '👤' });
      }
    });

    socket.on('user:updated', (data) => {
      if (['SUPER_ADMIN', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success(`User updated: ${data.email}`, { icon: '✏️' });
      }
    });

    socket.on('user:deleted', (data) => {
      if (['SUPER_ADMIN', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success(`User deleted: ${data.email}`, { icon: '🗑️' });
      }
    });

    socket.on('institution:created', (data) => {
      if (user?.role === 'SUPER_ADMIN') {
        toast.success(`New institution: ${data.name}`, { icon: '🏛️' });
      }
    });

    socket.on('institution:updated', (data) => {
      if (['SUPER_ADMIN', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success(`Institution updated: ${data.name}`, { icon: '✏️' });
      }
    });

    socket.on('exam:created', (data) => {
      if (['SUPER_ADMIN', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success(`New exam: ${data.subjectName}`, { icon: '📝' });
      }
    });

    socket.on('exam:status-update', (data) => {
      toast.success(`Exam ${data.status.toLowerCase()}: ${data.examTitle}`, { icon: '📝' });
    });

    socket.on('exam:allocation-published', (data) => {
      if (user?.role === 'STUDENT') {
        toast.success('New exam allocation published!', { icon: '🎯' });
      }
    });

    // Attendance events
    socket.on('attendance:marked', (data) => {
      if (['INVIGILATOR', 'EXAM_ADMIN'].includes(user?.role)) {
        toast.success('Attendance marked', { icon: '✅' });
      }
    });

    socket.on('attendance:status-update', (data) => {
      if (user?.role === 'STUDENT') {
        toast.success(`Attendance: ${data.status}`, { icon: '✅' });
      }
    });

    // Admin broadcasts
    socket.on('admin:broadcast', (data) => {
      const toastOptions = {
        duration: data.urgent ? 8000 : 5000,
        icon: data.urgent ? '🚨' : '📢',
        style: data.urgent ? {
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626'
        } : {
          background: '#F0F9FF',
          border: '1px solid #BAE6FD',
          color: '#0369A1'
        }
      };
      
      toast.success(`Admin: ${data.message}`, toastOptions);
    });

    // System events
    socket.on('system:maintenance', (data) => {
      toast.error(`Maintenance: ${data.message}`, {
        duration: 10000,
        icon: '🔧'
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(`Connection error: ${error.message}`);
    });

    // Legacy notification handler for backward compatibility
    if (onNotification) {
      socket.on('notification:push', (data) => {
        onNotification(data);
        toast(data.message || data.title, { icon: '🔔', duration: 5000 });
      });
    }
  }

  function removeListeners(socket) {
    const events = [
      'attendance:updated', 'exam:stats', 'issue:new', 'allocation:progress', 
      'allocation:complete', 'invigilator:arrived', 'notification:push',
      'notification:new', 'notification:broadcast', 'user:online', 'user:offline',
      'user:created', 'user:updated', 'user:deleted', 'institution:created',
      'institution:updated', 'exam:created', 'exam:status-update', 
      'exam:allocation-published', 'attendance:marked', 'attendance:status-update',
      'admin:broadcast', 'system:maintenance', 'error', 'connection:confirmed'
    ];
    events.forEach(event => socket.off(event));
  }

  // Enhanced emit functions
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinHall = useCallback((hallId) => emit('join:hall', { hallId }), [emit]);
  const joinExam = useCallback((examId) => emit('join:exam', { examId }), [emit]);
  const joinRoom = useCallback((room) => emit('join:room', { room }), [emit]);
  const leaveRoom = useCallback((room) => emit('leave:room', { room }), [emit]);

  const sendMessage = useCallback((roomId, message, type = 'text') => {
    emit('chat:send-message', { roomId, message, type });
  }, [emit]);

  const markAttendance = useCallback((allocationId, examId, status) => {
    emit('attendance:mark', { allocationId, examId, status });
  }, [emit]);

  const broadcastToRole = useCallback((message, targetRole, urgent = false) => {
    if (['EXAM_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) {
      emit('admin:broadcast', { message, targetRole, urgent });
    }
  }, [emit, user]);

  const requestSystemStatus = useCallback(() => {
    emit('system:status');
  }, [emit]);

  return { 
    socket: socketRef.current, 
    emit, 
    joinHall, 
    joinExam, 
    joinRoom,
    leaveRoom,
    sendMessage,
    markAttendance,
    broadcastToRole,
    requestSystemStatus,
    isConnected,
    onlineUsers
  };
}

export default useSocket;
