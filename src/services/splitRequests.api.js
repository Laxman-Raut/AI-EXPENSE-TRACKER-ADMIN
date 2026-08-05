import apiClient from '@/lib/api';

export const splitRequestsApi = {
  createSplitRequest: async (data) => {
    const response = await apiClient.post('/split-requests', data);
    return response.data;
  },
  getGroupSplitRequests: async (groupId) => {
    const response = await apiClient.get(`/split-requests/group/${groupId}`);
    return response.data;
  },
  getSplitRequestById: async (splitId) => {
    const response = await apiClient.get(`/split-requests/${splitId}`);
    return response.data;
  },
  updateSplitRequest: async (splitId, updateData) => {
    const response = await apiClient.put(`/split-requests/${splitId}`, updateData);
    return response.data;
  },
  deleteSplitRequest: async (splitId) => {
    const response = await apiClient.delete(`/split-requests/${splitId}`);
    return response.data;
  },
};
