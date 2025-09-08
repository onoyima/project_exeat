
import { api } from './api';
import type { AdminDashboardResponse, AuditTrailResponse, AdminStaffAssignment, AssignRoleResponse, AdminRole, StaffMember, AssignRoleRequest } from '@/types/staff';

// API
export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Staff Management
        getStaffAssignments: builder.query<AdminStaffAssignment[], void>({
            query: () => '/admin/staff/assignments',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.history && Array.isArray(response.history)) {
                    return response.history;
                }
                if (response?.data?.history && Array.isArray(response.data.history)) {
                    return response.data.history;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                // If none of the above, return empty array to prevent errors
                console.warn('Unexpected response structure for getStaffAssignments:', response);
                return [];
            },
            providesTags: ['Staff'],
        }),

        assignExeatRole: builder.mutation<AssignRoleResponse, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => ({
                url: `/admin/staff/${staffId}/assign-exeat-role`,
                method: 'POST',
                body: { exeat_role_id: exeatRoleId },
            }),
            transformResponse: (response: { success: boolean; data: AssignRoleResponse }) => response.data,
            invalidatesTags: ['Staff'],
        }),

        unassignExeatRole: builder.mutation<{ success: boolean; message: string }, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => {
                return {
                    url: `/admin/staff/${staffId}/unassign-exeat-role`,
                    method: 'DELETE',
                    body: JSON.stringify({ exeat_role_id: exeatRoleId }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
            },
            transformResponse: (response: any) => {

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
            invalidatesTags: ['Staff'],
        }),

        // Role Management
        getRoles: builder.query<AdminRole[], void>({
            query: () => '/admin/roles',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.roles && Array.isArray(response.roles)) {
                    return response.roles;
                }
                if (response?.data?.roles && Array.isArray(response.data.roles)) {
                    return response.data.roles;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                if (Array.isArray(response)) {
                    return response;
                }
                // If none of the above, return empty array to prevent errors
                console.warn('Unexpected response structure for getRoles:', response);
                return [];
            },
            providesTags: ['ExeatRoles'],
        }),

        getStaffList: builder.query<StaffMember[], void>({
            query: () => '/admin/staff',
            transformResponse: (response: any) => {
                // Handle different possible response structures
                if (response?.staff && Array.isArray(response.staff)) {
                    return response.staff;
                }
                if (response?.data?.staff && Array.isArray(response.data.staff)) {
                    return response.data.staff;
                }
                if (response?.data && Array.isArray(response.data)) {
                    return response.data;
                }
                if (Array.isArray(response)) {
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
                url: '/admin/roles',
                method: 'POST',
                body,
            }),
            transformResponse: (response: { success: boolean; data: AssignRoleResponse }) => response.data,
            invalidatesTags: ['Staff', 'ExeatRoles'],
        }),

        getAdminDashboardStats: builder.query<AdminDashboardResponse['data'], void>({
            query: () => '/dashboard/admin',
            transformResponse: (response: AdminDashboardResponse) => response.data,
            providesTags: ['DashboardStats'],
        }),

        getAdminAuditTrail: builder.query<AuditTrailResponse, void>({
            query: () => '/dashboard/dean',
            transformResponse: (response: AuditTrailResponse) => response,
            providesTags: ['Admin'],
        }),
    }),
});

export const {
    useGetStaffAssignmentsQuery,
    useAssignExeatRoleMutation,
    useUnassignExeatRoleMutation,
    useGetRolesQuery,
    useGetStaffListQuery,
    useCreateRoleAssignmentMutation,
    useGetAdminDashboardStatsQuery,
    useGetAdminAuditTrailQuery,
} = adminApi; 