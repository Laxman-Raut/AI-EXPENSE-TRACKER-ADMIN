'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics.api';
import { ChartSkeleton } from '../ui/Skeleton';
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
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, Users, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';

export default function AnalyticsView() {
  // Fetch charts data
  const { data: chartDataResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['userGrowthCharts'],
    queryFn: () => analyticsApi.getCharts()
  });

  const growthData = chartDataResponse?.growth || [];
  const subscriptionTrend = chartDataResponse?.subscriptions || [];

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve advanced analytics. Verify your backend server is active and try again.
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Advanced Analytics</h1>
        <p className="text-sm text-muted-foreground">Examine user onboarding rate, active user thresholds, and subscription metrics.</p>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Rate</span>
          <h4 className="text-xl font-bold mt-2 text-foreground">
            {isLoading ? 'Loading...' : (chartDataResponse?.advancedMetrics?.activeRate || '0.0%')}
          </h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            Based on active 30-day user visits
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Session Duration</span>
          <h4 className="text-xl font-bold mt-2 text-foreground">
            {isLoading ? 'Loading...' : (chartDataResponse?.advancedMetrics?.avgSessionDuration || '0m 0s')}
          </h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            Calculated via transaction frequency
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Retention (D30)</span>
          <h4 className="text-xl font-bold mt-2 text-foreground">
            {isLoading ? 'Loading...' : (chartDataResponse?.advancedMetrics?.d30Retention || '0.0%')}
          </h4>
          <p className="text-[10px] font-medium text-muted-foreground mt-2">
            30-day cohort retention rate
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily User Signups */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="text-sm font-bold text-foreground">Daily User Signups (30 Days)</h3>
            <p className="text-xs text-muted-foreground">Historical representation of new subscriber signups.</p>
          </div>

          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="Signups" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Accounts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Active Users (MAU) */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="text-sm font-bold text-foreground">Monthly Active Users (30 Days)</h3>
            <p className="text-xs text-muted-foreground">Historical tracking of unique accounts logging transactions.</p>
          </div>

          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line type="monotone" dataKey="ActiveUsers" stroke="#10b981" strokeWidth={2} dot={false} name="Active Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
