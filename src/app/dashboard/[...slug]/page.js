'use client';

import React, { use } from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function DynamicDashboardPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug?.[0] || 'dashboard';
  return <DashboardShell initialView={slug} />;
}
