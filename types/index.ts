export type Role = 'HR_ADMIN' | 'EMPLOYEE';

export interface UserSession {
  id: string; // Database ID
  identifier: string; // Username for HR or EmployeeID for Employee
  name: string;
  email?: string;
  role: Role;
  department?: string;
  designation?: string;
}

export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  office: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ModuleFormData {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  sortOrder: number;
}

export interface LessonFormData {
  id?: string;
  moduleId: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'PDF' | 'VIDEO_PDF';
  videoUrl?: string;
  pdfUrl?: string;
  sortOrder: number;
  minDurationSeconds: number;
}

export interface QuestionFormData {
  id?: string;
  courseId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points: number;
  sortOrder: number;
}

export interface AntiCheatLogPayload {
  action: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT';
  details?: string;
}
