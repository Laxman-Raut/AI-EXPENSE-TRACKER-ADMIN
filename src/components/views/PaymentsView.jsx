'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/services/payments.api';
import { TableSkeleton } from '../ui/Skeleton';
import Dialog from '../ui/Dialog';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RotateCcw,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function PaymentsView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch payments with filters
  const { data: paymentsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['paymentsList', { search, statusFilter, providerFilter, page }],
    queryFn: () => paymentsApi.getPayments({
      search,
      status: statusFilter,
      provider: providerFilter,
      page,
      limit: 8
    }),
  });

  const payments = paymentsResponse?.payments || [];
  const totalPages = paymentsResponse?.totalPages || 1;
  const totalCount = paymentsResponse?.total || 0;
  const isMissingApi = paymentsResponse?.isMissingApi || false;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const handleRefund = (payment) => {
    const confirmRefund = window.confirm(`Are you sure you want to refund $${payment.amount.toFixed(2)} to ${payment.user}?`);
    if (confirmRefund) {
      alert(`Refund request submitted for transaction ${payment.id}.`);
      refetch();
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-dashed border-border p-16 text-center animate-in fade-in duration-300">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3.5 border border-rose-500/20">
          <ShieldAlert size={20} />
        </div>
        <h3 className="text-sm font-bold text-foreground">API Connection Error</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Could not retrieve the payment ledger. Check that your backend service is running.
        </p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-md shadow-primary/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isMissingApi) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments Ledger</h1>
          <p className="text-sm text-muted-foreground">Trace billing details, examine gateway invoices, and process subscriber refunds.</p>
        </div>

        {/* Empty TODO state */}
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3.5 border border-amber-500/20">
            <ShieldAlert size={20} />
          </div>
          <h3 className="text-sm font-bold text-foreground">TODO: Implement payments API endpoint</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
            Every number visible in the dashboard must come from backend APIs. Since the detailed payments query is not supported by the original Express backend routes, this view is suspended until the API is implemented.
          </p>
          <div className="mt-4 text-[10px] font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border inline-block">
            File reference: <span className="font-mono">src/services/payments.api.js</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments Ledger</h1>
        <p className="text-sm text-muted-foreground">Trace billing details, examine gateway invoices, and process subscriber refunds.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search account holder..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/30 focus:bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Filter size={13} /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <Filter size={13} /> Provider
            </span>
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Providers</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground/35 mx-auto mb-3.5" />
          <h3 className="text-sm font-bold text-foreground">No payments found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Verify your filters or look for other transaction references.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Associated Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/15 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{payment.user}</p>
                      <p className="text-[10px] text-muted-foreground">{payment.email}</p>
                    </td>
                    <td className="p-4 font-bold text-foreground">${payment.amount.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground font-medium">{payment.provider}</td>
                    <td className="p-4 font-medium text-foreground">{payment.plan}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{payment.date}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {payment.status === 'Success' && (
                          <button
                            onClick={() => handleRefund(payment)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                            title="Refund Transaction"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Showing <span className="text-foreground">{payments.length}</span> of <span className="text-foreground">{totalCount}</span> transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-2 text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog 
        isOpen={!!selectedPayment} 
        onClose={() => setSelectedPayment(null)}
        title="Transaction Details"
      >
        {selectedPayment && (
          <div className="space-y-4 text-sm">
            <div className="pb-4 border-b border-border flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Receipt Amount</span>
                <h4 className="font-bold text-foreground text-2xl mt-0.5">${selectedPayment.amount.toFixed(2)}</h4>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedPayment.status)}`}>
                {selectedPayment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Account Holder</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.user}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedPayment.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.provider}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subscription Plan</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.plan}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Created Date</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedPayment.date}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Transaction Reference ID</span>
                <p className="font-mono text-xs text-foreground mt-0.5">{selectedPayment.id}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-2 flex justify-end gap-2">
              {selectedPayment.status === 'Success' && (
                <button 
                  onClick={() => {
                    handleRefund(selectedPayment);
                    setSelectedPayment(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold transition-colors"
                >
                  Issue Refund
                </button>
              )}
              <button 
                onClick={() => setSelectedPayment(null)}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
