import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="mt-4">
      <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="mt-2 h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full space-y-3 animate-pulse">
    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"></div>
    ))}
  </div>
);

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="h-48 bg-slate-200 dark:bg-slate-800"></div>
        <div className="p-4 space-y-2.5">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="pt-2 flex justify-between">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
