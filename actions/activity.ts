'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function logActivity(action: string, details?: string) {
  const session = await getSession();
  if (!session) return;

  await prisma.activityLog.create({
    data: {
      userId: session.identifier,
      employeeId: session.role === 'EMPLOYEE' ? session.id : null,
      hrUserId: session.role === 'HR_ADMIN' ? session.id : null,
      role: session.role,
      action,
      details: details || null,
    },
  });
}

export async function getActivityLogs({
  role = '',
  action = '',
  search = '',
  page = 1,
  pageSize = 20,
}: {
  role?: string;
  action?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    throw new Error('Unauthorized');
  }

  const where: any = {};

  if (role && role !== 'ALL') {
    where.role = role;
  }

  if (action && action !== 'ALL') {
    where.action = action;
  }

  if (search.trim()) {
    const q = search.trim();
    where.OR = [
      { userId: { contains: q } },
      { details: { contains: q } },
      { action: { contains: q } },
    ];
  }

  const total = await prisma.activityLog.count({ where });
  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      employee: {
        select: { firstName: true, lastName: true, employeeId: true, department: true },
      },
      hrUser: {
        select: { name: true, username: true },
      },
    },
  });

  return {
    logs,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  };
}
