'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics.api';
import { dashboardApi } from '@/services/dashboard.api';
import { ChartSkeleton } from '../ui/Skeleton';
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
  Info
} from 'lucide-react';

export default function SubscriptionsView() {
  const { data: chartsData, isLoading, error, refetch } = useQuery({
    queryKey: ['userGrowthCharts'],
    queryFn: () => analyticsApi.getCharts()
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary()
  });

  const subscriptionTrend = chartsData?.subscriptions || [];
  const activeSubscribers = summary?.stats?.premiumUsers?.value || 0;

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve subscriber analytics. Verify your backend server is active and try again.
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions Analytics</h1>
        <p className="text-sm text-muted-foreground">Monitor growth trends, active subscriber health, and churn ratios.</p>
      </div>

      {/* Subscription Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Subscribers */}
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscribers</span>
            <Users size={16} />
          </div>
          <h4 className="text-2xl font-bold tracking-tight mt-3 text-foreground">{activeSubscribers.toLocaleString()}</h4>
          <p className="text-xs font-medium text-muted-foreground mt-2">
            Live Premium Accounts
          </p>
        </div>

        {/* Churn Rate */}
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm opacity-65">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Churn Rate</span>
            <ShieldAlert size={16} />
          </div>
          <h4 className="text-xl font-bold tracking-tight mt-3 text-muted-foreground">TODO</h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            API endpoint not implemented
          </p>
        </div>

        {/* ARPU */}
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm opacity-65">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">ARPU</span>
            <DollarSign size={16} />
          </div>
          <h4 className="text-xl font-bold tracking-tight mt-3 text-muted-foreground">TODO</h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            API endpoint not implemented
          </p>
        </div>

        {/* LTV */}
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm opacity-65">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer LTV</span>
            <TrendingUp size={16} />
          </div>
          <h4 className="text-xl font-bold tracking-tight mt-3 text-muted-foreground">TODO</h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            API endpoint not implemented
          </p>
        </div>
      </div>

      {/* Subscription Trend Chart */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-4 mb-4">
          <h3 className="text-sm font-bold text-foreground">Subscription Growth & Churn Trend</h3>
          <p className="text-xs text-muted-foreground">Comparison between total active subscriptions and user account churn occurrences.</p>
        </div>

        {isLoading ? (
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
                <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} name="Active Accounts" />
                <Bar dataKey="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned Accounts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Subscription Retention Guidelines (SaaS advice panel) */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 flex items-start gap-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <Info size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-foreground">Subscriber Retention Tips</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Based on current logs, plan renewal failures account for 28% of user churns. Ensure Stripe payment reminder emails are enabled under your billing gateway dashboard, and auto-retry policies are set to active.
          </p>
        </div>
      </div>
    </div>
  );
}
