import { api } from './api';
import type { AuthCredentials, AuthResponse } from '@/types/auth';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, AuthCredentials>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        refreshToken: builder.query<AuthResponse, void>({
            query: () => '/refresh-token',
        }),
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRefreshTokenQuery,
    useLogoutMutation,
} = authApi;