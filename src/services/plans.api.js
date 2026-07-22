import apiClient from '@/lib/api';

export const plansApi = {
  getPlans: async () => {
    const response = await apiClient.get('/v1/admin/plans');
    return response.data.data; // Array of plans
  },

  createPlan: async (planData) => {
    const response = await apiClient.post('/v1/admin/plans', planData);
    return response.data.data;
  },

  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/v1/admin/plans/${id}`, planData);
    return response.data.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/v1/admin/plans/${id}/status`, { status });
    return response.data.data;
  },

  deletePlan: async (id) => {
    const response = await apiClient.delete(`/v1/admin/plans/${id}`);
    return response.data.data;
  },

  updateLimits: async (id, limitsData) => {
    const response = await apiClient.post(`/v1/admin/plans/${id}/limits`, limitsData);
    return response.data.data;
  }
};
export default plansApi;
