'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/notifications.api';
import { TableSkeleton } from '../ui/Skeleton';
import { 
  Bell, 
  Check, 
  Trash2, 
  ShieldAlert,
  Info,
  CheckCheck
} from 'lucide-react';

export default function NotificationsView() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: dbNotifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: () => notificationsApi.getNotifications()
  });

  // Mark all read mutation
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

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
    },
    onError: (err) => alert(err.message || 'Failed to mark notification as read.')
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      alert('Notification deleted.');
    },
    onError: (err) => alert(err.message || 'Failed to delete notification.')
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notificationsList']);
      alert('All notifications cleared.');
    },
    onError: (err) => alert(err.message || 'Failed to clear notifications.')
  });

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between md:gap-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System Notifications</h1>
          <p className="text-sm text-muted-foreground">Examine warning indicators, payment alerts, and automated backup outputs.</p>
        </div>
        
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

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4">
          <TableSkeleton rows={5} />
        </div>
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
  );
}
