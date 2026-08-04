import React from 'react';
import { SkeletonPageHeader, SkeletonCard } from '@/components/ui/SkeletonLoader';

export default function RootLoading() {
  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
