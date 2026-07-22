import apiClient from '@/lib/api';

export const aiUsageApi = {
  /**
   * GET /api/v1/admin/ai-usage
   * Returns AI feature usage totals, distribution, daily trend, and top users.
   */
  getAiUsage: async () => {
    const response = await apiClient.get('/v1/admin/ai-usage');
    return response.data.data;
  },
};

export default aiUsageApi;
