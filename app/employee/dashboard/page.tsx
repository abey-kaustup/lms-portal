import React from 'react';
import Link from 'next/link';
import { getEmployeeLearningState } from '@/actions/learning';
import { getSession } from '@/lib/auth';
import { StatCard, ProgressBar, Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

export default async function EmployeeDashboardPage() {
  const session = await getSession();
  const state = await getEmployeeLearningState();

  const {
    course,
    totalLessonsCount,
    completedLessonsCount,
    overallProgressPercentage,
    allLessonsCompleted,
    isAssessmentUnlocked,
    isCourseFullyCompleted,
    passedAttempt,
    certificate,
  } = state;

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Internal Corporate Induction 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {session?.name}!
            </h2>
            <p className="text-slate-300 text-sm">
              Department: <strong className="text-white">{session?.department || 'General'}</strong> | Designation:{' '}
              <strong className="text-white">{session?.designation || 'Staff'}</strong>
            </p>
            <p className="text-xs text-slate-400">
              Complete all mandatory induction modules, pass the final assessment, and receive your verified corporate certificate.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/employee/learn"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-5 h-5 fill-current" />
              <span>{completedLessonsCount > 0 ? 'Resume Learning' : 'Start Induction'}</span>
            </Link>
          </div>
        </div>

        {/* Subtle background graphic gradient */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Progress"
          value={`${overallProgressPercentage}%`}
          subtitle={`${completedLessonsCount} of ${totalLessonsCount} Lessons Completed`}
          icon={BookOpen}
          color="blue"
        />

        <StatCard
          title="Completed Lessons"
          value={completedLessonsCount}
          subtitle={`Total Lessons: ${totalLessonsCount}`}
          icon={CheckCircle2}
          color="emerald"
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
              ? `Score: ${passedAttempt.score}%`
              : allLessonsCompleted
              ? 'Ready to take assessment'
              : 'Complete lessons to unlock'
          }
          icon={FileCheck2}
          color={isCourseFullyCompleted ? 'emerald' : isAssessmentUnlocked ? 'amber' : 'slate'}
        />

        <StatCard
          title="Certificate Status"
          value={certificate ? 'Issued' : 'Pending'}
          subtitle={certificate ? certificate.certificateNumber : 'Unlocked upon passing'}
          icon={Award}
          color={certificate ? 'purple' : 'slate'}
        />
      </div>

      {/* Main Course Progress Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Course</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{course.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{course.description}</p>
          </div>
          <Badge variant={isCourseFullyCompleted ? 'success' : 'info'} className="self-start sm:self-auto">
            {isCourseFullyCompleted ? 'Course Fully Completed' : 'In Progress'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <ProgressBar progress={overallProgressPercentage} size="lg" color="emerald" />

        {/* Module breakdown summary */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Course Modules & Unlock Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {course.modules.map((mod, index) => (
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
                  <span className="text-xs font-bold text-slate-400">Module 0{index + 1}</span>
                  {mod.isCompleted ? (
                    <Badge variant="success">Completed</Badge>
                  ) : mod.isUnlocked ? (
                    <Badge variant="info">Available</Badge>
                  ) : (
                    <Badge variant="default">Locked</Badge>
                  )}
                </div>

                <h5 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{mod.title}</h5>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>{mod.lessons.length} Lessons</span>
                  {mod.isUnlocked && (
                    <Link
                      href={`/employee/learn?lessonId=${mod.lessons[0]?.id}`}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Footer Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Resume from Last Watched Timestamp</p>
              <p className="text-[11px] text-slate-500">
                Your video watch progress is automatically saved to the database.
              </p>
            </div>
          </div>

          <Link
            href="/employee/learn"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
