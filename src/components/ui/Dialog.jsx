'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ isOpen, onClose, title, children, size = 'default', position = 'center' }) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRight = position === 'right';

  const sizeClasses = {
    sm: 'max-w-md min-h-[300px]',
    default: 'max-w-xl min-h-[380px]',
    lg: 'max-w-2xl min-h-[50vh]',
    xl: 'max-w-3xl min-h-[55vh]',
  }[size] || 'max-w-xl min-h-[380px]';

  return (
    <div className={`fixed inset-0 z-50 flex ${isRight ? 'justify-end' : 'items-center justify-center p-4'}`}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />
      
      {/* Dialog / Right Sheet Content */}
      <div 
        className={
          isRight 
            ? "relative h-full w-full sm:w-[480px] md:w-[540px] lg:w-[48vw] max-w-2xl flex flex-col overflow-hidden border-l border-border bg-card text-card-foreground shadow-2xl transition-transform duration-300 animate-in slide-in-from-right z-10"
            : `relative w-full ${sizeClasses} max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-transform duration-300 animate-in zoom-in-95 ease-out z-10`
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
