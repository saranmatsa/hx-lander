import React from 'react';

export const PositionDetailsSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-7 shadow-2xl relative overflow-hidden animate-pulse">
      {/* Candidate ID and Status Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div className="space-y-2">
          <div className="h-2.5 w-28 bg-zinc-900 rounded-full shimmer-skeleton" />
          <div className="h-8 w-44 bg-zinc-900 rounded-lg shimmer-skeleton" />
        </div>

        <div className="sm:text-right space-y-2">
          <div className="h-2.5 w-20 bg-zinc-900 rounded-full shimmer-skeleton sm:ml-auto" />
          <div className="h-6 w-32 bg-zinc-900 rounded-full shimmer-skeleton sm:ml-auto" />
        </div>
      </div>

      {/* 3 Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 space-y-3">
            <div className="h-3 w-20 bg-zinc-800/80 rounded shimmer-skeleton" />
            <div className="h-9 w-24 bg-zinc-800/90 rounded shimmer-skeleton" />
            <div className="h-2.5 w-28 bg-zinc-900 rounded shimmer-skeleton" />
          </div>
        ))}
      </div>

      {/* Metadata Rows Skeleton */}
      <div className="border-t border-zinc-900 pt-5 space-y-4 font-mono text-xs">
        <div className="flex justify-between items-center py-1.5 border-b border-zinc-900/60">
          <div className="h-3 w-24 bg-zinc-900 rounded shimmer-skeleton" />
          <div className="h-3 w-36 bg-zinc-900 rounded shimmer-skeleton" />
        </div>

        <div className="flex justify-between items-center py-1.5 border-b border-zinc-900/60">
          <div className="h-3 w-28 bg-zinc-900 rounded shimmer-skeleton" />
          <div className="h-3 w-40 bg-zinc-900 rounded shimmer-skeleton" />
        </div>

        {/* Token Card Skeleton */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4 space-y-3 mt-2">
          <div className="flex justify-between items-center">
            <div className="h-2.5 w-32 bg-zinc-800 rounded shimmer-skeleton" />
            <div className="h-2.5 w-16 bg-zinc-800 rounded shimmer-skeleton" />
          </div>
          <div className="h-10 w-full bg-zinc-900 rounded-lg shimmer-skeleton" />
        </div>
      </div>
    </div>
  );
};
