import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Simple Event Emitter for Cold-Start Server Status
const coldStartListeners = new Set();

export const subscribeColdStart = (callback) => {
  coldStartListeners.add(callback);
  return () => coldStartListeners.delete(callback);
};

const notifyColdStart = (isWakingUp) => {
  coldStartListeners.forEach((listener) => listener(isWakingUp));
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds to accommodate free-tier Render server cold starts
});

// Request Interceptor: Inject JWT token & trigger cold start notification timer
axiosInstance.interceptors.request.use(
  (config) => {
    // Inject Authorization header if user token exists
    try {
      const storedUser = localStorage.getItem('tec_user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        const token = userObj.token || userObj.data?.access_token || userObj.access_token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('[axiosInstance] Error reading token from localStorage:', e);
    }

    // Set timer to notify UI if request takes longer than 3.5s (likely Render cold-start)
    const timer = setTimeout(() => {
      notifyColdStart(true);
    }, 3500);
    config.metadata = { timer };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Clear cold start timer & notify UI server is active
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.timer) {
      clearTimeout(response.config.metadata.timer);
    }
    notifyColdStart(false);
    return response;
  },
  (error) => {
    if (error.config?.metadata?.timer) {
      clearTimeout(error.config.metadata.timer);
    }
    notifyColdStart(false);
    return Promise.reject(error);
  }
);

export default axiosInstance;
