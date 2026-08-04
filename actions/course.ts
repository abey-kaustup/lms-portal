'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getCourseWithStructure() {
  const session = await getSession();
  if (!session) return null;

  try {
    const res = await fetch(`${API_BASE}/courses/structure`, {
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
    console.error('[getCourseWithStructure] API error:', err);
    return null;
  }
}

export async function createModule(data: {
  courseId: string;
  title: string;
  description?: string;
  moduleType?: 'COMMON' | 'DEPARTMENT';
  departmentId?: string | null;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      courseId: parseInt(data.courseId, 10),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      moduleType: data.moduleType || 'COMMON',
      targetDepartmentId: data.departmentId ? parseInt(data.departmentId, 10) : null,
      sortOrder: data.sortOrder,
    };

    const res = await fetch(`${API_BASE}/courses/modules`, {
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
      return { success: false, error: json?.message || 'Failed to create module.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create module.' };
  }
}

export async function updateModule(data: {
  id: string;
  title: string;
  description?: string;
  moduleType?: 'COMMON' | 'DEPARTMENT';
  departmentId?: string | null;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      id: parseInt(data.id, 10),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      moduleType: data.moduleType || 'COMMON',
      targetDepartmentId: data.departmentId ? parseInt(data.departmentId, 10) : null,
      sortOrder: data.sortOrder,
    };

    const res = await fetch(`${API_BASE}/courses/modules`, {
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
      return { success: false, error: json?.message || 'Failed to update module.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update module.' };
  }
}

export async function deleteModule(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/courses/modules/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to delete module.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete module.' };
  }
}

export async function createLesson(data: {
  moduleId: string;
  title: string;
  description?: string;
  contentType?: 'VIDEO' | 'PDF' | 'VIDEO_PDF';
  videoUrl?: string;
  pdfUrl?: string;
  minDurationSeconds?: number;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      moduleId: parseInt(data.moduleId, 10),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      contentType: data.contentType || 'VIDEO',
      videoUrl: data.videoUrl?.trim() || null,
      pdfUrl: data.pdfUrl?.trim() || null,
      minDurationSeconds: data.minDurationSeconds || 0,
      sortOrder: data.sortOrder,
    };

    const res = await fetch(`${API_BASE}/courses/lessons`, {
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
      return { success: false, error: json?.message || 'Failed to create lesson.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create lesson.' };
  }
}

export async function updateLesson(data: {
  id: string;
  title: string;
  description?: string;
  contentType?: 'VIDEO' | 'PDF' | 'VIDEO_PDF';
  videoUrl?: string;
  pdfUrl?: string;
  minDurationSeconds?: number;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      id: parseInt(data.id, 10),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      contentType: data.contentType || 'VIDEO',
      videoUrl: data.videoUrl?.trim() || null,
      pdfUrl: data.pdfUrl?.trim() || null,
      minDurationSeconds: data.minDurationSeconds || 0,
      sortOrder: data.sortOrder,
    };

    const res = await fetch(`${API_BASE}/courses/lessons`, {
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
      return { success: false, error: json?.message || 'Failed to update lesson.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update lesson.' };
  }
}

export async function deleteLesson(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/courses/lessons/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to delete lesson.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete lesson.' };
  }
}

export async function saveLesson(data: {
  id?: string;
  moduleId: string;
  title: string;
  description?: string;
  contentType?: 'VIDEO' | 'PDF' | 'VIDEO_PDF';
  videoUrl?: string;
  pdfUrl?: string;
  minDurationSeconds?: number;
  sortOrder?: number;
}) {
  if (data.id) {
    return updateLesson({ ...data, id: data.id });
  }
  return createLesson(data);
}

export async function reorderModules(moduleIds: string[]) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    for (let i = 0; i < moduleIds.length; i++) {
      const id = moduleIds[i];
      await fetch(`${API_BASE}/courses/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken || ''}`,
        },
        body: JSON.stringify({
          id: parseInt(id, 10),
          sortOrder: i + 1,
        }),
        cache: 'no-store',
      });
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder modules.' };
  }
}

