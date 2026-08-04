import { apiFetch, ApiResponse } from './api';

export interface LoginEmployeeRequest {
  employeeId: string;
}

export interface LoginHRRequest {
  username: string;
  password?: string;
}

export async function loginEmployeeService(employeeId: string): Promise<ApiResponse> {
  return apiFetch('/auth/login/employee', {
    method: 'POST',
    body: JSON.stringify({ employeeId: employeeId.trim().toUpperCase() }),
  });
}

export async function loginHRService(username: string, password?: string): Promise<ApiResponse> {
  return apiFetch('/auth/login/hr', {
    method: 'POST',
    body: JSON.stringify({ username: username.trim(), password }),
  });
}
