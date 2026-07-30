import React, { Suspense } from 'react';
import Link from 'next/link';
import { getCertificateByNumber } from '@/actions/certificate';
import { ShieldCheck, AlertCircle, CheckCircle2, Award, ArrowLeft, Building2, User, Calendar, BookOpen } from 'lucide-react';

async function VerifyCertificateContent({ searchParams }: { searchParams: Promise<{ cert?: string }> }) {
  const params = await searchParams;
  const certNumber = params.cert || '';

  if (!certNumber) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-soft-xl text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Certificate ID Required</h2>
        <p className="text-xs text-slate-500 font-medium">
          Please provide a valid certificate ID parameter in the URL to verify credentials.
        </p>
      </div>
    );
  }

  const certData = await getCertificateByNumber(certNumber.trim());

  if (!certData) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl border border-red-200 shadow-soft-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 rounded-2xl text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Invalid Certificate Record</h2>
        <p className="text-xs text-slate-500 font-medium">
          No official corporate record was found matching Certificate ID <span className="font-mono font-bold text-slate-800">{certNumber}</span>.
        </p>
        <Link href="/login">
          <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all">
            Return to LMS Login
          </button>
        </Link>
      </div>
    );
  }

  const fullName = `${certData.employee.firstName} ${certData.employee.middleName ? certData.employee.middleName + ' ' : ''}${certData.employee.lastName}`;
  const issueDateFormatted = new Date(certData.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const passingScore = certData.course?.passingScore || 80;
  const achievedScore = certData.passedAttempt?.score ? Math.round(certData.passedAttempt.score) : 100;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-soft-xl overflow-hidden text-slate-900 font-sans">
      {/* Header Verification Banner */}
      <div className="p-6 bg-emerald-950 text-white border-b border-emerald-800 flex items-center gap-4">
        <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30 shrink-0">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED & AUTHENTIC RECORD</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Corporate Induction Certificate
          </h1>
          <p className="text-xs text-emerald-300 font-mono">
            ID: {certData.certificateNumber}
          </p>
        </div>
      </div>

      {/* Verified Details Grid */}
      <div className="p-6 sm:p-8 space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Certified Employee</span>
            </p>
            <p className="text-sm font-bold text-slate-900">{fullName}</p>
            <p className="text-[11px] text-slate-500 font-mono">ID: {certData.employee.employeeId}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Department & Role</span>
            </p>
            <p className="text-sm font-bold text-slate-900">{certData.employee.department}</p>
            <p className="text-[11px] text-slate-500">{certData.employee.designation}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Completed Curriculum Program</span>
          </p>
          <p className="text-base font-bold text-slate-900">{certData.course.title}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-700">
            <span>Curriculum Completion: <strong className="text-emerald-600">100%</strong></span>
            <span>•</span>
            <span>Required Score: <strong>{passingScore}%</strong></span>
            <span>•</span>
            <span>Score Achieved: <strong className="text-blue-600">{achievedScore}%</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Official Issue Date</span>
            </p>
            <p className="text-xs font-bold text-slate-900">{issueDateFormatted}</p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
              STATUS: COMPLIANT
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <Link href="/login" className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to LMS Portal</span>
        </Link>

        <span className="text-[11px] text-slate-400 font-mono">
          Corporate Onboarding Registry
        </span>
      </div>
    </div>
  );
}

export default function VerifyPage({ searchParams }: { searchParams: Promise<{ cert?: string }> }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold shadow-soft-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Corporate Verification Gateway</span>
          </div>
        </div>

        <Suspense fallback={<div className="p-8 bg-white rounded-3xl text-center text-xs text-slate-400">Verifying Certificate...</div>}>
          <VerifyCertificateContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
