'use server';

import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// HR Admin Login → calls ASP.NET Core POST /api/auth/login/hr
// ─────────────────────────────────────────────────────────────────────────────
export async function loginHR(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login/hr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return { success: false, error: data?.message || 'Invalid username or password.' };
    }

    // Set session cookie using JWT returned from ASP.NET Core
    await setSessionCookie({
      id: String(data.user.id),
      identifier: data.user.username,
      name: data.user.name || data.user.username,
      email: data.user.email,
      role: 'HR_ADMIN',
      // Store the backend JWT token for authenticated API calls
      accessToken: data.token,
    });

    revalidatePath('/', 'layout');
    return { success: true, redirectUrl: data.redirectUrl || '/hr/dashboard' };
  } catch (err: any) {
    console.error('[loginHR] API error:', err);
    return {
      success: false,
      error: 'Could not reach backend server. Is the ASP.NET Core API running on port 5000?',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Employee Login → calls ASP.NET Core POST /api/auth/login/employee
// ─────────────────────────────────────────────────────────────────────────────
export async function loginEmployee(prevState: any, formData: FormData) {
  const employeeId = formData.get('employeeId') as string;

  if (!employeeId) {
    return { success: false, error: 'Employee ID is required.' };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login/employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employeeId.trim().toUpperCase() }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.message || 'Employee ID not found. Please contact HR.',
      };
    }

    const emp = data.employee;

    await setSessionCookie({
      id: String(emp.id),
      identifier: emp.employeeId,
      name: emp.name,
      email: emp.email,
      role: 'EMPLOYEE',
      department: emp.department,
      designation: emp.designation,
      isMasterTester: false,
      // Store the backend JWT token for authenticated API calls
      accessToken: data.token,
    });

    revalidatePath('/', 'layout');
    return { success: true, redirectUrl: data.redirectUrl || '/employee/dashboard' };
  } catch (err: any) {
    console.error('[loginEmployee] API error:', err);
    return {
      success: false,
      error: 'Could not reach backend server. Is the ASP.NET Core API running on port 5000?',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Current User → reads from session cookie (already populated on login)
// ─────────────────────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const initials = session.name
    ? session.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : session.identifier.substring(0, 2).toUpperCase();

  if (session.role === 'EMPLOYEE') {
    return {
      id: session.id,
      employeeId: session.identifier,
      name: session.name,
      firstName: session.name?.split(' ')[0] || '',
      lastName: session.name?.split(' ').slice(1).join(' ') || '',
      email: session.email,
      department: session.department || 'Corporate',
      designation: session.designation || '',
      office: '',
      role: 'EMPLOYEE' as const,
      isMasterTester: session.isMasterTester || false,
      initials,
      subtitle: `${session.identifier} • ${session.department || 'Corporate'} • ${session.designation || ''}`,
    };
  }

  if (session.role === 'HR_ADMIN') {
    return {
      id: session.id,
      employeeId: session.identifier,
      name: session.name,
      firstName: session.name?.split(' ')[0] || 'HR',
      lastName: session.name?.split(' ').slice(1).join(' ') || 'Admin',
      email: session.email,
      department: 'HR Operations',
      designation: 'HR Administrator',
      office: 'Corporate HQ',
      role: 'HR_ADMIN' as const,
      isMasterTester: false,
      initials,
      subtitle: `HR Admin • Corporate Operations`,
    };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout User → clears the session cookie
// ─────────────────────────────────────────────────────────────────────────────
export async function logoutUser() {
  await clearSessionCookie();
  revalidatePath('/');
}
