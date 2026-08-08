'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/services/groups.api';
import { splitRequestsApi } from '@/services/splitRequests.api';
import { useCurrency } from '@/hooks/useCurrency';
import { Users, Plus, Search, Trash2, Receipt, ShieldAlert, X } from 'lucide-react';

export default function GroupsView() {
  const { formatAmount } = useCurrency();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch groups
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });

  // Fetch group split requests when a group is selected
  const { data: splitsData, isLoading: isSplitsLoading } = useQuery({
    queryKey: ['splitRequests', selectedGroup?._id],
    queryFn: () => splitRequestsApi.getGroupSplitRequests(selectedGroup._id),
    enabled: !!selectedGroup?._id,
  });

  const groups = responseData?.data || [];
  const groupSplits = splitsData?.data || [];

  // Create Group Mutation
  const createMutation = useMutation({
    mutationFn: (newGroup) => groupsApi.createGroup(newGroup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsModalOpen(false);
      setName('');
      setDescription('');
    },
  });

  // Delete Group Mutation
  const deleteMutation = useMutation({
    mutationFn: (groupId) => groupsApi.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      if (selectedGroup?._id === groupId) setSelectedGroup(null);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() });
  };

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Groups & Split Expenses</h1>
          <p className="text-sm text-muted-foreground">Manage user expense sharing groups, member rosters, and split bill histories.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-md shadow-primary/10"
        >
          <Plus size={16} />
          Create Group
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          placeholder="Search groups by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-card border border-border rounded-xl animate-pulse p-4" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <ShieldAlert size={32} className="mx-auto text-rose-500 mb-2" />
          <h3 className="text-sm font-bold text-foreground">Failed to load groups</h3>
          <p className="text-xs text-muted-foreground mt-1">Make sure the backend server is running.</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Users size={40} className="mx-auto text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-foreground">No Groups Found</h3>
          <p className="text-xs text-muted-foreground mt-1">Create a group to start tracking split expenses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 text-sm">
                      {group.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.members?.length || 1} member(s)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(group._id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete Group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {group.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{group.description}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline"
                >
                  <Receipt size={14} />
                  View Split Expenses
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split Expenses Modal Drawer */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Split Expenses - {selectedGroup.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  History of shared bills in this group.
                </p>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {isSplitsLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading split expenses...</div>
              ) : groupSplits.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No split expenses created yet for this group.</div>
              ) : (
                groupSplits.map((split) => {
                  const paidByObj = typeof split.paidBy === 'object' ? split.paidBy : {};
                  return (
                    <div key={split._id} className="p-3.5 bg-background border border-border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground">{split.title}</h4>
                        <span className="font-bold text-primary text-sm">{formatAmount(split.totalAmount || split.amount || 0, 'INR')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Paid by {paidByObj.fullName || 'Member'}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${split.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {split.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create New Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roommates, Weekend Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Describe the group purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
