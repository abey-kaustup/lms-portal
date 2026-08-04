'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getAssessmentQuestions(courseId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/assessments/questions/${courseId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    const questions = json.data || [];
    (questions as any).isCooldownActive = Boolean(json.isCooldownActive);
    (questions as any).cooldownExpiresAt = json.cooldownExpiresAt;
    (questions as any).cooldownRemainingMinutes = json.cooldownRemainingMinutes || 0;
    (questions as any).lastAttemptScore = json.lastAttemptScore;
    return questions;
  } catch (err) {
    console.error('[getAssessmentQuestions] API error:', err);
    return [];
  }
}

export async function saveAssessmentQuestion(data: {
  id?: string;
  courseId: string;
  moduleId?: string | null;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      id: data.id ? parseInt(data.id, 10) : null,
      courseId: parseInt(data.courseId, 10),
      moduleId: data.moduleId ? parseInt(data.moduleId, 10) : null,
      questionText: data.questionText.trim(),
      options: data.options,
      correctOptionIndex: data.correctOptionIndex,
      explanation: data.explanation?.trim() || null,
      points: data.points || 1.0,
    };

    const res = await fetch(`${API_BASE}/assessments/questions`, {
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
      return { success: false, error: json?.message || 'Failed to save question.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/assessment');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save question.' };
  }
}

export async function deleteAssessmentQuestion(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'HR_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${API_BASE}/assessments/questions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.message || 'Failed to delete question.' };
    }

    revalidatePath('/hr/course');
    revalidatePath('/employee/assessment');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete question.' };
  }
}

export async function submitAssessmentAttempt(data: {
  courseId: string;
  answers: Record<string, number>;
  timeTakenSeconds: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const intAnswers: Record<number, number> = {};
    Object.entries(data.answers).forEach(([k, v]) => {
      intAnswers[parseInt(k, 10)] = v;
    });

    const payload = {
      courseId: parseInt(data.courseId, 10),
      answers: intAnswers,
      timeTakenSeconds: data.timeTakenSeconds,
    };

    const res = await fetch(`${API_BASE}/assessments/submit`, {
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
      return { success: false, error: json?.message || 'Failed to submit attempt.' };
    }

    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    revalidatePath('/employee/certificate');
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit attempt.' };
  }
}

export const submitAssessment = submitAssessmentAttempt;

