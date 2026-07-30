'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getEmployeeLearningState() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    throw new Error('Unauthorized');
  }

  // 1. Fetch employee details including department relation
  const employee = await prisma.employee.findUnique({
    where: { id: session.id },
    include: { departmentRel: true },
  });

  if (!employee) {
    throw new Error('Employee record not found');
  }

  const employeeDeptId = employee.departmentId;
  const employeeDeptName = employee.department;

  // 2. Fetch induction course with modules and lessons
  const course = await prisma.course.findFirst({
    where: { isDeleted: false },
    include: {
      modules: {
        where: { isDeleted: false },
        orderBy: { sortOrder: 'asc' },
        include: {
          department: true,
          lessons: {
            where: { isDeleted: false },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      assessmentQuestions: {
        where: { isDeleted: false },
        include: { module: { include: { department: true } } },
      },
    },
  });

  if (!course) {
    throw new Error('No course available');
  }

  // 3. Filter modules to ONLY show Common modules OR Department modules assigned to employee's department
  const filteredModules = course.modules.filter((mod) => {
    if (mod.moduleType === 'COMMON') return true;
    if (mod.moduleType === 'DEPARTMENT') {
      if (employeeDeptId && mod.departmentId === employeeDeptId) return true;
      if (mod.department?.name && employeeDeptName && mod.department.name.toLowerCase() === employeeDeptName.toLowerCase()) return true;
      if (mod.department?.code && employeeDeptName && mod.department.code.toLowerCase() === employeeDeptName.toLowerCase()) return true;
      return false;
    }
    return false;
  });

  // 4. Fetch employee lesson progress
  const progressList = await prisma.lessonProgress.findMany({
    where: { employeeId: session.id },
  });

  const progressMap = new Map<string, { isCompleted: boolean; watchedSeconds: number; totalSeconds: number }>();
  progressList.forEach((p) => {
    progressMap.set(p.lessonId, {
      isCompleted: p.isCompleted,
      watchedSeconds: p.watchedSeconds,
      totalSeconds: p.totalSeconds,
    });
  });

  // 5. Fetch assessment attempts & certificates
  const passedAttempt = await prisma.assessmentAttempt.findFirst({
    where: { employeeId: session.id, courseId: course.id, passed: true },
  });

  const certificate = await prisma.certificate.findFirst({
    where: { employeeId: session.id, courseId: course.id },
  });

  const isCourseFullyCompleted = Boolean(passedAttempt);

  // 6. Calculate counts across assigned modules
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;

  let commonLessonsCount = 0;
  let commonCompletedCount = 0;

  let deptLessonsCount = 0;
  let deptCompletedCount = 0;

  filteredModules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      totalLessonsCount++;
      const isDone = Boolean(progressMap.get(les.id)?.isCompleted);
      if (isDone) completedLessonsCount++;

      if (mod.moduleType === 'COMMON') {
        commonLessonsCount++;
        if (isDone) commonCompletedCount++;
      } else {
        deptLessonsCount++;
        if (isDone) deptCompletedCount++;
      }
    });
  });

  const overallProgressPercentage = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;

  const commonProgressPercentage = commonLessonsCount > 0
    ? Math.round((commonCompletedCount / commonLessonsCount) * 100)
    : 0;

  const deptProgressPercentage = deptLessonsCount > 0
    ? Math.round((deptCompletedCount / deptLessonsCount) * 100)
    : 0;

  const allCommonCompleted = commonCompletedCount === commonLessonsCount && commonLessonsCount > 0;

  const isMasterTester = Boolean(employee.isMasterTester || session.identifier === 'EMP7777');

  // 7. Evaluate sequential lock status for modules & lessons
  // RULE: If isMasterTester === true, bypass ALL restrictions and unlock everything!
  let previousModuleCompleted = true; // First common module is unlocked

  const processedModules = filteredModules.map((mod, modIdx) => {
    let previousLessonCompleted = true; // First lesson in module is unlocked if module unlocked

    let isModuleUnlocked = false;
    if (isMasterTester || isCourseFullyCompleted) {
      isModuleUnlocked = true;
    } else if (mod.moduleType === 'COMMON') {
      isModuleUnlocked = previousModuleCompleted;
    } else if (mod.moduleType === 'DEPARTMENT') {
      isModuleUnlocked = allCommonCompleted && previousModuleCompleted;
    }

    let moduleAllLessonsCompleted = isMasterTester ? true : true;

    const processedLessons = mod.lessons.map((les) => {
      const p = progressMap.get(les.id);
      const isCompleted = isMasterTester ? true : (p?.isCompleted ?? false);

      if (!isCompleted && !isMasterTester) {
        moduleAllLessonsCompleted = false;
      }

      const isLessonUnlocked = isMasterTester || isCourseFullyCompleted || (isModuleUnlocked && previousLessonCompleted);

      previousLessonCompleted = isCompleted;

      return {
        ...les,
        isCompleted,
        isUnlocked: isLessonUnlocked,
        watchedSeconds: p?.watchedSeconds ?? (isMasterTester ? 100 : 0),
        totalSeconds: p?.totalSeconds ?? (isMasterTester ? 100 : 0),
      };
    });

    previousModuleCompleted = moduleAllLessonsCompleted;

    return {
      ...mod,
      isUnlocked: isModuleUnlocked,
      isCompleted: isMasterTester ? true : moduleAllLessonsCompleted,
      lessons: processedLessons,
    };
  });

  const allLessonsCompleted = isMasterTester ? true : (completedLessonsCount === totalLessonsCount && totalLessonsCount > 0);
  const isAssessmentUnlocked = isMasterTester || isCourseFullyCompleted || (allCommonCompleted && allLessonsCompleted);

  const commonModules = processedModules.filter((m) => m.moduleType === 'COMMON');
  const departmentModules = processedModules.filter((m) => m.moduleType === 'DEPARTMENT');

  return {
    employee,
    isMasterTester,
    course: {
      ...course,
      modules: processedModules,
    },
    commonModules,
    departmentModules,
    totalLessonsCount,
    completedLessonsCount: isMasterTester ? totalLessonsCount : completedLessonsCount,
    commonLessonsCount,
    commonCompletedCount: isMasterTester ? commonLessonsCount : commonCompletedCount,
    commonProgressPercentage: isMasterTester ? 100 : commonProgressPercentage,
    deptLessonsCount,
    deptCompletedCount: isMasterTester ? deptLessonsCount : deptCompletedCount,
    deptProgressPercentage: isMasterTester ? 100 : deptProgressPercentage,
    overallProgressPercentage: isMasterTester ? 100 : overallProgressPercentage,
    allCommonCompleted: isMasterTester ? true : allCommonCompleted,
    allLessonsCompleted: isMasterTester ? true : allLessonsCompleted,
    isAssessmentUnlocked,
    isCourseFullyCompleted,
    passedAttempt,
    certificate,
  };
}

