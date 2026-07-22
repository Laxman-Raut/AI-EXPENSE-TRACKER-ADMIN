'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AiUsageView() {
  // TODO: AI Request Metrics and API Cost Logging endpoint is not supported by the original Express backend routes.
  // Never replace missing APIs with fake data. Display TODO state in the UI.

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Integration Analytics</h1>
        <p className="text-sm text-muted-foreground">Examine AI request counts, model triggers, API costs, and request latencies.</p>
      </div>

      {/* Empty TODO state */}
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3.5 border border-amber-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">TODO: Implement AI usage metrics API</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          Every number visible in the dashboard must come from backend APIs. Since AI query counting and API token logs are not supported by the original Express backend routes, this view is suspended until the API is implemented.
        </p>
        <div className="mt-4 text-[10px] font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border inline-block">
          File reference: <span className="font-mono">src/components/views/AiUsageView.jsx</span>
        </div>
      </div>
    </div>
  );
}
