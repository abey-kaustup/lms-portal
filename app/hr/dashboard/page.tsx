import React from 'react';
import Link from 'next/link';
import { getHRDashboardStats } from '@/actions/reports';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard, Badge, ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Award,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  Activity,
  User,
  Building2,
  Sparkles,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';

export default async function HRDashboardPage() {
  const stats = await getHRDashboardStats();

  const passRate = stats.totalEmployees > 0
    ? Math.round((stats.completedEmployeesCount / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="HR Executive Dashboard"
        description="Real-time induction compliance metrics, department progression, and corporate audit log stream."
        breadcrumbs={[{ label: 'Executive Dashboard' }]}
        primaryAction={
          <Link href="/hr/employees">
            <Button variant="primary" icon={Users}>
              Manage Employees
            </Button>
          </Link>
        }
        secondaryActions={
          <Link href="/hr/reports">
            <Button variant="outline" icon={FileSpreadsheet}>
              Export Excel Report
            </Button>
          </Link>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Staff"
          value={stats.totalEmployees}
          subtitle="Enrolled in Induction"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          subtitle="Active Profile Status"
          icon={UserCheck}
          color="emerald"
        />

        <StatCard
          title="Induction Certified"
          value={stats.completedEmployeesCount}
          subtitle={`Compliance: ${passRate}%`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Completion"
          value={stats.pendingEmployeesCount}
          subtitle="In-Progress Candidates"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Certificates Issued"
          value={stats.certificatesCount}
          subtitle="Verified PDF Documents"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Avg Test Score"
          value={`${stats.avgAssessmentScore}%`}
          subtitle="Assessment Benchmark"
          icon={BarChart2}
          color="slate"
        />
      </div>

      {/* Main 2-Column Widescreen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Department Progression & Completion Heatmap */}
        <div className="lg:col-span-8 space-y-6">
          {/* Induction Completion Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Organization Induction Compliance</CardTitle>
                  <CardDescription>Overall employee progression across common & department-specific modules</CardDescription>
                </div>
                <Badge variant="success">{passRate}% Completion Rate</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Overall Induction Benchmark</span>
                  <span className="text-emerald-600">{stats.completedEmployeesCount} of {stats.totalEmployees} Certified</span>
                </div>
                <ProgressBar progress={passRate} size="lg" color="emerald" />
              </div>

              {/* Department Breakdown Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">IT Department</span>
                  <p className="text-sm font-bold text-slate-900">Development Standards</p>
                  <p className="text-xs text-slate-500">4 Modules | Git & Deployment</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">HR Department</span>
                  <p className="text-sm font-bold text-slate-900">Recruitment & Onboarding</p>
                  <p className="text-xs text-slate-500">3 Modules | HRMS Protocols</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Finance Department</span>
                  <p className="text-sm font-bold text-slate-900">Financial Management</p>
                  <p className="text-xs text-slate-500">2 Modules | Expense Reporting</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Audit Trail Stream */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <CardTitle>Real-Time Audit Activity Feed</CardTitle>
                </div>
                <Link href="/hr/activity-logs">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    View Full Audit Log
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {stats.recentActivityLogs.map((log: any) => {
                  const dateStr = new Date(log.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-4 text-xs hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 mt-0.5 shadow-soft-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {log.employee
                              ? `${log.employee.firstName} ${log.employee.lastName} (${log.employee.employeeId})`
                              : log.hrUser?.name || log.userId}
                          </p>
                          <p className="text-slate-600 mt-0.5 font-medium">{log.details || log.action}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge
                          variant={
                            log.action.includes('COMPLETED') || log.action.includes('SUBMITTED')
                              ? 'success'
                              : log.action.includes('TAB_SWITCH') || log.action.includes('BLUR')
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {log.action}
                        </Badge>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 Cols): Quick Actions, Pending Tasks & Admin Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Admin Action Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-soft-lg space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold">Administrative Quick Tasks</h3>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Configure course structures, manage department rules, and export organization compliance reports.
            </p>

            <div className="space-y-2.5 pt-1">
              <Link href="/hr/departments" className="block">
                <Button variant="secondary" fullWidth size="lg" className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm">Manage Departments</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Button>
              </Link>
              <Link href="/hr/course" className="block">
                <Button variant="secondary" fullWidth size="lg" className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm">Curriculum & SharePoint Links</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Button>
              </Link>
              <Link href="/hr/reports" className="block">
                <Button variant="primary" fullWidth size="lg" className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-soft-md">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-4 h-4 text-white shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm">Export Compliance Excel</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Pending Onboarding Tasks Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Action Items</CardTitle>
              <CardDescription>Onboarding candidates requiring follow-up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-900">{stats.pendingEmployeesCount} Employees Pending</p>
                  <p className="text-[11px] text-amber-700">Awaiting induction completion</p>
                </div>
                <Link href="/hr/employees">
                  <Button variant="outline" size="sm">Review</Button>
                </Link>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900">Certificate Verification</p>
                  <p className="text-[11px] text-blue-700">{stats.certificatesCount} Certificates Verified</p>
                </div>
                <Link href="/hr/reports">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
