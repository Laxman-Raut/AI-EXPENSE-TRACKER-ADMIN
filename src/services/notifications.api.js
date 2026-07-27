import apiClient from '@/lib/api';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await apiClient.get('/v1/admin/notifications');
    return response.data.data;
  },
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/v1/admin/notifications/${id}/read`);
    return response.data.data;
  },
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/v1/admin/notifications/${id}`);
    return response.data.data;
  },
  clearAll: async () => {
    const response = await apiClient.delete('/v1/admin/notifications');
    return response.data.data;
  },
  // Campaign Broadcast APIs
  sendBroadcast: async (payload) => {
    const response = await apiClient.post('/v1/admin/notifications/broadcast', payload);
    return response.data;
  },
  getCampaigns: async () => {
    const response = await apiClient.get('/v1/admin/notifications/campaigns');
    return response.data.data;
  },
  getAudienceCount: async (segment, email) => {
    const response = await apiClient.get('/v1/admin/notifications/audience-count', {
      params: { segment, email }
    });
    return response.data.data?.audienceCount ?? 0;
  },
};

export default notificationsApi;
