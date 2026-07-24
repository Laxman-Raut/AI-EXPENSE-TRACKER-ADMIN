import apiClient from '@/lib/api';

export const analyticsApi = {
  getCharts: async () => {
    const response = await apiClient.get('/v1/admin/dashboard');
    const { charts } = response.data.data;

    // Adapt user growth trend: backend returns {_id: "YYYY-MM-DD", users: count}
    const growth = charts.userGrowthTrend?.map(t => ({
      date: t._id,
      Signups: t.users,
      ActiveUsers: t.users
    })) || [];

    // Adapt subscription distribution for backward-compat
    // Real trend data comes from subscriptionsApi.getMetrics().monthlyTrend
    const subscriptions = charts.subscriptionDistribution?.map(d => ({
      name: d._id === 'pro' ? 'Pro Plan' : (d._id === 'basic' ? 'Basic Plan' : 'Free Tier'),
      Active: d.users,
      Churned: 0
    })) || [];

    return {
      growth,
      subscriptions
    };
  }
};
export default analyticsApi;

