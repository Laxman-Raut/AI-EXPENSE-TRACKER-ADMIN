'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/services/plans.api';
import { dashboardApi } from '@/services/dashboard.api';
import { ChartSkeleton } from '../ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Layers, ShieldCheck, Zap, Server, Shield, ShieldAlert, ChevronRight, Trash2, Settings } from 'lucide-react';
import Dialog from '../ui/Dialog';

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
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Form states for configuration
  const [chatbotLimit, setChatbotLimit] = useState(0);
  const [receiptScannerLimit, setReceiptScannerLimit] = useState(0);
  const [voiceScannerLimit, setVoiceScannerLimit] = useState(0);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);

  const { data: plans = [], isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useQuery({
    queryKey: ['plansList'],
    queryFn: () => plansApi.getPlans()
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary()
  });

  const updateLimitsMutation = useMutation({
    mutationFn: ({ id, limits }) => plansApi.updateLimits(id, limits),
    onSuccess: () => {
      queryClient.invalidateQueries(['plansList']);
      alert('Plan limits updated successfully.');
      setSelectedPlan(null);
    },
    onError: (err) => alert(err.message || 'Failed to update plan limits.')
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => plansApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['plansList']);
      alert('Plan deleted successfully.');
    },
    onError: (err) => alert(err.message || 'Failed to delete plan.')
  });

  const handleConfigureLimits = (plan) => {
    setSelectedPlan(plan);
    setChatbotLimit(plan.limits?.chatbotLimit || 0);
    setReceiptScannerLimit(plan.limits?.receiptScannerLimit || 0);
    setVoiceScannerLimit(plan.limits?.voiceScannerLimit || 0);
    setGracePeriodDays(plan.limits?.gracePeriodDays || 7);
  };

  const handleSaveLimits = (e) => {
    e.preventDefault();
    if (!selectedPlan?._id) return;
    updateLimitsMutation.mutate({
      id: selectedPlan._id,
      limits: {
        chatbotLimit,
        receiptScannerLimit,
        voiceScannerLimit,
        gracePeriodDays
      }
    });
  };

  const chartData = summary?.pie || [];
  const isLoading = plansLoading || summaryLoading;

  if (plansError) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve subscription plans. Verify your backend is running.
        </p>
        <button 
          onClick={() => refetchPlans()} 
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the pricing plan "${plan.name}"?`)) {
                          deletePlanMutation.mutate(plan._id);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                </div>
                
                {/* Pricing info */}
                <div className="mt-4 flex items-baseline text-foreground">
                  <span className="text-3xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">/{frequencyLabel}</span>
                </div>
                
                <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                
                {/* Limits list */}
                <div className="mt-4 p-2.5 bg-muted/40 border border-border rounded-lg text-[10px] space-y-1">
                  <p className="font-bold text-foreground mb-1 text-[11px]">Plan Quota Limits:</p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Chatbot Queries:</span> <span className="font-bold text-foreground">{plan.limits?.chatbotLimit || 'No limit'}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Receipt Scans:</span> <span className="font-bold text-foreground">{plan.limits?.receiptScannerLimit || 'No limit'}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Voice Scanner:</span> <span className="font-bold text-foreground">{plan.limits?.voiceScannerLimit || 'No limit'}</span></p>
                  <p className="flex justify-between"><span className="text-muted-foreground">Grace Days:</span> <span className="font-bold text-foreground">{plan.limits?.gracePeriodDays || 7} days</span></p>
                </div>

                {/* Feature List */}
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
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
                  onClick={() => handleConfigureLimits(plan)}
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

      {/* Configure Limits Dialog */}
      <Dialog 
        isOpen={!!selectedPlan} 
        onClose={() => setSelectedPlan(null)}
        title={`Configure Limits - ${selectedPlan?.name || ''}`}
      >
        {selectedPlan && (
          <form onSubmit={handleSaveLimits} className="space-y-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Chatbot Queries Limit</label>
              <input
                type="number"
                value={chatbotLimit}
                onChange={(e) => setChatbotLimit(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                required
              />
              <span className="text-[10px] text-muted-foreground">Set to 0 for unlimited or specify maximum monthly AI chat questions.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Receipt Scanner Scan Limit</label>
              <input
                type="number"
                value={receiptScannerLimit}
                onChange={(e) => setReceiptScannerLimit(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                required
              />
              <span className="text-[10px] text-muted-foreground">Set to 0 for unlimited or specify maximum monthly scan actions.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Voice Scanner limit</label>
              <input
                type="number"
                value={voiceScannerLimit}
                onChange={(e) => setVoiceScannerLimit(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                required
              />
              <span className="text-[10px] text-muted-foreground">Set to 0 for unlimited or specify maximum monthly voice uploads.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground">Grace Period (Days)</label>
              <input
                type="number"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min="1"
                required
              />
              <span className="text-[10px] text-muted-foreground">Number of days allowed for late payment before subscription expires.</span>
            </div>

            <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={updateLimitsMutation.isPending}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-semibold transition-colors disabled:opacity-50"
              >
                Save Configuration
              </button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
