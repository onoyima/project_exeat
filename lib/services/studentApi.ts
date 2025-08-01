import { api } from './api';
import type { ApiResponse } from '@/types/api';
import type { StudentProfile, ExeatCategory, ExeatRequestForm, ExeatRequest } from '@/types/student';

export const studentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStudentProfile: builder.query<StudentProfile, void>({
            query: () => '/student/profile',
            transformResponse: (response: ApiResponse<{ profile: StudentProfile }>) => response.data!.profile,
            providesTags: ['Profile'],
        }),

        getExeatCategories: builder.query<ExeatCategory[], void>({
            query: () => '/student/exeat-categories',
            transformResponse: (response: ApiResponse<{ categories: ExeatCategory[] }>) => response.data!.categories,
            providesTags: ['ExeatCategories'],
        }),

        createExeatRequest: builder.mutation<ApiResponse<ExeatRequest>, ExeatRequestForm>({
            query: (form) => ({
                url: '/student/exeat-requests',
                method: 'POST',
                body: form,
            }),
            invalidatesTags: ['ExeatRequests'],
        }),

        getExeatRequests: builder.query<ExeatRequest[], void>({
            query: () => '/student/exeat-requests',
            transformResponse: (response: ApiResponse<{ requests: ExeatRequest[] }>) => response.data!.requests,
            providesTags: ['ExeatRequests'],
        }),
    }),
});

export const {
    useGetStudentProfileQuery,
    useGetExeatCategoriesQuery,
    useCreateExeatRequestMutation,
    useGetExeatRequestsQuery,
} = studentApi; 