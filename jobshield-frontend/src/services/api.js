/**
 * JobShield API Service
 * Centralized HTTP helper for communicating with the Spring Boot backend.
 * Handles JWT token injection, response parsing, and authentication expiration.
 */

// In local Vite development, using relative URLs ('/api/...') allows the Vite dev server
// to proxy requests to http://localhost:8081, preventing browser CORS issues without modifying backend code.
const ENV_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (import.meta.env.DEV && (!ENV_URL || ENV_URL.includes('localhost:8081')))
  ? ''
  : (ENV_URL || 'http://localhost:8081');

const TOKEN_KEY = 'jobshield_token';
const USER_KEY = 'jobshield_user';

// Token helpers
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
  } catch (e) {
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
  return !!token && token.trim().length > 0;
};

/**
 * Execute fetch request with automatic JWT auth header, error handling, and proxy support.
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Attach Bearer token if present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, ensure Content-Type is application/json if sending a body
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  const targetUrl = `${API_BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(targetUrl, fetchOptions);
  } catch (err) {
    // Typical browser network error when server is unreachable or CORS blocked
    throw new Error(
      'Cannot connect to JobShield backend at http://localhost:8081. Please ensure your Spring Boot server is started and running.'
    );
  }

  // Handle 502/503/504 Bad Gateway from Vite proxy when port 8081 is offline
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    throw new Error(
      'JobShield backend is not reachable at http://localhost:8081. Please start the Spring Boot application.'
    );
  }

  // If unauthorized or forbidden, clear token and notify auth state
  if (res.status === 401 || res.status === 403) {
    removeToken();
    const publicPaths = ['/', '/login', '/register'];
    if (!publicPaths.includes(window.location.pathname)) {
      window.location.href = '/login?expired=true';
    }
    throw new Error('Session expired or unauthorized. Please log in again.');
  }

  // Attempt to parse response body
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    let errorMessage = 'An error occurred';
    if (typeof data === 'object' && data !== null) {
      errorMessage = data.message || data.error || JSON.stringify(data);
    } else if (typeof data === 'string' && data.trim().length > 0) {
      errorMessage = data;
    }
    throw new Error(errorMessage);
  }

  return data;
}

// ==========================================
// Authentication APIs
// ==========================================

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register: async (payload) => {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Login user and receive JWT token
   * POST /api/auth/login
   */
  login: async (credentials) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data && data.token) {
      setToken(data.token);
    }
    return data;
  },

  /**
   * Fetch current authenticated user's profile
   * GET /api/auth/me
   */
  getProfile: async () => {
    const user = await apiFetch('/api/auth/me', {
      method: 'GET',
    });
    setSavedUser(user);
    return user;
  },

  logout: () => {
    removeToken();
  },
};

// ==========================================
// Job Analysis & Dashboard APIs
// ==========================================

export const jobApi = {
  /**
   * Analyze job posting description text
   * POST /api/jobs/analyze
   */
  analyzeJob: async (jobData) => {
    return apiFetch('/api/jobs/analyze', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Upload and analyze a PDF offer letter
   * POST /api/jobs/analyze-pdf
   * Note: Do NOT set Content-Type header manually for FormData.
   */
  analyzePdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch('/api/jobs/analyze-pdf', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Fetch user's scan history
   * GET /api/jobs/history
   */
  getHistory: async () => {
    return apiFetch('/api/jobs/history', {
      method: 'GET',
    });
  },

  /**
   * Fetch specific job analysis details by ID
   * GET /api/jobs/{analysisId}
   */
  getAnalysisById: async (analysisId) => {
    return apiFetch(`/api/jobs/${analysisId}`, {
      method: 'GET',
    });
  },

  /**
   * Fetch user scan dashboard statistics
   * GET /api/jobs/dashboard
   */
  getDashboard: async () => {
    return apiFetch('/api/jobs/dashboard', {
      method: 'GET',
    });
  },

  /**
   * Fetch grouped scam campaigns
   * GET /api/jobs/campaigns
   */
  getCampaigns: async () => {
    return apiFetch('/api/jobs/campaigns', {
      method: 'GET',
    });
  },
};
