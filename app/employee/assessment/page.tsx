'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEmployeeLearningState } from '@/actions/learning';
import { getAssessmentQuestions, submitAssessment } from '@/actions/assessment';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { AssessmentSkeleton } from '@/components/ui/SkeletonLoader';

export default function EmployeeAssessmentPage() {
  const router = useRouter();
  const { showToast } = useToast();

  useAntiCheat(true);

  const [loading, setLoading] = useState(true);
  const [learningState, setLearningState] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // 5-Hour Cooldown Retake Rule State
  const [cooldownInfo, setCooldownInfo] = useState<any>(null);
  const [cooldownRemainingSecs, setCooldownRemainingSecs] = useState<number>(0);

  const loadData = async () => {
    try {
      const state = await getEmployeeLearningState();
      setLearningState(state);

      if (state.course?.id) {
        const qRes: any = await getAssessmentQuestions(state.course.id);
        setQuestions(qRes || []);
        if (qRes?.isCooldownActive) {
          setCooldownInfo(qRes);
          setCooldownRemainingSecs((qRes.cooldownRemainingMinutes || 0) * 60);
        } else {
          setCooldownInfo(null);
          setCooldownRemainingSecs(0);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setStartTime(Date.now());
  }, []);

  // Timer for test duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownRemainingSecs <= 0) return;
    const cooldownTimer = setInterval(() => {
      setCooldownRemainingSecs((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer);
          loadData();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [cooldownRemainingSecs]);

  const handleOptionSelect = (questionId: string, optionIndexOrId: number) => {
    if (cooldownRemainingSecs > 0) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndexOrId,
    }));
  };

  const handleSubmit = async () => {
    if (cooldownRemainingSecs > 0) {
      showToast('Retake cooldown is active. Please wait 5 hours before attempting again.', 'error');
      return;
    }

    if (Object.keys(selectedAnswers).length < questions.length) {
      const confirmSubmit = window.confirm(
        `You have ${questions.length - Object.keys(selectedAnswers).length} unanswered question(s). Are you sure you want to submit your final assessment?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await submitAssessment({
        courseId: learningState.course.id,
        answers: selectedAnswers,
        timeTakenSeconds,
      });

      if (res.success) {
        setResultData(res);
        setResultModalOpen(true);
        loadData();
      } else {
        if (res.isCooldownActive) {
          showToast(res.message || 'Retake cooldown is active.', 'error');
          loadData();
        } else {
          showToast(res.error || 'Submission failed', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred submitting assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatCooldownTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours}h ${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  if (loading) {
    return <AssessmentSkeleton />;
  }

  if (!learningState?.isAssessmentUnlocked && !learningState?.isCourseFullyCompleted) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-soft-xs max-w-xl mx-auto space-y-4">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Assessment Currently Locked</h3>
        <p className="text-xs text-slate-500 font-medium">
          You must complete all Common Modules and your assigned Department Modules before attempting the final assessment.
        </p>
        <Link href="/employee/learn">
          <Button variant="primary" icon={BookOpen}>
            Return to Learning Workspace
          </Button>
        </Link>
      </div>
    );
  }

  const empDeptName = learningState?.employee?.departmentRel?.name || learningState?.employee?.department || 'Department';
  const isCooldownActive = cooldownRemainingSecs > 0 && !learningState.passedAttempt;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Proctored Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-soft-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Proctored Corporate Assessment ({empDeptName})</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1">Final Induction Assessment</h1>
            <p className="text-xs text-slate-400 font-medium">
              Passing Score: <strong>{learningState.course?.passingScore}%</strong> | Questions: <strong>{questions.length}</strong> | Retake Rules: <strong>5-Hour Cooldown</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700 shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Time Elapsed</p>
              <p className="text-sm font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</p>
            </div>
          </div>
        </div>

        {/* Live Anti-Cheat Focus Status Indicator */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-[11px] font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>🛡️ Proctored Session Active (Screen Focus Monitored)</span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Answered: <strong>{Object.keys(selectedAnswers).length}</strong> / <strong>{questions.length}</strong>
          </span>
        </div>
      </div>

      {/* Question Quick-Jump Palette Grid (Sticky Top) */}
      {questions.length > 0 && (
        <Card className="sticky top-4 z-40 border border-slate-200/90 shadow-md backdrop-blur-md bg-white/95 rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ListChecks className="w-4 h-4 text-blue-600" />
                  Question Quick-Jump Palette
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  Answered ({Object.keys(selectedAnswers).length})
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300 inline-block"></span>
                  Unanswered ({questions.length - Object.keys(selectedAnswers).length})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {questions.map((q, idx) => {
                const isAns = selectedAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      const elem = document.getElementById(`question-card-${q.id}`);
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    title={`Jump to Question ${idx + 1}: ${isAns ? 'Answered' : 'Unanswered'}`}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer border ${
                      isAns
                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20 ring-2 ring-blue-400/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5-Hour Cooldown Retake Alert Banner */}
      {isCooldownActive && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-50/50 border-2 border-amber-400/80 rounded-3xl shadow-md space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-sm">
              <Clock className="w-7 h-7 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                <span>Retake Cooldown Active (5-Hour Window)</span>
                <Badge variant="warning" className="font-mono text-[10px]">COOLDOWN</Badge>
              </h3>
              <p className="text-xs text-amber-900/80 font-medium">
                As per corporate induction rules, failed assessment retakes require a mandatory <strong>5-hour study cooldown</strong> to review course materials before your next attempt.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/90 rounded-2xl border border-amber-200 gap-3">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Retake Available In</p>
              <p className="text-2xl font-black font-mono text-amber-600">
                {formatCooldownTimer(cooldownRemainingSecs)}
              </p>
            </div>

            <Link href="/employee/learn">
              <Button variant="primary" icon={BookOpen} size="md">
                Revisit Learning Modules
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Previous Passed Attempt Banner */}
      {learningState.passedAttempt && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-soft-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                You passed this assessment with a score of {learningState.passedAttempt.score}%!
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Your verified corporate certificate is available for download.
              </p>
            </div>
          </div>
          <Link href="/employee/certificate">
            <Button variant="success" size="sm" icon={Award}>
              View Certificate
            </Button>
          </Link>
        </div>
      )}

      {/* Questions Card Stack (Randomized Question & Option Order) */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;

          return (
            <Card
              key={q.id}
              id={`question-card-${q.id}`}
              className={`scroll-mt-28 transition-all ${
                isAnswered ? 'border-blue-300 shadow-soft-xs ring-1 ring-blue-500/20' : ''
              }`}
            >
              <CardHeader className="flex-row items-start justify-between gap-3 border-b-0 pb-2">
                <Badge variant={isAnswered ? 'purple' : 'info'}>
                  Question {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">{q.points} Point(s)</span>
              </CardHeader>

              <CardContent className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">{q.questionText}</h3>

                <div className="space-y-2.5">
                  {q.options.map((opt: string, optIdx: number) => {
                    const optDetail = q.optionDetails ? q.optionDetails[optIdx] : null;
                    const optionValue = optDetail ? optDetail.id : optIdx;
                    const isSelected = selectedAnswers[q.id] === optionValue || selectedAnswers[q.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isCooldownActive}
                        onClick={() => handleOptionSelect(q.id, optionValue)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isCooldownActive
                            ? 'bg-slate-50/50 border-slate-200 text-slate-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-2xs'
                            : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Footer Card */}
      <Card>
        <CardFooter className="mt-0 pt-0 border-t-0 flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Answered <strong className="text-slate-900 font-bold">{Object.keys(selectedAnswers).length}</strong> of <strong className="text-slate-900 font-bold">{questions.length}</strong> questions
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/employee/learn">
              <Button variant="outline" size="md">
                Revisit Lessons
              </Button>
            </Link>

            <Button
              variant="primary"
              size="md"
              icon={isCooldownActive ? Lock : FileCheck2}
              loading={submitting}
              disabled={isCooldownActive || submitting}
              onClick={handleSubmit}
            >
              {isCooldownActive ? 'Retake Cooldown Active' : 'Submit Final Assessment'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Assessment Result"
        maxWidth="md"
      >
        {resultData && (
          <div className="text-center space-y-6 py-2">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-soft-lg ${
                resultData.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {resultData.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {resultData.passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {resultData.passed
                  ? 'Congratulations! You have successfully completed the induction assessment.'
                  : `Passing requirement is ${resultData.passingScore}%. A 5-hour study cooldown has been initialized for your next retake.`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Your Score</p>
                <p className={`text-2xl font-black ${resultData.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {resultData.scorePercentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Correct Answers</p>
                <p className="text-2xl font-black text-slate-900">
                  {resultData.correctAnswersCount} / {resultData.totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {resultData.passed ? (
                <Link href="/employee/certificate">
                  <Button variant="success" fullWidth size="lg" icon={Award}>
                    Claim & Download Certificate
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    ⏳ 5-Hour Retake Cooldown Initialized. Revisit your study materials before your next attempt.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/employee/learn" className="flex-1">
                      <Button variant="primary" fullWidth size="md" icon={BookOpen}>
                        Revisit Lessons
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setResultModalOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
