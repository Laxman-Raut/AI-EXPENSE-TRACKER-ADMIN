import apiClient from '@/lib/api';

export const reportsApi = {
  getSummary: async () => {
    const response = await apiClient.get('/v1/admin/reports/summary');
    return response.data.data;
  },

  getRevenue: async (year) => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/v1/admin/reports/revenue', { params });
    return response.data.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/v1/admin/reports/users');
    return response.data.data;
  },

  getSubscriptions: async () => {
    const response = await apiClient.get('/v1/admin/reports/subscriptions');
    return response.data.data;
  },

  getPayments: async (params = {}) => {
    const response = await apiClient.get('/v1/admin/reports/payments', { params });
    return response.data.data;
  },
};

export default reportsApi;
