import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '@/types/auth';
import { authApi } from './authApi';

interface AuthState {
    user: (User & { role: string }) | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Helper to safely access localStorage
const isClient = typeof window !== 'undefined';

const getFromStorage = (key: string) => {
    if (!isClient) return null;
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

// Helper to safely parse stored user data
const getStoredUser = () => {
    const storedUser = getFromStorage('user');
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: getStoredUser(),
    token: getFromStorage('token'),
    isAuthenticated: !!(getFromStorage('token') && getStoredUser()),
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            if (isClient) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        setCredentials: (state, action: PayloadAction<AuthResponse>) => {
            const { user, role, token } = action.payload;
            const userData = { ...user, role };
            state.user = userData;
            state.token = token;
            state.isAuthenticated = true;
            if (isClient) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.login.matchPending,
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                authApi.endpoints.login.matchFulfilled,
                (state, { payload }) => {
                    const user = { ...payload.user, role: payload.role };
                    state.user = user;
                    state.token = payload.token;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    if (isClient) {
                        localStorage.setItem('token', payload.token);
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            )
            .addMatcher(
                authApi.endpoints.login.matchRejected,
                (state) => {
                    state.isLoading = false;
                }
            )
            .addMatcher(
                authApi.endpoints.refreshToken.matchFulfilled,
                (state, { payload }) => {
                    const user = { ...payload.user, role: payload.role };
                    state.user = user;
                    state.token = payload.token;
                    state.isAuthenticated = true;
                    if (isClient) {
                        localStorage.setItem('token', payload.token);
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                }
            );
    },
});

export const { startLoading, stopLoading, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;