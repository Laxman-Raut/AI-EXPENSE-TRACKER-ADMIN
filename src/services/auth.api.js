import apiClient from '@/lib/api';
import axios from 'axios';

export const authApi = {
  // Login — backend sets HttpOnly cookies automatically
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Get profile — cookies sent automatically
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Refresh token — uses refresh_token cookie
  refreshToken: async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await axios.post(
      `${baseURL}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Client-Type': 'dashboard' },
      }
    );
    return response.data;
  },

  // Logout — server revokes refresh token and clears cookies
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Even if logout API fails, we still want to clear client state
      console.warn('[Auth] Logout API error (non-fatal):', err.message);
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },
};

export default authApi;
