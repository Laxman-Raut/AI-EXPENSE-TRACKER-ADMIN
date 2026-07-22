import apiClient from '@/lib/api';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // Expected response shape: { success: true, data: { token, user } }
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.data; // Expected response shape: { success: true, data: { fullName, email, role, avatar } }
  },
  
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data.data;
  }
};
export default authApi;
