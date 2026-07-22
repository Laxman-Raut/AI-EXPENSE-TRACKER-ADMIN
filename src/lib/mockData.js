// Mock Data Generator for SaaS Admin Dashboard

// Generates date strings
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const getPastMonths = (count) => {
  const currentMonthIdx = new Date().getMonth();
  const list = [];
  for (let i = count - 1; i >= 0; i--) {
    let idx = currentMonthIdx - i;
    if (idx < 0) idx += 12;
    list.push(MONTHS[idx]);
  }
  return list;
};

// Raw stats
export const mockOverviewStats = {
  totalUsers: { value: 12845, growth: 12.3, label: 'Total Users' },
  verifiedUsers: { value: 11230, growth: 8.1, label: 'Verified Users' },
  premiumUsers: { value: 4120, growth: 24.5, label: 'Premium Users' },
  freeUsers: { value: 8725, growth: 5.2, label: 'Free Users' },
  todayUsers: { value: 142, growth: 8.3, label: "Today's Signups" },
  monthlyUsers: { value: 9320, growth: 15.4, label: 'Monthly Active Users' },
  totalRevenue: { value: 248390, growth: 18.2, label: 'Total Revenue' },
  todayRevenue: { value: 1840, growth: 12.0, label: "Today's Revenue" },
  monthlyRevenue: { value: 42150, growth: 9.8, label: 'Monthly Recurring Revenue' },
  pendingPayments: { value: 18, growth: -5.4, label: 'Pending Payments' },
  activePlans: { value: 3, growth: 0.0, label: 'Active Subscription Plans' }
};

// Stats mini sparklines data (last 10 points)
export const mockSparklines = {
  totalUsers: [11200, 11350, 11500, 11700, 11900, 12100, 12300, 12500, 12700, 12845],
  verifiedUsers: [9800, 9950, 10100, 10300, 10450, 10600, 10800, 10950, 11100, 11230],
  premiumUsers: [3200, 3300, 3410, 3500, 3620, 3750, 3880, 3950, 4040, 4120],
  freeUsers: [8000, 8050, 8090, 8200, 8280, 8350, 8420, 8550, 8660, 8725],
  todayUsers: [95, 110, 80, 125, 130, 95, 150, 120, 135, 142],
  monthlyUsers: [7800, 8020, 8250, 8400, 8600, 8820, 8950, 9100, 9220, 9320],
  totalRevenue: [210000, 214000, 219000, 224000, 228000, 233000, 238000, 242000, 245000, 248390],
  todayRevenue: [1200, 1450, 980, 1600, 2100, 1300, 1750, 1900, 1550, 1840],
  monthlyRevenue: [38000, 38500, 39200, 39900, 40300, 41100, 41500, 41800, 42000, 42150],
  pendingPayments: [25, 22, 20, 24, 18, 15, 21, 19, 17, 18],
  activePlans: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
};

// Monthly Revenue Trend (12 Months)
export const generateRevenueTrend = () => {
  const months = getPastMonths(12);
  const baseValues = [15000, 17000, 19000, 22000, 24000, 26000, 29000, 32000, 35000, 38000, 40000, 42150];
  
  return months.map((month, idx) => {
    const total = baseValues[idx];
    const Basic = Math.round(total * 0.25);
    const Pro = Math.round(total * 0.50);
    const Enterprise = Math.round(total * 0.25);
    return { name: month, Basic, Pro, Enterprise, Total: total };
  });
};

// User Signups & MAU Growth (last 30 days)
export const generateUserGrowth = () => {
  const list = [];
  let baseSignups = 100;
  for (let i = 29; i >= 0; i--) {
    const date = getPastDate(i);
    // Add random noise
    const dailySignups = Math.round(baseSignups + Math.random() * 40 - 20);
    list.push({
      date,
      Signups: dailySignups,
      ActiveUsers: Math.round(8000 + (30 - i) * 44 + Math.random() * 100)
    });
    baseSignups += 1;
  }
  return list;
};

// Subscription Active vs Churned
export const generateSubscriptionGrowth = () => {
  const months = getPastMonths(6);
  const activeBase = [3200, 3400, 3600, 3800, 3950, 4120];
  const churnBase = [60, 75, 55, 90, 80, 70];
  
  return months.map((month, idx) => ({
    name: month,
    Active: activeBase[idx],
    Churned: churnBase[idx]
  }));
};

// Revenue by Plan
export const mockRevenueByPlan = [
  { name: 'Basic ($9/mo)', value: 10537, color: '#6366f1' },
  { name: 'Pro ($19/mo)', value: 21075, color: '#10b981' },
  { name: 'Enterprise ($49/mo)', value: 10538, color: '#f59e0b' }
];

