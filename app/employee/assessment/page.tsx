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
} from 'lucide-react';

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

  const loadData = async () => {
    try {
      const state = await getEmployeeLearningState();
      setLearningState(state);

      if (state.course?.id) {
        const qList = await getAssessmentQuestions(state.course.id);
        setQuestions(qList);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      const confirmSubmit = window.confirm(
        'You have unanswered questions. Are you sure you want to submit your assessment?'
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
        showToast(res.error || 'Submission failed', 'error');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Proctored Assessment...</p>
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Proctored Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-soft-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Proctored Corporate Assessment ({empDeptName})</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Final Induction Assessment</h1>
          <p className="text-xs text-slate-400 font-medium">
            Passing Score: <strong>{learningState.course?.passingScore}%</strong> | Common + {empDeptName} Questions
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Time Elapsed</p>
            <p className="text-sm font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</p>
          </div>
        </div>
      </div>

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

      {/* Questions Card Stack */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;

          return (
            <Card key={q.id} className={isAnswered ? 'border-blue-200 shadow-soft-xs' : ''}>
              <CardHeader className="flex-row items-start justify-between gap-3 border-b-0 pb-2">
                <Badge variant="info">Question 0{idx + 1}</Badge>
                <span className="text-xs font-semibold text-slate-400">{q.points} Point(s)</span>
              </CardHeader>

              <CardContent className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">{q.questionText}</h3>

                <div className="space-y-2.5">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, optIdx)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
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
              icon={FileCheck2}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Final Assessment
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
                {resultData.passed ? 'Assessment Passed!' : 'Assessment Failed'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {resultData.passed
                  ? 'Congratulations! You have successfully completed the induction assessment.'
                  : `Passing requirement is ${resultData.passingScore}%. You can retake the test immediately.`}
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
                <div className="flex gap-2">
                  <Link href="/employee/learn" className="flex-1">
                    <Button variant="outline" fullWidth size="md">
                      Revisit Lessons
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    icon={RotateCcw}
                    onClick={() => {
                      setResultModalOpen(false);
                      setSelectedAnswers({});
                      setStartTime(Date.now());
                    }}
                  >
                    Retake Test
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
