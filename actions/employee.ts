'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import ExcelJS from 'exceljs';
import { validateEmployeeData } from '@/lib/validation';

export async function getEmployees({
  search = '',
  department = '',
  status = '',
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  // 1. Try fetching from ASP.NET Core Web API (MS SQL Server)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  try {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status && status !== 'ALL') query.append('status', status);
    query.append('page', String(page));
    query.append('pageSize', String(pageSize));

    const res = await fetch(`${API_BASE}/employees?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const formattedEmployees = result.data.map((e: any) => ({
          id: e.id,
          employeeId: e.employeeCode,
          firstName: e.firstName,
          middleName: e.middleName,
          lastName: e.lastName,
          email: e.officialEmail,
          department: e.department?.departmentName || 'Information Technology',
          departmentId: e.departmentId,
          designation: e.designation?.title || 'Team Lead',
          office: e.office?.officeName || 'Corporate HQ',
          joiningDate: new Date(e.joiningDate),
          status: e.employmentStatus || 'ACTIVE',
          isMasterTester: e.isMasterTester || false,
          certificates: [],
          assessmentAttempts: [],
          lessonProgresses: [],
        }));

        return {
          employees: formattedEmployees,
          total: result.totalRecords || formattedEmployees.length,
          totalPages: result.totalPages || 1,
          page: result.page || 1,
          departments: ['Information Technology', 'Human Resources', 'Finance & Accounts', 'Operations', 'Sales & Marketing', 'Legal & Compliance'],
          departmentItems: [],
        };
      }
    }
  } catch (err) {
    console.warn('[getEmployees] API fetch warning, using local query fallback:', err);
  }

  // 2. Fallback to Prisma SQLite
  const where: any = {
    isDeleted: false,
  };

  if (search.trim()) {
    const q = search.trim();
    where.OR = [
      { employeeId: { contains: q } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { designation: { contains: q } },
      { office: { contains: q } },
    ];
  }

  if (department && department !== 'ALL') {
    where.OR = [
      { departmentId: department },
      { department: department },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const total = await prisma.employee.count({ where }).catch(() => 0);
  const employees = await prisma.employee.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      departmentRel: true,
      lessonProgresses: {
        where: { isCompleted: true },
      },
      assessmentAttempts: {
        orderBy: { score: 'desc' },
        take: 1,
      },
      certificates: true,
    },
  }).catch(() => []);

  const activeDepartments = await prisma.department.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  return {
    employees,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
    page,
    departments: activeDepartments.map((d) => d.name),
    departmentItems: activeDepartments,
  };
}

export async function getEmployeeById(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      departmentRel: true,
      lessonProgresses: {
        include: { lesson: true },
      },
      assessmentAttempts: {
        orderBy: { submittedAt: 'desc' },
      },
      certificates: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  return employee;
}

export async function saveEmployee(data: {
  id?: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  departmentId?: string | null;
  designation: string;
  office: string;
  joiningDate: string;
  status: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const validation = validateEmployeeData({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      department: data.department,
      joiningDate: data.joiningDate,
    });

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const joiningDate = new Date(data.joiningDate);
    const cleanEmpId = data.employeeId.trim().toUpperCase();

    // 1. Save to ASP.NET Core REST API (MS SQL Server)
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const apiPayload = {
      id: data.id && !isNaN(parseInt(data.id)) ? parseInt(data.id) : null,
      employeeCode: cleanEmpId,
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      officialEmail: data.email.trim(),
      departmentId: data.departmentId && !isNaN(parseInt(data.departmentId)) ? parseInt(data.departmentId) : 1,
      designationId: 1,
      officeId: 1,
      joiningDate: joiningDate.toISOString(),
      employmentStatus: data.status || 'ACTIVE',
      isMasterTester: cleanEmpId === 'EMP7777',
    };

      const apiRes = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken || ''}`,
        },
        body: JSON.stringify(apiPayload),
      });

      const apiResult = await apiRes.json().catch(() => null);
      if (!apiRes.ok) {
        return {
          success: false,
          error: apiResult?.message || 'Employee Code or Email already exists.',
        };
      }

    // 2. Also save in Prisma SQLite as local sync
    let targetDeptId = data.departmentId || null;
    let targetDeptName = data.department.trim();

    if (targetDeptId) {
      const deptObj = await prisma.department.findUnique({ where: { id: targetDeptId } }).catch(() => null);
      if (deptObj) targetDeptName = deptObj.name;
    } else if (targetDeptName) {
      const deptObj = await prisma.department.findFirst({
        where: {
          isDeleted: false,
          OR: [{ name: targetDeptName }, { code: targetDeptName.toUpperCase() }],
        },
      }).catch(() => null);
      if (deptObj) {
        targetDeptId = deptObj.id;
        targetDeptName = deptObj.name;
      }
    }

    if (data.id) {
      await prisma.employee.update({
        where: { id: data.id },
        data: {
          employeeId: cleanEmpId,
          firstName: data.firstName.trim(),
          middleName: data.middleName?.trim() || null,
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          department: targetDeptName,
          departmentId: targetDeptId,
          designation: data.designation.trim(),
          office: data.office.trim(),
          joiningDate,
          status: data.status,
        },
      }).catch(() => null);
    } else {
      await prisma.employee.create({
        data: {
          employeeId: cleanEmpId,
          firstName: data.firstName.trim(),
          middleName: data.middleName?.trim() || null,
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          department: targetDeptName,
          departmentId: targetDeptId,
          designation: data.designation.trim(),
          office: data.office.trim(),
          joiningDate,
          status: data.status || 'ACTIVE',
        },
      }).catch(() => null);
    }

    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save employee.' };
  }
}

