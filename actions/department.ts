'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getDepartments() {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const departments = await prisma.department.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          employees: { where: { isDeleted: false } },
          modules: { where: { isDeleted: false } },
        },
      },
    },
  });

  return departments;
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

    if (data.id) {
      // Check duplicate
      const existing = await prisma.department.findFirst({
        where: {
          NOT: { id: data.id },
          OR: [{ name: cleanName }, { code: cleanCode }],
        },
      });

      if (existing) {
        return { success: false, error: 'A department with this Name or Code already exists.' };
      }

      await prisma.department.update({
        where: { id: data.id },
        data: {
          name: cleanName,
          code: cleanCode,
          description: data.description?.trim() || null,
        },
      });
    } else {
      // Check duplicate
      const existing = await prisma.department.findFirst({
        where: {
          OR: [{ name: cleanName }, { code: cleanCode }],
        },
      });

      if (existing) {
        return { success: false, error: 'A department with this Name or Code already exists.' };
      }

      await prisma.department.create({
        data: {
          name: cleanName,
          code: cleanCode,
          description: data.description?.trim() || null,
        },
      });
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
    const empCount = await prisma.employee.count({
      where: { departmentId: id, isDeleted: false },
    });

    if (empCount > 0) {
      return {
        success: false,
        error: `Cannot delete department. ${empCount} active employee(s) are assigned to it. Reassign them first.`,
      };
    }

    await prisma.department.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath('/hr/departments');
    revalidatePath('/hr/course');
    revalidatePath('/hr/employees');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete department.' };
  }
}
