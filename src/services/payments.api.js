import apiClient from '@/lib/api';

export const paymentsApi = {
  /**
   * GET /api/v1/admin/payments
   * Returns paginated payment ledger with summary stats.
   */
  getPayments: async (params = {}) => {
    const response = await apiClient.get('/v1/admin/payments', { params });
    return response.data.data;
  },
};

export default paymentsApi;
