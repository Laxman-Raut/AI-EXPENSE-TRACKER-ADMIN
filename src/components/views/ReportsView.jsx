'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/reports.api';
import { useCurrency } from '@/hooks/useCurrency';
import { ChartSkeleton } from '../ui/Skeleton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, TrendingDown, ShieldAlert,
  RefreshCcw, Activity, CreditCard, FileText, CheckCircle2, Clock, XCircle, Download,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────
const PLAN_COLORS = { pro: '#10b981', basic: '#6366f1', free: '#94a3b8', pro_monthly: '#10b981', pro_yearly: '#0ea5e9' };
const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const PAYMENT_STATUS_STYLE = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  failed:  'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

// ─── KPI Card ───────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconClass, growth }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={16} className={iconClass} />
      </div>
      <h4 className="text-2xl font-bold tracking-tight mt-3 text-foreground">{value}</h4>
      <div className="flex items-center gap-1.5 mt-2">
        <p className="text-xs text-muted-foreground">{sub}</p>
        {growth !== undefined && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────
function Section({ title, desc, children, isLoading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="border-b border-border pb-4 mb-5">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {isLoading ? <ChartSkeleton /> : children}
    </div>
  );
}

// ─── CSV Download Helper ────────────────────────────────────────
const downloadCSV = (filename, rows, headers) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Main ───────────────────────────────────────────────────────
export default function ReportsView() {
  const { symbol, currency, formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('');
  const currentYear = new Date().getFullYear();

  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch } = useQuery({
    queryKey: ['reportsSummary'],
    queryFn: () => reportsApi.getSummary(),
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['reportsRevenue', currentYear],
    queryFn: () => reportsApi.getRevenue(currentYear),
    enabled: activeTab === 'overview' || activeTab === 'revenue',
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['reportsUsers'],
    queryFn: () => reportsApi.getUsers(),
    enabled: activeTab === 'overview' || activeTab === 'users',
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['reportsSubscriptions'],
    queryFn: () => reportsApi.getSubscriptions(),
    enabled: activeTab === 'overview' || activeTab === 'subscriptions',
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['reportsPayments', paymentPage, paymentStatus],
    queryFn: () => reportsApi.getPayments({ page: paymentPage, limit: 12, status: paymentStatus || undefined }),
    enabled: activeTab === 'payments',
  });

  if (summaryError) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">Reports API Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not load reports. Make sure your backend is running.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors"
        >
          <RefreshCcw size={13} className="inline mr-1.5" />Retry
        </button>
      </div>
    );
  }

  // ── Download handler ────────────────────────────────────────
  const handleDownload = () => {
    const ts = new Date().toISOString().split('T')[0];
    if (activeTab === 'overview' || activeTab === 'revenue') {
      const rows = (revenue?.monthlyData || []).map(m => ({
        Month: m.name,
        [`Total Revenue (${currency})`]: m.total,
        'Payments Count': m.payments,
      }));
      downloadCSV(`revenue_report_${ts}.csv`, rows, ['Month', `Total Revenue (${currency})`, 'Payments Count']);
    } else if (activeTab === 'users') {
      const rows = (users?.monthlyGrowth || []).map(m => ({ Month: m.name, 'New Signups': m.signups }));
      downloadCSV(`users_report_${ts}.csv`, rows, ['Month', 'New Signups']);
    } else if (activeTab === 'subscriptions') {
      const rows = (subscriptions?.recentHistory || []).map(h => ({
        User: h.user,
        Email: h.email,
        Action: h.action,
        [`Amount (${currency})`]: h.amount,
        Provider: h.provider,
        Note: h.note,
        Date: h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN') : '',
      }));
      downloadCSV(`subscriptions_report_${ts}.csv`, rows, ['User','Email','Action',`Amount (${currency})`,'Provider','Note','Date']);
    } else if (activeTab === 'payments') {
      const rows = (payments?.payments || []).map(p => ({
        User: p.user,
        Email: p.email,
        [`Amount (${currency})`]: p.amount,
        Plan: p.plan,
        Provider: p.provider,
        Status: p.status,
        Date: p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '',
      }));
      downloadCSV(`payments_report_${ts}.csv`, rows, ['User','Email',`Amount (${currency})`,'Plan','Provider','Status','Date']);
    }
  };

  // ── Determine if download is ready ──────────────────────────
  const isDownloadReady = (
    (activeTab === 'overview' || activeTab === 'revenue') && revenue?.monthlyData
  ) || (
    activeTab === 'users' && users?.monthlyGrowth
  ) || (
    activeTab === 'subscriptions' && subscriptions?.recentHistory
  ) || (
    activeTab === 'payments' && payments?.payments
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing &amp; System Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live analytics and data reports sourced directly from your database.</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!isDownloadReady}
          className="shrink-0 flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={13} />
          Download CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'users', label: 'Users' },
          { key: 'subscriptions', label: 'Subscriptions' },
          { key: 'payments', label: 'Payments' },
        ].map(t => (
          <Tab key={t.key} label={t.label} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {summaryLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />)
            ) : (
              <>
                <KpiCard label="Total Users" value={summary?.totalUsers?.toLocaleString()} sub="All registered accounts" icon={Users} iconClass="text-violet-500" growth={summary?.userGrowth} />
                <KpiCard label="Active Subscribers" value={summary?.activeSubscribers?.toLocaleString()} sub="Paid plans active" icon={Activity} iconClass="text-emerald-500" />
                <KpiCard label="Total Revenue" value={formatAmount(summary?.totalRevenue)} sub={`${formatAmount(summary?.monthlyRevenue)} this month`} icon={DollarSign} iconClass="text-sky-500" growth={summary?.revenueGrowth} />
                <KpiCard label="Active Plans" value={summary?.activePlans?.toLocaleString()} sub="Plan tiers in use" icon={FileText} iconClass="text-amber-500" />
              </>
            )}
          </div>

          {/* Revenue Bar + User Growth side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="Monthly Revenue (This Year)" desc={`Revenue trend for ${currentYear}`} isLoading={revenueLoading}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue?.monthlyData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                    <YAxis tickFormatter={v => `${symbol}${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                    <Tooltip formatter={v => [formatAmount(v), 'Revenue']} contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="User Signups (This Year)" desc={`New user registrations per month — ${currentYear}`} isLoading={usersLoading}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={users?.monthlyGrowth || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={false} name="Signups" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

          {/* Plan Distribution Pie */}
          <Section title="Subscription Plan Distribution" desc="Current user distribution across all plan tiers" isLoading={usersLoading}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={users?.planDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {(users?.planDistribution || []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: '12px', borderRadius: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                {(users?.planDistribution || []).map((p, i) => (
                  <div key={p._id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-semibold text-foreground capitalize">{p._id || 'Unknown'}</span>
                    </div>
                    <span className="font-bold text-foreground">{p.count?.toLocaleString()} users</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ── Revenue Tab ──────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <>
          <Section title={`Monthly Revenue Breakdown — ${currentYear}`} desc="Total payments received per month" isLoading={revenueLoading}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue?.monthlyData || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tickFormatter={v => `${symbol}${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip formatter={v => [formatAmount(v), 'Revenue']} contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Revenue by Plan" desc="Lifetime revenue contribution by plan type" isLoading={revenueLoading}>
            <div className="space-y-3">
              {(revenue?.revenueByPlan || []).map((r, i) => {
                const total = (revenue?.revenueByPlan || []).reduce((s, x) => s + x.revenue, 0);
                const pct = total > 0 ? Math.round((r.revenue / total) * 100) : 0;
                return (
                  <div key={r._id} className="flex items-center gap-3 text-xs">
                    <span className="w-24 font-semibold text-foreground capitalize">{r._id || 'Unknown'}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PLAN_COLORS[r._id] || '#6366f1' }} />
                    </div>
                    <span className="w-16 text-right font-bold text-foreground">{formatAmount(r.revenue)}</span>
                    <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
              {(revenue?.revenueByPlan || []).length === 0 && !revenueLoading && (
                <p className="text-xs text-center text-muted-foreground py-6">No payment data available yet.</p>
              )}
            </div>
          </Section>
        </>
      )}

      {/* ── Users Tab ────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {usersLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />) : (
              <>
                <KpiCard label="Total Users" value={((users?.verificationStats?.verified || 0) + (users?.verificationStats?.unverified || 0)).toLocaleString()} sub="All accounts" icon={Users} iconClass="text-violet-500" />
                <KpiCard label="Verified" value={users?.verificationStats?.verified?.toLocaleString()} sub="Email verified" icon={CheckCircle2} iconClass="text-emerald-500" />
                <KpiCard label="Unverified" value={users?.verificationStats?.unverified?.toLocaleString()} sub="Pending verification" icon={Clock} iconClass="text-amber-500" />
              </>
            )}
          </div>

          <Section title="Monthly User Signups" desc={`New registrations per month — ${currentYear}`} isLoading={usersLoading}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={users?.monthlyGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="signups" fill="#6366f1" radius={[4,4,0,0]} name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Plan Distribution" desc="Users across plan tiers" isLoading={usersLoading}>
              <div className="space-y-2.5">
                {(users?.planDistribution || []).map((p, i) => (
                  <div key={p._id} className="flex items-center justify-between text-xs border border-border rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-semibold text-foreground capitalize">{p._id || 'Unknown'}</span>
                    </div>
                    <span className="font-bold text-foreground">{p.count?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Account Status" desc="Active vs suspended accounts" isLoading={usersLoading}>
              <div className="space-y-2.5">
                {(users?.statusDistribution || []).map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between text-xs border border-border rounded-lg px-3 py-2.5">
                    <span className="font-semibold text-foreground capitalize">{s._id || 'Unknown'}</span>
                    <span className="font-bold text-foreground">{s.count?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </>
      )}

      {/* ── Subscriptions Tab ─────────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <>
          <Section title="Activations vs Churn — Monthly" desc={`Subscription events for ${currentYear}`} isLoading={subsLoading}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptions?.monthlySubscriptionTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                  <Bar dataKey="Activated" fill="#10b981" radius={[4,4,0,0]} name="Activated" />
                  <Bar dataKey="Churned" fill="#ef4444" radius={[4,4,0,0]} name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Event Breakdown" desc="Total subscription lifecycle events" isLoading={subsLoading}>
              <div className="space-y-2.5">
                {(subscriptions?.actionBreakdown || []).map((a) => (
                  <div key={a._id} className="flex items-center justify-between text-xs border border-border rounded-lg px-3 py-2.5">
                    <span className="font-semibold text-foreground capitalize">{a._id || 'unknown'}</span>
                    <span className="font-bold text-foreground">{a.count?.toLocaleString()} events</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Recent Activity" desc="Last 20 subscription events" isLoading={subsLoading}>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(subscriptions?.recentHistory || []).map((h) => (
                  <div key={h._id} className="flex items-center justify-between text-[11px] border border-border rounded-lg px-3 py-2">
                    <div>
                      <p className="font-semibold text-foreground leading-none">{h.user}</p>
                      <p className="text-muted-foreground mt-0.5">{h.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        h.action === 'activated' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        h.action === 'cancelled' || h.action === 'expired' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-sky-500/10 text-sky-600 border-sky-500/20'
                      }`}>{h.action}</span>
                      <p className="text-muted-foreground mt-0.5">{new Date(h.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
                {(subscriptions?.recentHistory || []).length === 0 && !subsLoading && (
                  <p className="text-xs text-center text-muted-foreground py-6">No subscription history yet.</p>
                )}
              </div>
            </Section>
          </div>
        </>
      )}

      {/* ── Payments Tab ─────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <>
          {/* Payment Stats */}
          {!paymentsLoading && payments?.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'success', label: 'Successful', icon: CheckCircle2, color: 'text-emerald-500' },
                { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500' },
                { key: 'failed', label: 'Failed', icon: XCircle, color: 'text-rose-500' },
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                    <Icon size={16} className={color} />
                  </div>
                  <p className="text-xl font-bold text-foreground mt-2">{payments.stats[key]?.count?.toLocaleString() || 0} txns</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatAmount(payments.stats[key]?.total || 0)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Payment Records</h3>
                <p className="text-xs text-muted-foreground">All payment transactions from the database.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={paymentStatus}
                  onChange={(e) => { setPaymentStatus(e.target.value); setPaymentPage(1); }}
                  className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {paymentsLoading ? (
              <div className="p-5 space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['User', 'Plan', 'Amount', 'Provider', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(payments?.payments || []).map((p) => (
                        <tr key={p._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground leading-none">{p.user}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.email}</p>
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">{p.plan || '—'}</td>
                          <td className="px-4 py-3 font-bold text-foreground">{formatAmount(p.amount)}</td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">{p.provider || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] border ${PAYMENT_STATUS_STYLE[p.status] || 'bg-muted text-muted-foreground border-border'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      ))}
                      {(payments?.payments || []).length === 0 && (
                        <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No payment records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {payments?.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      Page {payments.page} of {payments.totalPages} · {payments.total} total
                    </p>
                    <div className="flex gap-1.5">
                      <button disabled={paymentPage <= 1} onClick={() => setPaymentPage(p => p - 1)}
                        className="h-7 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-40 transition-colors">
                        ← Prev
                      </button>
                      <button disabled={paymentPage >= payments.totalPages} onClick={() => setPaymentPage(p => p + 1)}
                        className="h-7 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-secondary disabled:opacity-40 transition-colors">
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
