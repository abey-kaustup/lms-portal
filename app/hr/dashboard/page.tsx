import React from 'react';
import Link from 'next/link';
import { getHRDashboardStats } from '@/actions/reports';
import { StatCard, Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';

export default async function HRDashboardPage() {
  const stats = await getHRDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">HR Administration Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time induction progress metrics, organization compliance, and activity audit log stream.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Employees</span>
          </Link>
          <Link
            href="/hr/reports"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle="Enrolled in Induction"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          subtitle="Active status profiles"
          icon={UserCheck}
          color="emerald"
        />

        <StatCard
          title="Completed Induction"
          value={stats.completedEmployeesCount}
          subtitle={`Pass rate: ${stats.totalEmployees > 0 ? Math.round((stats.completedEmployeesCount / stats.totalEmployees) * 100) : 0}%`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Completion"
          value={stats.pendingEmployeesCount}
          subtitle="Employees in progress"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Certificates Generated"
          value={stats.certificatesCount}
          subtitle="QR Verified PDF Certificates"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Average Score"
          value={`${stats.avgAssessmentScore}%`}
          subtitle="Passed Assessment Average"
          icon={BarChart2}
          color="slate"
        />
      </div>

      {/* Recent Activity Stream & Quick Action Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent System Activity Stream */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Recent System Activity</h3>
            </div>
            <Link
              href="/hr/activity-logs"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {stats.recentActivityLogs.map((log: any) => {
              const dateStr = new Date(log.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {log.employee
                          ? `${log.employee.firstName} ${log.employee.lastName} (${log.employee.employeeId})`
                          : log.hrUser?.name || log.userId}
                      </p>
                      <p className="text-slate-600 mt-0.5">{log.details || log.action}</p>
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
        </div>

        {/* Right 4 Cols: Quick Administrative Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Quick Management</span>
            </h3>
            <p className="text-xs text-slate-300">
              Manage corporate employee directory, update induction course modules, review assessment scores, and export compliance reports.
            </p>

            <div className="space-y-2 pt-2">
              <Link
                href="/hr/employees"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                <span>Add / Edit Employees</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/hr/course"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
              >
                <span>Configure Course & SharePoint Links</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/hr/reports"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors"
              >
                <span>Export Progress to Excel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
