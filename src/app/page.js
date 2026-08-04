'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView, setCurrency } from '@/store/uiSlice';
import { settingsApi } from '@/services/settings.api';
import { authApi } from '@/services/auth.api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import AdminLoginForm from '@/components/AdminLoginForm';

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

const VALID_VIEWS = [
  'dashboard',
  'users',
  'plans',
  'subscriptions',
  'payments',
  'analytics',
  'reports',
  'notifications',
  'ai-usage',
  'settings'
];

export default function Home() {
  const dispatch = useDispatch();
  const { activeView, sidebarCollapsed } = useSelector((state) => state.ui);
  
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read token and restore activeView from URL hash or localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getProfile();
        if (
          res.success &&
          (res.data.role === 'super_admin' || res.data.role === 'admin')
        ) {
          setToken(true); // Use boolean instead of actual token
          setUser(res.data);
          
          settingsApi.getSettings()
            .then((systemSettings) => {
              dispatch(setCurrency(systemSettings.currency || 'INR'));
            })
            .catch((err) => console.error('Failed to fetch settings:', err));
        }
      } catch {
        // No valid session — user needs to login
        setToken(null);
      }

      // Restore active view from URL hash or localStorage
      const hashView = window.location.hash.replace('#', '').trim();
      const localView = localStorage.getItem('admin_active_view');
      const targetView = VALID_VIEWS.includes(hashView)
        ? hashView
        : (VALID_VIEWS.includes(localView) ? localView : 'dashboard');
      if (targetView) {
        dispatch(setActiveView(targetView));
      }

      setLoading(false);
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [dispatch]);

  // Sync current activeView to URL hash and localStorage whenever activeView changes
  useEffect(() => {
    if (typeof window !== 'undefined' && activeView) {
      localStorage.setItem('admin_active_view', activeView);
      if (window.location.hash !== `#${activeView}`) {
        window.history.replaceState(null, '', `#${activeView}`);
      }
    }
  }, [activeView]);

  const handleLoginSuccess = (data) => {
    if (data?.user?.role === 'super_admin' || data?.user?.role === 'admin') {
      setToken(true);
      setUser(data.user);
      settingsApi.getSettings()
        .then((systemSettings) => {
          dispatch(setCurrency(systemSettings.currency || 'INR'));
        })
        .catch((err) => console.error('Failed to fetch settings:', err));
    } else {
      alert('Access denied. Admin role required.');
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview onViewChange={(view) => dispatch(setActiveView(view))} />;
      case 'users':
        return <UsersView />;
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

  // Loading Screen Loader
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

  // Authentication shield gate
  if (!token) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
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
