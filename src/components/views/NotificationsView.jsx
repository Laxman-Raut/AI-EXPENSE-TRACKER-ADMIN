'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/notifications.api';
import { TableSkeleton } from '../ui/Skeleton';
import { 
  Bell, 
  Check, 
  Trash2, 
  ShieldAlert,
  Info,
  CheckCheck,
  Send,
  History,
  Radio,
  ListOrdered,
  Clock,
  Calendar,
  Zap,
  Play,
  Pause
} from 'lucide-react';

export default function NotificationsView() {
  const [activeTab, setActiveTab] = useState('broadcast');
  const queryClient = useQueryClient();

  // ----- TAB 1: BROADCAST & SCHEDULING STATE -----
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [category, setCategory] = useState('system');
  const [targetSegment, setTargetSegment] = useState('all');
  const [targetEmail, setTargetEmail] = useState('');

  // Scheduling state
  const [scheduleType, setScheduleType] = useState('immediate'); // 'immediate', 'daily', 'specific_date'
  const [scheduledTime, setScheduledTime] = useState('14:00'); // Default 2:00 PM
  const [scheduledDate, setScheduledDate] = useState('');

  // Audience Count Query
  const { data: audienceCount = 0 } = useQuery({
    queryKey: ['audienceCount', targetSegment, targetEmail],
    queryFn: () => notificationsApi.getAudienceCount(targetSegment, targetEmail),
    enabled: targetSegment !== 'specific' || (targetSegment === 'specific' && targetEmail.length > 5)
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: (payload) => notificationsApi.sendBroadcast(payload),
    onSuccess: (data) => {
      alert(data.message || 'Notification broadcast / schedule created successfully!');
      setCampaignTitle('');
      setCampaignBody('');
      setTargetEmail('');
      setScheduledDate('');
      queryClient.invalidateQueries(['campaignsList']);
      setActiveTab('history');
    },
    onError: (err) => alert(err.message || 'Failed to process request.')
  });

  const handleSendBroadcast = () => {
    if (!campaignTitle || !campaignBody) {
      alert('Please provide a campaign title and body.');
      return;
    }

    if (scheduleType === 'daily' && !scheduledTime) {
      alert('Please select a daily execution time (e.g. 14:00 for 2:00 PM).');
      return;
    }

    if (scheduleType === 'specific_date' && (!scheduledDate || !scheduledTime)) {
      alert('Please select both a date and time for the scheduled campaign.');
      return;
    }

    let fullScheduledDate = null;
    if (scheduleType === 'specific_date' && scheduledDate && scheduledTime) {
      fullScheduledDate = `${scheduledDate}T${scheduledTime}:00`;
    }

    const confirmMsg = scheduleType === 'immediate'
      ? `Are you sure you want to send this broadcast NOW to ${audienceCount} users?`
      : scheduleType === 'daily'
      ? `Schedule this campaign to run EVERY DAY at ${scheduledTime}?`
      : `Schedule this campaign for ${scheduledDate} at ${scheduledTime}?`;

    if (window.confirm(confirmMsg)) {
      sendBroadcastMutation.mutate({
        title: campaignTitle,
        body: campaignBody,
        category,
        segment: targetSegment,
        email: targetEmail,
        scheduleType,
        scheduledTime,
        scheduledDate: fullScheduledDate
      });
    }
  };

  // ----- TAB 2: CAMPAIGNS HISTORY & SCHEDULED RULES -----
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaignsList'],
    queryFn: () => notificationsApi.getCampaigns()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => notificationsApi.updateCampaignStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['campaignsList']);
      alert(data.message || 'Campaign status updated.');
    },
    onError: (err) => alert(err.message || 'Failed to update campaign status.')
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => notificationsApi.deleteCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['campaignsList']);
      alert(data.message || 'Campaign deleted.');
    },
    onError: (err) => alert(err.message || 'Failed to delete campaign.')
  });

  // ----- TAB 3: SYSTEM NOTIFICATIONS LOGS -----
  const { data: dbNotifications = [], isLoading: isLoadingNotifs, error, refetch } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: () => notificationsApi.getNotifications()
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unreads = dbNotifications.filter(n => !n.read);
      await Promise.all(unreads.map(n => notificationsApi.markAsRead(n._id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      alert('All notifications marked as read.');
    },
    onError: (err) => alert(err.message || 'Failed to mark all as read.')
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
    },
    onError: (err) => alert(err.message || 'Failed to mark notification as read.')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      alert('Notification deleted.');
    },
    onError: (err) => alert(err.message || 'Failed to delete notification.')
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      alert('All notifications cleared.');
    },
    onError: (err) => alert(err.message || 'Failed to clear notifications.')
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Tabs Navigation */}
      <div className="border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Notifications & Campaigns</h1>
        
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'broadcast' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radio size={16} />
            Broadcast & Scheduler
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListOrdered size={16} />
            Campaigns & Schedules ({campaigns.length})
          </button>
          
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'system' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert size={16} />
            System Alerts & Logs
          </button>
        </div>
      </div>

      {/* TAB 1: BROADCAST & SCHEDULER */}
      {activeTab === 'broadcast' && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                placeholder="Daily Reminder: Don't forget to track your expenses today!"
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Campaign Body / Message</label>
              <textarea
                value={campaignBody}
                onChange={e => setCampaignBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-24 p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {['system', 'budget', 'ai', 'reminder', 'security'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors capitalize ${
                      category === cat 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Type Selection */}
            <div className="pt-2 border-t border-border space-y-3">
              <label className="block text-xs font-bold text-foreground mb-1">Execution Schedule</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'immediate', label: 'Send Immediately', icon: Zap, sub: 'Dispatches now' },
                  { id: 'daily', label: 'Daily Constant Time', icon: Clock, sub: 'Runs every day at fixed time' },
                  { id: 'specific_date', label: 'Specific Date & Time', icon: Calendar, sub: 'One-time on scheduled date' },
                ].map(sch => {
                  const IconComp = sch.icon;
                  const isSelected = scheduleType === sch.id;
                  return (
                    <button
                      key={sch.id}
                      onClick={() => setScheduleType(sch.id)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                          : 'border-border bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {sch.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{sch.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Time / Date Inputs */}
              {scheduleType === 'daily' && (
                <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-foreground">
                    Daily Constant Time (24h Format)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                      className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">
                      Notification will automatically trigger every day at <strong>{scheduledTime || '14:00'}</strong> (e.g. 2:00 PM).
                    </span>
                  </div>
                </div>
              )}

              {scheduleType === 'specific_date' && (
                <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-foreground">
                    Select Target Date & Time
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Date:</span>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Time:</span>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Will trigger one-time on <strong>{scheduledDate || 'selected date'}</strong> at <strong>{scheduledTime || 'selected time'}</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-foreground mb-2">Target Audience Segment</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'All Users (Broadcast)', icon: '🌐' },
                  { id: 'free', label: 'Free Plan Users Only', icon: '🆓' },
                  { id: 'pro', label: 'Active Pro Subscribers', icon: '⭐' },
                  { id: 'expired', label: 'Expired / Cancelled', icon: '⚠️' },
                  { id: 'inactive', label: 'Inactive Users (30+ Days)', icon: '💤' },
                  { id: 'specific', label: 'Specific User (By Email)', icon: '🎯' },
                ].map(segment => (
                  <button
                    key={segment.id}
                    onClick={() => setTargetSegment(segment.id)}
                    className={`p-3 border rounded-lg text-left transition-colors flex items-center gap-2 ${
                      targetSegment === segment.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-background hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg">{segment.icon}</span>
                    <span className={`text-xs font-bold ${targetSegment === segment.id ? 'text-primary' : 'text-foreground'}`}>
                      {segment.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {targetSegment === 'specific' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">User Email</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg border border-border">
              <Info size={14} />
              <span className="text-xs font-bold">Target Audience: {audienceCount} Users</span>
            </div>
            <button
              onClick={handleSendBroadcast}
              disabled={sendBroadcastMutation.isPending}
              className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {scheduleType === 'immediate' ? <Send size={16} /> : <Clock size={16} />}
              {sendBroadcastMutation.isPending 
                ? 'Processing...' 
                : scheduleType === 'immediate'
                ? 'Send Broadcast Now'
                : scheduleType === 'daily'
                ? `Schedule Daily at ${scheduledTime}`
                : `Schedule for ${scheduledDate || 'Date'} at ${scheduledTime || 'Time'}`
              }
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGNS HISTORY & SCHEDULES */}
      {activeTab === 'history' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoadingCampaigns ? (
            <div className="p-4"><TableSkeleton rows={5} /></div>
          ) : campaigns.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <History className="mx-auto mb-3 opacity-50" size={32} />
              <p className="text-sm">No campaigns or scheduled rules created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground">
                    <th className="p-4 whitespace-nowrap">Campaign Title & Body</th>
                    <th className="p-4">Schedule / Frequency</th>
                    <th className="p-4">Segment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Recipients</th>
                    <th className="p-4 text-right">Created Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs text-foreground">
                  {campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{camp.title}</div>
                        <div className="text-muted-foreground truncate max-w-xs">{camp.body}</div>
                      </td>
                      <td className="p-4">
                        {camp.scheduleType === 'daily' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[11px]">
                            <Clock size={12} />
                            Daily at {camp.scheduledTime || '14:00'}
                          </span>
                        ) : camp.scheduleType === 'specific_date' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[11px]">
                            <Calendar size={12} />
                            {camp.scheduledDate ? new Date(camp.scheduledDate).toLocaleString() : 'Scheduled'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold text-[10px]">
                            <Zap size={10} />
                            Immediate
                          </span>
                        )}
                      </td>
                      <td className="p-4 capitalize">{camp.targetSegment || camp.segment || 'all'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold capitalize border ${
                          camp.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : camp.status === 'scheduled'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : camp.status === 'paused'
                            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                            : camp.status === 'completed' || camp.status === 'sent'
                            ? 'bg-secondary text-secondary-foreground border-border'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {camp.status || 'sent'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">{camp.recipientCount || camp.recipientsCount || 0}</td>
                      <td className="p-4 text-right text-muted-foreground">
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {(camp.scheduleType === 'daily' || camp.scheduleType === 'specific_date') && (
                            <button
                              onClick={() => {
                                const newStatus = camp.status === 'active' || camp.status === 'scheduled' ? 'paused' : 'active';
                                updateStatusMutation.mutate({ id: camp._id, status: newStatus });
                              }}
                              title={camp.status === 'active' || camp.status === 'scheduled' ? 'Pause Campaign' : 'Resume Campaign'}
                              className="p-1.5 hover:bg-secondary text-foreground rounded-lg transition-colors border border-border"
                            >
                              {camp.status === 'active' || camp.status === 'scheduled' ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this campaign / scheduled rule?')) {
                                deleteCampaignMutation.mutate(camp._id);
                              }
                            }}
                            title="Delete Campaign"
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors border border-border"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYSTEM NOTIFICATIONS */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            {dbNotifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="h-9 px-4 border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCheck size={14} />
                  Mark All Read
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all notifications?')) {
                      clearAllMutation.mutate();
                    }
                  }}
                  disabled={clearAllMutation.isPending}
                  className="h-9 px-4 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Could not retrieve system notifications. Check that your backend service is running.
              </p>
              <button 
                onClick={() => refetch()} 
                className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-md shadow-primary/10"
              >
                Retry Connection
              </button>
            </div>
          ) : isLoadingNotifs ? (
            <TableSkeleton rows={5} />
          ) : dbNotifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3.5 border border-border">
                <Bell size={20} />
              </div>
              <h3 className="text-sm font-bold text-foreground">No Notifications</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                Your system logs are completely clean. There are no warning indicators or pending backup alerts.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
              {dbNotifications.map((notif) => (
                <div 
                  key={notif._id}
                  className={`p-4 flex items-start gap-4 hover:bg-muted/30 transition-all duration-200 relative
                    ${!notif.read ? 'bg-primary/5' : ''}
                  `}
                >
                  {!notif.read && (
                    <span className="absolute left-3 top-6 h-2 w-2 rounded-full bg-primary" />
                  )}
                  
                  <div className="flex-1 space-y-1 pl-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title || 'System Notification'}
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => markReadMutation.mutate(notif._id)}
                        title="Mark as Read"
                        className="p-1.5 hover:bg-secondary text-primary rounded-lg transition-colors border border-border bg-card"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this notification?')) {
                          deleteMutation.mutate(notif._id);
                        }
                      }}
                      title="Delete Notification"
                      className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors border border-border bg-card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
