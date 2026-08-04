'use server';

import { getSession } from '@/lib/auth';
import ExcelJS from 'exceljs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getHRDashboardStats() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/reports/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    return {
      totalEmployees: data.totalEmployees || 0,
      activeEmployees: data.activeEmployees || 0,
      completedEmployeesCount: data.completedEmployeesCount || 0,
      pendingEmployeesCount: data.pendingEmployeesCount || 0,
      certificatesCount: data.certificatesCount || 0,
      avgAssessmentScore: data.avgAssessmentScore || 0,
      recentActivityLogs: data.recentActivityLogs || [],
      totalLessonsCount: data.totalLessonsCount || 0,
      departments: (data.departments || []).map((d: any) => ({
        id: String(d.id),
        name: d.departmentName || d.name,
        code: d.departmentCode || d.code,
        description: d.description,
        _count: {
          employees: d.employeeCount ?? d._count?.employees ?? 0,
          modules: d.moduleCount ?? d._count?.modules ?? 0,
        },
      })),
    };
  } catch (err: any) {
    console.error('[getHRDashboardStats] API error:', err);
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      completedEmployeesCount: 0,
      pendingEmployeesCount: 0,
      certificatesCount: 0,
      avgAssessmentScore: 0,
      recentActivityLogs: [],
      totalLessonsCount: 0,
      departments: [],
    };
  }
}

export async function getHRDetailedReport(departmentFilter?: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    const url = new URL(`${API_BASE}/reports/detailed`);
    if (departmentFilter && departmentFilter !== 'ALL') {
      url.searchParams.set('departmentFilter', departmentFilter);
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (err: any) {
    console.error('[getHRDetailedReport] API error:', err);
    return [];
  }
}

export async function exportReportToExcel(departmentFilter?: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const reportRows = await getHRDetailedReport(departmentFilter);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Induction Progress Report');

  sheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 15 },
    { header: 'Employee Name', key: 'name', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Office Location', key: 'office', width: 20 },
    { header: 'Lessons Completed', key: 'lessons', width: 18 },
    { header: 'Overall Progress (%)', key: 'progressPercent', width: 20 },
    { header: 'Assessment Attempts', key: 'attemptsCount', width: 20 },
    { header: 'Best Score', key: 'bestScore', width: 15 },
    { header: 'Last Attempt Date', key: 'lastAttemptDate', width: 18 },
    { header: 'Certificate Status', key: 'certificateStatus', width: 18 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  reportRows.forEach((row: any) => {
    sheet.addRow({
      employeeId: row.employeeId,
      name: row.name,
      department: row.department,
      designation: row.designation,
      office: row.office,
      lessons: `${row.completedLessonsCount} / ${row.totalLessons}`,
      progressPercent: `${row.progressPercent}%`,
      attemptsCount: row.attemptsCount,
      bestScore: row.bestScore,
      lastAttemptDate: row.lastAttemptDate,
      certificateStatus: row.certificateStatus,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return (buffer as any).toString('base64');
}

export async function sendOverdueReminder(employeeId: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/reports/send-reminder/${employeeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to send reminder.' };
    }

    return { success: true, message: json.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send reminder.' };
  }
}

export async function sendBulkOverdueReminders() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/reports/send-overdue-reminders-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to dispatch bulk reminders.' };
    }

    return { success: true, count: json.count, message: json.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch bulk reminders.' };
  }
}
