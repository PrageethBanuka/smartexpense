import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const hasGlobal = typeof globalThis === 'object';
    const token = hasGlobal && globalThis.localStorage ? globalThis.localStorage.getItem('token') : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const hasGlobal = typeof globalThis === 'object';
      if (hasGlobal && globalThis.localStorage) {
        globalThis.localStorage.removeItem('token');
        globalThis.localStorage.removeItem('user');
      }
      // Redirect to login if we're in the browser context
      if (hasGlobal && globalThis.location && globalThis.location.pathname !== '/login') {
        globalThis.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
