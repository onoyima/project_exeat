const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  // Always use 'include' for credentials to send cookies
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  // Fetch CSRF cookie before protected requests (POST, PUT, DELETE)
//   if (['POST', 'PUT', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
//     await fetch('http://localhost:8000/sanctum/csrf-cookie', { credentials: 'include' });
//   }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function getProfile() {
  return apiCall('/me');
}

export async function logout() {
  const result = await apiCall('/logout', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'omit'
  });
  
  // Always clear local storage regardless of API response
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoles');
  
  return result;
}

export async function getExeatRoles() {
  return apiCall('/admin/roles');
}

export async function assignExeatRoleToStaff(staffId: number, exeatRoleId: number) {
  return apiCall(`/admin/staff/${staffId}/assign-exeat-role`, {
    method: 'POST',
    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
  });
}

export async function unassignExeatRoleFromStaff(staffId: number, exeatRoleId: number) {
  return apiCall(`/admin/staff/${staffId}/unassign-exeat-role`, {
    method: 'DELETE',
    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
  });
}

export async function getStaffList() {
  return apiCall('/admin/staff');
}

export async function getExeatRoleAssignments() {
  return apiCall('/admin/staff/assignments');
}