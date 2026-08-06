'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLoginForm from '@/components/AdminLoginForm';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoginSuccess = () => {
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    router.push(callbackUrl);
    router.refresh();
  };

  return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold animate-pulse text-lg">
            E
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
