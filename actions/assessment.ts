'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { issueCertificate } from '@/actions/certificate';

export async function getAssessmentQuestions(courseId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const rawQuestions = await prisma.assessmentQuestion.findMany({
    where: { courseId, isDeleted: false },
    orderBy: { sortOrder: 'asc' },
    include: {
      module: {
        include: { department: true },
      },
    },
  });

  // HR gets all questions for course architecture management
  if (session.role === 'HR_ADMIN') {
    return rawQuestions.map((q) => ({
      id: q.id,
      moduleId: q.moduleId,
      moduleTitle: q.module?.title,
      moduleType: q.module?.moduleType || 'COMMON',
      departmentName: q.module?.department?.name || 'Common',
      questionText: q.questionText,
      options: JSON.parse(q.optionsJSON) as string[],
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      points: q.points,
      sortOrder: q.sortOrder,
    }));
  }

  // Employee: Filter questions by employee's assigned department
  const employee = await prisma.employee.findUnique({
    where: { id: session.id },
    include: { departmentRel: true },
  });

  const empDeptId = employee?.departmentId;
  const empDeptName = employee?.department;

  const filteredQuestions = rawQuestions.filter((q) => {
    // If not linked to a module or module is COMMON -> include
    if (!q.module || q.module.moduleType === 'COMMON') return true;

    // If module is DEPARTMENT -> only include if matching employee department
    if (q.module.moduleType === 'DEPARTMENT') {
      if (empDeptId && q.module.departmentId === empDeptId) return true;
      if (q.module.department?.name && empDeptName && q.module.department.name.toLowerCase() === empDeptName.toLowerCase()) return true;
      if (q.module.department?.code && empDeptName && q.module.department.code.toLowerCase() === empDeptName.toLowerCase()) return true;
      return false;
    }

    return false;
  });

  return filteredQuestions.map((q) => ({
    id: q.id,
    moduleId: q.moduleId,
    questionText: q.questionText,
    options: JSON.parse(q.optionsJSON) as string[],
    points: q.points,
    sortOrder: q.sortOrder,
  }));
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
    const optionsJSON = JSON.stringify(data.options);
    const moduleId = data.moduleId || null;

    if (data.id) {
      await prisma.assessmentQuestion.update({
        where: { id: data.id },
        data: {
          questionText: data.questionText.trim(),
          moduleId,
          optionsJSON,
          correctOptionIndex: data.correctOptionIndex,
          explanation: data.explanation?.trim() || null,
          points: data.points ?? 1.0,
        },
      });
    } else {
      const count = await prisma.assessmentQuestion.count({ where: { courseId: data.courseId } });
      await prisma.assessmentQuestion.create({
        data: {
          courseId: data.courseId,
          moduleId,
          questionText: data.questionText.trim(),
          optionsJSON,
          correctOptionIndex: data.correctOptionIndex,
          explanation: data.explanation?.trim() || null,
          points: data.points ?? 1.0,
          sortOrder: count + 1,
        },
      });
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
    await prisma.assessmentQuestion.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath('/hr/course');
    revalidatePath('/employee/assessment');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Failed to delete question.' };
  }
}

export async function submitAssessment(data: {
  courseId: string;
  answers: Record<string, number>; // { [questionId]: selectedIndex }
  timeTakenSeconds: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return { success: false, error: 'Unauthorized' };
  }

  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
  });

  if (!course) {
    return { success: false, error: 'Course not found' };
  }

  // Get questions filtered for employee department
  const questions = await getAssessmentQuestions(data.courseId);

  if (questions.length === 0) {
    return { success: false, error: 'No assessment questions configured for your department.' };
  }

  // Verify all questions belong to DB
  const dbQuestions = await prisma.assessmentQuestion.findMany({
    where: {
      id: { in: questions.map((q) => q.id) },
      isDeleted: false,
    },
  });

  let totalPoints = 0;
  let earnedPoints = 0;
  let correctAnswersCount = 0;

  dbQuestions.forEach((q) => {
    totalPoints += q.points;
    const selectedIdx = data.answers[q.id];
    if (selectedIdx === q.correctOptionIndex) {
      earnedPoints += q.points;
      correctAnswersCount++;
    }
  });

  const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100 * 10) / 10 : 0;
  const passed = scorePercentage >= course.passingScore;

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      employeeId: session.id,
      courseId: data.courseId,
      score: scorePercentage,
      passed,
      totalQuestions: dbQuestions.length,
      correctAnswers: correctAnswersCount,
      timeTakenSeconds: data.timeTakenSeconds,
      answersJSON: JSON.stringify(data.answers),
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: session.identifier,
      employeeId: session.id,
      role: 'EMPLOYEE',
      action: 'ASSESSMENT_SUBMITTED',
      details: `Submitted department assessment: Score ${scorePercentage}% (${passed ? 'PASSED' : 'FAILED'})`,
    },
  });

  // If passed, issue certificate automatically
  let certificate = null;
  if (passed) {
    certificate = await issueCertificate(session.id, data.courseId);
  }

  revalidatePath('/employee/dashboard');
  revalidatePath('/employee/learn');
  revalidatePath('/employee/assessment');
  revalidatePath('/employee/certificate');

  return {
    success: true,
    attempt,
    scorePercentage,
    passed,
    passingScore: course.passingScore,
    correctAnswersCount,
    totalQuestions: dbQuestions.length,
    certificate,
  };
}
