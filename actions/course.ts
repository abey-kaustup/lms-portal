'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCourseWithStructure() {
  // Currently Induction Course code: IND-2026-01
  const course = await prisma.course.findFirst({
    where: { isDeleted: false },
    include: {
      modules: {
        where: { isDeleted: false },
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            where: { isDeleted: false },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      assessmentQuestions: {
        where: { isDeleted: false },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return course;
}

export async function createModule(data: {
  courseId: string;
  title: string;
  description?: string;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const count = await prisma.module.count({ where: { courseId: data.courseId } });

    await prisma.module.create({
      data: {
        courseId: data.courseId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder ?? count + 1,
      },
    });

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create module.' };
  }
}

export async function updateModule(data: {
  id: string;
  title: string;
  description?: string;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.module.update({
      where: { id: data.id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
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
    await prisma.module.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete module.' };
  }
}

export async function reorderModules(moduleIds: string[]) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    for (let index = 0; index < moduleIds.length; index++) {
      await prisma.module.update({
        where: { id: moduleIds[index] },
        data: { sortOrder: index + 1 },
      });
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to reorder modules.' };
  }
}

export async function saveLesson(data: {
  id?: string;
  moduleId: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'PDF' | 'VIDEO_PDF';
  videoUrl?: string;
  pdfUrl?: string;
  minDurationSeconds?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    if (data.id) {
      await prisma.lesson.update({
        where: { id: data.id },
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          contentType: data.contentType,
          videoUrl: data.videoUrl?.trim() || null,
          pdfUrl: data.pdfUrl?.trim() || null,
          minDurationSeconds: data.minDurationSeconds ?? 0,
        },
      });
    } else {
      const count = await prisma.lesson.count({ where: { moduleId: data.moduleId } });
      await prisma.lesson.create({
        data: {
          moduleId: data.moduleId,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          contentType: data.contentType,
          videoUrl: data.videoUrl?.trim() || null,
          pdfUrl: data.pdfUrl?.trim() || null,
          sortOrder: count + 1,
          minDurationSeconds: data.minDurationSeconds ?? 0,
        },
      });
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save lesson.' };
  }
}

export async function deleteLesson(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.lesson.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath('/hr/course');
    revalidatePath('/employee/learn');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete lesson.' };
  }
}
