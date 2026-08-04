import React from 'react';
import Link from 'next/link';
import { getEmployeeLearningState } from '@/actions/learning';
import { getSession } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard, ProgressBar, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Award,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  PlayCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default async function EmployeeDashboardPage() {
  const session = await getSession();
  const state = await getEmployeeLearningState();

  if (!state) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm font-semibold">Unable to load learning state. Please refresh or contact HR.</p>
      </div>
    );
  }

  const {
    employee,
    course,
    commonModules = [],
    departmentModules = [],
    totalLessonsCount = 0,
    completedLessonsCount = 0,
    commonLessonsCount = 0,
    commonCompletedCount = 0,
    deptLessonsCount = 0,
    deptCompletedCount = 0,
    overallProgressPercentage = 0,
    allCommonCompleted = false,
    allLessonsCompleted = false,
    isAssessmentUnlocked = false,
    isCourseFullyCompleted = false,
    passedAttempt = null,
    certificate = null,
  } = state;

  const empDeptName = employee?.departmentRel?.name || session?.department || 'General';

  // Find active unlocked module and lesson for immediate quick action
  const activeModule =
    commonModules.find((m: any) => !m.isCompleted && m.isUnlocked) ||
    departmentModules.find((m: any) => !m.isCompleted && m.isUnlocked) ||
    commonModules[0];

  const activeLesson =
    activeModule?.lessons?.find((l: any) => !l.isCompleted) ||
    activeModule?.lessons?.[0];

  // SVG Circular Progress Calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgressPercentage / 100) * circumference;

  return (
    <div className="h-full flex flex-col justify-between space-y-3 overflow-hidden">
      {/* Executive Hero Banner (Shrink-0) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-3.5 sm:p-4 text-white shadow-soft-md border border-slate-800/80 shrink-0">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Column: Greeting & Badge Chips */}
          <div className="space-y-1 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold border border-blue-400/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Corporate Onboarding 2026
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Dept: <strong className="text-white font-bold">{empDeptName}</strong> | {session?.designation || 'Staff'}
              </span>
              {employee?.isOverdue ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/30 text-red-200 text-[10px] font-extrabold border border-red-400/50 uppercase tracking-wider animate-pulse">
                  <Clock className="w-3 h-3 text-red-400" />
                  OVERDUE BY {employee.overdueDays || 1} DAY(S)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {employee?.daysRemaining !== undefined ? `${employee.daysRemaining} Days Left in 7-Day Window` : '7-Day Compliance Active'}
                </span>
              )}
              {state.isMasterTester && (
                <span className="text-[9px] font-black bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-md border border-purple-400/40 uppercase tracking-wider">
                  MASTER TEST
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Welcome back, {session?.name || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-tight">
              Complete core induction modules followed by {empDeptName} training to unlock your assessment.
            </p>
          </div>

          {/* Right Column: Direct CTA Action Button */}
          <div className="shrink-0">
            <Link href={activeLesson ? `/employee/learn?lessonId=${activeLesson.id}` : '/employee/learn'}>
              <Button variant="primary" size="md" icon={PlayCircle} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 text-xs sm:text-sm shadow-[0_4px_16px_0_rgba(37,99,235,0.45)] cta-pulse-glow hover:scale-[1.02] active:scale-[0.97]">
                {completedLessonsCount > 0 ? 'Resume Induction' : 'Start Induction'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Overview Summary Cards Grid (Shrink-0, Executive min-h-[96px]) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <StatCard
          title="Overall Progression"
          value={`${overallProgressPercentage}%`}
          subtitle={`${completedLessonsCount} of ${totalLessonsCount} Lessons Done`}
          icon={BookOpen}
          color="blue"
          progress={overallProgressPercentage}
          badgeText="COMPLIANCE"
          actionHref="/employee/learn"
          actionText="Open Learning Center"
        />

        <StatCard
          title="Common Core Modules"
          value={`${commonCompletedCount}/${commonLessonsCount}`}
          subtitle={allCommonCompleted ? '✔ Core Complete' : `${Math.max(0, commonLessonsCount - commonCompletedCount)} Core Lesson(s) Pending`}
          icon={CheckCircle2}
          color={allCommonCompleted ? 'emerald' : 'blue'}
          progress={commonLessonsCount > 0 ? (commonCompletedCount / commonLessonsCount) * 100 : 0}
          badgeText={allCommonCompleted ? 'PASSED' : 'MANDATORY'}
          actionHref="/employee/learn"
          actionText="View Core Modules"
        />

        <StatCard
          title="Assessment Status"
          value={
            isCourseFullyCompleted
              ? 'Passed'
              : isAssessmentUnlocked
                ? 'Unlocked'
                : 'Locked'
          }
          subtitle={
            passedAttempt
              ? `Score: ${passedAttempt.score}% • Passed`
              : allLessonsCompleted
                ? 'Ready for assessment'
                : 'Complete lessons to unlock'
          }
          icon={FileCheck2}
          color={isCourseFullyCompleted ? 'emerald' : isAssessmentUnlocked ? 'amber' : 'slate'}
          badgeText={isCourseFullyCompleted ? 'VERIFIED' : isAssessmentUnlocked ? 'READY' : 'LOCKED'}
          actionHref={isAssessmentUnlocked ? '/employee/assessment' : undefined}
          actionText={isAssessmentUnlocked ? 'Take Assessment Test' : undefined}
        />

        <StatCard
          title="Certificate Status"
          value={certificate ? 'Issued' : 'Pending'}
          subtitle={certificate ? `Ref: ${certificate.certificateNumber}` : 'Unlocked after test'}
          icon={Award}
          color={certificate ? 'purple' : 'slate'}
          badgeText={certificate ? 'VERIFIED PDF' : 'LOCKED'}
          actionHref={certificate ? '/employee/certificate' : undefined}
          actionText={certificate ? 'Download Certificate' : undefined}
        />
      </div>

      {/* Combined 2-Column Executive High-Density Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden">
        {/* Left Column (Flex-1): Learning Focus & Roadmap Card */}
        <div className="flex-1 h-full flex flex-col min-h-0">
          <Card className="ultra-compact-card h-full flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl shadow-soft-sm border border-slate-200/80">
            <CardHeader className="flex-row items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Learning Progression & Roadmap</CardTitle>
                </div>
              </div>
              <Badge variant={isCourseFullyCompleted ? 'success' : 'info'}>
                {isCourseFullyCompleted ? 'Course Fully Completed' : 'Induction In Progress'}
              </Badge>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between space-y-2.5 p-0 min-h-0">
              {/* Current Active Lesson Sub-Panel */}
              <div className="p-3 bg-slate-50/90 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 micro-lift shrink-0">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Current Focus: {activeModule?.moduleType === 'DEPARTMENT' ? `${empDeptName} Module` : 'Core Common Module'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activeLesson?.title || activeModule?.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{activeModule?.description}</p>
                </div>

                <div className="shrink-0">
                  {activeLesson ? (
                    <Link href={`/employee/learn?lessonId=${activeLesson.id}`}>
                      <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                        Continue Lesson
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      Done
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Tracker Bar */}
              <div className="space-y-1 py-1 shrink-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  <span>Induction Compliance Benchmark</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{overallProgressPercentage}%</span>
                </div>
                <ProgressBar progress={overallProgressPercentage} size="sm" color="emerald" />
              </div>

              {/* Curriculum Roadmap Rows */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Curriculum Tracks</span>
                  <Link href="/employee/learn" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
                    <span>View Full Catalog</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Common Modules Row */}
                <div className="p-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">1. Core Common Induction ({commonModules.length} Modules)</span>
                  </div>
                  <Badge variant={allCommonCompleted ? 'success' : 'info'}>
                    {commonCompletedCount}/{commonLessonsCount} Lessons
                  </Badge>
                </div>

                {/* Department Modules Row */}
                <div className="p-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">2. Department Training ({empDeptName})</span>
                  </div>
                  <Badge variant={allCommonCompleted ? (deptCompletedCount === deptLessonsCount && deptLessonsCount > 0 ? 'success' : 'purple') : 'default'}>
                    {allCommonCompleted ? `${deptCompletedCount}/${deptLessonsCount} Lessons` : 'Locked'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Fixed Width): Assessment Readiness & Compliance Summary */}
        <div className="w-full lg:w-[350px] shrink-0 h-full flex flex-col min-h-0">
          <Card className="ultra-compact-card h-full flex flex-col justify-between space-y-2 p-3.5 sm:p-4 rounded-2xl shadow-soft-sm border border-slate-200/80 dark:border-slate-800/80">
            {/* Assessment Panel Header */}
            <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-xl p-3 space-y-2 border border-slate-800 shadow-soft-sm shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Assessment Status</h3>
                </div>
                <Badge variant={isAssessmentUnlocked ? 'success' : 'default'}>
                  {isAssessmentUnlocked ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 font-normal leading-tight">
                {passedAttempt
                  ? `Passed with ${passedAttempt.score}% score. Your certificate is verified.`
                  : isAssessmentUnlocked
                    ? 'All mandatory lessons complete. Ready for assessment.'
                    : 'Complete all mandatory lessons to unlock.'}
              </p>

              {isAssessmentUnlocked ? (
                <Link href="/employee/assessment" className="block">
                  <Button variant="primary" fullWidth size="sm" className="bg-blue-600 hover:bg-blue-500 py-1 text-xs font-bold">
                    {passedAttempt ? 'Retake Assessment' : 'Take Assessment Now'}
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" fullWidth size="sm" disabled className="opacity-60 cursor-not-allowed py-1 text-xs font-bold">
                  Locked (Complete Lessons)
                </Button>
              )}

              {certificate && (
                <div className="pt-1.5 border-t border-slate-800">
                  <Link href="/employee/certificate" className="block">
                    <Button variant="success" fullWidth size="sm" icon={Award} className="py-1 text-xs font-bold">
                      Download Certificate
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Compliance Summary Table */}
            <div className="space-y-2 pt-2 text-xs flex-1 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Compliance Metrics</span>

              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/70 dark:border-blue-900/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-300 text-xs sm:text-sm">Lesson Completion</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">{completedLessonsCount} of {totalLessonsCount} Completed</p>
                </div>
                <Badge variant="info">{overallProgressPercentage}%</Badge>
              </div>

              <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm">Assigned Department</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{empDeptName}</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
