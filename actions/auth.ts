'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function loginHR(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const hrUser = await prisma.hRUser.findUnique({
    where: { username: username.trim() },
  });

  if (!hrUser || hrUser.isDeleted) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const passwordValid = bcrypt.compareSync(password, hrUser.password);
  if (!passwordValid) {
    return { success: false, error: 'Invalid username or password.' };
  }

  await setSessionCookie({
    id: hrUser.id,
    identifier: hrUser.username,
    name: hrUser.name,
    email: hrUser.email,
    role: 'HR_ADMIN',
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: hrUser.username,
      hrUserId: hrUser.id,
      role: 'HR_ADMIN',
      action: 'LOGIN',
      details: 'HR Administrator logged in',
    },
  });

  revalidatePath('/', 'layout');
  return { success: true, redirectUrl: '/hr/dashboard' };
}

export async function loginEmployee(prevState: any, formData: FormData) {
  const employeeId = formData.get('employeeId') as string;

  if (!employeeId) {
    return { success: false, error: 'Employee ID is required.' };
  }

  const cleanEmpId = employeeId.trim().toUpperCase();

  const employee = await prisma.employee.findUnique({
    where: { employeeId: cleanEmpId },
  });

  if (!employee || employee.isDeleted) {
    return { success: false, error: 'Employee ID not found. Please contact HR.' };
  }

  if (employee.status !== 'ACTIVE') {
    return { success: false, error: 'Your account is currently inactive. Please contact HR.' };
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  await setSessionCookie({
    id: employee.id,
    identifier: employee.employeeId,
    name: fullName,
    email: employee.email,
    role: 'EMPLOYEE',
    department: employee.department,
    departmentId: employee.departmentId,
    designation: employee.designation,
    isMasterTester: employee.isMasterTester,
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: employee.employeeId,
      employeeId: employee.id,
      role: 'EMPLOYEE',
      action: 'LOGIN',
      details: `Employee ${fullName} (${employee.employeeId}) logged in`,
    },
  });

  revalidatePath('/', 'layout');
  return { success: true, redirectUrl: '/employee/dashboard' };
}

export async function getCurrentUser() {
  const session = await getSession();

  if (session && session.role === 'EMPLOYEE') {
    const emp = await prisma.employee.findUnique({
      where: { id: session.id },
      include: { departmentRel: true },
    });

    if (emp) {
      const name = `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`.trim();
      const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();
      const deptName = emp.departmentRel?.name || emp.department || 'Corporate';

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        name,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: deptName,
        designation: emp.designation,
        office: emp.office,
        role: 'EMPLOYEE' as const,
        isMasterTester: emp.isMasterTester,
        initials,
        subtitle: `${emp.employeeId} • ${deptName} • ${emp.designation}`,
      };
    }
  }

  if (session && session.role === 'HR_ADMIN') {
    const hr = await prisma.hRUser.findUnique({
      where: { id: session.id },
    });

    if (hr) {
      const initials = hr.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      return {
        id: hr.id,
        employeeId: hr.username,
        name: hr.name,
        firstName: hr.name.split(' ')[0] || 'HR',
        lastName: hr.name.split(' ')[1] || 'Admin',
        email: hr.email,
        department: 'HR Operations',
        designation: 'HR Administrator',
        office: 'Corporate HQ',
        role: 'HR_ADMIN' as const,
        isMasterTester: false,
        initials: initials || 'HR',
        subtitle: `HR Admin • Corporate Operations`,
      };
    }
  }

  return null;
}

export async function logoutUser() {
  try {
    const session = await getSession();
    if (session) {
      await prisma.activityLog.create({
        data: {
          userId: session.identifier,
          role: session.role,
          action: 'LOGOUT',
          details: `User ${session.name} logged out`,
        },
      });
    }
  } catch (err) {
    console.error('Logout activity logging error:', err);
  } finally {
    await clearSessionCookie();
    revalidatePath('/');
  }
}
