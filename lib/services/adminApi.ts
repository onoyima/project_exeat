import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type { Staff, ExeatRole, ExeatRoleAssignment, HostelAdminAssignment } from '@/types/staff';

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getExeatRoles: builder.query<ExeatRole[], void>({
            query: () => '/admin/roles',
            transformResponse: (response: ApiResponse<ExeatRole[]>) => response.data!,
            providesTags: ['ExeatRoles'],
        }),

        getStaffList: builder.query<Staff[], void>({
            query: () => '/admin/staff',
            transformResponse: (response: ApiResponse<Staff[]>) => response.data!,
            providesTags: ['Staff'],
        }),

        assignExeatRole: builder.mutation<ApiResponse<ExeatRoleAssignment>, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => ({
                url: `/admin/staff/${staffId}/assign-exeat-role`,
                method: 'POST',
                body: { exeat_role_id: exeatRoleId },
            }),
            invalidatesTags: ['Staff', 'ExeatRoles'],
        }),

        unassignExeatRole: builder.mutation<ApiResponse<void>, { staffId: number; exeatRoleId: number }>({
            query: ({ staffId, exeatRoleId }) => ({
                url: `/admin/staff/${staffId}/unassign-exeat-role`,
                method: 'DELETE',
                body: { exeat_role_id: exeatRoleId },
            }),
            invalidatesTags: ['Staff', 'ExeatRoles'],
        }),

        getExeatRoleAssignments: builder.query<ExeatRoleAssignment[], void>({
            query: () => '/admin/staff/assignments',
            transformResponse: (response: ApiResponse<ExeatRoleAssignment[]>) => response.data!,
            providesTags: ['Staff', 'ExeatRoles'],
        }),

        getHostelAdminAssignments: builder.query<HostelAdminAssignment[], void>({
            query: () => '/admin/hostel-assignments',
            transformResponse: (response: ApiResponse<HostelAdminAssignment[]>) => response.data!,
            providesTags: ['Staff'],
        }),
    }),
});

export const {
    useGetExeatRolesQuery,
    useGetStaffListQuery,
    useAssignExeatRoleMutation,
    useUnassignExeatRoleMutation,
    useGetExeatRoleAssignmentsQuery,
    useGetHostelAdminAssignmentsQuery,
} = adminApi; 