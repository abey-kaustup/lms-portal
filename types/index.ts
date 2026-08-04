export type Role = 'HR_ADMIN' | 'EMPLOYEE';

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: {
    employees: number;
    modules: number;
  };
}

export interface UserSession {
  id: string; // Database ID
  identifier: string; // Username for HR or EmployeeID for Employee
  name: string;
  email?: string;
  role: Role;
  department?: string;
  departmentId?: string | null;
  designation?: string;
  isMasterTester?: boolean;
  accessToken?: string; // ASP.NET Core JWT Bearer token
}

export interface EmployeeFormData {
  id?: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  departmentId?: string | null;
  designation: string;
  office: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  isMasterTester?: boolean;
}

export interface ModuleFormData {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  moduleType: 'COMMON' | 'DEPARTMENT';
  departmentId?: string | null;
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
  moduleId?: string | null;
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

