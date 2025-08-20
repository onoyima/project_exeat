import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use proxy URL for development, direct URL for production
const API_BASE_URL = 'https://attendance.veritas.edu.ng/api';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            // Safely access localStorage
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
            }
            headers.set('Content-Type', 'application/json');
            headers.set('Accept', 'application/json');
            headers.set('X-Requested-With', 'XMLHttpRequest');
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['Profile', 'ExeatCategories', 'ExeatRequests', 'ExeatRoles', 'Staff'],
    endpoints: () => ({}),
});