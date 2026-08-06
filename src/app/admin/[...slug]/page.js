'use client';

import React from 'react';
import DashboardShell from '@/components/DashboardShell';

export default function DynamicAdminPage({ params }) {
  const slug = params?.slug?.[0] || 'dashboard';
  return <DashboardShell initialView={slug} />;
}
