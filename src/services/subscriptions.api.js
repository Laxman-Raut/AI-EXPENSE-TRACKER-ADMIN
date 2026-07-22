import apiClient from '@/lib/api';

export const subscriptionsApi = {
  getSubscriptions: async (params = {}) => {
    const { search = '', status = 'All', plan = 'All', page = 1, limit = 8 } = params;

    const queryParams = {};
    if (search) queryParams.search = search;
    if (status && status !== 'All') {
      queryParams.status = status === 'Active' ? 'active' : (status === 'Pending' ? 'pending' : 'expired');
    }
    if (plan && plan !== 'All') {
      queryParams.plan = plan === 'Free Tier' ? 'free' : 'pro';
    }
    queryParams.page = page;
    queryParams.limit = limit;

    const response = await apiClient.get('/v1/admin/subscriptions', { params: queryParams });
    return response.data.data;
  },

  getSubscriptionById: async (id) => {
    const response = await apiClient.get(`/v1/admin/subscriptions/${id}`);
    return response.data.data;
  },

  getTimeline: async (id) => {
    const response = await apiClient.get(`/v1/admin/subscriptions/${id}/timeline`);
    return response.data.data;
  },

  activate: async (id, planId) => {
    const response = await apiClient.patch(`/v1/admin/subscriptions/${id}/activate`, { planId });
    return response.data.data;
  },

  cancel: async (id) => {
    const response = await apiClient.patch(`/v1/admin/subscriptions/${id}/cancel`);
    return response.data.data;
  },

  extend: async (id, durationDays, note) => {
    const response = await apiClient.patch(`/v1/admin/subscriptions/${id}/extend`, { durationDays, note });
    return response.data.data;
  },

  getMetrics: async () => {
    const response = await apiClient.get('/v1/admin/subscriptions/metrics');
    return response.data.data;
  },
};
export default subscriptionsApi;
