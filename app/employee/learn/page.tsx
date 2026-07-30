'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getEmployeeLearningState, updateLessonProgress } from '@/actions/learning';
import { AntiSkipVideoPlayer } from '@/components/ui/AntiSkipVideoPlayer';
import { PDFViewer } from '@/components/ui/PDFViewer';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

function LearnWorkspaceContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useAntiCheat(true);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<any>(null);

  const queryLessonId = searchParams.get('lessonId');

  const loadState = async () => {
    try {
      const res = await getEmployeeLearningState();
      setData(res);

      let selectedLes: any = null;
      let selectedMod: any = null;

      if (queryLessonId) {
        for (const mod of res.course.modules) {
          const found = mod.lessons.find((l: any) => l.id === queryLessonId);
          if (found && found.isUnlocked) {
            selectedLes = found;
            selectedMod = mod;
            break;
          }
        }
      }

      if (!selectedLes) {
        for (const mod of res.course.modules) {
          if (mod.isUnlocked) {
            for (const les of mod.lessons) {
              if (les.isUnlocked) {
                if (!les.isCompleted && !selectedLes) {
                  selectedLes = les;
                  selectedMod = mod;
                }
              }
            }
          }
        }
      }

      if (!selectedLes && res.course.modules[0]?.lessons[0]) {
        selectedLes = res.course.modules[0].lessons[0];
        selectedMod = res.course.modules[0];
      }

      setActiveLesson(selectedLes);
      setActiveModule(selectedMod);
    } catch (err: any) {
      showToast(err.message || 'Failed to load learning workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, [queryLessonId]);

  const handleVideoProgressUpdate = async (
    watchedSeconds: number,
    totalSeconds: number,
    isCompleted: boolean
  ) => {
    if (!activeLesson) return;
    try {
      const res = await updateLessonProgress({
        lessonId: activeLesson.id,
        watchedSeconds,
        totalSeconds,
      });

      if (res.isCompleted && !activeLesson.isCompleted) {
        showToast(`Completed lesson: ${activeLesson.title}`, 'success');
        loadState();
      }
    } catch (err) {
      console.error('Progress update error:', err);
    }
  };

  const handleManualPDFComplete = async () => {
    if (!activeLesson) return;
    try {
      const res = await updateLessonProgress({
        lessonId: activeLesson.id,
        watchedSeconds: 60,
        totalSeconds: 60,
        markCompletedManualPDF: true,
      });

      if (res.success) {
        showToast('PDF marked as completed!', 'success');
        loadState();
      }
    } catch (err: any) {
      showToast('Failed to mark PDF as completed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Proctored Learning Workspace...</p>
        </div>
      </div>
    );
  }

  if (!data || !activeLesson) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-soft-xs">
        <p className="text-sm font-bold text-slate-700">No active course material found.</p>
      </div>
    );
  }

  const { course, employee, overallProgressPercentage, isAssessmentUnlocked, isCourseFullyCompleted } = data;
  const empDeptName = employee?.departmentRel?.name || employee?.department || 'General';

  return (
    <div className="space-y-6">
      {/* Workspace Header Card */}
      <Card>
        <CardHeader className="flex-col md:flex-row md:items-center justify-between gap-4 border-b-0 pb-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                {activeModule?.moduleType === 'DEPARTMENT' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-purple-700 font-bold">[{empDeptName}]</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>[Common Module]</span>
                  </>
                )}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700">{activeLesson.title}</span>
            </div>
            <CardTitle className="mt-1">{activeLesson.title}</CardTitle>
            {activeLesson.description && (
              <CardDescription className="mt-0.5">{activeLesson.description}</CardDescription>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={activeLesson.isCompleted ? 'success' : 'info'}>
              {activeLesson.isCompleted ? 'Completed' : 'In Progress'}
            </Badge>

            {isAssessmentUnlocked && (
              <Link href="/employee/assessment">
                <Button variant="success" icon={FileCheck2}>
                  Take Assessment
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Player on Left (8 Cols), Module Sidebar on Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player & Content */}
        <div className="lg:col-span-8 space-y-6">
          {(activeLesson.contentType === 'VIDEO' || activeLesson.contentType === 'VIDEO_PDF') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-blue-600" />
                  Lesson Video (SharePoint Hosted)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">Anti-Skip Enforced</span>
              </div>
              <AntiSkipVideoPlayer
                videoUrl={activeLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                initialWatchedSeconds={activeLesson.watchedSeconds}
                minDurationSeconds={activeLesson.minDurationSeconds}
                isCompleted={activeLesson.isCompleted}
                onProgressUpdate={handleVideoProgressUpdate}
                onComplete={() => {
                  handleVideoProgressUpdate(
                    activeLesson.totalSeconds || 120,
                    activeLesson.totalSeconds || 120,
                    true
                  );
                }}
              />
            </div>
          )}

          {(activeLesson.contentType === 'PDF' || activeLesson.contentType === 'VIDEO_PDF') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Lesson Reading Material (SharePoint PDF)
                </span>
              </div>
              <PDFViewer
                pdfUrl={activeLesson.pdfUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'}
                title={activeLesson.title}
                isCompleted={activeLesson.isCompleted}
                onMarkCompleted={handleManualPDFComplete}
              />
            </div>
          )}

          <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-xs flex items-start gap-3 shadow-soft-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Proctored Corporate Learning Environment</p>
              <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                Session activity (tab switching, window focus, video playback) is audited for compliance verification. Fast-forwarding is restricted.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Course Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-sm">Induction Navigation</CardTitle>
              <span className="text-xs font-bold text-blue-600 font-mono">{overallProgressPercentage}% Complete</span>
            </CardHeader>

            <CardContent className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {course.modules.map((mod: any) => {
                const isDept = mod.moduleType === 'DEPARTMENT';

                return (
                  <div key={mod.id} className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                        mod.isUnlocked
                          ? isDept
                            ? 'bg-purple-50 text-purple-900 border border-purple-200'
                            : 'bg-slate-100 text-slate-800'
                          : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                      }`}
                    >
                      <span className="line-clamp-1 flex items-center gap-1.5">
                        {isDept ? (
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span>{mod.title}</span>
                      </span>
                      {!mod.isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    </div>

                    <div className="space-y-1 pl-2">
                      {mod.lessons.map((les: any) => {
                        const isActive = activeLesson?.id === les.id;

                        return (
                          <button
                            key={les.id}
                            disabled={!les.isUnlocked}
                            onClick={() => {
                              setActiveLesson(les);
                              setActiveModule(mod);
                            }}
                            className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                              isActive
                                ? 'bg-blue-600 text-white font-bold shadow-soft-xs'
                                : les.isUnlocked
                                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/60'
                                : 'bg-slate-50/50 text-slate-400 cursor-not-allowed border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {les.isCompleted ? (
                                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                              ) : les.isUnlocked ? (
                                <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                              ) : (
                                <Lock className="w-4 h-4 shrink-0 text-slate-300" />
                              )}
                              <span className="line-clamp-1 font-semibold">{les.title}</span>
                            </div>

                            <div className="shrink-0 text-[10px]">
                              {les.contentType === 'VIDEO' && 'Video'}
                              {les.contentType === 'PDF' && 'PDF'}
                              {les.contentType === 'VIDEO_PDF' && 'Video+PDF'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <div className="p-4 pt-2 border-t border-slate-100">
              <Link href="/employee/assessment" className="block">
                <Button
                  variant={isAssessmentUnlocked ? 'success' : 'secondary'}
                  fullWidth
                  disabled={!isAssessmentUnlocked}
                  icon={FileCheck2}
                >
                  {isCourseFullyCompleted
                    ? 'Review Assessment Results'
                    : isAssessmentUnlocked
                    ? 'Unlock Final Assessment'
                    : 'Complete Lessons to Unlock Test'}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading Workspace...</p>
          </div>
        </div>
      }
    >
      <LearnWorkspaceContent />
    </Suspense>
  );
}
