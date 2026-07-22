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
    // TODO: Delete plan API endpoint is not supported by the original Express backend.
    // Create a TODO comment instead of fake implementations or modifying routes.
    console.warn(`TODO: Implement DELETE plan endpoint for ID: ${id}`);
    throw new Error('Delete plan functionality is not supported by the backend APIs.');
  }
};
export default plansApi;
