import apiClient from '@/lib/api';

export const supportApi = {
  getSupportQueries: async () => {
    const response = await apiClient.get('/v1/admin/support-queries');
    return response.data;
  },
  updateQueryStatus: async (id, status) => {
    const response = await apiClient.patch(`/v1/admin/support-queries/${id}/status`, { status });
    return response.data;
  },
};
