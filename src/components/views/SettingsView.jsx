'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/store/adminSlice';
import { useForm } from 'react-hook-form';
import { authApi } from '@/services/auth.api';
import settingsApi from '@/services/settings.api';
import {
  Save,
  User,
  BellRing,
  Database,
  Sparkles,
  Eye,
  EyeOff,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Settings as SettingsIcon
} from 'lucide-react';

export default function SettingsView() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.admin);
  
  const [activeTab, setActiveTab] = useState('ai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      // Profile
      name: profile?.name || '',
      email: profile?.email || '',
      role: profile?.role || '',
      avatar: profile?.avatar || '',
      // Settings
      geminiModel: 'gemini-flash-latest',
      geminiApiKey: '',
      aiReceiptScanner: true,
      voiceTransactionScanner: false,
      aiChatbotAdvisor: true,
      maintenanceMode: false,
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false,
    }
  });

  const selectedModel = watch('geminiModel');
  const aiReceiptScanner = watch('aiReceiptScanner');
  const voiceTransactionScanner = watch('voiceTransactionScanner');
  const aiChatbotAdvisor = watch('aiChatbotAdvisor');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const systemSettings = await settingsApi.getSettings();
        
        reset({
          name: profile?.name || '',
          email: profile?.email || '',
          role: profile?.role || '',
          avatar: profile?.avatar || '',
          // Assuming systemSettings maps to these:
          geminiModel: systemSettings?.geminiModel || 'gemini-flash-latest',
          geminiApiKey: systemSettings?.geminiApiKey || '',
          aiReceiptScanner: systemSettings?.aiReceiptScanner ?? true,
          voiceTransactionScanner: systemSettings?.voiceTransactionScanner ?? false,
          aiChatbotAdvisor: systemSettings?.aiChatbotAdvisor ?? true,
          maintenanceMode: systemSettings?.maintenanceMode ?? false,
          autoBackup: systemSettings?.autoBackup ?? true,
          emailNotifications: systemSettings?.emailNotifications ?? true,
          smsNotifications: systemSettings?.smsNotifications ?? false,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      // Save profile
      await authApi.updateProfile({
        fullName: data.name,
        email: data.email
      });
      dispatch(updateProfile({
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      }));
      
      // Save settings
      await settingsApi.updateSettings({
        geminiModel: data.geminiModel,
        geminiApiKey: data.geminiApiKey,
        aiReceiptScanner: data.aiReceiptScanner,
        voiceTransactionScanner: data.voiceTransactionScanner,
        aiChatbotAdvisor: data.aiChatbotAdvisor,
        maintenanceMode: data.maintenanceMode,
        autoBackup: data.autoBackup,
        emailNotifications: data.emailNotifications,
        smsNotifications: data.smsNotifications,
      });

      alert('Admin configuration successfully updated on database.');
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to save settings.');
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Engine & Models', icon: Cpu },
    { id: 'profile', label: 'Super Admin Profile', icon: User },
    { id: 'system', label: 'System & Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Alert Notifications', icon: BellRing },
  ];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="text-primary" />
          Settings & Configuration
        </h1>
        <p className="text-sm text-muted-foreground">Manage your AI models, system preferences, and security settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-muted/40 p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center whitespace-nowrap gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Tab Content: AI Engine */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
              
              <div className="space-y-4 border-b border-border pb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    Gemini Model Switcher
                  </label>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <CheckCircle2 size={12} /> Active: {selectedModel}
                  </span>
                </div>
                <select
                  {...register('geminiModel')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash — Recommended (High Speed & Vision OCR)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite — Ultra Lightweight & High Speed</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro — Advanced Reasoning & Logic</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash — Multimodal Fast Processing</option>
                  <option value="gemini-flash-latest">gemini-flash-latest — Default Alias</option>
                </select>
              </div>

              <div className="space-y-4 border-b border-border pb-6">
                <div>
                  <label className="text-sm font-bold text-foreground">Custom Gemini API Key</label>
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to use the default environment API key set in server .env</p>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    {...register('geminiApiKey')}
                    placeholder="AIzaSy..."
                    className="w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-sm font-bold text-foreground">AI Feature Toggles</h3>
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      AI Receipt Scanner
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${aiReceiptScanner ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {aiReceiptScanner ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Enable or disable receipt OCR parsing for camera & gallery uploads.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('aiReceiptScanner')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Voice Transaction Scanner
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${voiceTransactionScanner ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {voiceTransactionScanner ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Enable or disable voice speech-to-text transaction parsing.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('voiceTransactionScanner')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      AI Chatbot Advisor
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${aiChatbotAdvisor ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {aiChatbotAdvisor ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Enable or disable interactive AI financial assistant.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('aiChatbotAdvisor')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="rounded-xl border border-border bg-card shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">System Role</label>
                <input
                  type="text"
                  {...register('role')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Avatar Initials (2 Chars)</label>
                <input
                  type="text"
                  maxLength={2}
                  {...register('avatar')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: System & Security */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
             <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground">Maintenance Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Restrict client app edits.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('maintenanceMode')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground">Auto Database Backup</h4>
                    <p className="text-xs text-muted-foreground mt-1">Snapshot every 24h.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('autoBackup')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

             </div>
          </div>
        )}

        {/* Tab Content: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2">
             <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground">Email Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">Weekly billing reports.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('emailNotifications')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-foreground">SMS Urgent Toggles</h4>
                    <p className="text-xs text-muted-foreground mt-1">Payment warnings.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" {...register('smsNotifications')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

             </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
