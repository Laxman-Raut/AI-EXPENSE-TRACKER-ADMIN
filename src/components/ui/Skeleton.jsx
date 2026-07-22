import React from 'react';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/60 ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-border bg-muted/40 p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-1/4 mr-4 last:mr-0" />
        ))}
      </div>
      {/* Body */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton 
                key={c} 
                className={`h-4 mr-4 last:mr-0
                  ${c === 0 && cols > 2 ? 'w-8 h-8 rounded-full' : 'w-1/4'}
                `} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex h-64 items-end justify-between gap-2 px-4">
        <Skeleton className="h-[20%] w-[10%] rounded-t" />
        <Skeleton className="h-[50%] w-[10%] rounded-t" />
        <Skeleton className="h-[40%] w-[10%] rounded-t" />
        <Skeleton className="h-[75%] w-[10%] rounded-t" />
        <Skeleton className="h-[60%] w-[10%] rounded-t" />
        <Skeleton className="h-[85%] w-[10%] rounded-t" />
        <Skeleton className="h-[95%] w-[10%] rounded-t" />
      </div>
      <div className="mt-4 flex justify-center gap-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
