import apiClient from '@/lib/api';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data.notifications || [];
  },

  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.notification;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await apiClient.delete('/notifications');
    return response.data;
  }
};

export default notificationsApi;
