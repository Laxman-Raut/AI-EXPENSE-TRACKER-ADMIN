'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView, setCurrency } from '@/store/uiSlice';
import { settingsApi } from '@/services/settings.api';
import { authApi } from '@/services/auth.api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

// Dynamic Views
import DashboardOverview from '@/components/views/DashboardOverview';
import UsersView from '@/components/views/UsersView';
import PlansView from '@/components/views/PlansView';
import SubscriptionsView from '@/components/views/SubscriptionsView';
import PaymentsView from '@/components/views/PaymentsView';
import AnalyticsView from '@/components/views/AnalyticsView';
import ReportsView from '@/components/views/ReportsView';
import NotificationsView from '@/components/views/NotificationsView';
import AiUsageView from '@/components/views/AiUsageView';
import SettingsView from '@/components/views/SettingsView';
import GroupsView from '@/components/views/GroupsView';

const VALID_VIEWS = [
  'dashboard',
  'users',
  'groups',
  'plans',
  'subscriptions',
  'payments',
  'analytics',
  'reports',
  'notifications',
  'ai-usage',
  'settings'
];

export default function DashboardShell({ initialView }) {
  const dispatch = useDispatch();
  const { activeView, sidebarCollapsed } = useSelector((state) => state.ui);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getProfile();
        if (
          res.success &&
          (res.data.role === 'super_admin' || res.data.role === 'admin')
        ) {
          settingsApi.getSettings()
            .then((systemSettings) => {
              dispatch(setCurrency(systemSettings.currency || 'INR'));
            })
            .catch((err) => console.error('Failed to fetch settings:', err));
        } else {
          // Invalid role — redirect to login
          window.location.href = '/login';
        }
      } catch (err) {
        // Unauthenticated session — redirect to login
        console.warn('[DashboardShell] Session verification failed:', err.message);
        window.location.href = '/login';
      }

      // Determine view: Priority 1: URL Path, Priority 2: initialView prop, Priority 3: URL Hash, Priority 4: localStorage
      const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
      const pathView = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
      const hashView = typeof window !== 'undefined' ? window.location.hash.replace('#', '').trim() : '';
      const localView = typeof window !== 'undefined' ? localStorage.getItem('admin_active_view') : '';

      let targetView = 'dashboard';
      if (pathView && VALID_VIEWS.includes(pathView)) {
        targetView = pathView;
      } else if (initialView && VALID_VIEWS.includes(initialView)) {
        targetView = initialView;
      } else if (hashView && VALID_VIEWS.includes(hashView)) {
        targetView = hashView;
      } else if (localView && VALID_VIEWS.includes(localView)) {
        targetView = localView;
      }

      if (targetView) {
        dispatch(setActiveView(targetView));
      }

      setLoading(false);
    };

    checkAuth();
  }, [dispatch, initialView]);

  // Sync activeView to URL path & localStorage so page refresh stays on exact page
  useEffect(() => {
    if (typeof window !== 'undefined' && activeView) {
      localStorage.setItem('admin_active_view', activeView);
      
      const targetPath = activeView === 'dashboard' ? '/dashboard' : `/dashboard/${activeView}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activeView]);

  // Support browser Back & Forward button navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const pathView = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
      
      if (pathView && VALID_VIEWS.includes(pathView)) {
        dispatch(setActiveView(pathView));
      } else {
        dispatch(setActiveView('dashboard'));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview onViewChange={(view) => dispatch(setActiveView(view))} />;
      case 'users':
        return <UsersView />;
      case 'groups':
        return <GroupsView />;
      case 'plans':
        return <PlansView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'payments':
        return <PaymentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'ai-usage':
        return <AiUsageView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview onViewChange={(view) => dispatch(setActiveView(view))} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold animate-pulse text-lg">
          E
        </div>
        <span className="text-xs text-muted-foreground font-semibold mt-4">Initializing Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Page Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'pl-20' : 'pl-64'}
        `}
      >
        {/* Header Navigation */}
        <Navbar />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
