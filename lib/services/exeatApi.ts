import { api } from './api';
import type { ExeatCategory, StudentProfile, ExeatRequestForm, ExeatRequest } from '@/types/student';

export const exeatApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getExeatRequests: builder.query<{ exeat_requests: ExeatRequest[] }, void>({
            query: () => '/student/exeat-requests',
            providesTags: ['ExeatRequests'],
        }),
        getCategories: builder.query<{ categories: ExeatCategory[] }, void>({
            query: () => '/student/exeat-categories',
            transformResponse: (response: { categories: ExeatCategory[] }) => response,
        }),

        getStudentProfile: builder.query<{ profile: StudentProfile }, void>({
            query: () => '/student/profile',
            transformResponse: (response: { success: boolean; data: { profile: StudentProfile } }) => {
                if (!response.success || !response.data?.profile) {
                    throw new Error('Failed to load profile data');
                }
                return response.data;
            },
        }),
        createExeatRequest: builder.mutation<{ success: boolean; message: string }, ExeatRequestForm>({
            query: (data) => ({
                url: '/student/exeat-requests',
                method: 'POST',
                body: data,
            }),
            // Invalidate the relevant queries after a successful request
            invalidatesTags: ['ExeatRequests'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetStudentProfileQuery,
    useCreateExeatRequestMutation,
    useGetExeatRequestsQuery,
} = exeatApi;