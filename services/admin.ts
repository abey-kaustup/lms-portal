import { apiFetch, ApiResponse } from './api';

export async function fetchDashboardStatsService(token?: string): Promise<ApiResponse> {
  return apiFetch('/reports/dashboard', { token });
}

export async function fetchDetailedReportService(departmentFilter?: string, token?: string): Promise<ApiResponse> {
  const endpoint = departmentFilter && departmentFilter !== 'ALL'
    ? `/reports/detailed?departmentFilter=${encodeURIComponent(departmentFilter)}`
    : '/reports/detailed';
  return apiFetch(endpoint, { token });
}

export async function fetchDepartmentsService(token?: string): Promise<ApiResponse> {
  return apiFetch('/departments', { token });
}

export async function saveDepartmentService(data: { id?: number; departmentName: string; departmentCode?: string; description?: string }, token?: string): Promise<ApiResponse> {
  return apiFetch('/departments', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteDepartmentService(id: number | string, token?: string): Promise<ApiResponse> {
  return apiFetch(`/departments/${id}`, {
    method: 'DELETE',
    token,
  });
}
