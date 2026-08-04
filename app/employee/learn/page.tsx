'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ShieldAlert,
  Building2,
  ShieldCheck,
  FileCheck2,
  Loader2,
  Sparkles,
  Clock,
  BookmarkCheck,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { LearningCenterSkeleton } from '@/components/ui/SkeletonLoader';

function LearnWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useAntiCheat(true);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Split-Tab Material Viewer & Chapter Seek State
  const [activeTab, setActiveTab] = useState<'video' | 'doc' | 'notes'>('video');
  const [seekTarget, setSeekTarget] = useState<number | undefined>(undefined);

  const queryLessonId = searchParams.get('lessonId');

  const loadState = async () => {
    try {
      const res = await getEmployeeLearningState();
      setData(res);

      const allMods = [...(res.commonModules || []), ...(res.departmentModules || [])];

      let selectedLes: any = null;
      let selectedMod: any = null;

      if (queryLessonId) {
        for (const mod of allMods) {
          const found = mod.lessons.find((l: any) => l.id === queryLessonId);
          if (found && found.isUnlocked) {
            selectedLes = found;
            selectedMod = mod;
            break;
          }
        }
      }

      if (!selectedLes) {
        for (const mod of allMods) {
          if (mod.isUnlocked) {
            for (const les of mod.lessons) {
              if (les.isUnlocked && !les.isCompleted && !selectedLes) {
                selectedLes = les;
                selectedMod = mod;
                break;
              }
            }
          }
        }
      }

      if (!selectedLes && allMods[0]?.lessons[0]) {
        selectedLes = allMods[0].lessons[0];
        selectedMod = allMods[0];
      }

      setActiveLesson(selectedLes);
      setActiveModule(selectedMod);

      // Auto-set tab based on content type
      if (selectedLes?.contentType === 'PDF' || selectedLes?.contentType === 'DOCUMENT') {
        setActiveTab('doc');
      } else {
        setActiveTab('video');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load learning workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, [queryLessonId]);

  useEffect(() => {
    if (activeLesson) {
      if (activeLesson.contentType === 'PDF' || activeLesson.contentType === 'DOCUMENT') {
        setActiveTab('doc');
      } else {
        setActiveTab('video');
      }
      setSeekTarget(undefined);
    }
  }, [activeLesson?.id]);

  const toggleModuleCollapse = (modId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Main automatic lesson completion and navigation handler
  const handleLessonCompletion = async (
    watchedSeconds: number,
    totalSeconds: number,
    isManualPdf: boolean = false
  ) => {
    if (!activeLesson || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await updateLessonProgress({
        lessonId: activeLesson.id,
        watchedSeconds,
        totalSeconds,
        isCompleted: true,
        markCompletedManualPDF: isManualPdf,
      });

      if (res.error) {
        showToast(res.error, 'error');
        setIsSubmitting(false);
        return;
      }

      // Fetch updated learning state from backend
      const freshState = await getEmployeeLearningState();
      setData(freshState);

      const allMods = [...(freshState.commonModules || []), ...(freshState.departmentModules || [])];
      const allLessons: { lesson: any; module: any }[] = [];
      allMods.forEach((m: any) => {
        (m.lessons || []).forEach((l: any) => {
          allLessons.push({ lesson: l, module: m });
        });
      });

      const currentIdx = allLessons.findIndex((item) => item.lesson.id === activeLesson.id);

      // Locate next unlocked & uncompleted lesson, or next unlocked lesson
      const nextItem =
        allLessons.slice(currentIdx + 1).find((item) => item.lesson.isUnlocked && !item.lesson.isCompleted) ||
        allLessons.slice(currentIdx + 1).find((item) => item.lesson.isUnlocked);

      if (nextItem) {
        showToast(`Completed! Advancing to: "${nextItem.lesson.title}"`, 'success');
        setActiveLesson(nextItem.lesson);
        setActiveModule(nextItem.module);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (freshState.isAssessmentUnlocked || freshState.completedLessonsCount >= freshState.totalLessonsCount) {
        showToast('All induction modules completed! Unlocking final assessment...', 'success');
        router.push('/employee/assessment');
      } else {
        showToast(`Completed lesson: ${activeLesson.title}`, 'success');
      }
    } catch (err: any) {
      console.error('Lesson completion error:', err);
      showToast(err?.message || 'Failed to complete lesson', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Periodic passive progress sync
  const handleVideoProgressUpdate = async (
    watchedSeconds: number,
    totalSeconds: number,
    isCompleted?: boolean
  ) => {
    if (!activeLesson || isSubmitting) return;

    if (isCompleted) {
      await handleLessonCompletion(watchedSeconds, totalSeconds, false);
      return;
    }

    try {
      await updateLessonProgress({
        lessonId: activeLesson.id,
        watchedSeconds,
        totalSeconds,
        isCompleted: false,
      });
    } catch (err) {
      console.error('Passive progress sync error:', err);
    }
  };

  const handleManualPDFComplete = async () => {
    await handleLessonCompletion(60, 60, true);
  };

  const getDurationBadge = (les: any) => {
    if (les.contentType === 'VIDEO_PDF') {
      return '🎥+📄 12m';
    }
    if (les.contentType === 'PDF' || les.contentType === 'DOCUMENT') {
      return '📄 5m read';
    }
    const mins = Math.ceil((les.minDurationSeconds || 300) / 60);
    return `⏱️ ${mins}m`;
  };

  if (loading) {
    return <LearningCenterSkeleton />;
  }

  if (!data || !activeLesson) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-soft-xs">
        <p className="text-sm font-bold text-slate-700">No active course material found.</p>
      </div>
    );
  }

  const { employee, overallProgressPercentage, isAssessmentUnlocked } = data;
  const allModules = [...(data.commonModules || []), ...(data.departmentModules || [])];
  const empDeptName = employee?.departmentRel?.name || employee?.department || 'General';

  const hasVideo = activeLesson.contentType === 'VIDEO' || activeLesson.contentType === 'VIDEO_PDF' || Boolean(activeLesson.videoUrl);
  const hasDoc = activeLesson.contentType === 'PDF' || activeLesson.contentType === 'DOCUMENT' || activeLesson.contentType === 'VIDEO_PDF' || Boolean(activeLesson.pdfUrl);

  return (
    <div className="space-y-6">
      {/* Workspace Header Card */}
      <Card className="border border-slate-200/80 shadow-sm">
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
            {isSubmitting ? (
              <Badge variant="info" className="flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Progress...</span>
              </Badge>
            ) : (
              <Badge variant={activeLesson.isCompleted ? 'success' : 'info'}>
                {activeLesson.isCompleted ? 'Completed' : 'In Progress'}
              </Badge>
            )}

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

      {/* Split-Tab Material Viewer Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs">
        {hasVideo && (
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>🎥 Video Lesson</span>
          </button>
        )}

        {hasDoc && (
          <button
            type="button"
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'doc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Attached Document & Guidelines</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>📌 Key Takeaways & Summary</span>
        </button>
      </div>

      {/* Main Grid: Player/Tabs on Left (8 Cols), Module Sidebar on Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Animated Player & Content Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeLesson.id}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* TAB 1: VIDEO STREAM & STICKY CHAPTER MARKERS */}
              {activeTab === 'video' && hasVideo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                      Lesson Video Stream
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">Anti-Skip Protection Enforced</span>
                  </div>

                  <AntiSkipVideoPlayer
                    videoUrl={activeLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    initialWatchedSeconds={activeLesson.watchedSeconds}
                    minDurationSeconds={activeLesson.minDurationSeconds}
                    seekToTime={seekTarget}
                    isCompleted={activeLesson.isCompleted}
                    onProgressUpdate={handleVideoProgressUpdate}
                    onComplete={() => {
                      const reqTime = activeLesson.minDurationSeconds || 120;
                      handleLessonCompletion(reqTime, reqTime, false);
                    }}
                  />

                  {/* Sticky Video Chapter Markers */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Interactive Chapter Timeline
                      </span>
                      <span className="text-[10px] text-slate-400">Click to jump to topic</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { title: '00:00 - Introduction & Objectives', time: 0 },
                        { title: '01:30 - Core Policy Standard', time: 90 },
                        { title: '04:15 - Safety & Compliance', time: 255 },
                        { title: '07:00 - Key Summary', time: 420 },
                      ].map((chap, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            setSeekTarget(chap.time);
                            showToast(`Jumping to chapter: ${chap.title}`, 'info');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>{chap.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATTACHED DOCUMENT & GUIDELINES */}
              {activeTab === 'doc' && hasDoc && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Lesson Reading Material & Document Attachment
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

              {/* TAB 3: KEY TAKEAWAYS & SUMMARY NOTES */}
              {activeTab === 'notes' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft-xs space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <BookmarkCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Key Takeaways & Compliance Summary</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Essential objectives for <strong>{activeLesson.title}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 font-medium leading-relaxed">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <ListChecks className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold">Standard Operational Procedure:</strong>
                        <p className="text-slate-600 mt-0.5">Ensure all guidelines in the training document are strictly adhered to during daily operations.</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                      <ListChecks className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-bold">Security & Escalation:</strong>
                        <p className="text-slate-600 mt-0.5">Report any security breaches or policy non-compliance directly to your department head within 24 hours.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant={activeLesson.isCompleted ? 'success' : 'primary'}
                      icon={CheckCircle2}
                      onClick={handleManualPDFComplete}
                    >
                      {activeLesson.isCompleted ? 'Marked Completed ✔' : 'Mark Lesson Completed'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Proctored Warning Footer Banner */}
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

        {/* Right Column: Sleek & Animated Induction Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-200/90 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3 bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <CardTitle className="text-sm font-bold text-slate-900">Induction Navigation</CardTitle>
                </div>
                <span className="text-xs font-extrabold text-blue-600 font-mono bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                  {overallProgressPercentage}% Complete
                </span>
              </div>

              {/* Induction Overall Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgressPercentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3.5 max-h-[720px] overflow-y-auto p-4 custom-scrollbar">
              {allModules.map((mod: any, mIdx: number) => {
                const isDept = mod.moduleType === 'DEPARTMENT';
                const isCollapsed = Boolean(collapsedModules[mod.id]);
                const completedLessonsCount = mod.lessons.filter((l: any) => l.isCompleted).length;
                const totalModLessons = mod.lessons.length;
                const isModFullyDone = totalModLessons > 0 && completedLessonsCount === totalModLessons;

                return (
                  <div key={mod.id} className="space-y-2">
                    {/* Module Header Card */}
                    <div
                      onClick={() => toggleModuleCollapse(mod.id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border ${
                        mod.isUnlocked
                          ? isDept
                            ? 'bg-gradient-to-r from-purple-50/90 via-purple-50/40 to-white text-purple-950 border-purple-200 shadow-2xs hover:border-purple-300'
                            : 'bg-gradient-to-r from-slate-100/90 via-slate-50 to-white text-slate-800 border-slate-200/90 shadow-2xs hover:border-blue-300'
                          : 'bg-slate-50/50 text-slate-400 border-slate-200/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 line-clamp-1 pr-2">
                        {isDept ? (
                          <div className="p-1 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-bold tracking-tight line-clamp-1">{mod.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {mod.isUnlocked && (
                          <span
                            className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md border ${
                              isModFullyDone
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : 'bg-slate-200/70 text-slate-700 border-slate-300'
                            }`}
                          >
                            {completedLessonsCount}/{totalModLessons}
                          </span>
                        )}

                        {!mod.isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <motion.div
                            animate={{ rotate: isCollapsed ? -90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Animated Collapsible Lessons List */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                          className="space-y-1.5 pl-1.5 pr-0.5 pt-1 overflow-hidden"
                        >
                          {mod.lessons.map((les: any) => {
                            const isActive = activeLesson?.id === les.id;

                            return (
                              <motion.button
                                key={les.id}
                                disabled={!les.isUnlocked || isSubmitting}
                                whileHover={{ x: les.isUnlocked ? 3 : 0 }}
                                whileTap={{ scale: les.isUnlocked ? 0.98 : 1 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => {
                                  setActiveLesson(les);
                                  setActiveModule(mod);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                                  isActive
                                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20 border-blue-500/80'
                                    : les.isCompleted
                                    ? 'bg-emerald-50/80 text-slate-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60'
                                    : les.isUnlocked
                                    ? 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/60'
                                    : 'bg-slate-50/40 text-slate-400 border-slate-200/40 cursor-not-allowed opacity-75'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  {les.isCompleted ? (
                                    <CheckCircle2
                                      className={`w-4 h-4 shrink-0 ${
                                        isActive ? 'text-white' : 'text-emerald-600'
                                      }`}
                                    />
                                  ) : les.isUnlocked ? (
                                    <PlayCircle
                                      className={`w-4 h-4 shrink-0 ${
                                        isActive ? 'text-white' : 'text-blue-600'
                                      }`}
                                    />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                  )}

                                  <span className="truncate">{les.title}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Duration Badge Chip */}
                                  <span
                                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                      isActive
                                        ? 'bg-blue-700 text-blue-100 border-blue-500'
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {getDurationBadge(les)}
                                  </span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLearnPage() {
  return (
    <Suspense fallback={<LearningCenterSkeleton />}>
      <LearnWorkspaceContent />
    </Suspense>
  );
}
