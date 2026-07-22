'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/users.api';
import { subscriptionsApi } from '@/services/subscriptions.api';
import { plansApi } from '@/services/plans.api';
import { TableSkeleton } from '../ui/Skeleton';
import Dialog from '../ui/Dialog';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  UserX, 
  UserCheck, 
  Eye, 
  Mail,
  ShieldAlert,
  Clock,
  Calendar,
  DollarSign,
  PlusCircle
} from 'lucide-react';

export default function UsersView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subFilter, setSubFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUserMenu, setActionUserMenu] = useState(null);

  const queryClient = useQueryClient();
  const [dialogTab, setDialogTab] = useState('profile'); // 'profile' or 'subscription'
  const [extendDays, setExtendDays] = useState(30);
  const [extendNote, setExtendNote] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Fetch plans catalog for selection
  const { data: plans = [] } = useQuery({
    queryKey: ['plansList'],
    queryFn: () => plansApi.getPlans(),
  });

  // Fetch subscription timeline for the selected user
  const { data: timeline = [], refetch: refetchTimeline } = useQuery({
    queryKey: ['userTimeline', selectedUser?.id],
    queryFn: () => subscriptionsApi.getTimeline(selectedUser.id),
    enabled: !!selectedUser?.id && dialogTab === 'subscription',
  });

  // Mutations
  const extendMutation = useMutation({
    mutationFn: ({ userId, days, note }) => subscriptionsApi.extend(userId, days, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList']);
      queryClient.invalidateQueries(['dashboardSummary']);
      refetchTimeline();
      alert('Subscription extended successfully.');
      setExtendNote('');
    },
    onError: (err) => alert(err.message || 'Failed to extend subscription.')
  });

  const cancelMutation = useMutation({
    mutationFn: (userId) => subscriptionsApi.cancel(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList']);
      queryClient.invalidateQueries(['dashboardSummary']);
      refetchTimeline();
      alert('Subscription cancelled successfully.');
    },
    onError: (err) => alert(err.message || 'Failed to cancel subscription.')
  });

  const activateMutation = useMutation({
    mutationFn: ({ userId, planId }) => subscriptionsApi.activate(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['usersList']);
      queryClient.invalidateQueries(['dashboardSummary']);
      refetchTimeline();
      alert('Subscription activated successfully.');
    },
    onError: (err) => alert(err.message || 'Failed to activate subscription.')
  });

  // Fetch users with filters
  const { data: usersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['usersList', { search, statusFilter, subFilter, page }],
    queryFn: () => usersApi.getUsers({
      search,
      status: statusFilter,
      plan: subFilter,
      page,
      limit: 8
    }),
  });

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve the user directory. Check that your backend service is running.
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

  const users = usersResponse?.users || [];
  const totalPages = usersResponse?.totalPages || 1;
  const totalUsersCount = usersResponse?.total || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const handleAction = (action, user) => {
    setActionUserMenu(null);
    if (action === 'view') {
      setSelectedUser(user);
    } else if (action === 'toggle_status') {
      const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
      alert(`User status for ${user.name} changed to ${nextStatus}.`);
      refetch();
    } else if (action === 'reset_pass') {
      alert(`Password reset link sent to ${user.email}.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Monitor signups, subscription assignments, and manage access limits.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/30 focus:bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Filter size={13} /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Filter size={13} /> Plan
            </span>
            <select
              value={subFilter}
              onChange={(e) => {
                setSubFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Plans</option>
              <option value="Free Tier">Free Tier</option>
              <option value="Basic Plan">Basic Plan</option>
              <option value="Pro Plan">Pro Plan</option>
              <option value="Enterprise Plan">Enterprise Plan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground/35 mx-auto mb-3.5" />
          <h3 className="text-sm font-bold text-foreground">No users found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to locate records.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/15 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground text-[10px]">{user.id}</td>
                    <td className="p-4 font-medium text-foreground">{user.subscription}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.joinedDate}</td>
                    <td className="p-4 text-center relative">
                      <div className="inline-block text-left">
                        <button 
                          onClick={() => setActionUserMenu(actionUserMenu === user.id ? null : user.id)}
                          className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {actionUserMenu === user.id && (
                          <>
                            <div 
                              onClick={() => setActionUserMenu(null)}
                              className="fixed inset-0 z-40"
                            />
                            <div className="absolute right-4 mt-1 w-44 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in duration-100 z-50 p-1 space-y-0.5">
                              <button
                                onClick={() => handleAction('view', user)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                              >
                                <Eye size={13} />
                                View Profile
                              </button>
                              <button
                                onClick={() => handleAction('toggle_status', user)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                              >
                                {user.status === 'Active' ? (
                                  <>
                                    <UserX size={13} className="text-rose-500" />
                                    Suspend Account
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={13} className="text-emerald-500" />
                                    Activate Account
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleAction('reset_pass', user)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                              >
                                <Mail size={13} />
                                Reset Password
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{users.length}</span> of <span className="text-foreground">{totalUsersCount}</span> entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-2 text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog 
        isOpen={!!selectedUser} 
        onClose={() => {
          setSelectedUser(null);
          setDialogTab('profile');
        }}
        title="User Record & Subscription Details"
      >
        {selectedUser && (
          <div className="space-y-4 text-sm animate-in fade-in duration-200">
            {/* Tabs Selector */}
            <div className="flex border-b border-border pb-1 gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <button
                onClick={() => setDialogTab('profile')}
                className={`pb-2 border-b-2 transition-all ${dialogTab === 'profile' ? 'border-primary text-foreground' : 'border-transparent'}`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setDialogTab('subscription')}
                className={`pb-2 border-b-2 transition-all ${dialogTab === 'subscription' ? 'border-primary text-foreground' : 'border-transparent'}`}
              >
                Manage Subscription
              </button>
            </div>

            {dialogTab === 'profile' ? (
              <>
                <div className="flex items-center gap-3.5 pb-4 border-b border-border mt-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base">{selectedUser.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subscription Tier</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedUser.subscription}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                    <p className="mt-0.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Member Since</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedUser.joinedDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User Reference ID</span>
                    <p className="font-mono text-xs text-foreground mt-0.5">{selectedUser.id}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 mt-2">
                {/* Subscription Action Form */}
                <div className="p-3 bg-muted/30 border border-border rounded-xl">
                  <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    Subscription Actions
                  </h5>

                  {selectedUser.status === 'Active' ? (
                    <div className="space-y-3 mt-3">
                      {/* Extend subscription */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Extend duration (days)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={extendDays}
                            onChange={(e) => setExtendDays(e.target.value)}
                            className="w-20 h-8 rounded-lg border border-border text-xs bg-background text-foreground text-center font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Add reason/note..."
                            value={extendNote}
                            onChange={(e) => setExtendNote(e.target.value)}
                            className="flex-1 h-8 rounded-lg border border-border text-xs px-2.5 bg-background text-foreground"
                          />
                          <button
                            onClick={() => extendMutation.mutate({ userId: selectedUser.id, days: extendDays, note: extendNote })}
                            disabled={extendMutation.isLoading}
                            className="h-8 px-3 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 disabled:opacity-50 transition-colors"
                          >
                            Extend
                          </button>
                        </div>
                      </div>

                      {/* Cancel subscription */}
                      <div className="pt-2 border-t border-border/50 flex justify-between items-center mt-2">
                        <div className="text-[10px] text-muted-foreground font-semibold">
                          Stop automatic renewal & terminate plan access.
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel the subscription for ${selectedUser.name}?`)) {
                              cancelMutation.mutate(selectedUser.id);
                            }
                          }}
                          disabled={cancelMutation.isLoading}
                          className="h-7 px-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Activate subscription tier</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="flex-1 h-8 rounded-lg border border-border text-xs px-2.5 bg-background text-foreground"
                          >
                            <option value="">Choose plan...</option>
                            {plans.map((p) => (
                              <option key={p._id} value={p._id}>{p.name} (${p.price}/{p.billingCycle})</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (!selectedPlanId) return alert('Please select a plan first.');
                              activateMutation.mutate({ userId: selectedUser.id, planId: selectedPlanId });
                            }}
                            disabled={activateMutation.isLoading || !selectedPlanId}
                            className="h-8 px-3 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                          >
                            Activate Manual
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline History */}
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-3.5 flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" />
                    Subscription History Timeline
                  </h5>

                  {timeline.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground font-semibold">
                      No billing actions recorded.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {timeline.map((event, idx) => (
                        <div key={event._id || idx} className="flex gap-3 text-xs leading-relaxed border-l-2 border-primary/20 pl-3.5 relative">
                          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between font-bold text-foreground text-[11px]">
                              <span className="capitalize">{event.action}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {event.note || `Subscription manual action: ${event.action}.`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setDialogTab('profile');
                }}
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