// Recent Users
export const mockRecentUsers = [
  { id: 'usr_1', name: 'Sarah Connor', email: 'sarah.c@sky.net', subscription: 'Pro Plan', status: 'Active', joinedDate: '2026-07-21', avatar: 'SC' },
  { id: 'usr_2', name: 'Alex Mercer', email: 'mercer@gentek.org', subscription: 'Enterprise Plan', status: 'Active', joinedDate: '2026-07-20', avatar: 'AM' },
  { id: 'usr_3', name: 'Bruce Wayne', email: 'bruce@wayne.co', subscription: 'Enterprise Plan', status: 'Active', joinedDate: '2026-07-20', avatar: 'BW' },
  { id: 'usr_4', name: 'Jane Doe', email: 'jane.doe@gmail.com', subscription: 'Basic Plan', status: 'Active', joinedDate: '2026-07-19', avatar: 'JD' },
  { id: 'usr_5', name: 'Peter Parker', email: 'peter@dailybugle.com', subscription: 'Free Tier', status: 'Active', joinedDate: '2026-07-18', avatar: 'PP' },
  { id: 'usr_6', name: 'Tony Stark', email: 'tony@stark.industries', subscription: 'Enterprise Plan', status: 'Active', joinedDate: '2026-07-17', avatar: 'TS' },
  { id: 'usr_7', name: 'Wanda Maximoff', email: 'wanda@westview.gov', subscription: 'Pro Plan', status: 'Pending', joinedDate: '2026-07-16', avatar: 'WM' },
  { id: 'usr_8', name: 'Arthur Dent', email: 'dent.a@hitchhiker.org', subscription: 'Free Tier', status: 'Suspended', joinedDate: '2026-07-15', avatar: 'AD' },
  { id: 'usr_9', name: 'Clark Kent', email: 'clark@dailyplanet.com', subscription: 'Basic Plan', status: 'Active', joinedDate: '2026-07-14', avatar: 'CK' },
  { id: 'usr_10', name: 'Natasha Romanoff', email: 'natasha@shield.gov', subscription: 'Pro Plan', status: 'Active', joinedDate: '2026-07-13', avatar: 'NR' }
];

// Extensive Users Database for pagination/filtering tests
export const generateUsersDb = () => {
  const users = [...mockRecentUsers];
  const names = [
    'Hal Jordan', 'Barry Allen', 'Oliver Queen', 'Diana Prince', 'Arthur Curry',
    'Reed Richards', 'Sue Storm', 'Johnny Storm', 'Ben Grimm', 'Charles Xavier',
    'Logan Howlett', 'Scott Summers', 'Jean Grey', 'Oren Ishii', 'Beatrix Kiddo',
    'Bill Gates', 'Steve Jobs', 'Linus Torvalds', 'Ada Lovelace', 'Alan Turing'
  ];
  const domains = ['example.com', 'startup.io', 'tech.org', 'corp.com', 'workspace.net'];
  const plans = ['Free Tier', 'Basic Plan', 'Pro Plan', 'Enterprise Plan'];
  const statuses = ['Active', 'Active', 'Active', 'Pending', 'Suspended'];

  for (let i = 0; i < 40; i++) {
    const name = names[i % names.length] + ' ' + String.fromCharCode(65 + (i % 26)) + '.';
    const email = name.toLowerCase().replace(/[^a-z]/g, '') + '@' + domains[i % domains.length];
    const subscription = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const date = getPastDate(10 + i);
    const initials = name.split(' ').map(n => n[0]).join('');

    users.push({
      id: `usr_${11 + i}`,
      name,
      email,
      subscription,
      status,
      joinedDate: date,
      avatar: initials
    });
  }
  return users;
};

