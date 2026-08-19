import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'dashboard',
  },
  withCredentials: true, // Send cookies with every request
});

// ─────────────────────────────────────────────────────────────
// Silent Token Refresh Logic
// ─────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (success) {
      resolve();
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 (not 403), and not on refresh/login endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { 'X-Client-Type': 'dashboard' },
          }
        );

        // Refresh succeeded — process queued requests
        processQueue(null, true);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear queue
        processQueue(refreshError, false);

        if (typeof window !== 'undefined') {
          // Clean up any legacy localStorage tokens and redirect to login
          localStorage.removeItem('admin_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
