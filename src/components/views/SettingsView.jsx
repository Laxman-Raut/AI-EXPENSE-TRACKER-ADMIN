'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/store/adminSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/services/auth.api';
import { Save, User, Settings as SettingsIcon, BellRing, Database } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  avatar: z.string().min(2, { message: 'Initials must be exactly 2 characters.' }).max(2, { message: 'Initials must be exactly 2 characters.' }).toUpperCase(),
  twoFactor: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
  autoBackup: z.boolean(),
});

export default function SettingsView() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.admin);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });

  useEffect(() => {
    reset(profile);
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      // Save settings to database via PUT /auth/profile
      await authApi.updateProfile({
        fullName: data.name,
        email: data.email
      });
      dispatch(updateProfile(data));
      alert('Admin configuration successfully updated on database.');
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Configuration</h1>
        <p className="text-sm text-muted-foreground">Adjust system parameters, update super administrator profile, and security preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-4 bg-muted/20">
            <User size={16} className="text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Super Administrator Profile</h3>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-medium bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.name ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-border'}
                `}
              />
              {errors.name && <p className="text-[10px] font-semibold text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-medium bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-border'}
                `}
              />
              {errors.email && <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">System Role</label>
              <input
                type="text"
                {...register('role')}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-medium bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.role ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-border'}
                `}
              />
              {errors.role && <p className="text-[10px] font-semibold text-rose-500">{errors.role.message}</p>}
            </div>

            {/* Avatar Initials */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Avatar Initials (2 Chars)</label>
              <input
                type="text"
                maxLength={2}
                {...register('avatar')}
                className={`w-full h-9 px-3 rounded-lg border text-xs font-medium bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.avatar ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-border'}
                `}
              />
              {errors.avatar && <p className="text-[10px] font-semibold text-rose-500">{errors.avatar.message}</p>}
            </div>
          </div>
        </div>

        {/* Security & System Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Flags */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border p-4 bg-muted/20">
              <Database size={16} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">System Toggles</h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Maintenance Mode</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Restrict client app transaction edits temporarily.</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('maintenanceMode')}
                  className="h-4 w-8 rounded-full border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Auto Database Backup</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Automate full system snapshots every 24 hours.</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('autoBackup')}
                  className="h-4 w-8 rounded-full border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notifications config */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border p-4 bg-muted/20">
              <BellRing size={16} className="text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Alert Subscriptions</h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Email Notifications</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Receive summary reports of billing renewals weekly.</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('emailNotifications')}
                  className="h-4 w-8 rounded-full border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">SMS Urgent Toggles</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Get texted regarding payment pipeline warnings.</p>
                </div>
                <input 
                  type="checkbox" 
                  {...register('smsNotifications')}
                  className="h-4 w-8 rounded-full border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            <Save size={14} />
            {isSubmitting ? 'Saving settings...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
