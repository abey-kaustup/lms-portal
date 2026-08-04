'use server';

import { getSession } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function logActivity(action: string, details?: string) {
  const session = await getSession();
  if (!session) return;

  try {
    await fetch(`${API_BASE}/activity/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      body: JSON.stringify({ action, details }),
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[logActivity] API error:', err);
  }
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

  try {
    const url = new URL(`${API_BASE}/activity/logs`);
    if (role && role !== 'ALL') url.searchParams.set('role', role);
    if (action && action !== 'ALL') url.searchParams.set('action', action);
    if (search.trim()) url.searchParams.set('search', search.trim());
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return { logs: [], total: 0, totalPages: 0, page: 1 };
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('[getActivityLogs] API error:', err);
    return { logs: [], total: 0, totalPages: 0, page: 1 };
  }
}
