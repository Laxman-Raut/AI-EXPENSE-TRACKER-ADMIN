import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch Auth Errors (Expired Token / Unauthenticated)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      // 401 Unauthorized / 403 Forbidden indicates invalid or expired credentials
      if (status === 401 || status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          window.location.reload(); // Force page refresh to redirect to login overlay
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
