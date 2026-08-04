'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getEmployeeLearningState() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/learning/state`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return processLearningStateData(json.data, session);
      }
    }
  } catch (err) {
    console.error('[getEmployeeLearningState] API error:', err);
  }

  // Return safe default state if backend fetch fails or data is empty
  return getDefaultLearningState(session);
}

function processLearningStateData(data: any, session: any) {
  const employee = data.employee || {
    id: session.id,
    employeeId: session.identifier,
    firstName: session.name?.split(' ')[0] || session.identifier,
    lastName: session.name?.split(' ').slice(1).join(' ') || '',
    email: session.email,
    department: session.department || 'Corporate',
    designation: session.designation || 'Staff',
    office: 'Corporate HQ',
    status: 'ACTIVE',
    isMasterTester: session.identifier === 'EMP7777' || Boolean(session.isMasterTester),
  };

  const isMasterTester = Boolean(employee.isMasterTester || session.identifier === 'EMP7777');
  const course = data.course || null;
  const progressList = data.progressList || [];
  const passedAttempt = data.passedAttempt || null;
  const certificate = data.certificate || null;

  const rawModules = course?.modules || [];

  // Map progress to lessons
  const completedLessonIds = new Set(
    progressList.filter((p: any) => p.isCompleted).map((p: any) => String(p.lessonId))
  );

  let commonLessonsCount = 0;
  let commonCompletedCount = 0;
  let deptLessonsCount = 0;
  let deptCompletedCount = 0;

  const processedModules = rawModules.map((m: any) => {
    const lessons = (m.lessons || []).map((l: any) => {
      const isCompleted = completedLessonIds.has(String(l.id));
      if (m.moduleType === 'COMMON') {
        commonLessonsCount++;
        if (isCompleted) commonCompletedCount++;
      } else {
        deptLessonsCount++;
        if (isCompleted) deptCompletedCount++;
      }
      return {
        ...l,
        id: String(l.id),
        isCompleted,
      };
    });

    const isModuleCompleted = lessons.length > 0 && lessons.every((l: any) => l.isCompleted);
    return {
      ...m,
      id: String(m.id),
      lessons,
      isCompleted: isModuleCompleted,
      isUnlocked: true,
    };
  });

  const commonModules = processedModules.filter((m: any) => m.moduleType === 'COMMON');
  const departmentModules = processedModules.filter((m: any) => m.moduleType === 'DEPARTMENT');

  const allCommonCompleted = commonLessonsCount > 0 ? commonCompletedCount >= commonLessonsCount : true;

  // Set sequential module unlocking
  let prevCommonDone = true;
  commonModules.forEach((m: any) => {
    m.isUnlocked = prevCommonDone || isMasterTester;
    if (!m.isCompleted) prevCommonDone = false;
  });

  let prevDeptDone = allCommonCompleted;
  departmentModules.forEach((m: any) => {
    m.isUnlocked = (allCommonCompleted && prevDeptDone) || isMasterTester;
    if (!m.isCompleted) prevDeptDone = false;
  });

  // Set sequential lesson unlocking within each module
  [...commonModules, ...departmentModules].forEach((m: any) => {
    let prevLessonDone = m.isUnlocked;
    m.lessons.forEach((l: any, idx: number) => {
      l.isUnlocked = isMasterTester || (idx === 0 ? m.isUnlocked : prevLessonDone);
      if (l.isCompleted) {
        prevLessonDone = true;
      } else {
        prevLessonDone = false;
      }
    });
  });

  const totalLessonsCount = commonLessonsCount + deptLessonsCount;
  const completedLessonsCount = commonCompletedCount + deptCompletedCount;
  const overallProgressPercentage = totalLessonsCount > 0
    ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100))
    : 0;

  const allLessonsCompleted = totalLessonsCount > 0 ? completedLessonsCount >= totalLessonsCount : true;
  const isAssessmentUnlocked = allLessonsCompleted || isMasterTester;
  const isCourseFullyCompleted = Boolean(passedAttempt || certificate);

  return {
    employee,
    course,
    commonModules,
    departmentModules,
    totalLessonsCount,
    completedLessonsCount,
    commonLessonsCount,
    commonCompletedCount,
    deptLessonsCount,
    deptCompletedCount,
    overallProgressPercentage,
    allCommonCompleted,
    allLessonsCompleted,
    isAssessmentUnlocked,
    isCourseFullyCompleted,
    passedAttempt,
    certificate,
    isMasterTester,
  };
}

function getDefaultLearningState(session: any) {
  const isMasterTester = session?.identifier === 'EMP7777' || Boolean(session?.isMasterTester);
  return {
    employee: {
      id: session?.id || '1',
      employeeId: session?.identifier || 'EMP1001',
      firstName: session?.name?.split(' ')[0] || 'Candidate',
      lastName: session?.name?.split(' ').slice(1).join(' ') || '',
      email: session?.email || '',
      department: session?.department || 'Corporate',
      designation: session?.designation || 'Staff',
      office: 'Corporate HQ',
      status: 'ACTIVE',
      isMasterTester,
    },
    course: null,
    commonModules: [],
    departmentModules: [],
    totalLessonsCount: 0,
    completedLessonsCount: 0,
    commonLessonsCount: 0,
    commonCompletedCount: 0,
    deptLessonsCount: 0,
    deptCompletedCount: 0,
    overallProgressPercentage: 0,
    allCommonCompleted: true,
    allLessonsCompleted: true,
    isAssessmentUnlocked: isMasterTester,
    isCourseFullyCompleted: false,
    passedAttempt: null,
    certificate: null,
    isMasterTester,
  };
}

export async function saveLessonProgress(data: {
  lessonId: string;
  isCompleted?: boolean;
  markCompletedManualPDF?: boolean;
  watchedSeconds: number;
  totalSeconds: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return { success: false, isCompleted: false, error: 'Unauthorized' };
  }

  try {
    const payload = {
      lessonId: parseInt(data.lessonId, 10),
      isCompleted: Boolean(data.isCompleted || data.markCompletedManualPDF),
      watchedSeconds: Number(data.watchedSeconds || 0),
      totalSeconds: Number(data.totalSeconds || 0),
    };

    const res = await fetch(`${API_BASE}/learning/progress`, {
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
      return { success: false, error: json?.message || 'Failed to save progress.' };
    }

    revalidatePath('/employee/learn');
    revalidatePath('/employee/dashboard');
    return { success: true, isCompleted: json.data?.isCompleted || Boolean(payload.isCompleted), progress: json.data };
  } catch (err: any) {
    return { success: false, isCompleted: false, error: err.message || 'Failed to save progress.' };
  }
}

export const updateLessonProgress = saveLessonProgress;

