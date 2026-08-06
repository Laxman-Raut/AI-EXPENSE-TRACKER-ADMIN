'use client';

import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function DynamicDashboardPage({ params }) {
  const slug = params?.slug?.[0] || 'dashboard';
  return <DashboardShell initialView={slug} />;
}