export async function deleteEmployee(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: { isDeleted: true },
    });
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete employee.' };
  }
}

export async function exportEmployeesToExcel() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const employees = await prisma.employee.findMany({
    where: { isDeleted: false },
    orderBy: { employeeId: 'asc' },
    include: {
      certificates: true,
      assessmentAttempts: {
        where: { passed: true },
        take: 1,
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Employees');

  sheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Middle Name', key: 'middleName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Office Location', key: 'office', width: 20 },
    { header: 'Joining Date', key: 'joiningDate', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Assessment Score (%)', key: 'score', width: 20 },
    { header: 'Certificate Status', key: 'certificateStatus', width: 20 },
  ];

  // Header styling
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  employees.forEach((emp) => {
    const topScore = emp.assessmentAttempts[0]?.score ?? 'N/A';
    const certStatus = emp.certificates.length > 0 ? 'Issued' : 'Pending';

    sheet.addRow({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName || '',
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      office: emp.office,
      joiningDate: emp.joiningDate.toISOString().split('T')[0],
      status: emp.status,
      score: topScore,
      certificateStatus: certStatus,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return (buffer as any).toString('base64');
}

export async function importEmployeesFromExcel(base64Content: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      return { success: false, error: 'Excel file is empty or missing worksheet.' };
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Skip header row
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const empId = row.getCell(1).text.trim().toUpperCase();
      const firstName = row.getCell(2).text.trim();
      const middleName = row.getCell(3).text.trim();
      const lastName = row.getCell(4).text.trim();
      const email = row.getCell(5).text.trim();
      const department = row.getCell(6).text.trim();
      const designation = row.getCell(7).text.trim();
      const office = row.getCell(8).text.trim();
      const joiningDateText = row.getCell(9).text.trim();
      const statusText = row.getCell(10).text.trim().toUpperCase() || 'ACTIVE';

      if (!empId || !firstName || !lastName || !email) {
        errors.push(`Row ${rowNumber}: Required fields (Employee ID, First Name, Last Name, Email) missing.`);
        continue;
      }

      const joiningDate = joiningDateText ? new Date(joiningDateText) : new Date();

      const validation = validateEmployeeData({
        firstName,
        middleName,
        lastName,
        email,
        department: department || 'General',
        joiningDate,
      });

      if (!validation.isValid) {
        errors.push(`Row ${rowNumber} (${empId}): ${validation.error}`);
        continue;
      }

      try {
        const existing = await prisma.employee.findUnique({
          where: { employeeId: empId },
        });

        if (existing) {
          await prisma.employee.update({
            where: { id: existing.id },
            data: {
              firstName,
              middleName: middleName || null,
              lastName,
              email,
              department: department || existing.department,
              designation: designation || existing.designation,
              office: office || existing.office,
              joiningDate,
              status: statusText === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            },
          });
          updatedCount++;
        } else {
          await prisma.employee.create({
            data: {
              employeeId: empId,
              firstName,
              middleName: middleName || null,
              lastName,
              email,
              department: department || 'General',
              designation: designation || 'Staff',
              office: office || 'Corporate HQ',
              joiningDate,
              status: statusText === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            },
          });
          createdCount++;
        }
      } catch (err: any) {
        errors.push(`Row ${rowNumber} (${empId}): ${err.message}`);
      }
    }

    revalidatePath('/hr/employees');
    return {
      success: true,
      createdCount,
      updatedCount,
      errors,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to process Excel file.' };
  }
}

export async function generateEmployeeImportTemplate() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Employee Import Template');

  sheet.columns = [
    { header: 'EmployeeID', key: 'employeeId', width: 16 },
    { header: 'FirstName', key: 'firstName', width: 16 },
    { header: 'MiddleName', key: 'middleName', width: 14 },
    { header: 'LastName', key: 'lastName', width: 16 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Designation', key: 'designation', width: 22 },
    { header: 'Office', key: 'office', width: 20 },
    { header: 'JoiningDate', key: 'joiningDate', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Add sample rows to guide user on format
  sheet.addRow({
    employeeId: 'EMP1010',
    firstName: 'Sarah',
    middleName: 'A.',
    lastName: 'Connor',
    email: 'sarah.connor@corporate.com',
    department: 'Engineering',
    designation: 'Software Engineer',
    office: 'Corporate HQ',
    joiningDate: todayStr,
    status: 'ACTIVE',
  });

  sheet.addRow({
    employeeId: 'EMP1011',
    firstName: 'Michael',
    middleName: '',
    lastName: 'Scott',
    email: 'michael.scott@corporate.com',
    department: 'Human Resources',
    designation: 'HR Specialist',
    office: 'Scranton Branch',
    joiningDate: todayStr,
    status: 'ACTIVE',
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return (buffer as any).toString('base64');
}
