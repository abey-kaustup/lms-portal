import React from 'react';

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-2xl ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonBox className="w-1/3 h-4" />
        <SkeletonBox className="w-8 h-8 rounded-xl" />
      </div>
      <SkeletonBox className="w-1/2 h-8" />
      <SkeletonBox className="w-2/3 h-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-xs overflow-hidden p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <SkeletonBox className="w-48 h-8 rounded-xl" />
        <SkeletonBox className="w-32 h-8 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 py-2">
            <SkeletonBox className="w-10 h-10 rounded-full" />
            <SkeletonBox className="w-1/4 h-4" />
            <SkeletonBox className="w-1/6 h-4" />
            <SkeletonBox className="w-1/5 h-4" />
            <SkeletonBox className="w-12 h-6 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
