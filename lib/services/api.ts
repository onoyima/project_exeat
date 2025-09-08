import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

// Use proxy URL for development, direct URL for production
const API_BASE_URL = 'https://attendance.veritas.edu.ng/api';

// Get token from Redux state
const getAuthToken = (getState: () => RootState) => {
    const state = getState();
    return state.auth.token;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Get token from Redux state
            const token = getAuthToken(getState as () => RootState);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            headers.set('Content-Type', 'application/json');
            headers.set('Accept', 'application/json');
            return headers;
        },
        // credentials: 'include',
    }),
    tagTypes: ['Profile', 'ExeatCategories', 'ExeatRequests', 'ExeatRoles', 'Staff', 'ExeatRequests', 'DashboardStats', 'Admin'],
    endpoints: () => ({}),
});