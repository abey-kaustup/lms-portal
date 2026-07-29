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
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  BookOpen,
  ArrowRight,
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

  // Timer counter
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
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Assessment Currently Locked</h3>
        <p className="text-xs text-slate-500">
          You must complete all lessons in the Induction course before attempting the final assessment.
        </p>
        <Link
          href="/employee/learn"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Return to Learning Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Proctored Corporate Assessment</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Final Induction Assessment</h2>
          <p className="text-xs text-slate-400">
            Passing Threshold: <strong>{learningState.course?.passingScore}%</strong> | Unlimited Retakes
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-700">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Elapsed</p>
            <p className="text-sm font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Previous attempts summary if available */}
      {learningState.passedAttempt && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                You have already passed this assessment with a score of {learningState.passedAttempt.score}%!
              </p>
              <p className="text-[11px] text-emerald-700">
                Your verified certificate is ready. You may retake the test at any time to improve your score.
              </p>
            </div>
          </div>
          <Link
            href="/employee/certificate"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>View Certificate</span>
          </Link>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;

          return (
            <div
              key={q.id}
              className={`p-6 bg-white rounded-3xl border transition-all ${
                isAnswered ? 'border-blue-200 shadow-xs' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  Question 0{idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-400">{q.points} Point(s)</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-4">{q.questionText}</h3>

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
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Answered <strong>{Object.keys(selectedAnswers).length}</strong> of <strong>{questions.length}</strong> questions
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/employee/learn"
            className="flex-1 sm:flex-initial px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-center transition-colors"
          >
            Revisit Lessons
          </Link>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Evaluating Answers...</span>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Submit Final Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Assessment Result"
        maxWidth="md"
      >
        {resultData && (
          <div className="text-center space-y-6 py-2">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                resultData.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {resultData.passed ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {resultData.passed ? 'Assessment Passed!' : 'Assessment Failed'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {resultData.passed
                  ? 'Congratulations! You have successfully passed the induction assessment.'
                  : `Passing requirement is ${resultData.passingScore}%. You can retake the test immediately.`}
              </p>
            </div>

            {/* Score Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Your Score</p>
                <p
                  className={`text-2xl font-black ${
                    resultData.passed ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
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

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              {resultData.passed ? (
                <Link
                  href="/employee/certificate"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md text-center transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim & Download Certificate</span>
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/employee/learn"
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition-colors"
                  >
                    Revisit Lessons
                  </Link>

                  <button
                    onClick={() => {
                      setResultModalOpen(false);
                      setSelectedAnswers({});
                      setStartTime(Date.now());
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Test Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
