import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-main)] rounded-2xl p-5 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      
      <div className="h-24 bg-[var(--bg-card)] rounded-xl mb-4 w-full"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-card)]"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--bg-card)] rounded w-3/4"></div>
          <div className="h-3 bg-[var(--bg-card)] rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-[var(--bg-card)] rounded w-full"></div>
        <div className="h-3 bg-[var(--bg-card)] rounded w-5/6"></div>
      </div>
      
      <div className="flex items-center justify-between border-t border-[var(--border-main)] pt-4">
        <div className="h-4 bg-[var(--bg-card)] rounded w-1/4"></div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--bg-card)]"></div>
          <div className="w-6 h-6 rounded-full bg-[var(--bg-card)]"></div>
        </div>
      </div>
    </div>
  );
};
