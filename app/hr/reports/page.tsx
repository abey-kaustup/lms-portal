'use client';

import React, { useState, useEffect } from 'react';
import {
  getHRDetailedReport,
  exportReportToExcel,
  sendOverdueReminder,
  sendBulkOverdueReminders,
} from '@/actions/reports';
import { getDepartments } from '@/actions/department';
import { useToast } from '@/components/ui/Toast';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import {
  BarChart3,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Award,
  FileSpreadsheet,
  Building2,
  Filter,
  Send,
  AlertTriangle,
  BellRing,
  Sparkles,
} from 'lucide-react';

export default function HRReportsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [data, deptList] = await Promise.all([
        getHRDetailedReport(departmentFilter),
        getDepartments(),
      ]);
      setReportRows(data);
      setDepartments(deptList);
    } catch (err: any) {
      showToast(err.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [departmentFilter]);

  const handleExportExcel = async () => {
    try {
      showToast('Generating Excel progress report...', 'info');
      const base64 = await exportReportToExcel(departmentFilter);
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `Induction_Compliance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      showToast('Report downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to export report', 'error');
    }
  };

  const handleSendSingleReminder = async (row: any) => {
    setSendingId(row.id);
    try {
      const res = await sendOverdueReminder(row.id);
      if (res.success) {
        showToast(res.message || `Reminder sent to ${row.name}`, 'success');
        loadReport();
      } else {
        showToast(res.error || 'Failed to send reminder', 'error');
      }
    } catch (err: any) {
      showToast('Error sending reminder', 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendBulkReminders = async () => {
    setSendingBulk(true);
    try {
      const res = await sendBulkOverdueReminders();
      if (res.success) {
        showToast(
          res.count > 0
            ? `Automated reminders successfully sent to ${res.count} overdue employee(s)!`
            : 'No overdue employees require reminders at this time.',
          'success'
        );
        loadReport();
      } else {
        showToast(res.error || 'Failed to send bulk reminders', 'error');
      }
    } catch (err: any) {
      showToast('Error executing automated reminder run', 'error');
    } finally {
      setSendingBulk(false);
    }
  };

  const filteredRows = reportRows.filter((row) => {
    const matchesSearch =
      search === '' ||
      row.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'COMPLETED' && row.isCompleted) ||
      (statusFilter === 'OVERDUE' && row.isOverdue) ||
      (statusFilter === 'PENDING' && !row.isCompleted);

    return matchesSearch && matchesStatus;
  });

  const totalCertified = reportRows.filter((r) => r.isCompleted).length;
  const overdueCount = reportRows.filter((r) => r.isOverdue).length;

  const validScores = reportRows
    .map((r) => {
      if (typeof r.bestScoreNum === 'number' && r.bestScoreNum !== null && (r.hasAttempt || r.bestScoreNum > 0)) {
        return r.bestScoreNum;
      }
      if (typeof r.bestScore === 'string' && r.bestScore !== 'N/A') {
        const parsed = parseFloat(r.bestScore.replace('%', ''));
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    })
    .filter((score): score is number => score !== null);

  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((acc, val) => acc + val, 0) / validScores.length)
    : 0;

  const columns: Column<any>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
          {row.employeeId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Employee Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-400 font-medium">Joined: {row.joiningDate}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <Badge variant="info">{row.department}</Badge>,
    },
    {
      key: 'progressPercent',
      header: 'Induction Progression',
      width: '200px',
      render: (row) => <ProgressBar progress={row.progressPercent} size="sm" showLabel={true} color="emerald" />,
    },
    {
      key: 'complianceStatus',
      header: '7-Day Deadline Status',
      align: 'center',
      render: (row) => {
        if (row.isCompleted) {
          return <Badge variant="success">COMPLETED ✔</Badge>;
        }
        if (row.isOverdue) {
          return <Badge variant="danger">OVERDUE ({row.overdueDays}d)</Badge>;
        }
        return <Badge variant="info">ON TRACK (7d)</Badge>;
      },
    },
    {
      key: 'bestScore',
      header: 'Best Score',
      align: 'center',
      render: (row) => <span className="font-bold text-blue-600 font-mono">{row.bestScore}</span>,
    },
    {
      key: 'actions',
      header: 'Automated Reminder',
      align: 'right',
      render: (row) => {
        if (row.isCompleted) {
          return <span className="text-[11px] font-semibold text-emerald-600">Compliance Met</span>;
        }

        const isSending = sendingId === row.id;

        return (
          <Button
            variant={row.isOverdue ? 'danger' : 'outline'}
            size="sm"
            icon={isSending ? Sparkles : BellRing}
            loading={isSending}
            onClick={() => handleSendSingleReminder(row)}
          >
            {row.isOverdue ? 'Send Overdue Alert' : 'Send Nudge'}
          </Button>
        );
      },
    },
  ];

  const pageSize = 10;
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Compliance & Automated Overdue Reminders"
        description="Monitor 7-day employee induction deadlines, track overdue compliance, and dispatch automated notification reminders."
        breadcrumbs={[{ label: 'Compliance & Overdue Control' }]}
        primaryAction={
          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              icon={BellRing}
              loading={sendingBulk}
              onClick={handleSendBulkReminders}
            >
              Send Automated Bulk Overdue Reminders ({overdueCount})
            </Button>
            <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
          </div>
        }
        stats={[
          { title: 'Total Evaluated', value: reportRows.length, subtitle: 'Enrolled Employees', icon: BarChart3, color: 'blue' },
          { title: 'Compliant & Certified', value: totalCertified, subtitle: 'Passed Within 7 Days', icon: CheckCircle2, color: 'emerald' },
          { title: 'Overdue Induction', value: overdueCount, subtitle: 'Exceeded 7-Day Window', icon: AlertTriangle, color: 'amber' },
        ]}
      />

      {/* Overdue Notification Banner Card */}
      {overdueCount > 0 && (
        <div className="p-5 bg-gradient-to-r from-rose-500/10 via-rose-50 to-rose-50/40 border-2 border-rose-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                <span>{overdueCount} Employee(s) Overdue for 7-Day Induction Completion</span>
                <Badge variant="danger" className="text-[10px]">ACTION REQUIRED</Badge>
              </h4>
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                Corporate policy mandates 100% video and assessment completion within 7 days of onboarding.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            icon={Send}
            loading={sendingBulk}
            onClick={handleSendBulkReminders}
          >
            Dispatch Overdue Reminders Now
          </Button>
        </div>
      )}

      {/* Analytics Data Table */}
      <DataTable
        columns={columns}
        data={paginatedRows}
        loading={loading}
        searchPlaceholder="Filter by ID, name, department..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalRecords={filteredRows.length}
        onPageChange={(p) => setPage(p)}
        filterControls={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Employees</option>
                <option value="OVERDUE">Overdue Only (7+ Days)</option>
                <option value="COMPLETED">Completed & Certified</option>
                <option value="PENDING">Pending Induction</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
