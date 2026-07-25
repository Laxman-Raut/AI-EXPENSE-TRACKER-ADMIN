'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiUsageApi } from '@/services/aiUsage.api';
import { StatCardSkeleton, ChartSkeleton } from '../ui/Skeleton';
import { ShieldAlert, MessageSquare, ScanLine, Mic, Zap, Users, Filter, RotateCcw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Colour palette ──────────────────────────────────────────────
const PALETTE = ['#8b5cf6', '#06b6d4', '#f59e0b'];

// ─── Helpers ────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const getTodayString = () => new Date().toISOString().split('T')[0];
const getCurrentMonthString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
};

// ─── Sub-components ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value?.toLocaleString?.() ?? value}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="text-xs font-bold text-foreground">
          {e.value?.toLocaleString()} queries
        </p>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function AiUsageView() {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'day' | 'month'
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  const queryParams = useMemo(() => {
    if (filterType === 'day' && selectedDate) {
      return { date: selectedDate };
    }
    if (filterType === 'month' && selectedMonth) {
      return { month: selectedMonth };
    }
    return {};
  }, [filterType, selectedDate, selectedMonth]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminAiUsage', queryParams],
    queryFn: () => aiUsageApi.getAiUsage(queryParams),
  });

  const summary      = data?.summary      || {};
  const distribution = data?.distribution || [];
  const dailyTrend   = data?.dailyTrend   || [];
  const topUsers     = data?.topUsers     || [];

  const handleResetFilter = () => {
    setFilterType('all');
    setSelectedDate(getTodayString());
    setSelectedMonth(getCurrentMonthString());
  };

  // ─── Error ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not fetch AI usage statistics. Check that your backend is running.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Integration Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Real-time AI feature usage across Chatbot, Receipt Scanner, and Voice Scanner.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center flex-wrap gap-2.5 bg-card border border-border p-2 rounded-xl shadow-sm">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-muted-foreground">
            <Filter size={14} className="text-primary" />
            <span>Filter:</span>
          </div>

          {/* Filter Type Selector */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 bg-background border border-border text-foreground text-xs font-semibold rounded-lg px-2.5 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="day">Specific Day</option>
            <option value="month">Specific Month</option>
          </select>

          {/* Day Picker */}
          {filterType === 'day' && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 bg-background border border-border text-foreground text-xs font-semibold rounded-lg px-2.5 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Month Picker */}
          {filterType === 'month' && (
            <div className="flex items-center gap-1">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-8 bg-background border border-border text-foreground text-xs font-semibold rounded-lg px-2.5 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Reset Filter Button */}
          {filterType !== 'all' && (
            <button
              onClick={handleResetFilter}
              title="Reset Filter"
              className="h-8 px-2.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Zap}          label="Total AI Queries"    value={summary.totalQueries}         color="bg-violet-500/10 text-violet-500" />
          <StatCard icon={MessageSquare} label="Chatbot Queries"    value={summary.totalChatbot}         color="bg-sky-500/10 text-sky-500" />
          <StatCard icon={ScanLine}     label="Receipt Scans"       value={summary.totalReceiptScanner}  color="bg-emerald-500/10 text-emerald-500" />
          <StatCard icon={Mic}          label="Voice Queries"       value={summary.totalVoiceScanner}    color="bg-amber-500/10 text-amber-500" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Daily Chatbot Trend */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-foreground">Chatbot Query Trend</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {filterType === 'day' ? `Day: ${selectedDate}` : filterType === 'month' ? `Month: ${selectedMonth}` : 'Last 30 Days'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Daily count of user messages sent to the AI chatbot.</p>
          {isLoading ? (
            <ChartSkeleton />
          ) : dailyTrend.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">No data recorded for this selection.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => fmtDate(v)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="queries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Feature Distribution Pie */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-1">Usage Distribution</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Share of queries by AI feature.</p>
          {isLoading ? (
            <ChartSkeleton />
          ) : distribution.every(d => d.count === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-xs">No AI usage recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="count"
                  nameKey="feature"
                  cx="50%"
                  cy="45%"
                  outerRadius={72}
                  innerRadius={36}
                  paddingAngle={3}
                >
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Active Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Users Using Chatbot</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.usersWithChatbot ?? 0}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Users Using Receipt Scanner</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.usersWithReceipt ?? 0}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Users Using Voice Scanner</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{summary.usersWithVoice ?? 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Power Users */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Top AI Power Users</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Users ranked by total AI feature usage.</p>
          </div>
          {filterType !== 'all' && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Filtered ({filterType === 'day' ? selectedDate : selectedMonth})
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="p-5"><StatCardSkeleton /></div>
        ) : topUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">No AI usage data found for this selection.</div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground font-semibold border-b border-border">
                <th className="p-4">#</th>
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4 text-center">Chatbot</th>
                <th className="p-4 text-center">Receipt Scan</th>
                <th className="p-4 text-center">Voice</th>
                <th className="p-4 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topUsers.map((u, i) => (
                <tr key={u._id} className="hover:bg-muted/15 transition-colors">
                  <td className="p-4 font-bold text-muted-foreground">#{i + 1}</td>
                  <td className="p-4">
                    <p className="font-bold text-foreground">{u.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      u.subscription?.plan === 'pro'
                        ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                        : 'bg-muted/30 text-muted-foreground border-border'
                    }`}>
                      {u.subscription?.plan === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-semibold text-foreground">{u.aiUsage?.chatbot?.used ?? 0}</td>
                  <td className="p-4 text-center font-semibold text-foreground">{u.aiUsage?.receiptScanner?.used ?? 0}</td>
                  <td className="p-4 text-center font-semibold text-foreground">{u.aiUsage?.voiceScanner?.used ?? 0}</td>
                  <td className="p-4 text-center font-bold text-violet-500">{u.totalAiUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
