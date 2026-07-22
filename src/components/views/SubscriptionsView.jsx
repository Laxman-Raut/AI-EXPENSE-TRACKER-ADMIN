'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics.api';
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
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

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
  const { data: chartsData, isLoading: chartsLoading, error: chartsError, refetch } = useQuery({
    queryKey: ['userGrowthCharts'],
    queryFn: () => analyticsApi.getCharts()
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary()
  });

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['subscriptionMetrics'],
    queryFn: () => subscriptionsApi.getMetrics(),
  });

  const subscriptionTrend = chartsData?.subscriptions || [];
  const activeSubscribers  = summary?.stats?.premiumUsers?.value || 0;

  if (chartsError) {
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

      {/* Subscription Trend Chart */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-4 mb-4">
          <h3 className="text-sm font-bold text-foreground">Subscription Growth & Churn Trend</h3>
          <p className="text-xs text-muted-foreground">
            Comparison between total active subscriptions and user account churn occurrences.
          </p>
        </div>

        {chartsLoading ? (
          <ChartSkeleton />
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
                <Bar dataKey="Active"  fill="#10b981" radius={[4, 4, 0, 0]} name="Active Accounts" />
                <Bar dataKey="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned Accounts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
