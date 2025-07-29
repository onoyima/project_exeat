const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = 'http://attendance.veritas.edu.ng/api';

//
// ✅ Types
//
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface StudentProfile {
  matric_no: string;
  parent_surname: string;
  parent_othernames: string;
  parent_phone_no: string;
  parent_phone_no_two: string;
  parent_email: string;
  student_accommodation: string;
}

export interface ExeatCategory {
  id: number;
  name: string;
}

//
// ✅ Core API Call Function
//
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Request failed',
        status: response.status,
      };
    }

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

//
// 🔐 Authentication-related
//
export async function getProfile() {
  return apiCall('/me');
}

export async function logout() {
  const result = await apiCall('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'omit',
  });

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoles');

  return result;
}

//
// 👤 Student APIs
//
export async function fetchStudentProfile() {
  return apiCall<{ profile: StudentProfile }>('/student/profile');
}

export async function fetchStudentCategories() {
  return apiCall<{ categories: ExeatCategory[] }>('/student/exeat-categories');
}

export async function createStudentExeatRequest(form: {
  category_id: number;
  preferred_mode_of_contact: string;
  reason: string;
  destination: string;
  departure_date: string;
  return_date: string;
}) {
  return apiCall('/student/exeat-requests', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

//
// 👨‍🏫 Admin APIs
//
export async function getExeatRoles() {
  return apiCall('/admin/roles');
}

export async function getStaffList() {
  return apiCall('/admin/staff');
}

export async function assignExeatRoleToStaff(
  staffId: number,
  exeatRoleId: number
) {
  return apiCall(`/admin/staff/${staffId}/assign-exeat-role`, {
    method: 'POST',
    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
  });
}

export async function unassignExeatRoleFromStaff(
  staffId: number,
  exeatRoleId: number
) {
  return apiCall(`/admin/staff/${staffId}/unassign-exeat-role`, {
    method: 'DELETE',
    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
  });
}

export async function getExeatRoleAssignments() {
  return apiCall('/admin/staff/assignments');
}
