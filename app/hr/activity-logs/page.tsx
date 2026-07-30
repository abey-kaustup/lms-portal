'use client';

import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '@/actions/activity';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import {
  ShieldAlert,
  Search,
  Filter,
  Activity,
  User,
  Clock,
} from 'lucide-react';

export default function HRActivityLogsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getActivityLogs({
        role: roleFilter,
        action: actionFilter,
        search,
        page,
        pageSize: 20,
      });
      setLogs(res.logs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast('Failed to fetch activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [roleFilter, actionFilter, search, page]);

  const columns: Column<any>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (row) => (
        <span className="font-mono text-slate-500 font-semibold">
          {new Date(row.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'User Identity',
      render: (row) => (
        <span className="font-bold text-slate-900">
          {row.employee
            ? `${row.employee.firstName} ${row.employee.lastName} (${row.employee.employeeId})`
            : row.hrUser?.name || row.userId}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant={row.role === 'HR_ADMIN' ? 'purple' : 'default'}>{row.role}</Badge>,
    },
    {
      key: 'action',
      header: 'Action Event',
      render: (row) => {
        const isAntiCheat =
          row.action === 'TAB_SWITCH' ||
          row.action === 'WINDOW_BLUR' ||
          row.action === 'FULLSCREEN_EXIT';
        return (
          <Badge
            variant={
              isAntiCheat
                ? 'warning'
                : row.action.includes('COMPLETED') || row.action.includes('SUBMITTED')
                ? 'success'
                : 'info'
            }
          >
            {row.action}
          </Badge>
        );
      },
    },
    {
      key: 'details',
      header: 'Activity Details',
      render: (row) => <span className="text-slate-600 font-medium">{row.details}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Security & System Audit Logs"
        description="Audit trail of logins, lesson completions, proctored assessment events, and anti-cheat alerts."
        breadcrumbs={[{ label: 'Audit Logs' }]}
        stats={[
          { title: 'Total Logged Events', value: total, subtitle: 'System Audit Stream', icon: Activity, color: 'blue' },
          { title: 'Anti-Cheat Alerts', value: logs.filter((l) => l.action.includes('TAB_SWITCH') || l.action.includes('BLUR')).length, subtitle: 'Proctor Violations', icon: ShieldAlert, color: 'amber' },
        ]}
      />

      {/* Audit Log DataTable */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search by User ID or details..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalRecords={total}
        onPageChange={(p) => setPage(p)}
        filterControls={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_ADMIN">HR Administrator</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span>Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Event Types</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="LESSON_COMPLETED">LESSON_COMPLETED</option>
                <option value="ASSESSMENT_SUBMITTED">ASSESSMENT_SUBMITTED</option>
                <option value="TAB_SWITCH">TAB_SWITCH (Anti-Cheat)</option>
                <option value="WINDOW_BLUR">WINDOW_BLUR (Anti-Cheat)</option>
              </select>
            </div>
          </div>
        }
      />
    </div>
  );
}
