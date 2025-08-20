import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type {
    Staff,
    ExeatRole,
    ExeatRoleAssignment,
    StaffProfile,
    StaffApprovalAction,
    StudentSignAction,
    ExeatStatistics
} from '@/types/staff';
import type { ExeatRequest } from '@/types/student';

// Exeat request for staff approval
export interface StaffExeatRequest {
    id: number;
    student_id: number;
    matric_no: string;
    category_id: number;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    preferred_mode_of_contact: string;
    parent_surname: string;
    parent_othernames: string;
    parent_phone_no: string;
    parent_phone_no_two: string;
    parent_email: string;
    student_accommodation: string | null;
    status: string;
    is_medical: number;
    created_at: string;
    updated_at: string;
    student: {
        id: number;
        fname: string;
        lname: string;
        passport: string;
    };
}

export const staffApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get staff profile with roles
        getStaffProfile: builder.query<StaffProfile, void>({
            query: () => '/me',
            transformResponse: (response: { user: StaffProfile; contacts: any[]; exeat_roles: any[]; role: string; roles: string[]; token: string; message: string }) => {
                return response.user;
            },
            providesTags: ['Profile'],
        }),

        // Get all exeat requests (role-based filtering handled by backend)
        getAllExeatRequests: builder.query<StaffExeatRequest[], void>({
            query: () => '/staff/exeat-requests',
            transformResponse: (response: { exeat_requests: StaffExeatRequest[] }) => response.exeat_requests,
            providesTags: ['ExeatRequests'],
        }),

        // Get exeat requests by status
        getExeatRequestsByStatus: builder.query<StaffExeatRequest[], string>({
            query: (status) => `/staff/exeat-requests?status=${status}`,
            transformResponse: (response: { exeat_requests: StaffExeatRequest[] }) => response.exeat_requests,
            providesTags: ['ExeatRequests'],
        }),

        // Get a single exeat request by ID
        getExeatRequestById: builder.query<StaffExeatRequest, number>({
            query: (id) => `/staff/exeat-requests/${id}`,
            transformResponse: (response: { exeat_request: StaffExeatRequest }) => response.exeat_request,
            providesTags: (result, error, id) => [{ type: 'ExeatRequests', id }],
        }),

        // Approve an exeat request
        approveExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/approve`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Reject an exeat request
        rejectExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/reject`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Sign student out (for hostel admins)
        signStudentOut: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/sign-out`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Sign student in (for hostel admins)
        signStudentIn: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment?: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/sign-in`,
                method: 'POST',
                body: { comment },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        // Get exeat statistics for dashboard
        getExeatStatistics: builder.query<ExeatStatistics, void>({
            query: () => '/staff/exeat-statistics',
            transformResponse: (response: ApiResponse<ExeatStatistics>) => response.data!,
            providesTags: ['Staff'],
        }),
    }),
});

export const {
    useGetStaffProfileQuery,
    useGetAllExeatRequestsQuery,
    useGetExeatRequestsByStatusQuery,
    useGetExeatRequestByIdQuery,
    useApproveExeatRequestMutation,
    useRejectExeatRequestMutation,
    useSignStudentOutMutation,
    useSignStudentInMutation,
    useGetExeatStatisticsQuery,
} = staffApi;