// Recent Payments
export const mockRecentPayments = [
  { id: 'pay_1', user: 'Bruce Wayne', email: 'bruce@wayne.co', amount: 49.00, provider: 'Stripe', status: 'Success', plan: 'Enterprise Plan', date: '2026-07-21 12:04' },
  { id: 'pay_2', user: 'Alex Mercer', email: 'mercer@gentek.org', amount: 49.00, provider: 'Stripe', status: 'Success', plan: 'Enterprise Plan', date: '2026-07-21 11:42' },
  { id: 'pay_3', user: 'Tony Stark', email: 'tony@stark.industries', amount: 49.00, provider: 'Stripe', status: 'Success', plan: 'Enterprise Plan', date: '2026-07-21 09:15' },
  { id: 'pay_4', user: 'Jane Doe', email: 'jane.doe@gmail.com', amount: 9.00, provider: 'PayPal', status: 'Success', plan: 'Basic Plan', date: '2026-07-21 08:30' },
  { id: 'pay_5', user: 'Sarah Connor', email: 'sarah.c@sky.net', amount: 19.00, provider: 'Stripe', status: 'Success', plan: 'Pro Plan', date: '2026-07-20 18:22' },
  { id: 'pay_6', user: 'Wanda Maximoff', email: 'wanda@westview.gov', amount: 19.00, provider: 'Stripe', status: 'Pending', plan: 'Pro Plan', date: '2026-07-20 15:40' },
  { id: 'pay_7', user: 'Clark Kent', email: 'clark@dailyplanet.com', amount: 9.00, provider: 'PayPal', status: 'Success', plan: 'Basic Plan', date: '2026-07-20 11:10' },
  { id: 'pay_8', user: 'Natasha Romanoff', email: 'natasha@shield.gov', amount: 19.00, provider: 'Stripe', status: 'Success', plan: 'Pro Plan', date: '2026-07-19 22:50' },
  { id: 'pay_9', user: 'Lex Luthor', email: 'lex@lexcorp.com', amount: 49.00, provider: 'Stripe', status: 'Failed', plan: 'Enterprise Plan', date: '2026-07-19 14:15' },
  { id: 'pay_10', user: 'Peter Parker', email: 'peter@dailybugle.com', amount: 0.00, provider: 'None', status: 'Success', plan: 'Free Tier', date: '2026-07-19 09:00' }
];

// Extensive Payments Database
export const generatePaymentsDb = () => {
  const payments = [...mockRecentPayments];
  const users = generateUsersDb();
  const providers = ['Stripe', 'Stripe', 'PayPal', 'Stripe'];
  const statuses = ['Success', 'Success', 'Success', 'Pending', 'Failed'];
  const planCosts = {
    'Free Tier': 0,
    'Basic Plan': 9,
    'Pro Plan': 19,
    'Enterprise Plan': 49
  };

  for (let i = 0; i < 50; i++) {
    const user = users[(i + 5) % users.length];
    if (user.subscription === 'Free Tier') continue;
    
    const provider = providers[i % providers.length];
    const status = statuses[i % statuses.length];
    const amount = planCosts[user.subscription] || 19;
    const date = getPastDate(1 + Math.floor(i / 2)) + ' ' + String(10 + (i % 12)).padStart(2, '0') + ':' + String(10 + (i % 50)).padStart(2, '0');

    payments.push({
      id: `pay_${11 + i}`,
      user: user.name,
      email: user.email,
      amount,
      provider,
      status,
      plan: user.subscription,
      date
    });
  }
  return payments;
};

// AI Usage Data
export const mockAiUsageTrend = [
  { date: getPastDate(6), Queries: 1240, Cost: 2.48 },
  { date: getPastDate(5), Queries: 1450, Cost: 2.90 },
  { date: getPastDate(4), Queries: 1100, Cost: 2.20 },
  { date: getPastDate(3), Queries: 1650, Cost: 3.30 },
  { date: getPastDate(2), Queries: 1890, Cost: 3.78 },
  { date: getPastDate(1), Queries: 2100, Cost: 4.20 },
  { date: getPastDate(0), Queries: 2450, Cost: 4.90 }
];

export const mockAiModelDistribution = [
  { name: 'GPT-4o', value: 58, color: '#6366f1' },
  { name: 'Claude 3.5 Sonnet', value: 27, color: '#10b981' },
  { name: 'Gemini 1.5 Pro', value: 15, color: '#f59e0b' }
];

export const mockAiLatencyData = [
  { name: '0-200ms', count: 420 },
  { name: '200-500ms', count: 1250 },
  { name: '500-1000ms', count: 680 },
  { name: '1s-2s', count: 240 },
  { name: '2s+', count: 80 }
];

// System logs/notifications
export const mockNotifications = [
  { id: 'not_1', type: 'payment', text: 'New Enterprise subscription received from Bruce Wayne', time: '5m ago', read: false },
  { id: 'not_2', type: 'system', text: 'AI Endpoint latency peaked above threshold (2.4s)', time: '12m ago', read: false },
  { id: 'not_3', type: 'user', text: 'User Alexander Mercer verified their email', time: '1h ago', read: true },
  { id: 'not_4', type: 'payment', text: 'Stripe webhook: Subscription renewal failed for user usr_42', time: '4h ago', read: true },
  { id: 'not_5', type: 'system', text: 'Daily database backup successfully completed', time: '6h ago', read: true }
];
