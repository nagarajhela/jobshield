import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8081';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

let lastErrorToastTime = 0;
const showErrorToast = (msg) => {
  const now = Date.now();
  if (now - lastErrorToastTime > 2500) {
    toast.error(msg);
    lastErrorToastTime = now;
  }
};

// Request interceptor: attach token if present & not expired
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobshield_token');
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('jobshield_token');
        localStorage.removeItem('jobshield_user');
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle status codes
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem('jobshield_token');
        localStorage.removeItem('jobshield_user');
        const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/check-email', '/verify-email', '/campaigns', '/community-reports'];
        const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/campaigns/'));
        if (!isPublicPath && window.location.pathname !== '/login') {
          showErrorToast('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        showErrorToast('Access denied.');
      } else if (status === 429) {
        showErrorToast('Too many requests. Please slow down.');
      } else if (status === 500) {
        showErrorToast(error.response?.data?.message || 'Server error. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

// Backward-compatible helpers & exports
const TOKEN_KEY = 'jobshield_token';
const USER_KEY = 'jobshield_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getSavedUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSavedUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return Boolean(token && token.trim().length > 0);
};

export const authApi = {
  register: async (payload) => {
    const res = await apiClient.post('/api/auth/register', payload);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post('/api/auth/login', credentials);
    if (res.data?.token) {
      setToken(res.data.token);
    }
    if (res.data?.user) {
      setSavedUser(res.data.user);
    }
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get('/api/auth/me');
    setSavedUser(res.data);
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore
    }
    removeToken();
  },
};

export const jobApi = {
  analyzeJob: async (jobData) => {
    const res = await apiClient.post('/api/jobs/analyze', jobData);
    return res.data;
  },
  analyzePdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/api/jobs/analyze-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  analyzeUrl: async (urlData) => {
    const res = await apiClient.post('/api/jobs/analyze-url', urlData);
    return res.data;
  },
  getHistory: async () => {
    const res = await apiClient.get('/api/jobs/history');
    return res.data;
  },
  getAnalysisById: async (analysisId) => {
    const res = await apiClient.get(`/api/jobs/${analysisId}`);
    return res.data;
  },
  getDashboard: async () => {
    const res = await apiClient.get('/api/jobs/dashboard');
    return res.data;
  },
  getCampaigns: async () => {
    const res = await apiClient.get('/api/jobs/campaigns');
    return res.data;
  },
};

export default apiClient;
