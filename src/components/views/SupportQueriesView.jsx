'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/services/support.api';
import { TableSkeleton } from '../ui/Skeleton';
import Dialog from '../ui/Dialog';
import {
  Search,
  Filter,
  HelpCircle,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  RefreshCw,
  Phone,
  Send,
} from 'lucide-react';

export default function SupportQueriesView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyModalQuery, setReplyModalQuery] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [replySuccessMsg, setReplySuccessMsg] = useState('');

  const queryClient = useQueryClient();

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['supportQueries'],
    queryFn: () => supportApi.getSupportQueries(),
  });

  const queries = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
    ? responseData
    : [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => supportApi.updateQueryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportQueries'] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, payload }) => supportApi.replyToQuery(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportQueries'] });
      setReplySuccessMsg('Email response dispatched successfully!');
      setTimeout(() => {
        setReplySuccessMsg('');
        setReplyModalQuery(null);
      }, 1200);
    },
  });

  const handleOpenReply = (item) => {
    setReplyModalQuery(item);
    setReplySubject(`Re: ${item.subject || 'Support Request'}`);
    setReplyMessage(
      `Hello ${item.userName || 'User'},\n\nWe have reviewed your support query regarding "${item.subject || 'your request'}" and resolved the issue. Please let us know if you need any further assistance.\n\nBest regards,\nExpenso Support Team`
    );
    setReplyStatus('resolved');
  };

  const applyPreset = (type, item) => {
    const name = item?.userName || 'User';
    const subj = item?.subject || 'Query';
    if (type === 'resolved') {
      setReplySubject(`Re: ${subj} - Problem Resolved`);
      setReplyMessage(`Hello ${name},\n\nWe have reviewed your request regarding "${subj}" and resolved the issue. Please check in the app and let us know if you need any further help.\n\nBest regards,\nExpenso Support Team`);
      setReplyStatus('resolved');
    } else if (type === 'investigating') {
      setReplySubject(`Re: ${subj} - Under Investigation`);
      setReplyMessage(`Hello ${name},\n\nWe are actively investigating your issue regarding "${subj}". Our technical team is working on it and we will update you shortly.\n\nBest regards,\nExpenso Support Team`);
      setReplyStatus('in_progress');
    } else if (type === 'info') {
      setReplySubject(`Re: ${subj} - More Info Required`);
      setReplyMessage(`Hello ${name},\n\nThank you for contacting support regarding "${subj}". Could you please reply with additional details or a screenshot so we can assist you better?\n\nBest regards,\nExpenso Support Team`);
      setReplyStatus('pending');
    }
  };

  // Filter queries by search and status
  const filteredQueries = queries.filter((item) => {
    const name = item.userName || '';
    const email = item.userEmail || '';
    const subject = item.subject || '';
    const message = item.message || '';
    const queryStr = search.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(queryStr) ||
      email.toLowerCase().includes(queryStr) ||
      subject.toLowerCase().includes(queryStr) ||
      message.toLowerCase().includes(queryStr);

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Pending'
        ? item.status === 'pending'
        : statusFilter === 'Resolved'
        ? item.status === 'resolved'
        : true;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = queries.filter((q) => q.status === 'pending').length;
  const resolvedCount = queries.filter((q) => q.status === 'resolved').length;

  const handleToggleStatus = (query) => {
    const newStatus = query.status === 'resolved' ? 'pending' : 'resolved';
    updateStatusMutation.mutate({ id: query._id || query.id, status: newStatus });
    if (selectedQuery && (selectedQuery._id === query._id || selectedQuery.id === query.id)) {
      setSelectedQuery({ ...selectedQuery, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="text-primary" size={28} />
            Help & Support Queries
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and respond to support tickets submitted by app users.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-secondary transition-colors text-foreground shadow-sm"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Queries
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{queries.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-amber-500 dark:text-amber-400 uppercase tracking-wider">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
              Resolved
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {resolvedCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-sm">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-foreground text-sm focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : filteredQueries.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No queries found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? 'Try adjusting your search criteria.'
                : 'No support tickets have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 border-b border-border text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Query Message</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQueries.map((item) => {
                  const isResolved = item.status === 'resolved';
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={item._id || item.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                            {(item.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-foreground truncate">
                              {item.userName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail size={12} />
                              {item.userEmail}
                            </p>
                            {item.phoneNumber ? (
                              <a
                                href={`tel:${(item.countryCode || '+91')}${item.phoneNumber}`}
                                className="text-xs text-primary hover:underline truncate flex items-center gap-1 mt-0.5 font-medium"
                                title="Click to Call"
                              >
                                <Phone size={11} />
                                {item.countryCode || '+91'} {item.phoneNumber}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 font-medium text-foreground">
                        <span className="line-clamp-1">{item.subject || 'Support Ticket'}</span>
                      </td>

                      {/* Query Message Preview */}
                      <td className="px-6 py-4 text-muted-foreground max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed">{item.message}</p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {dateStr}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isResolved
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isResolved ? (
                            <>
                              <CheckCircle size={12} />
                              Resolved
                            </>
                          ) : (
                            <>
                              <AlertCircle size={12} />
                              Pending
                            </>
                          )
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReply(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                            title="Send Email Reply to User"
                          >
                            <Send size={13} />
                            Reply
                          </button>

                          <button
                            onClick={() => setSelectedQuery(item)}
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="View Full Query"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={updateStatusMutation.isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              isResolved
                                ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                          >
                            {isResolved ? 'Mark Pending' : 'Mark Resolved'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <Dialog
          isOpen={!!selectedQuery}
          onClose={() => setSelectedQuery(null)}
          title="Support Query Details"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                  {(selectedQuery.userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedQuery.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedQuery.userEmail}</p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedQuery.status === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {selectedQuery.status === 'resolved' ? 'Resolved' : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact Phone
                </label>
                {selectedQuery.phoneNumber ? (
                  <a
                    href={`tel:${(selectedQuery.countryCode || '+91')}${selectedQuery.phoneNumber}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mt-0.5"
                  >
                    <Phone size={14} />
                    {selectedQuery.countryCode || '+91'} {selectedQuery.phoneNumber}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">Not Provided</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subject
                </label>
                <p className="font-semibold text-foreground mt-0.5">{selectedQuery.subject}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Query Message
              </label>
              <div className="mt-1 p-3.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedQuery.message}
              </div>
            </div>

            {/* Display Past Admin Reply if present */}
            {selectedQuery.adminReply ? (
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span className="flex items-center gap-1"><Send size={12} /> Last Admin Reply Sent</span>
                  <span>{selectedQuery.repliedAt ? new Date(selectedQuery.repliedAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap mt-1 leading-relaxed">{selectedQuery.adminReply}</p>
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
              <span>
                Submitted on:{' '}
                {selectedQuery.createdAt
                  ? new Date(selectedQuery.createdAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => {
                  const q = selectedQuery;
                  setSelectedQuery(null);
                  handleOpenReply(q);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-colors"
              >
                <Send size={13} />
                Send Email Reply
              </button>
              <button
                onClick={() => handleToggleStatus(selectedQuery)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedQuery.status === 'resolved'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                {selectedQuery.status === 'resolved' ? 'Mark as Pending' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Admin Email Reply Modal */}
      {replyModalQuery && (
        <Dialog
          isOpen={!!replyModalQuery}
          onClose={() => setReplyModalQuery(null)}
          title={`Reply to ${replyModalQuery.userName || 'User'}`}
        >
          <div className="space-y-4">
            {replySuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{replySuccessMsg}</span>
              </div>
            ) : null}

            {/* Recipient summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border">
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">{replyModalQuery.userName}</p>
                  <p className="text-[11px] text-muted-foreground">{replyModalQuery.userEmail}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded-full">
                Via Brevo Email API
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Quick Response Templates
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('resolved', replyModalQuery)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                >
                  🟢 Problem Resolved
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('investigating', replyModalQuery)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                >
                  🟡 Under Investigation
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('info', replyModalQuery)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                >
                  🔵 More Info Needed
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Email Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Response Message (HTML Email to User)
              </label>
              <textarea
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the user..."
                className="w-full p-3 rounded-lg border border-border text-xs bg-background text-foreground font-normal focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Ticket Status Select */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Set Ticket Status:</label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="h-8 rounded-lg border border-border text-xs bg-background text-foreground px-2 font-bold focus:outline-none"
                >
                  <option value="resolved">Resolved (Completed)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModalQuery(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={replyMutation.isPending || !replyMessage.trim()}
                  onClick={() => {
                    replyMutation.mutate({
                      id: replyModalQuery._id || replyModalQuery.id,
                      payload: {
                        subject: replySubject,
                        message: replyMessage,
                        status: replyStatus,
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {replyMutation.isPending ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Send Email Response
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
