'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function getHRDashboardStats() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const [
    totalEmployees,
    activeEmployees,
    certificatesCount,
    allPassedAttempts,
    recentActivityLogs,
    totalLessonsCount,
    departments,
  ] = await Promise.all([
    prisma.employee.count({ where: { isDeleted: false } }),
    prisma.employee.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
    prisma.certificate.count(),
    prisma.assessmentAttempt.findMany({
      select: { score: true, passed: true },
    }),
    prisma.activityLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } },
        hrUser: { select: { name: true, username: true } },
      },
    }),
    prisma.lesson.count({ where: { isDeleted: false } }),
    prisma.department.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: {
            employees: { where: { isDeleted: false } },
            modules: { where: { isDeleted: false } },
          },
        },
      },
    }),
  ]);

  const completedEmployeesCount = certificatesCount;
  const pendingEmployeesCount = Math.max(0, totalEmployees - completedEmployeesCount);

  let totalScoreSum = 0;
  allPassedAttempts.forEach((a) => {
    totalScoreSum += a.score;
  });
  const avgAssessmentScore = allPassedAttempts.length > 0
    ? Math.round((totalScoreSum / allPassedAttempts.length) * 10) / 10
    : 0;

  return {
    totalEmployees,
    activeEmployees,
    completedEmployeesCount,
    pendingEmployeesCount,
    certificatesCount,
    avgAssessmentScore,
    recentActivityLogs,
    totalLessonsCount,
    departments,
  };
}

export async function getHRDetailedReport(departmentFilter?: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const where: any = { isDeleted: false };
  if (departmentFilter && departmentFilter !== 'ALL') {
    where.OR = [
      { departmentId: departmentFilter },
      { department: departmentFilter },
    ];
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { employeeId: 'asc' },
    include: {
      departmentRel: true,
      lessonProgresses: {
        where: { isCompleted: true },
      },
      assessmentAttempts: {
        orderBy: { submittedAt: 'desc' },
      },
      certificates: true,
    },
  });

  // Fetch all active modules to calculate expected lessons per department
  const allModules = await prisma.module.findMany({
    where: { isDeleted: false },
    include: {
      lessons: { where: { isDeleted: false } },
    },
  });

  const reportRows = employees.map((emp) => {
    // Calculate employee-specific assigned lessons count (Common + Dept modules)
    const assignedModules = allModules.filter((m) => {
      if (m.moduleType === 'COMMON') return true;
      if (m.moduleType === 'DEPARTMENT') {
        if (emp.departmentId && m.departmentId === emp.departmentId) return true;
        if (emp.department && m.departmentId) return true;
      }
      return false;
    });

    let assignedLessonsTotal = 0;
    assignedModules.forEach((m) => {
      assignedLessonsTotal += m.lessons.length;
    });

    const completedLessonsCount = emp.lessonProgresses.length;
    const progressPercent = assignedLessonsTotal > 0
      ? Math.min(100, Math.round((completedLessonsCount / assignedLessonsTotal) * 100))
      : 0;

    const isCompleted = emp.certificates.length > 0;
    const attemptsCount = emp.assessmentAttempts.length;
    const bestAttempt = emp.assessmentAttempts.reduce(
      (max, curr) => (curr.score > max ? curr.score : max),
      0
    );
    const lastAttempt = emp.assessmentAttempts[0];

    return {
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.departmentRel?.name || emp.department,
      designation: emp.designation,
      office: emp.office,
      progressPercent,
      completedLessonsCount,
      totalLessons: assignedLessonsTotal,
      isCompleted,
      attemptsCount,
      bestScore: attemptsCount > 0 ? `${bestAttempt}%` : 'N/A',
      lastAttemptDate: lastAttempt ? lastAttempt.submittedAt.toISOString().split('T')[0] : 'N/A',
      certificateStatus: isCompleted ? 'Issued' : 'Pending',
    };
  });

  return reportRows;
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

  // Header styling
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  reportRows.forEach((row) => {
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
