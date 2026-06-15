import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard = () => {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 overflow-hidden relative">
      <Skeleton className="h-24 rounded-xl mb-4 w-full" />
      
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 rounded w-3/4" />
          <Skeleton className="h-3 rounded w-1/2" />
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <Skeleton className="h-3 rounded w-full" />
        <Skeleton className="h-3 rounded w-5/6" />
      </div>
      
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <Skeleton className="h-4 rounded w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};
