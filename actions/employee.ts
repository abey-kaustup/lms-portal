'use server';

import { getSession } from '@/lib/auth';
import { validateEmployeeData } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import ExcelJS from 'exceljs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

  try {
    const url = new URL(`${API_BASE}/employees`);
    if (search.trim()) url.searchParams.set('search', search.trim());
    if (department && department !== 'ALL') {
      if (!isNaN(parseInt(department, 10))) {
        url.searchParams.set('departmentId', department);
      }
    }
    if (status && status !== 'ALL') url.searchParams.set('status', status);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const result = await res.json();
      const rawList = result.data || result.employees || [];

      const formattedEmployees = rawList.map((emp: any) => ({
        id: String(emp.id),
        employeeId: emp.employeeCode || emp.employeeId,
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        email: emp.officialEmail || emp.email,
        department: emp.department?.departmentName || emp.departmentName || emp.department || 'Corporate',
        departmentId: emp.departmentId ? String(emp.departmentId) : null,
        designation: emp.designation?.title || emp.designationTitle || emp.designation || 'Staff',
        office: emp.office?.officeName || emp.officeName || emp.office || 'Corporate HQ',
        joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : new Date(),
        status: emp.employmentStatus || emp.status || 'ACTIVE',
        isMasterTester: Boolean(emp.isMasterTester),
        certificates: [],
        assessmentAttempts: [],
        lessonProgresses: [],
      }));

      const deptsRes = await fetch(`${API_BASE}/departments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken || ''}`,
        },
        cache: 'no-store',
      }).catch(() => null);

      let depts: string[] = ['Information Technology', 'Human Resources', 'Finance & Accounts', 'Operations', 'Sales & Marketing', 'Legal & Compliance'];
      let deptItems: any[] = [];

      if (deptsRes && deptsRes.ok) {
        const dJson = await deptsRes.json();
        if (dJson.data) {
          deptItems = dJson.data;
          depts = dJson.data.map((d: any) => d.departmentName || d.name);
        }
      }

      return {
        employees: formattedEmployees,
        total: result.totalRecords || formattedEmployees.length,
        totalPages: result.totalPages || 1,
        page: result.page || page,
        departments: depts,
        departmentItems: deptItems,
      };
    }
  } catch (err) {
    console.error('[getEmployees] API fetch error:', err);
  }

  return {
    employees: [],
    total: 0,
    totalPages: 1,
    page,
    departments: ['Information Technology', 'Human Resources', 'Finance & Accounts', 'Operations', 'Sales & Marketing', 'Legal & Compliance'],
    departmentItems: [],
  };
}

export async function getEmployeeById(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('[getEmployeeById] API error:', err);
    return null;
  }
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

    const apiPayload = {
      id: data.id && !isNaN(parseInt(data.id, 10)) ? parseInt(data.id, 10) : null,
      employeeCode: cleanEmpId,
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      officialEmail: data.email.trim(),
      departmentId: data.departmentId && !isNaN(parseInt(data.departmentId, 10)) ? parseInt(data.departmentId, 10) : 1,
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
      cache: 'no-store',
    });

    const apiResult = await apiRes.json().catch(() => null);
    if (!apiRes.ok || !apiResult?.success) {
      return {
        success: false,
        error: apiResult?.message || 'Failed to save employee record.',
      };
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
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to delete employee.' };
    }

    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete employee.' };
  }
}

export async function exportEmployeesToExcel() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const { employees } = await getEmployees({ pageSize: 1000 });

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
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  employees.forEach((emp: any) => {
    sheet.addRow({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName || '',
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      office: emp.office,
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      status: emp.status,
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
        errors.push(`Row ${rowNumber}: Required fields missing.`);
        continue;
      }

      const joiningDate = joiningDateText ? new Date(joiningDateText).toISOString() : new Date().toISOString();

      const saveRes = await saveEmployee({
        employeeId: empId,
        firstName,
        middleName,
        lastName,
        email,
        department: department || 'General',
        designation: designation || 'Staff',
        office: office || 'Corporate HQ',
        joiningDate,
        status: statusText,
      });

      if (saveRes.success) {
        createdCount++;
      } else {
        errors.push(`Row ${rowNumber} (${empId}): ${saveRes.error}`);
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

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };

  const todayStr = new Date().toISOString().split('T')[0];

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

  const buffer = await workbook.xlsx.writeBuffer();
  return (buffer as any).toString('base64');
}
