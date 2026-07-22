import apiClient from '@/lib/api';

export const usersApi = {
  getUsers: async (params = {}) => {
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

    const response = await apiClient.get('/v1/admin/users', { params: queryParams });
    const { users, total, page: currentPage, totalPages } = response.data.data;

    const mappedUsers = users.map(u => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      subscription: u.subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Tier',
      status: u.accountStatus === 'suspended' ? 'Suspended' : (u.subscription?.status === 'active' ? 'Active' : 'Pending'),
      accountStatus: u.accountStatus || 'active',
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      avatar: u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    }));

    return {
      users: mappedUsers,
      total,
      page: currentPage,
      totalPages
    };
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/v1/admin/users/${id}`);
    const { user, payments } = response.data.data;

    return {
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        subscription: user.subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Tier',
        status: user.accountStatus === 'suspended' ? 'Suspended' : (user.subscription?.status === 'active' ? 'Active' : 'Pending'),
        accountStatus: user.accountStatus || 'active',
        joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        avatar: user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
      },
      payments: payments.map(p => ({
        id: p._id,
        amount: p.amount,
        status: p.status === 'success' ? 'Success' : (p.status === 'pending' ? 'Pending' : 'Failed'),
        date: p.paidAt ? new Date(p.paidAt).toLocaleString() : ''
      }))
    };
  },

  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/v1/admin/users/${id}/status`);
    return response.data.data;
  },
};
export default usersApi;
