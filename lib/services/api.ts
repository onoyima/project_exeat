import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use relative URL for the API base URL to go through Next.js proxy
const API_BASE_URL = 'http://attendance.veritas.edu.ng/api';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
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
    tagTypes: ['Profile', 'ExeatCategories', 'ExeatRequests', 'ExeatRoles', 'Staff'],
    endpoints: () => ({}),
});