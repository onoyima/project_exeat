import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

// Get token from Redux state
const getAuthToken = (getState: () => RootState) => {
    const state = getState();
    return state.auth.token;
};

// Types
export interface AdminStaffAssignment {
    staff_id: number;
    staff_name: string;
    staff_email: string;
    role_name: string;
    role_display_name: string;
    assigned_at: string;
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
            headers.set('X-Requested-With', 'XMLHttpRequest');
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['StaffAssignments', 'Roles'],
    endpoints: (builder) => ({
        // Staff Management
        getStaffAssignments: builder.query<AdminStaffAssignment[], void>({
            query: () => '/staff/assignments',
            transformResponse: (response: { success: boolean; data: AdminStaffAssignment[] }) => response.data,
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
            query: ({ staffId, exeatRoleId }) => ({
                url: `/staff/${staffId}/unassign-exeat-role`,
                method: 'DELETE',
                body: { exeat_role_id: exeatRoleId },
            }),
            invalidatesTags: ['StaffAssignments'],
        }),

        // Role Management
        getRoles: builder.query<AdminRole[], void>({
            query: () => '/roles',
            transformResponse: (response: { success: boolean; data: AdminRole[] }) => response.data,
            providesTags: ['Roles'],
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
    useCreateRoleAssignmentMutation,
} = adminApi; 