// src/services/api.js — Axios with auto-refresh interceptor
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  pendingQueue = [];
};

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('acadex-auth');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
  }
  return config;
}, (err) => Promise.reject(err));

// Response interceptor — handle 401 with refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry && orig.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }
      orig._retry = true;
      isRefreshing = true;
      try {
        const res = await api.post('/auth/refresh');
        const { accessToken } = res.data.data;
        // Update stored token
        const stored = localStorage.getItem('acadex-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.state.accessToken = accessToken;
          localStorage.setItem('acadex-auth', JSON.stringify(parsed));
        }
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return api(orig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('acadex-auth');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const apiGet = (url, params) => api.get(url, { params }).then(r => r.data);
export const apiPost = (url, data) => api.post(url, data).then(r => r.data);
export const apiPut = (url, data) => api.put(url, data).then(r => r.data);
export const apiPatch = (url, data) => api.patch(url, data).then(r => r.data);
export const apiDelete = (url) => api.delete(url).then(r => r.data);

export default api;
