'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { subscriptionsApi } from '@/services/subscriptions.api';
import { ChartSkeleton, StatCardSkeleton } from '../ui/Skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  DollarSign,
  Info,
  RefreshCcw,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const STATUS_STYLE = {
  active:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  expired: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  cancelled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const STATUS_ICON = {
  active: CheckCircle2,
  pending: Clock,
  expired: XCircle,
  cancelled: XCircle,
};

// ─── Metric Card ────────────────────────────────────────────────
function MetricCard({ label, value, subLabel, icon: Icon, iconClass, isLoading, error }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm ${error ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Icon size={16} className={iconClass} />
      </div>
      {isLoading ? (
        <div className="mt-3 h-7 w-24 rounded-md bg-muted animate-pulse" />
      ) : error ? (
        <h4 className="text-sm font-bold tracking-tight mt-3 text-rose-500">Error</h4>
      ) : (
        <h4 className="text-2xl font-bold tracking-tight mt-3 text-foreground">{value}</h4>
      )}
      <p className="text-xs font-medium text-muted-foreground mt-2">{subLabel}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function SubscriptionsView() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary()
  });

  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch } = useQuery({
    queryKey: ['subscriptionMetrics'],
    queryFn: () => subscriptionsApi.getMetrics(),
  });

  const { data: subsData, isLoading: subsLoading, error: subsError } = useQuery({
    queryKey: ['subscriptionsList', page, statusFilter, planFilter],
    queryFn: () => subscriptionsApi.getSubscriptions({ page, limit: 8, status: statusFilter, plan: planFilter }),
    keepPreviousData: true,
  });

  // Real 6-month trend from backend
  const subscriptionTrend = metrics?.monthlyTrend || [];
  const activeSubscribers  = summary?.stats?.premiumUsers?.value || 0;

  if (metricsError && subsError) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve subscriber analytics. Verify your backend is running.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-md shadow-primary/10"
        >
          <RefreshCcw size={13} className="inline mr-1.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Monitor growth trends, active subscriber health, and SaaS metrics.
        </p>
      </div>

      {/* Subscription Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Active Subscribers — from dashboard summary */}
        <MetricCard
          label="Active Subscribers"
          value={activeSubscribers.toLocaleString()}
          subLabel="Live Premium Accounts"
          icon={Users}
          iconClass="text-violet-500"
          isLoading={!summary}
        />

        {/* Monthly Churn Rate */}
        <MetricCard
          label="Monthly Churn Rate"
          value={`${metrics?.churnRate ?? 0}%`}
          subLabel={`${metrics?.churnedThisMonth ?? 0} cancellations this month`}
          icon={TrendingDown}
          iconClass={metrics?.churnRate > 5 ? 'text-rose-500' : 'text-emerald-500'}
          isLoading={metricsLoading}
          error={!!metricsError}
        />

        {/* ARPU */}
        <MetricCard
          label="ARPU"
          value={fmt(metrics?.arpu)}
          subLabel={`Avg. revenue across ${metrics?.totalPayingUsers ?? 0} paying users`}
          icon={DollarSign}
          iconClass="text-sky-500"
          isLoading={metricsLoading}
          error={!!metricsError}
        />

        {/* Customer LTV */}
        <MetricCard
          label="Customer LTV"
          value={fmt(metrics?.ltv)}
          subLabel={`Avg. ${metrics?.avgSubscriptionMonths ?? 0} months subscription`}
          icon={TrendingUp}
          iconClass="text-amber-500"
          isLoading={metricsLoading}
          error={!!metricsError}
        />
      </div>

      {/* Extra context row */}
      {!metricsLoading && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(metrics.totalRevenue) },
            { label: 'Paying Users', value: metrics.totalPayingUsers?.toLocaleString() ?? 0 },
            { label: 'Churned This Month', value: metrics.churnedThisMonth ?? 0 },
            { label: 'Avg. Sub Duration', value: `${metrics.avgSubscriptionMonths ?? 0} mo` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Trend Chart — Real 6-month data */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-4 mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Subscription Growth & Churn Trend</h3>
            <p className="text-xs text-muted-foreground">
              6-month comparison of active paid subscribers vs. churn events from the database.
            </p>
          </div>
          {metricsLoading && <div className="h-4 w-20 rounded bg-muted animate-pulse" />}
        </div>

        {metricsLoading ? (
          <ChartSkeleton />
        ) : subscriptionTrend.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No subscription trend data available yet.</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                <Bar dataKey="Active"  fill="#10b981" radius={[4, 4, 0, 0]} name="Active Subscribers" />
                <Bar dataKey="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned This Month" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Real Subscriptions Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">All Subscriptions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live user subscription records from database.</p>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {['All', 'Active', 'Pending', 'Expired'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {['All', 'Free Tier', 'Pro Plan'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {subsLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : subsError ? (
          <div className="p-10 text-center text-xs text-muted-foreground">
            Could not load subscriptions. Check backend connection.
          </div>
        ) : subsData?.subscriptions?.length === 0 ? (
          <div className="p-10 text-center text-xs text-muted-foreground">
            No subscriptions found matching selected filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Start Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">End Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {(subsData?.subscriptions || []).map((sub) => {
                    const status = sub.subscription?.status || 'unknown';
                    const statusStyle = STATUS_STYLE[status] || 'bg-muted text-muted-foreground border-border';
                    const StatusIcon = STATUS_ICON[status] || Clock;
                    const endDate = sub.subscription?.endDate
                      ? new Date(sub.subscription.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';
                    const startDate = sub.subscription?.startDate
                      ? new Date(sub.subscription.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';
                    const planLabel = sub.subscription?.plan === 'free' ? 'Free Tier'
                      : sub.subscription?.plan === 'pro' ? 'Pro Plan'
                      : sub.subscription?.plan === 'basic' ? 'Basic Plan'
                      : (sub.subscription?.plan || '—');

                    return (
                      <tr key={sub._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center border border-primary/20 shrink-0">
                              {sub.fullName ? sub.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground leading-none">{sub.fullName || 'Unknown'}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{sub.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground capitalize">{planLabel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle}`}>
                            <StatusIcon size={9} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{startDate}</td>
                        <td className="px-4 py-3 text-muted-foreground">{endDate}</td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-muted-foreground">{sub.subscription?.provider || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {subsData?.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Page {subsData.page} of {subsData.totalPages} · {subsData.total} total records
                </p>
                <div className="flex gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-7 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={page >= subsData.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="h-7 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Retention Tips */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 flex items-start gap-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <Info size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-foreground">Subscriber Retention Tips</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            A churn rate below 5% is considered healthy for SaaS products. Proactively reach out to users approaching their subscription end date, and consider offering grace extensions to reduce involuntary churn from payment failures.
          </p>
        </div>
      </div>
    </div>
  );
}
