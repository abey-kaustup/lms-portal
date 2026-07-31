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

  const {
    employee,
    course,
    commonModules,
    departmentModules,
    totalLessonsCount,
    completedLessonsCount,
    commonLessonsCount,
    commonCompletedCount,
    deptLessonsCount,
    deptCompletedCount,
    overallProgressPercentage,
    allCommonCompleted,
    allLessonsCompleted,
    isAssessmentUnlocked,
    isCourseFullyCompleted,
    passedAttempt,
    certificate,
  } = state;

  const empDeptName = employee?.departmentRel?.name || session?.department || 'General';

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Internal Corporate Induction Program 2026</span>
              </div>
              {state.isMasterTester && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-extrabold border border-purple-400/50 shadow-soft-sm tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>MASTER TEST ACCOUNT</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {session?.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-2">
              <span>Department: <strong className="text-white bg-blue-600/40 px-2 py-0.5 rounded-lg border border-blue-400/30 font-bold">{empDeptName}</strong></span>
              <span>| Designation: <strong className="text-white font-bold">{session?.designation || 'Staff'}</strong></span>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Complete mandatory common induction modules followed by specialized {empDeptName} training to unlock the final assessment and receive your verified corporate certificate.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="/employee/learn">
              <Button variant="primary" size="lg" icon={PlayCircle}>
                {completedLessonsCount > 0 ? 'Resume Induction' : 'Start Induction'}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Progress"
          value={`${overallProgressPercentage}%`}
          subtitle={`${completedLessonsCount} of ${totalLessonsCount} Lessons Completed`}
          icon={BookOpen}
          color="blue"
          progress={overallProgressPercentage}
          badgeText="COMPLIANCE"
          actionHref="/employee/learn"
          actionText="Continue Induction"
        />

        <StatCard
          title="Common Modules"
          value={`${commonCompletedCount}/${commonLessonsCount}`}
          subtitle={allCommonCompleted ? '✔ All Core Modules Completed' : `${Math.max(0, commonLessonsCount - commonCompletedCount)} Core Module(s) Remaining`}
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
              ? 'Ready to take assessment test'
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
          subtitle={certificate ? `Ref: ${certificate.certificateNumber}` : 'Unlocked upon passing test'}
          icon={Award}
          color={certificate ? 'purple' : 'slate'}
          badgeText={certificate ? 'VERIFIED PDF' : 'LOCKED'}
          actionHref={certificate ? '/employee/certificate' : undefined}
          actionText={certificate ? 'Download Certificate' : undefined}
        />
      </div>

      {/* Main Course Progress Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Course</span>
            <CardTitle className="mt-0.5">{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </div>
          <Badge variant={isCourseFullyCompleted ? 'success' : 'info'}>
            {isCourseFullyCompleted ? 'Fully Completed' : 'In Progress'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Induction Progression</span>
              <span className="text-emerald-600 font-mono">{overallProgressPercentage}%</span>
            </div>
            <ProgressBar progress={overallProgressPercentage} size="lg" color="emerald" />
          </div>

          {/* SECTION 1: COMMON MODULES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Common Modules <span className="text-slate-400 font-normal">({commonModules.length})</span>
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Completed: <strong className="text-emerald-600">{commonCompletedCount}</strong> | Remaining: <strong className="text-slate-700">{Math.max(0, commonLessonsCount - commonCompletedCount)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {commonModules.map((mod: any, index: number) => (
                <div
                  key={mod.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    mod.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : mod.isUnlocked
                      ? 'bg-blue-50/30 border-blue-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Common 0{index + 1}</span>
                    <Badge variant={mod.isCompleted ? 'success' : mod.isUnlocked ? 'info' : 'default'}>
                      {mod.isCompleted ? 'Completed' : mod.isUnlocked ? 'Available' : 'Locked'}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{mod.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{mod.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span>{mod.lessons.length} Lesson(s)</span>
                    {mod.isUnlocked && (
                      <Link href={`/employee/learn?lessonId=${mod.lessons[0]?.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: DEPARTMENT-SPECIFIC MODULES */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Department Training ({empDeptName})
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {allCommonCompleted ? (
                  <span className="text-emerald-600 font-bold">Unlocked for {empDeptName}</span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 font-bold">
                    <Lock className="w-3.5 h-3.5" /> Unlocks after Common Modules
                  </span>
                )}
              </span>
            </div>

            {departmentModules.length === 0 ? (
              <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-purple-900">No department-specific modules assigned yet for {empDeptName}.</p>
                <p className="text-[11px] text-purple-700 font-medium">Once common modules are complete, HR can assign custom modules for your department.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departmentModules.map((mod: any) => (
                  <div
                    key={mod.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      mod.isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : mod.isUnlocked
                        ? 'bg-purple-50/30 border-purple-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold text-purple-600 uppercase">{empDeptName} Module</span>
                      <Badge variant={mod.isCompleted ? 'success' : mod.isUnlocked ? 'purple' : 'default'}>
                        {mod.isCompleted ? 'Completed' : mod.isUnlocked ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{mod.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{mod.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span>{mod.lessons.length} Specialized Lesson(s)</span>
                      {mod.isUnlocked ? (
                        <Link href={`/employee/learn?lessonId=${mod.lessons[0]?.id}`} className="text-purple-600 hover:text-purple-800 flex items-center gap-1">
                          <span>Start Department Module</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Locked until Common Modules complete</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
