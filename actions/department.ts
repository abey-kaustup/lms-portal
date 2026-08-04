'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getDepartments() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rawDepts = json.data || [];

    return rawDepts.map((d: any) => ({
      id: String(d.id),
      name: d.departmentName || d.name,
      code: d.departmentCode || d.code,
      description: d.description,
      _count: {
        employees: d.employeeCount ?? d._count?.employees ?? 0,
        modules: d.moduleCount ?? d._count?.modules ?? 0,
      },
    }));
  } catch (err: any) {
    console.error('[getDepartments] API error:', err);
    return [];
  }
}

export async function saveDepartment(data: {
  id?: string;
  name: string;
  code: string;
  description?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const cleanName = data.name.trim();
    const cleanCode = data.code.trim().toUpperCase();

    if (!cleanName || !cleanCode) {
      return { success: false, error: 'Department Name and Code are required.' };
    }

    const payload = {
      id: data.id ? parseInt(data.id, 10) : null,
      departmentName: cleanName,
      departmentCode: cleanCode,
      description: data.description?.trim() || null,
    };

    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to save department.' };
    }

    revalidatePath('/hr/departments');
    revalidatePath('/hr/course');
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save department.' };
  }
}

export async function deleteDepartment(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to delete department.' };
    }

    revalidatePath('/hr/departments');
    revalidatePath('/hr/course');
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete department.' };
  }
}
