'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { plansApi } from '@/services/plans.api';
import { dashboardApi } from '@/services/dashboard.api';
import { ChartSkeleton } from '../ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Layers, ShieldCheck, Zap, Server, Shield, ShieldAlert, ChevronRight } from 'lucide-react';

const ICON_MAP = {
  server: Server,
  layers: Layers,
  zap: Zap,
  shield: ShieldAlert,
  crown: Zap
};

const COLOR_MAP = {
  free: 'text-slate-500 bg-slate-500/10',
  basic: 'text-indigo-500 bg-indigo-500/10',
  pro: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 shadow-emerald-500/5',
  enterprise: 'text-amber-500 bg-amber-500/10'
};

export default function PlansView() {
  const { data: plans = [], isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useQuery({
    queryKey: ['plansList'],
    queryFn: () => plansApi.getPlans()
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary()
  });

  const chartData = summary?.pie || [];
  const isLoading = plansLoading || summaryLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Subscription Plans</h1>
        <p className="text-sm text-muted-foreground">Manage service limits, pricing structure, and track revenue per tier.</p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = ICON_MAP[plan.icon] || Zap;
          const colorClass = COLOR_MAP[plan.slug] || 'text-slate-500 bg-slate-500/10';
          const frequencyLabel = plan.billingCycle === 'monthly' ? 'month' : (plan.billingCycle === 'yearly' ? 'year' : 'forever');
          
          return (
            <div 
              key={plan._id || plan.slug} 
              className={`rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col justify-between hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">{plan.name}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                </div>
                
                {/* Pricing info */}
                <div className="mt-4 flex items-baseline text-foreground">
                  <span className="text-3xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">/{frequencyLabel}</span>
                </div>
                
                <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                
                {/* Feature List */}
                <ul className="mt-5 space-y-2 border-t border-border pt-4">
                  {(plan.features || []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <span className="text-emerald-500 font-bold leading-none select-none mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => {
                    console.error(`[PlansView] Missing Endpoint: POST /v1/admin/plans/${plan._id || plan.slug}/limits`);
                    alert('Endpoint Not Found');
                  }}
                  className="w-full h-8 flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150"
                >
                  Configure Limits
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Graph & Distribution Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Distribution Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="border-b border-border pb-4 mb-4">
            <h3 className="text-sm font-bold text-foreground">Monthly Recurring Income per Plan</h3>
            <p className="text-xs text-muted-foreground">Overview of monthly revenue contributions across active plans.</p>
          </div>

          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip 
                    formatter={(val) => [`$${val.toLocaleString()}`, 'Monthly Income']}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-popover)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plan Configuration Panel */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-border pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground">Plan Controls</h3>
              <p className="text-xs text-muted-foreground">Adjust currency settings, discount coupons, and payment terms.</p>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="font-semibold text-muted-foreground">Global Currency</span>
                <span className="font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-lg border border-border">USD ($)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="font-semibold text-muted-foreground">Active Discount Codes</span>
                <span className="font-bold text-emerald-500">4 coupons</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="font-semibold text-muted-foreground">Grace Period Threshold</span>
                <span className="font-semibold text-foreground">7 business days</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-muted-foreground">Default Payment Gateway</span>
                <span className="font-bold text-primary">Stripe</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <button 
              onClick={() => {
                console.error('[PlansView] Missing Endpoint: POST /v1/admin/plans/new');
                alert('Endpoint Not Found');
              }}
              className="w-full h-9 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
            >
              Create New Plan Tier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
