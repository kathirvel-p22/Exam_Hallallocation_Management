// src/store/authStore.js — Zustand auth state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,

      // Computed properties as regular functions instead of getters
      isAuthenticated: () => {
        const state = get();
        const hasUser = !!state.user;
        const hasToken = !!state.accessToken;
        const result = hasUser && hasToken;
        console.log('🔍 isAuthenticated() called:', {
          hasUser,
          hasToken,
          result,
          userEmail: state.user?.email,
          tokenLength: state.accessToken?.length
        });
        return result;
      },

      // Signup
      signup: async (email, password, name, role = 'STUDENT') => {
        console.log('🔍 AuthStore signup called:', { email, name, role, password: '***' });
        set({ isLoading: true });
        try {
          console.log('📡 Making API call to /auth/signup');
          const res = await api.post('/auth/signup', { email, password, name, role });
          console.log('✅ Signup API response:', res.data);
          const { accessToken, user } = res.data.data;
          set({ user, accessToken, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          console.log('✅ Auth state updated after signup:', { user: user.email, role: user.role });
          return { success: true, user };
        } catch (err) {
          console.error('❌ Signup API error:', err);
          set({ isLoading: false });
          throw err;
        }
      },
      login: async (email, password) => {
        console.log('🔍 AuthStore login called:', { email, password: '***' });
        set({ isLoading: true });
        try {
          console.log('📡 Making API call to /auth/login');
          const res = await api.post('/auth/login', { email, password });
          console.log('✅ API response:', res.data);
          const { accessToken, user } = res.data.data;
          
          // Update state and force persistence
          console.log('🔄 Setting auth state...');
          set({ user, accessToken, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Force localStorage update
          const storeData = {
            state: { user, accessToken },
            version: 0
          };
          localStorage.setItem('acadex-auth', JSON.stringify(storeData));
          console.log('💾 Forced localStorage update:', storeData);
          
          console.log('✅ Auth state updated:', { user: user.email, role: user.role });
          
          // Verify the state was actually updated
          setTimeout(() => {
            const currentState = get();
            const isAuth = currentState.isAuthenticated();
            console.log('✅ Current auth state after update:', {
              hasUser: !!currentState.user,
              hasToken: !!currentState.accessToken,
              isAuthenticated: isAuth
            });
            console.log('💾 localStorage check:', localStorage.getItem('acadex-auth'));
          }, 100);
          
          return { success: true, user };
        } catch (err) {
          console.error('❌ Login API error:', err);
          set({ isLoading: false });
          throw err;
        }
      },

      // Logout
      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null });
      },

      // Refresh access token
      refreshToken: async () => {
        try {
          const res = await api.post('/auth/refresh');
          const { accessToken } = res.data.data;
          set({ accessToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return accessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      // Hydrate from server
      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) { set({ isInitialized: true }); return; }
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isInitialized: true });
        } catch {
          set({ user: null, accessToken: null, isInitialized: true });
        }
      },

      // Update FCM token
      setFcmToken: async (token) => {
        try { await api.put('/auth/fcm-token', { fcmToken: token }); } catch {}
      },

      setUser: (user) => set({ user }),
      setAccessToken: (t) => {
        set({ accessToken: t });
        if (t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      },

      get role() { return get().user?.role; },
      get isAdmin() { return ['EXAM_ADMIN', 'SUPER_ADMIN'].includes(get().user?.role); },
      get isStudent() { return get().user?.role === 'STUDENT'; },
      get isInvigilator() { return get().user?.role === 'INVIGILATOR'; },
      get isSuperAdmin() { return get().user?.role === 'SUPER_ADMIN'; },
    }),
    {
      name: 'acadex-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        user: state.user 
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Zustand rehydration error:', error);
        } else {
          console.log('🔄 Zustand rehydrated from localStorage:', {
            hasUser: !!state?.user,
            hasToken: !!state?.accessToken,
            userRole: state?.user?.role
          });
        }
      },
      version: 0,
      migrate: (persistedState, version) => {
        console.log('🔄 Zustand migration:', { persistedState, version });
        return persistedState;
      },
    }
  )
);

export default useAuthStore;
