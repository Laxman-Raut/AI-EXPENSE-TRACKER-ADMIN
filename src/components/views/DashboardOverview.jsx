'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { useCurrency } from '@/hooks/useCurrency';
import StatCard from '../ui/StatCard';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../ui/Skeleton';
import Dialog from '../ui/Dialog';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  CalendarRange, 
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DashboardOverview({ onViewChange }) {
  const { symbol, formatAmount, convertAmount } = useCurrency();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch dashboard summary from backend
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve administration stats. Verify your backend server is active and try again.
        </p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-md shadow-primary/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const stats = summary?.stats;
  const sparklines = summary?.sparklines;
  const trend = summary?.trend || [];
  const pie = summary?.pie || [];
  const latestUsers = summary?.latestUsers || [];
  const latestPayments = summary?.latestPayments || [];

  // Render stats cards grid
  const renderStats = () => {
    if (isLoading || !stats) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.value}
          growth={stats.totalUsers.growth}
          icon={Users}
          sparkline={sparklines.totalUsers}
        />
        <StatCard
          title="Monthly Active Users"
          value={stats.monthlyUsers.value}
          growth={stats.monthlyUsers.growth}
          icon={TrendingUp}
          sparkline={sparklines.monthlyUsers}
        />
        <StatCard
          title="Total Revenue"
          value={convertAmount(stats.totalRevenue.value)}
          growth={stats.totalRevenue.growth}
          icon={CreditCard}
          prefix={symbol}
          sparkline={sparklines.totalRevenue}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={convertAmount(stats.monthlyRevenue.value)}
          growth={stats.monthlyRevenue.growth}
          icon={CalendarRange}
          prefix={symbol}
          sparkline={sparklines.monthlyRevenue}
        />
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Failed':
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  // Date formatting
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome banner */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back, Admin</h1>
          <p className="text-sm text-muted-foreground">Here is what is happening with your SaaS metrics today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-card border border-border px-3.5 py-2 rounded-xl shadow-sm self-start">
          <Clock size={14} className="text-primary shrink-0" />
          <span>{today}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {renderStats()}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly growth distribution per pricing plan tier.</p>
            </div>
            <button 
              onClick={() => onViewChange('analytics')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Detailed Analytics <ChevronRight size={14} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-sm text-muted-foreground animate-pulse">Loading charts...</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBusiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tickFormatter={(val) => `${symbol}${val}`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      color: 'var(--color-foreground)',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="Basic Plan" stackId="1" stroke="#6366f1" fillOpacity={1} fill="url(#colorBasic)" />
                  <Area type="monotone" dataKey="Pro Plan" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorPro)" />
                  <Area type="monotone" dataKey="Business Plan" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBusiness)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plan Distribution Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="text-sm font-bold text-foreground">Revenue by Plan</h3>
            <p className="text-xs text-muted-foreground">Plan distributions for current monthly recurring revenue.</p>
          </div>
          
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <span className="text-sm text-muted-foreground animate-pulse">Loading plans...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${formatAmount(val)}`, 'Monthly Income']}
                      contentStyle={{
                        backgroundColor: 'var(--color-popover)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '10px',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">MRR</span>
                  <span className="text-lg font-bold">{formatAmount(stats?.monthlyRevenue.value || 0)}</span>
                </div>
              </div>

              {/* Legends */}
              <div className="mt-4 w-full grid grid-cols-2 gap-2">
                {pie.map((entry, index) => (
                  <div key={`${entry.name}-${index}`} className="flex flex-col items-center text-center p-1.5 rounded-lg bg-muted/20 border border-border/50">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground truncate max-w-full">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{formatAmount(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lists Row: Recent Users + Recent Payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Users</h3>
              <p className="text-xs text-muted-foreground">Latest sign-ups registered on the platform.</p>
            </div>
            <button 
              onClick={() => onViewChange('users')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Manage Users <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">Subscription</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {latestUsers.map((user) => (
                    <tr 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-muted/30 cursor-pointer group transition-colors"
                    >
                      <td className="py-3 flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/20">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{user.subscription}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{user.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
              <p className="text-xs text-muted-foreground">Latest financial receipts handled by gateways.</p>
            </div>
            <button 
              onClick={() => onViewChange('payments')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Ledger <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Gateway</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {latestPayments.map((payment) => (
                    <tr 
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className="hover:bg-muted/30 cursor-pointer group transition-colors"
                    >
                      <td className="py-3">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{payment.user}</p>
                        <p className="text-[10px] text-muted-foreground">{payment.email}</p>
                      </td>
                      <td className="py-3 font-bold text-foreground">{formatAmount(payment.amount)}</td>
                      <td className="py-3 text-muted-foreground">{payment.provider}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for User Details */}
      <Dialog 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)}
        title="User Record details"
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                {selectedUser.avatar}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base">{selectedUser.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subscription Tier</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedUser.subscription}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Status</span>
                <p className="mt-0.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Member Since</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedUser.joinedDate}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">User Reference ID</span>
                <p className="font-mono text-xs text-foreground mt-0.5">{selectedUser.id}</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
              <button 
                onClick={() => {
                  alert(`Logs opened for user ${selectedUser.id}`);
                  setSelectedUser(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-xs font-semibold transition-colors"
              >
                <ExternalLink size={12} />
                Inspect Full Logs
              </button>
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog for Payment Details */}
      <Dialog 
        isOpen={!!selectedPayment} 
        onClose={() => setSelectedPayment(null)}
        title="Transaction Details"
      >
        {selectedPayment && (
          <div className="space-y-4 text-sm">
            <div className="pb-4 border-b border-border flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Receipt Amount</span>
                <h4 className="font-bold text-foreground text-2xl mt-0.5">{formatAmount(selectedPayment.amount)}</h4>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedPayment.status)}`}>
                {selectedPayment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Account Holder</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.user}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedPayment.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.provider}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subscription Plan</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.plan}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Created Date</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.date}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Transaction Reference ID</span>
                <p className="font-mono text-xs text-foreground mt-0.5">{selectedPayment.id}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
              <button 
                onClick={() => {
                  alert(`Refunding transaction ${selectedPayment.id}...`);
                  setSelectedPayment(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold transition-colors"
                disabled={selectedPayment.status !== 'Success'}
              >
                Issue Refund
              </button>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
