'use client';

import React, { useState, useEffect } from 'react';
import { getHRDetailedReport, exportReportToExcel } from '@/actions/reports';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Badge';
import {
  BarChart3,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Award,
  FileSpreadsheet,
} from 'lucide-react';

export default function HRReportsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getHRDetailedReport();
      setReportRows(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExportExcel = async () => {
    try {
      showToast('Generating Excel progress report...', 'info');
      const base64 = await exportReportToExcel();
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Compliance Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed breakdown of employee completion rates, scores, and assessment attempt metrics.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Full Excel Report</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter by ID, name, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Employees</option>
            <option value="COMPLETED">Completed & Certified</option>
            <option value="PENDING">Pending Induction</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Overall Progress</th>
                <th className="py-3.5 px-4 text-center">Lessons</th>
                <th className="py-3.5 px-4 text-center">Attempts</th>
                <th className="py-3.5 px-4 text-center">Best Score</th>
                <th className="py-3.5 px-4 text-right">Certificate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Computing Compliance Analytics...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.employeeId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.department}</td>
                    <td className="py-3.5 px-4 w-48">
                      <ProgressBar progress={row.progressPercent} size="sm" showLabel={true} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {row.completedLessonsCount} / {row.totalLessons}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {row.attemptsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                      {row.bestScore}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge variant={row.isCompleted ? 'purple' : 'warning'}>
                        {row.certificateStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
