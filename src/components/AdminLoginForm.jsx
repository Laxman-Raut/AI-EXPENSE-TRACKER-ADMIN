'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/services/auth.api';
import { ShieldAlert, KeyRound, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AdminLoginForm({ onLoginSuccess }) {
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const response = await authApi.login(data.email, data.password);
      if (response.success && response.data?.user) {
        const userRole = response.data.user?.role;
        if (userRole === 'admin' || userRole === 'super_admin') {
          // Cookies are set automatically by the browser from Set-Cookie headers
          // No need to store token in localStorage
          onLoginSuccess(response.data);
        } else {
          setErrorMsg('Access Denied: You do not have administrator permissions.');
        }
      } else {
        setErrorMsg('Authentication failed.');
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || 
        error.message || 
        'An error occurred during authentication.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 text-card-foreground shadow-lg">
        {/* Header decoration logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 text-lg">
            E
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-4">ExpenseAI Portal</h2>
          <p className="text-xs text-muted-foreground mt-1.5">Sign in to your administrator dashboard</p>
        </div>

        {/* Warning messages */}
        {errorMsg && (
          <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@expenseai.co"
                {...register('email')}
                className={`w-full h-10 pl-9 pr-4 rounded-lg border text-xs font-semibold bg-muted/20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-border'}
                `}
              />
            </div>
            {errors.email && <p className="text-[10px] font-semibold text-rose-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full h-10 pl-9 pr-4 rounded-lg border text-xs font-semibold bg-muted/20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all
                  ${errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-border'}
                `}
              />
            </div>
            {errors.password && <p className="text-[10px] font-semibold text-rose-500">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors flex items-center justify-center shadow-md shadow-primary/10 mt-6 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 rounded-full border border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              'Verify Credentials'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
