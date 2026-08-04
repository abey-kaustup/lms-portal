import { apiFetch, ApiResponse } from './api';

export interface EmployeeQuery {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchEmployeesService(query: EmployeeQuery, token?: string): Promise<ApiResponse> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.department && query.department !== 'ALL') params.set('departmentId', query.department);
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  params.set('page', String(query.page || 1));
  params.set('pageSize', String(query.pageSize || 10));

  return apiFetch(`/employees?${params.toString()}`, { token });
}

export async function fetchEmployeeByIdService(id: string, token?: string): Promise<ApiResponse> {
  return apiFetch(`/employees/${id}`, { token });
}

export async function saveEmployeeService(employeeData: any, token?: string): Promise<ApiResponse> {
  return apiFetch('/employees', {
    method: 'POST',
    token,
    body: JSON.stringify(employeeData),
  });
}

export async function deleteEmployeeService(id: string, token?: string): Promise<ApiResponse> {
  return apiFetch(`/employees/${id}`, {
    method: 'DELETE',
    token,
  });
}
