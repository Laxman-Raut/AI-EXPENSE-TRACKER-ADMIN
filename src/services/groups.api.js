import apiClient from '@/lib/api';

export const groupsApi = {
  getGroups: async () => {
    const response = await apiClient.get('/groups');
    return response.data;
  },
  getGroupById: async (groupId) => {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data;
  },
  createGroup: async (data) => {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },
  updateGroup: async (groupId, data) => {
    const response = await apiClient.put(`/groups/${groupId}`, data);
    return response.data;
  },
  deleteGroup: async (groupId) => {
    const response = await apiClient.delete(`/groups/${groupId}`);
    return response.data;
  },
  addMember: async (groupId, memberId) => {
    const response = await apiClient.post(`/groups/${groupId}/members`, { memberId });
    return response.data;
  },
  removeMember: async (groupId, memberId) => {
    const response = await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },
  leaveGroup: async (groupId) => {
    const response = await apiClient.delete(`/groups/${groupId}/leave`);
    return response.data;
  },
};
