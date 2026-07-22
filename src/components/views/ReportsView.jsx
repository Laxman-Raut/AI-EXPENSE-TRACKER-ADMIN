'use client';

import React, { useState } from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'revenue', title: 'Monthly Revenue Audit', desc: 'Breakdown of monthly subscription renewals, churn costs, and payouts.', format: 'CSV / XLSX' },
  { id: 'users', title: 'User Account Activity', desc: 'List of all users, emails, sign-up records, and active plans.', format: 'CSV' },
  { id: 'ai', title: 'AI Tokens Usage Summary', desc: 'Audit log of query counts, LLM model triggers, and latency metrics.', format: 'JSON / CSV' },
  { id: 'payments', title: 'Transaction Ledger Export', desc: 'Gateway payouts, payment methods (Stripe, PayPal), and status codes.', format: 'XLSX' }
];

export default function ReportsView() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = (id, title) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      alert(`Report "${title}" successfully compiled and downloaded to your local device.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & System Reports</h1>
        <p className="text-sm text-muted-foreground">Compile and download detailed CSV / Excel reports for audit reviews.</p>
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((rep) => (
          <div key={rep.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{rep.title}</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{rep.format}</span>
                </div>
              </div>
              
              <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed">{rep.desc}</p>
            </div>

            <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock size={12} /> Auto-updates daily
              </span>
              
              <button
                onClick={() => handleDownload(rep.id, rep.title)}
                disabled={downloading !== null}
                className="h-8 px-3.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {downloading === rep.id ? (
                  <>
                    <span className="h-3 w-3 rounded-full border border-primary-foreground border-t-transparent animate-spin shrink-0" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Download size={13} />
                    Download File
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
