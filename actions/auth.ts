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

  return { success: true, redirectUrl: '/employee/dashboard' };
}

export async function logoutUser() {
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

  await clearSessionCookie();
  revalidatePath('/');
}
