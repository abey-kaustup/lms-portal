'use client';

import React, { useState, useEffect } from 'react';
import { getHRDetailedReport, exportReportToExcel } from '@/actions/reports';
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
} from 'lucide-react';

export default function HRReportsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
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

  const filteredRows = reportRows.filter((row) => {
    const matchesSearch =
      search === '' ||
      row.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'COMPLETED' && row.isCompleted) ||
      (statusFilter === 'PENDING' && !row.isCompleted);

    return matchesSearch && matchesStatus;
  });

  const totalCertified = reportRows.filter((r) => r.isCompleted).length;
  
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
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {row.employeeId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Employee Name',
      render: (row) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>,
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
      key: 'completedLessonsCount',
      header: 'Lessons Completed',
      align: 'center',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.completedLessonsCount} / {row.totalLessons}
        </span>
      ),
    },
    {
      key: 'attemptsCount',
      header: 'Attempts',
      align: 'center',
      render: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.attemptsCount}</span>,
    },
    {
      key: 'bestScore',
      header: 'Best Score',
      align: 'center',
      render: (row) => <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{row.bestScore}</span>,
    },
    {
      key: 'certificateStatus',
      header: 'Status',
      align: 'right',
      render: (row) => (
        <Badge variant={row.isCompleted ? 'purple' : 'warning'}>
          {row.certificateStatus}
        </Badge>
      ),
    },
  ];

  const pageSize = 10;
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Compliance & Analytics Reports"
        description="Detailed department-wise breakdown of employee completion rates, assessment scores, and attempt metrics."
        breadcrumbs={[{ label: 'Compliance Reports' }]}
        primaryAction={
          <Button variant="primary" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Export Excel Report
          </Button>
        }
        stats={[
          { title: 'Total Evaluated', value: reportRows.length, subtitle: 'Corporate Enrolled Staff', icon: BarChart3, color: 'blue' },
          { title: 'Certified Staff', value: totalCertified, subtitle: 'Passed Assessment', icon: CheckCircle2, color: 'emerald' },
          { title: 'Avg Assessment Score', value: `${avgScore}%`, subtitle: 'Benchmark Average', icon: Award, color: 'purple' },
        ]}
      />

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
