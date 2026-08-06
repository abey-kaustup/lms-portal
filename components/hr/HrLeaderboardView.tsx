'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Download, RefreshCw, Filter, ArrowUpDown, Award, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { LeaderboardUser, fetchTop20Leaderboard, triggerRecalculateLeaderboard } from '@/lib/gamification-api';

interface DepartmentOption {
  id: number;
  name: string;
}

interface OfficeOption {
  id: number;
  name: string;
}

export function HrLeaderboardView() {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);

  // Filters & Sorting state
  const [departmentId, setDepartmentId] = useState<string>('');
  const [officeId, setOfficeId] = useState<string>('');
  const [joiningYear, setJoiningYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('points');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchTop20Leaderboard({
      departmentId: departmentId ? parseInt(departmentId) : undefined,
      officeId: officeId ? parseInt(officeId) : undefined,
      joiningYear: joiningYear ? parseInt(joiningYear) : undefined,
      sortBy,
      page,
      pageSize: 20,
    });
    setData(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const loadDropdowns = async () => {
    try {
      const [deptRes, officeRes] = await Promise.all([
        fetch('/api/Departments', { cache: 'no-store' }),
        fetch('/api/Offices', { cache: 'no-store' }),
      ]);
      if (deptRes.ok) {
        const deptJson = await deptRes.json();
        setDepartments(deptJson.data || []);
      }
      if (officeRes.ok) {
        const officeJson = await officeRes.ok ? await officeRes.json() : { data: [] };
        setOffices(officeJson.data || []);
      }
    } catch (e) {
      console.error('Dropdown fetch error:', e);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadData();
  }, [departmentId, officeId, joiningYear, sortBy, page]);

  const handleRecalculate = async () => {
    if (!confirm('Recalculate gamification points and rankings for all employees?')) return;
    setRecalculating(true);
    const success = await triggerRecalculateLeaderboard();
    setRecalculating(false);
    if (success) {
      alert('Leaderboard points & ranks recalculated successfully!');
      loadData();
    } else {
      alert('Failed to recalculate leaderboard.');
    }
  };

  const exportToCsv = () => {
    if (data.length === 0) return;
    const headers = ['Rank', 'Employee Code', 'Employee Name', 'Department', 'Office', 'Courses Completed', 'Lessons Completed', 'Avg Assessment Score %', 'Total Points', 'Badge', 'Last Activity'];
    const rows = filteredData.map((u) => [
      u.rank,
      `"${u.employeeCode}"`,
      `"${u.employeeName}"`,
      `"${u.department}"`,
      `"${u.office || ''}"`,
      u.coursesCompleted,
      u.lessonsCompleted || 0,
      `${u.avgAssessmentScore}%`,
      u.totalPoints,
      `"${u.badge}"`,
      `"${u.lastActivity || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LMS_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    window.print();
  };

  const filteredData = data.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.employeeCode.toLowerCase().includes(term) ||
      u.employeeName.toLowerCase().includes(term) ||
      u.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              Enterprise Gamification Leaderboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Rankings & Achievement Metrics Across All Departments & Locations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-soft-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Ranks'}
          </button>

          <button
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-soft-sm transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel / CSV
          </button>

          <button
            onClick={exportToPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-soft-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Department Filter */}
        <select
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Office Filter */}
        <select
          value={officeId}
          onChange={(e) => {
            setOfficeId(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="">All Offices</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        {/* Joining Year Filter */}
        <select
          value={joiningYear}
          onChange={(e) => {
            setJoiningYear(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="">All Joining Years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
        >
          <option value="points">Sort: Total Points</option>
          <option value="score">Sort: Avg Quiz Score</option>
          <option value="courses">Sort: Courses Completed</option>
          <option value="department">Sort: Department</option>
          <option value="office">Sort: Office Location</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3 text-center">Rank</th>
              <th className="p-3">Employee Code</th>
              <th className="p-3">Employee Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Office</th>
              <th className="p-3 text-center">Courses</th>
              <th className="p-3 text-center">Lessons</th>
              <th className="p-3 text-center">Avg Quiz Score</th>
              <th className="p-3 text-right">Total Points</th>
              <th className="p-3 text-center">Badge</th>
              <th className="p-3 text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {loading ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading leaderboard data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-slate-400">
                  No employees matched the selected filters.
                </td>
              </tr>
            ) : (
              filteredData.map((u) => (
                <tr
                  key={u.employeeId}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    u.rank === 1
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 font-semibold'
                      : u.rank === 2
                      ? 'bg-slate-50/40 dark:bg-slate-800/30'
                      : u.rank === 3
                      ? 'bg-amber-900/10'
                      : ''
                  }`}
                >
                  <td className="p-3 text-center font-bold font-mono">
                    {u.rank === 1 ? '🥇 1' : u.rank === 2 ? '🥈 2' : u.rank === 3 ? '🥉 3' : u.rank}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{u.employeeCode}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{u.employeeName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{u.department}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{u.office || 'N/A'}</td>
                  <td className="p-3 text-center font-bold">{u.coursesCompleted}</td>
                  <td className="p-3 text-center text-slate-500">{u.lessonsCompleted || 0}</td>
                  <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {u.avgAssessmentScore}%
                  </td>
                  <td className="p-3 text-right font-black font-mono text-amber-600 dark:text-amber-400">
                    {u.totalPoints.toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-bold text-xs">{u.badge}</td>
                  <td className="p-3 text-right text-[11px] text-slate-400">{u.lastActivity || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
