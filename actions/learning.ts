'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getEmployeeLearningState() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    throw new Error('Unauthorized');
  }

  // 1. Fetch course with modules and lessons
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
      },
    },
  });

  if (!course) {
    throw new Error('No course available');
  }

  // 2. Fetch employee lesson progress
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

  // 3. Fetch assessment attempts & certificates
  const passedAttempt = await prisma.assessmentAttempt.findFirst({
    where: { employeeId: session.id, courseId: course.id, passed: true },
  });

  const certificate = await prisma.certificate.findFirst({
    where: { employeeId: session.id, courseId: course.id },
  });

  const isCourseFullyCompleted = Boolean(passedAttempt);

  // 4. Calculate total lessons and completed lessons count
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;

  course.modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      totalLessonsCount++;
      if (progressMap.get(les.id)?.isCompleted) {
        completedLessonsCount++;
      }
    });
  });

  const overallProgressPercentage = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;

  // 5. Evaluate sequential lock status for modules & lessons
  let previousModuleCompleted = true; // First module is unlocked

  const processedModules = course.modules.map((mod, modIdx) => {
    let previousLessonCompleted = true; // First lesson in module is unlocked if module unlocked

    const isModuleUnlocked = isCourseFullyCompleted || previousModuleCompleted;

    let moduleAllLessonsCompleted = true;

    const processedLessons = mod.lessons.map((les, lesIdx) => {
      const p = progressMap.get(les.id);
      const isCompleted = p?.isCompleted ?? false;

      if (!isCompleted) {
        moduleAllLessonsCompleted = false;
      }

      // Lesson unlocked if course finished OR (module unlocked AND previous lesson completed)
      const isLessonUnlocked = isCourseFullyCompleted || (isModuleUnlocked && previousLessonCompleted);

      previousLessonCompleted = isCompleted;

      return {
        ...les,
        isCompleted,
        isUnlocked: isLessonUnlocked,
        watchedSeconds: p?.watchedSeconds ?? 0,
        totalSeconds: p?.totalSeconds ?? 0,
      };
    });

    previousModuleCompleted = moduleAllLessonsCompleted;

    return {
      ...mod,
      isUnlocked: isModuleUnlocked,
      isCompleted: moduleAllLessonsCompleted,
      lessons: processedLessons,
    };
  });

  const allLessonsCompleted = completedLessonsCount === totalLessonsCount && totalLessonsCount > 0;
  const isAssessmentUnlocked = isCourseFullyCompleted || allLessonsCompleted;

  return {
    course: {
      ...course,
      modules: processedModules,
    },
    totalLessonsCount,
    completedLessonsCount,
    overallProgressPercentage,
    allLessonsCompleted,
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
