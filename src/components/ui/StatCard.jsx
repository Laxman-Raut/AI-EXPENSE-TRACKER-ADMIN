'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, growth, icon: Icon, sparkline, prefix = '', suffix = '' }) {
  const isPositive = growth >= 0;
  const isNeutral = growth === 0;

  // Render SVG Sparkline
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    
    const height = 32;
    const width = 120;
    const padding = 2;
    
    const points = sparkline
      .map((val, index) => {
        const x = (index / (sparkline.length - 1)) * width;
        const y = padding + (height - padding * 2) - ((val - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="overflow-visible shrink-0" width={width} height={height}>
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString();
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200 group">
      {/* Icon + Title */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-primary transition-colors duration-200">
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {prefix}{formatNumber(value)}{suffix}
        </span>
      </div>

      {/* Footer Info (Growth + Sparkline) */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {isNeutral ? (
            <span className="text-xs font-semibold text-muted-foreground">
              0.0%
            </span>
          ) : (
            <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositive ? <ArrowUpRight size={14} className="shrink-0" /> : <ArrowDownRight size={14} className="shrink-0" />}
              <span>{Math.abs(growth).toFixed(1)}%</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">vs last month</span>
        </div>
        
        {/* Sparkline display */}
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          {renderSparkline()}
        </div>
      </div>
    </div>
  );
}
