import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

// Get token from Redux state
const getAuthToken = (getState: () => RootState) => {
    const state = getState();
    return state.auth.token;
};

// Types
export interface AdminStaffAssignment {
    staff_id?: number;
    staff_name: string;
    staff_email: string;
    role_name: string;
    role_display_name: string;
    assigned_at: string;
    exeat_role_id?: number;
}

export interface AdminRole {
    id: number;
    name: string;
    display_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface AssignRoleRequest {
    staff_id: number;
    exeat_role_id: number;
}

export interface AssignRoleResponse {
    id: number;
    staff_id: number;
    exeat_role_id: number;
    assigned_at: string;
}

export interface StaffMember {
    id: number;
    fname: string;
    lname: string;
    middle_name?: string;
    email: string;
    title?: string;
    status?: number;
}

export interface UnassignRoleRequest {
    exeat_role_id: number;
}

// API
export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/admin',
        prepareHeaders: (headers, { getState }) => {
            // Get token from Redux state
            const token = getAuthToken(getState as () => RootState);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            headers.set('Content-Type', 'application/json');
            headers.set('Accept', 'application/json');
            // headers.set('X-Requested-With', 'XMLHttpRequest');
            return headers;
        },
        // credentials: 'include',
    }),
    tagTypes: ['StaffAssignments', 'Roles', 'Staff'],
    endpoints: (builder) => ({
        // Staff Management
        getStaffAssignments: builder.query<AdminStaffAssignment[], void>({
            query: () => '/staff/assignments',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.history && Array.isArray(response.history)) {
                    console.log('getStaffAssignments: Found history array directly in response');
                    return response.history;
                }
                if (response?.data?.history && Array.isArray(response.data.history)) {
                    console.log('getStaffAssignments: Found history array in response.data.history');
                    return response.data.history;
                }
                if (response?.data && Array.isArray(response.data)) {
                    console.log('getStaffAssignments: Found array in response.data');
                    return response.data;
                }
                if (Array.isArray(response)) {
                    console.log('getStaffAssignments: Response is array');
                    return response;
                }
                // If none of the above, return empty array to prevent errors
                console.warn('Unexpected response structure for getStaffAssignments:', response);
                return [];
            },
            providesTags: ['StaffAssignments'],
        }),

        assignExeatRole: builder.mutation<AssignRoleResponse, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => ({
                url: `/staff/${staffId}/assign-exeat-role`,
                method: 'POST',
                body: { exeat_role_id: exeatRoleId },
            }),
            transformResponse: (response: { success: boolean; data: AssignRoleResponse }) => response.data,
            invalidatesTags: ['StaffAssignments'],
        }),

        unassignExeatRole: builder.mutation<{ success: boolean; message: string }, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => {
                console.log('Unassign API call:', { staffId, exeatRoleId, url: `/admin/staff/${staffId}/unassign-exeat-role` });
                console.log('Request body:', JSON.stringify({ exeat_role_id: exeatRoleId }));
                return {
                    url: `/staff/${staffId}/unassign-exeat-role`,
                    method: 'DELETE',
                    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
            },
            transformResponse: (response: any) => {
                console.log('Unassign role raw response:', response);

                // Handle different possible response structures
                if (response?.success !== undefined) {
                    return response;
                }
                if (response?.data?.success !== undefined) {
                    return response.data;
                }
                if (response?.message) {
                    return { success: true, message: response.message };
                }
                if (response?.data?.message) {
                    return { success: true, message: response.data.message };
                }

                // If response is just a string, treat it as success message
                if (typeof response === 'string') {
                    return { success: true, message: response };
                }

                // If no explicit success field but no error either, assume success
                return { success: true, message: 'Role unassigned successfully' };
            },
            transformErrorResponse: (error: any) => {
                console.error('Unassign role error response:', error);
                return error;
            },
            invalidatesTags: ['StaffAssignments'],
        }),

        // Role Management
        getRoles: builder.query<AdminRole[], void>({
            query: () => '/roles',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.roles && Array.isArray(response.roles)) {
                    console.log('getRoles: Found roles array directly in response');
                    return response.roles;
                }
                if (response?.data?.roles && Array.isArray(response.data.roles)) {
                    console.log('getRoles: Found roles array in response.data.roles');
                    return response.data.roles;
                }
                if (response?.data && Array.isArray(response.data)) {
                    console.log('getRoles: Found array in response.data');
                    return response.data;
                }
                if (Array.isArray(response)) {
                    console.log('getRoles: Response is array');
                    return response;
                }
                // If none of the above, return empty array to prevent errors
                console.warn('Unexpected response structure for getRoles:', response);
                return [];
            },
            providesTags: ['Roles'],
        }),

        getStaffList: builder.query<StaffMember[], void>({
            query: () => '/staff',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.staff && Array.isArray(response.staff)) {
                    console.log('getStaffList: Found staff array directly in response');
                    return response.staff;
                }
                if (response?.data?.staff && Array.isArray(response.data.staff)) {
                    console.log('getStaffList: Found staff array in response.data.staff');
                    return response.data.staff;
                }
                if (response?.data && Array.isArray(response.data)) {
                    console.log('getStaffList: Found array in response.data');
                    return response.data;
                }
                if (Array.isArray(response)) {
                    console.log('getStaffList: Response is array');
                    return response;
                }
                // If none of the above, return empty array to prevent errors
                console.warn('Unexpected response structure for getStaffList:', response);
                return [];
            },
            providesTags: ['Staff'],
        }),

        createRoleAssignment: builder.mutation<AssignRoleResponse, AssignRoleRequest>({
            query: (body) => ({
                url: '/roles',
                method: 'POST',
                body,
            }),
            transformResponse: (response: { success: boolean; data: AssignRoleResponse }) => response.data,
            invalidatesTags: ['StaffAssignments', 'Roles'],
        }),
    }),
});

// Export hooks
export const {
    useGetStaffAssignmentsQuery,
    useAssignExeatRoleMutation,
    useUnassignExeatRoleMutation,
    useGetRolesQuery,
    useGetStaffListQuery,
    useCreateRoleAssignmentMutation,
} = adminApi; 