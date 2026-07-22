'use client';

import React, { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ReportsView() {
  useEffect(() => {
    console.error('[ReportsView] Missing Endpoint: GET /v1/admin/reports');
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & System Reports</h1>
        <p className="text-sm text-muted-foreground">Compile and download detailed CSV / Excel reports for audit reviews.</p>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">Endpoint Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          Detailed metrics extraction and billing export spreadsheets require a dedicated administrative reporting service. This endpoint is not implemented on the backend.
        </p>
        <div className="mt-4 text-[10px] font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border inline-block">
          Required Endpoint: <span className="font-mono">GET /api/v1/admin/reports</span>
        </div>
      </div>
    </div>
  );
}
