import React from 'react';

// ============================================================================
// 1. REUSABLE SKELETON PRIMITIVES
// ============================================================================

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function SkeletonText({ className = 'w-full h-3.5' }: { className?: string }) {
  return <SkeletonBox className={`rounded-md ${className}`} />;
}

export function SkeletonAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };
  return <SkeletonBox className={`${sizeMap[size]} ${className}`} />;
}

export function SkeletonButton({ className = 'w-24 h-8' }: { className?: string }) {
  return <SkeletonBox className={`rounded-xl ${className}`} />;
}

export function SkeletonBadge({ className = 'w-16 h-5' }: { className?: string }) {
  return <SkeletonBox className={`rounded-full ${className}`} />;
}

export function SkeletonCard({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs space-y-3 ${className}`}>
      {children || (
        <>
          <div className="flex items-center justify-between">
            <SkeletonText className="w-1/3 h-4" />
            <SkeletonAvatar size="sm" />
          </div>
          <SkeletonText className="w-1/2 h-7" />
          <SkeletonText className="w-2/3 h-3" />
        </>
      )}
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="space-y-1 shrink-0">
      <div className="flex items-center gap-2">
        <SkeletonBox className="w-16 h-3 rounded" />
        <SkeletonBox className="w-3 h-3 rounded" />
        <SkeletonBox className="w-28 h-3 rounded" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <SkeletonBox className="w-56 h-6 rounded-lg" />
          <SkeletonBox className="w-80 h-3.5 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonButton className="w-28 h-8" />
          <SkeletonButton className="w-32 h-8" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs overflow-hidden p-4 space-y-3">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <SkeletonBox className="w-44 h-7 rounded-xl" />
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-24 h-7 rounded-lg" />
          <SkeletonBox className="w-20 h-7 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-none">
            <div className="flex items-center gap-3 w-1/3">
              <SkeletonAvatar size="sm" />
              <div className="space-y-1 flex-1">
                <SkeletonText className="w-3/4 h-3.5" />
                <SkeletonText className="w-1/2 h-2.5" />
              </div>
            </div>
            {Array.from({ length: cols - 1 }).map((_, cIdx) => (
              <SkeletonText key={cIdx} className="w-1/6 h-3.5 hidden sm:block" />
            ))}
            <SkeletonButton className="w-16 h-6 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. PAGE-SPECIFIC SKELETONS (EXACT LAYOUT MATCHING)
// ============================================================================

/** Candidate Dashboard Skeleton */
export function EmployeeDashboardSkeleton() {
  return (
    <div className="h-full flex flex-col justify-between space-y-3 overflow-hidden">
      {/* Hero Banner Placeholder */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-4 text-white shadow-soft-md border border-slate-800 shrink-0 flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-36 h-5 rounded-full bg-slate-800" />
            <SkeletonBox className="w-28 h-4 rounded bg-slate-800" />
          </div>
          <SkeletonBox className="w-64 h-7 rounded-lg bg-slate-800" />
          <SkeletonBox className="w-80 h-4 rounded bg-slate-800" />
        </div>
        <SkeletonBox className="w-36 h-10 rounded-xl bg-blue-600/40 shrink-0 hidden sm:block" />
      </div>

      {/* 4 Stat Cards Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonCard key={idx} className="min-h-[96px] justify-between">
            <div className="flex justify-between items-center">
              <SkeletonText className="w-24 h-3" />
              <SkeletonBadge className="w-14 h-4" />
            </div>
            <div className="flex justify-between items-center">
              <SkeletonText className="w-16 h-7" />
              <SkeletonAvatar size="sm" />
            </div>
            <SkeletonBox className="w-full h-1.5 rounded-full" />
          </SkeletonCard>
        ))}
      </div>

      {/* Main 2-Column Overview Placeholder */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
        {/* Left Column (Roadmap & Current Focus) */}
        <div className="flex-1 h-full flex flex-col min-h-0">
          <CardSkeleton className="h-full flex flex-col justify-between p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SkeletonAvatar size="sm" />
                <SkeletonText className="w-48 h-4" />
              </div>
              <SkeletonBadge className="w-24 h-5" />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <SkeletonText className="w-32 h-3" />
              <SkeletonText className="w-3/4 h-4" />
              <SkeletonText className="w-1/2 h-3" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <SkeletonText className="w-full h-2 rounded-full" />
              <SkeletonBox className="w-full h-10 rounded-xl" />
              <SkeletonBox className="w-full h-10 rounded-xl" />
            </div>
          </CardSkeleton>
        </div>

        {/* Right Column (Assessment & Compliance) */}
        <div className="w-full lg:w-[350px] shrink-0 h-full flex flex-col min-h-0">
          <CardSkeleton className="h-full flex flex-col justify-between p-4">
            <div className="bg-slate-900 rounded-xl p-3.5 space-y-2">
              <SkeletonBox className="w-32 h-4 rounded bg-slate-800" />
              <SkeletonBox className="w-full h-3 rounded bg-slate-800" />
              <SkeletonBox className="w-full h-8 rounded-lg bg-blue-600/40" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <SkeletonBox className="w-full h-10 rounded-xl" />
              <SkeletonBox className="w-full h-10 rounded-xl" />
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}

/** HR Executive Dashboard Skeleton */
export function HRDashboardSkeleton() {
  return (
    <div className="h-full flex flex-col justify-between space-y-2 overflow-hidden">
      {/* Page Header */}
      <SkeletonPageHeader />

      {/* 6 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 shrink-0">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} className="min-h-[96px] justify-between">
            <div className="flex justify-between items-center">
              <SkeletonText className="w-20 h-3" />
              <SkeletonAvatar size="sm" />
            </div>
            <SkeletonText className="w-12 h-6" />
            <SkeletonText className="w-24 h-2.5" />
          </SkeletonCard>
        ))}
      </div>

      {/* Main 2-Column Grid */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 overflow-hidden">
        {/* Left Column (Compliance & Audit Feed) */}
        <div className="flex-1 h-full flex flex-col min-h-0 space-y-2 overflow-hidden">
          <CardSkeleton className="shrink-0 p-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <SkeletonText className="w-48 h-4" />
              <SkeletonBadge className="w-20 h-5" />
            </div>
            <div className="space-y-2 pt-1">
              <SkeletonBox className="w-full h-2 rounded-full" />
              <div className="grid grid-cols-3 gap-2">
                <SkeletonBox className="h-10 rounded-lg" />
                <SkeletonBox className="h-10 rounded-lg" />
                <SkeletonBox className="h-10 rounded-lg" />
              </div>
            </div>
          </CardSkeleton>

          {/* Audit Feed Skeleton List */}
          <CardSkeleton className="flex-1 min-h-0 flex flex-col p-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
              <SkeletonText className="w-40 h-4" />
              <SkeletonButton className="w-24 h-6" />
            </div>
            <div className="space-y-2 pt-2 flex-1 overflow-hidden">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2">
                    <SkeletonAvatar size="sm" />
                    <div className="space-y-1">
                      <SkeletonText className="w-36 h-3" />
                      <SkeletonText className="w-24 h-2.5" />
                    </div>
                  </div>
                  <SkeletonBadge className="w-16 h-4" />
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

        {/* Right Column (Quick Tasks & Action Items) */}
        <div className="w-full lg:w-[330px] shrink-0 h-full flex flex-col min-h-0 space-y-2 overflow-hidden">
          <div className="bg-slate-900 rounded-2xl p-3 space-y-2 shrink-0 border border-slate-800">
            <SkeletonBox className="w-40 h-4 rounded bg-slate-800" />
            <SkeletonBox className="w-full h-3 rounded bg-slate-800" />
            <div className="space-y-1.5 pt-1">
              <SkeletonBox className="w-full h-8 rounded-lg bg-slate-800" />
              <SkeletonBox className="w-full h-8 rounded-lg bg-slate-800" />
              <SkeletonBox className="w-full h-8 rounded-lg bg-blue-600/40" />
            </div>
          </div>

          <CardSkeleton className="flex-1 min-h-0 flex flex-col justify-between p-3">
            <SkeletonText className="w-32 h-4" />
            <div className="space-y-2">
              <SkeletonBox className="w-full h-10 rounded-xl" />
              <SkeletonBox className="w-full h-10 rounded-xl" />
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}

/** Learning Center Skeleton */
export function LearningCenterSkeleton() {
  return (
    <div className="h-full flex flex-col justify-between space-y-3 overflow-hidden">
      <SkeletonPageHeader />
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Main Lesson Content Frame */}
        <div className="flex-1 h-full flex flex-col space-y-3 overflow-hidden">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs space-y-3">
            <SkeletonText className="w-1/3 h-5" />
            <SkeletonBox className="w-full h-[320px] rounded-xl" />
            <div className="flex justify-between items-center">
              <SkeletonButton className="w-28 h-9" />
              <SkeletonButton className="w-32 h-9" />
            </div>
          </div>
        </div>
        {/* Course Modules Sidebar */}
        <div className="w-full lg:w-[360px] shrink-0 h-full p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <SkeletonText className="w-40 h-5" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonBox key={idx} className="w-full h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Assessment Skeleton */
export function AssessmentSkeleton() {
  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col justify-between space-y-4 overflow-hidden p-2">
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between shrink-0">
        <SkeletonText className="w-48 h-5" />
        <SkeletonBadge className="w-28 h-7" />
      </div>

      <div className="flex-1 min-h-0 p-6 bg-white rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <SkeletonText className="w-24 h-4" />
          <SkeletonText className="w-3/4 h-6" />
        </div>

        <div className="space-y-3 flex-1 flex flex-col justify-center">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonBox key={idx} className="w-full h-12 rounded-xl" />
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 shrink-0">
          <SkeletonButton className="w-28 h-9" />
          <SkeletonButton className="w-32 h-9" />
        </div>
      </div>
    </div>
  );
}

/** Certificate Skeleton */
export function CertificateSkeleton() {
  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col justify-between space-y-4 overflow-hidden p-2">
      <SkeletonPageHeader />
      <div className="flex-1 min-h-0 p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
        <SkeletonAvatar size="lg" />
        <SkeletonBox className="w-64 h-7 bg-slate-800 rounded-lg" />
        <SkeletonBox className="w-96 h-4 bg-slate-800 rounded" />
        <SkeletonBox className="w-48 h-12 bg-slate-800 rounded-xl" />
        <div className="flex gap-3 pt-4">
          <SkeletonButton className="w-36 h-10 bg-blue-600/40" />
          <SkeletonButton className="w-32 h-10 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

/** Employee Directory Skeleton */
export function EmployeeDirectorySkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

/** Department Skeleton */
export function DepartmentSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonCard key={idx} className="p-4 space-y-3">
            <SkeletonText className="w-36 h-5" />
            <SkeletonText className="w-full h-3" />
            <SkeletonBox className="w-full h-10 rounded-xl" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

/** Reports & Analytics Skeleton */
export function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <SkeletonCard key={idx} className="p-4 space-y-2">
            <SkeletonText className="w-28 h-3" />
            <SkeletonText className="w-16 h-7" />
          </SkeletonCard>
        ))}
      </div>
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}

/** Audit Log Skeleton */
export function AuditLogSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPageHeader />
      <SkeletonTable rows={8} cols={4} />
    </div>
  );
}

/** Card Wrapper Helper for Skeletons */
function CardSkeleton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft-xs ${className}`}>
      {children}
    </div>
  );
}
