import React from 'react';
import Link from 'next/link';
import { getEmployeeById } from '@/actions/employee';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Badge';
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Award,
  Activity,
  Clock,
} from 'lucide-react';

export default async function HREmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const employee = await getEmployeeById(resolvedParams.id);

  if (!employee) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Employee record not found.</p>
        <Link href="/hr/employees" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
          Return to Employee Directory
        </Link>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`;
  const joiningDateFormatted = new Date(employee.joiningDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedLessons = (employee.lessonProgresses || []).filter((p: any) => p.isCompleted);
  const bestAttempt = (employee.assessmentAttempts || []).reduce(
    (best: any, curr: any) => (!best || curr.score > best.score ? curr : best),
    null
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/hr/employees"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'danger'}>
          Status: {employee.status}
        </Badge>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{fullName}</h2>
              <p className="text-xs text-blue-300 font-semibold font-mono mt-0.5">
                ID: {employee.employeeId}
              </p>
              <p className="text-xs text-slate-400 mt-1">{employee.designation} • {employee.department}</p>
            </div>
          </div>

          {employee.certificates.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-bold">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Induction Certificate Issued</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Details Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Employee Specifications
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Corporate Email</p>
                <p className="font-semibold text-slate-900">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Department</p>
                <p className="font-semibold text-slate-900">{employee.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Designation</p>
                <p className="font-semibold text-slate-900">{employee.designation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Office Location</p>
                <p className="font-semibold text-slate-900">{employee.office}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Joining Date</p>
                <p className="font-semibold text-slate-900">{joiningDateFormatted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Learning Progress & Attempts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Induction Progress Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Induction Learning Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <p className="text-xs text-slate-500 font-semibold">Lessons Completed</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{completedLessons.length}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                <p className="text-xs text-slate-500 font-semibold">Best Assessment Score</p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {bestAttempt ? `${bestAttempt.score}%` : 'Not Attempted'}
                </p>
              </div>
            </div>

            {/* Assessment History Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Assessment Attempt History</h4>
              {employee.assessmentAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No assessment attempts recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {(employee.assessmentAttempts || []).map((attempt: any) => (
                    <div key={attempt.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{attempt.score}%</span>
                        <span className="text-slate-400 ml-2">
                          ({attempt.correctAnswers}/{attempt.totalQuestions} Correct)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={attempt.passed ? 'success' : 'danger'}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Audit Stream for this employee */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Employee Audit Trail</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {(employee.activityLogs || []).map((log: any) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}: </span>
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
