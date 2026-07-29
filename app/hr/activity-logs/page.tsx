'use client';

import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '@/actions/activity';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security & System Audit Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of logins, lesson completions, proctored assessment events, and anti-cheat alerts.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by User ID or details..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="HR_ADMIN">HR Administrator</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="LESSON_COMPLETED">LESSON_COMPLETED</option>
              <option value="ASSESSMENT_SUBMITTED">ASSESSMENT_SUBMITTED</option>
              <option value="TAB_SWITCH">TAB_SWITCH (Anti-Cheat)</option>
              <option value="WINDOW_BLUR">WINDOW_BLUR (Anti-Cheat)</option>
              <option value="FULLSCREEN_EXIT">FULLSCREEN_EXIT (Anti-Cheat)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Querying Audit Log Stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateStr = new Date(log.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  const isAntiCheat =
                    log.action === 'TAB_SWITCH' ||
                    log.action === 'WINDOW_BLUR' ||
                    log.action === 'FULLSCREEN_EXIT';

                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        isAntiCheat ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 shrink-0">{dateStr}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {log.employee
                          ? `${log.employee.firstName} ${log.employee.lastName} (${log.employee.employeeId})`
                          : log.hrUser?.name || log.userId}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={log.role === 'HR_ADMIN' ? 'info' : 'default'}>
                          {log.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            isAntiCheat
                              ? 'warning'
                              : log.action.includes('COMPLETED') || log.action.includes('SUBMITTED')
                              ? 'success'
                              : 'info'
                          }
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{log.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {logs.length} of {total} Logs</span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
