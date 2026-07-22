import apiClient from '@/lib/api';

export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get('/v1/admin/dashboard');
    const { cards, charts, recentActivity } = response.data.data;

    // Build real sparklines from the 7-day trends returned by the backend
    const revenueSpark = charts.revenueTrend?.map(t => t.revenue) || [0];
    const usersSpark = charts.userGrowthTrend?.map(t => t.users) || [0];

    // Adapt stats to frontend expected shape
    const stats = {
      totalUsers: { value: cards.users.total || 0, growth: 0.0, label: 'Total Users' },
      verifiedUsers: { value: cards.users.verified || 0, growth: 0.0, label: 'Verified Users' },
      premiumUsers: { value: cards.users.premium || 0, growth: 0.0, label: 'Premium Users' },
      freeUsers: { value: cards.users.free || 0, growth: 0.0, label: 'Free Users' },
      todayUsers: { value: cards.users.today || 0, growth: 0.0, label: "Today's Signups" },
      monthlyUsers: { value: cards.users.monthly || 0, growth: 0.0, label: 'Monthly Active Users' },
      totalRevenue: { value: cards.revenue.total || 0, growth: 0.0, label: 'Total Revenue' },
      todayRevenue: { value: cards.revenue.today || 0, growth: 0.0, label: "Today's Revenue" },
      monthlyRevenue: { value: cards.revenue.monthly || 0, growth: 0.0, label: 'Monthly Recurring Revenue' },
      pendingPayments: { value: cards.payments.pending || 0, growth: 0.0, label: 'Pending Payments' },
      activePlans: { value: cards.plans.active || 0, growth: 0.0, label: 'Active Plans' }
    };

    const sparklines = {
      totalUsers: usersSpark,
      verifiedUsers: usersSpark,
      premiumUsers: usersSpark,
      freeUsers: usersSpark,
      todayUsers: usersSpark,
      monthlyUsers: usersSpark,
      totalRevenue: revenueSpark,
      todayRevenue: revenueSpark,
      monthlyRevenue: revenueSpark,
      pendingPayments: [cards.payments.pending || 0],
      activePlans: [cards.plans.active || 0]
    };

    // Adapt charts
    // 1. Revenue trend: backend gives array of {_id: "YYYY-MM-DD", revenue: N}. Map to name, Basic, Pro, Enterprise, Total.
    const trend = charts.revenueTrend?.map(t => ({
      name: t._id,
      Total: t.revenue,
      Basic: 0, // TODO: Backend does not split daily trend by plan
      Pro: t.revenue, // Default everything as pro for visualization since basic is not split
      Enterprise: 0
    })) || [];

    // 2. Revenue by plan (Pie Chart): backend gives array of {_id: "plan_slug", revenue: N, payments: C}
    const colors = { pro: '#10b981', basic: '#6366f1', free: '#94a3b8' };
    const pie = charts.revenueByPlan?.map(p => ({
      name: p._id === 'pro' ? 'Pro Plan' : (p._id === 'basic' ? 'Basic Plan' : 'Free Tier'),
      value: p.revenue,
      color: colors[p._id] || '#6366f1'
    })) || [];

    // Adapt recentActivity tables
    const latestUsers = recentActivity.latestUsers?.map(u => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      subscription: u.subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Tier',
      status: u.subscription?.status === 'active' ? 'Active' : 'Inactive',
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      avatar: u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    })) || [];

    const latestPayments = recentActivity.latestPayments?.map(p => ({
      id: p._id,
      user: p.userId?.fullName || 'Unknown User',
      email: p.userId?.email || '',
      amount: p.amount || 0,
      provider: p.provider || 'Gateway',
      status: p.status === 'success' ? 'Success' : (p.status === 'pending' ? 'Pending' : 'Failed'),
      plan: p.plan || 'Subscription',
      date: p.paidAt ? new Date(p.paidAt).toLocaleString() : new Date(p.createdAt).toLocaleString()
    })) || [];

    return {
      stats,
      sparklines,
      trend,
      pie,
      latestUsers,
      latestPayments
    };
  }
};
export default dashboardApi;
