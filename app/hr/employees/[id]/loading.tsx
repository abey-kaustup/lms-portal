import React from 'react';
import { SkeletonPageHeader, SkeletonCard, SkeletonTable } from '@/components/ui/SkeletonLoader';

export default function EmployeeDetailLoading() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard className="p-4 space-y-2" />
        <SkeletonCard className="p-4 space-y-2" />
        <SkeletonCard className="p-4 space-y-2" />
      </div>
      <SkeletonTable rows={4} cols={4} />
    </div>
  );
}
