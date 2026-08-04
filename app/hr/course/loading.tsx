import React from 'react';
import { SkeletonPageHeader, SkeletonCard } from '@/components/ui/SkeletonLoader';

export default function HRCourseLoading() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard className="p-4 space-y-3" />
        <SkeletonCard className="p-4 space-y-3" />
      </div>
    </div>
  );
}