export async function updateLessonProgress(data: {
  lessonId: string;
  watchedSeconds: number;
  totalSeconds: number;
  watchedIntervalsJSON?: string;
  markCompletedManualPDF?: boolean;
}) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return { success: false, error: 'Unauthorized' };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: data.lessonId },
  });

  if (!lesson) {
    return { success: false, error: 'Lesson not found' };
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: {
      employeeId_lessonId: {
        employeeId: session.id,
        lessonId: data.lessonId,
      },
    },
  });

  let isCompleted = existing?.isCompleted ?? false;
  let newWatchedSeconds = Math.max(existing?.watchedSeconds ?? 0, data.watchedSeconds);
  const totalSecs = data.totalSeconds > 0 ? data.totalSeconds : (existing?.totalSeconds ?? 1);

  // Server Anti-Skip Validation
  if (lesson.contentType === 'PDF') {
    // PDF completed when requested
    if (data.markCompletedManualPDF || data.watchedSeconds >= 10) {
      isCompleted = true;
    }
  } else {
    // Video or Video+PDF
    // Server checks if watched percentage >= 95% OR watchedSeconds >= minDuration
    const watchedRatio = newWatchedSeconds / totalSecs;
    if (watchedRatio >= 0.95 || (lesson.minDurationSeconds > 0 && newWatchedSeconds >= lesson.minDurationSeconds)) {
      isCompleted = true;
    }
  }

  const completedAt = isCompleted ? (existing?.completedAt ?? new Date()) : null;

  await prisma.lessonProgress.upsert({
    where: {
      employeeId_lessonId: {
        employeeId: session.id,
        lessonId: data.lessonId,
      },
    },
    update: {
      watchedSeconds: newWatchedSeconds,
      totalSeconds: totalSecs,
      watchedIntervalsJSON: data.watchedIntervalsJSON || existing?.watchedIntervalsJSON || '[]',
      isCompleted,
      completedAt,
    },
    create: {
      employeeId: session.id,
      lessonId: data.lessonId,
      watchedSeconds: newWatchedSeconds,
      totalSeconds: totalSecs,
      watchedIntervalsJSON: data.watchedIntervalsJSON || '[]',
      isCompleted,
      completedAt,
    },
  });

  // Log activity if newly completed
  if (isCompleted && !existing?.isCompleted) {
    await prisma.activityLog.create({
      data: {
        userId: session.identifier,
        employeeId: session.id,
        role: 'EMPLOYEE',
        action: 'LESSON_COMPLETED',
        details: `Completed lesson: ${lesson.title}`,
      },
    });
  }

  revalidatePath('/employee/learn');
  revalidatePath('/employee/dashboard');

  return { success: true, isCompleted };
}
