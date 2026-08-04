import React from 'react';
import { SkeletonBox } from '@/components/ui/SkeletonLoader';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 space-y-6 shadow-soft-xl border border-slate-200">
        <div className="text-center space-y-2">
          <SkeletonBox className="w-12 h-12 rounded-2xl mx-auto" />
          <SkeletonBox className="w-48 h-6 rounded-lg mx-auto" />
          <SkeletonBox className="w-64 h-3.5 rounded mx-auto" />
        </div>
        <div className="space-y-4">
          <SkeletonBox className="w-full h-11 rounded-xl" />
          <SkeletonBox className="w-full h-11 rounded-xl" />
          <SkeletonBox className="w-full h-11 rounded-xl bg-blue-600/40" />
        </div>
      </div>
    </div>
  );
}
