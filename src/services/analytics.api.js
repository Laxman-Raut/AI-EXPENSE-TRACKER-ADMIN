import apiClient from '@/lib/api';

export const analyticsApi = {
  getCharts: async () => {
    const response = await apiClient.get('/v1/admin/dashboard');
    const { charts } = response.data.data;

    // Adapt user growth trend: backend returns {_id: "YYYY-MM-DD", users: count}
    const growth = charts.userGrowthTrend?.map(t => ({
      date: t._id,
      Signups: t.users,
      ActiveUsers: t.users // Use growth users count directly
    })) || [];

    // Adapt subscription distribution: backend returns {_id: "plan_slug", users: count}
    // We map this for compatibility with the view charts
    const subscriptions = charts.subscriptionDistribution?.map(d => ({
      name: d._id === 'pro' ? 'Pro Plan' : 'Free Tier',
      Active: d.users,
      Churned: 0 // TODO: Churn values are not tracked in the current dashboard database schema
    })) || [];

    return {
      growth,
      subscriptions
    };
  }
};
export default analyticsApi;
