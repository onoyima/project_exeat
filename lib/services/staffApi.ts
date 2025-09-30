import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type {
    Staff,
    ExeatRole,
    ExeatRoleAssignment,
    StaffProfile,
    StaffApprovalAction,
    StudentSignAction,
    ExeatStatistics,
    CompletedExeatRequestsResponse,
    RejectedExeatRequestsResponse,
    StaffDashboardStats
} from '@/types/staff';
import type { ExeatRequest } from '@/types/student';

// Exeat request for staff approval
export interface StaffExeatRequest {
    id: number;
    student_id: number;
    matric_no: string;
    category_id?: number;
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
    is_medical: number | boolean;
    is_expired?: boolean;
    expired_at?: string | null;
    created_at: string;
    updated_at: string;
    student: {
        id: number;
        fname: string;
        lname: string;
        email?: string;
        passport?: string;
        phone?: string;
    };
    category?: {
        id: number;
        name: string;
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
            transformResponse: (response: any) => {
                // Handle permission error response
                if (response?.message && response.message.includes('permission')) {
                    throw new Error(response.message);
                }

                // Handle normal success response
                if (response?.exeat_request) {
                    return response.exeat_request;
                }

                // If response structure is unexpected, throw error
                throw new Error('Invalid response format from server');
            },
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

        getCompletedExeatRequests: builder.query<CompletedExeatRequestsResponse, void>({
            query: () => '/exeats/by-status/completed',
            transformResponse: (response: CompletedExeatRequestsResponse) => response,
            providesTags: ['ExeatRequests'],
        }),
        getCompletedExeatRequestDetails: builder.query<{ exeat_request: StaffExeatRequest }, number>({
            query: (id) => `/exeats/by-status/completed/${id}`,
            transformResponse: (response: { exeat_request: StaffExeatRequest }) => response,
            providesTags: ['ExeatRequests'],
        }),
        getStaffDashboardStats: builder.query<StaffDashboardStats, void>({
            query: () => '/staff/dashboard',
            transformResponse: (response: StaffDashboardStats) => response,
            providesTags: ['DashboardStats'],
        }),
        getRejectedExeatRequests: builder.query<RejectedExeatRequestsResponse, void>({
            query: () => '/exeats/by-status/rejected',
            transformResponse: (response: RejectedExeatRequestsResponse) => response,
            providesTags: ['ExeatRequests'],
        }),
        getRejectedExeatRequestDetails: builder.query<{ exeat_request: StaffExeatRequest }, number>({
            query: (id) => `/exeats/by-status/rejected/${id}`,
            transformResponse: (response: { exeat_request: StaffExeatRequest }) => response,
            providesTags: ['ExeatRequests'],
        }),
        sendComment: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; comment: string }>({
            query: ({ exeat_request_id, comment }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}/send-comment`,
                method: 'POST',
                body: { comment, priority: "high" },
            }),
            invalidatesTags: ['ExeatRequests'],
        }),
        editExeatRequest: builder.mutation<ApiResponse<StaffExeatRequest>, { exeat_request_id: number; payload: Partial<StaffExeatRequest> }>({
            query: ({ exeat_request_id, payload }) => ({
                url: `/staff/exeat-requests/${exeat_request_id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ['ExeatRequests'],
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
    useGetCompletedExeatRequestsQuery,
    useGetCompletedExeatRequestDetailsQuery,
    useGetRejectedExeatRequestsQuery,
    useGetRejectedExeatRequestDetailsQuery,
    useGetStaffDashboardStatsQuery,
    useSendCommentMutation,
    useEditExeatRequestMutation,
} = staffApi;
