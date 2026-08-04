import { apiFetch, ApiResponse } from './api';

export async function fetchLearningStateService(token?: string): Promise<ApiResponse> {
  return apiFetch('/learning/state', { token });
}

export async function saveProgressService(data: { lessonId: number; isCompleted: boolean; watchedSeconds: number; totalSeconds: number }, token?: string): Promise<ApiResponse> {
  return apiFetch('/learning/progress', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function fetchAssessmentQuestionsService(courseId: number | string, token?: string): Promise<ApiResponse> {
  return apiFetch(`/assessments/questions/${courseId}`, { token });
}

export async function submitAssessmentAttemptService(data: { courseId: number; answers: Record<number, number>; timeTakenSeconds: number }, token?: string): Promise<ApiResponse> {
  return apiFetch('/assessments/submit', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function fetchMyCertificateService(token?: string): Promise<ApiResponse> {
  return apiFetch('/certificates/my-certificate', { token });
}

export async function verifyCertificateService(certificateNumber: string): Promise<ApiResponse> {
  return apiFetch(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
}
