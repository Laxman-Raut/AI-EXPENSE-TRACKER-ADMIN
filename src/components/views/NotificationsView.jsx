'use client';

import React, { useState, useEffect } from 'react';
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
  Megaphone,
  Radio,
  ListOrdered
} from 'lucide-react';

export default function NotificationsView() {
  const [activeTab, setActiveTab] = useState('broadcast');
  const queryClient = useQueryClient();

  // ----- TAB 1: BROADCAST STATE -----
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [category, setCategory] = useState('system');
  const [targetSegment, setTargetSegment] = useState('all');
  const [targetEmail, setTargetEmail] = useState('');

  // Audience Count Query
  const { data: audienceCount = 0 } = useQuery({
    queryKey: ['audienceCount', targetSegment, targetEmail],
    queryFn: () => notificationsApi.getAudienceCount(targetSegment, targetEmail),
    enabled: targetSegment !== 'specific' || (targetSegment === 'specific' && targetEmail.length > 5)
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: (payload) => notificationsApi.sendBroadcast(payload),
    onSuccess: () => {
      alert('Campaign broadcasted successfully!');
      setCampaignTitle('');
      setCampaignBody('');
      setTargetEmail('');
      queryClient.invalidateQueries(['campaignsList']);
      setActiveTab('history');
    },
    onError: (err) => alert(err.message || 'Failed to send broadcast.')
  });

  const handleSendBroadcast = () => {
    if (!campaignTitle || !campaignBody) {
      alert('Please provide a title and body.');
      return;
    }
    if (window.confirm(`Are you sure you want to send this broadcast to ${audienceCount} users?`)) {
      sendBroadcastMutation.mutate({
        title: campaignTitle,
        body: campaignBody,
        category,
        segment: targetSegment,
        email: targetEmail
      });
    }
  };

  // ----- TAB 2: CAMPAIGNS HISTORY -----
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaignsList'],
    queryFn: () => notificationsApi.getCampaigns()
  });

  // ----- TAB 3: SYSTEM NOTIFICATIONS -----
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
            Campaign Broadcast
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
            Sent Campaign History
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

      {/* TAB 1: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={e => setCampaignTitle(e.target.value)}
                placeholder="End of Month: Check your budget utilization!"
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

            <div>
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
              <Send size={16} />
              {sendBroadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGNS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoadingCampaigns ? (
            <div className="p-4"><TableSkeleton rows={5} /></div>
          ) : campaigns.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <History className="mx-auto mb-3 opacity-50" size={32} />
              <p className="text-sm">No campaigns sent yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground">
                    <th className="p-4 whitespace-nowrap">Campaign</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Segment</th>
                    <th className="p-4 text-right">Recipients</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs text-foreground">
                  {campaigns.map((camp, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{camp.title}</div>
                        <div className="text-muted-foreground truncate max-w-xs">{camp.body}</div>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground border border-border text-[10px] font-bold">
                          {camp.category}
                        </span>
                      </td>
                      <td className="p-4 capitalize">{camp.segment}</td>
                      <td className="p-4 text-right font-mono">{camp.recipientsCount}</td>
                      <td className="p-4 text-right text-muted-foreground">
                        {new Date(camp.createdAt).toLocaleDateString()}
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
