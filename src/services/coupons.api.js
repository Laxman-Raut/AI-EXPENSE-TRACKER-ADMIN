import apiClient from '@/lib/api';

export const couponsApi = {
  getCoupons: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const response = await apiClient.get(`/v1/admin/coupons?${params.toString()}`);
    return response.data.data;
  },
  createCoupon: async (data) => {
    const response = await apiClient.post('/v1/admin/coupons', data);
    return response.data.data;
  },
  getCouponById: async (id) => {
    const response = await apiClient.get(`/v1/admin/coupons/${id}`);
    return response.data.data;
  },
  updateCoupon: async (id, data) => {
    const response = await apiClient.put(`/v1/admin/coupons/${id}`, data);
    return response.data.data;
  },
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/v1/admin/coupons/${id}/status`);
    return response.data.data;
  },
  deleteCoupon: async (id) => {
    const response = await apiClient.delete(`/v1/admin/coupons/${id}`);
    return response.data.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/v1/admin/coupons/stats');
    return response.data.data;
  },
};

export default couponsApi;
