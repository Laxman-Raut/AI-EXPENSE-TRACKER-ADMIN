'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView } from '@/store/uiSlice';
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

export default function Home() {
  const dispatch = useDispatch();
  const { activeView, sidebarCollapsed } = useSelector((state) => state.ui);
  
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('admin_token');
      setToken(storedToken);
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    // Force clean layout sync on reload or state update
    window.location.reload();
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
