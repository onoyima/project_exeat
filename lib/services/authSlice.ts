import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '@/types/auth';
import { authApi } from './authApi';

interface AuthState {
    user: (User & { role: string; roles?: string[] }) | null;
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
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        // If the stored user has exeat_roles but no roles, migrate it
        if (parsed && parsed.exeat_roles && !parsed.roles) {
            const roleNames = parsed.exeat_roles.map((role: any) => role.role?.name || role.name);
            parsed.roles = roleNames;
        }
        return parsed;
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
            // Handle both 'roles' and 'exeat_roles' field names
            const exeatRoles = (user as any)?.exeat_roles || (action.payload as any).roles;
            const userData = { ...user, role, roles: exeatRoles };
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
                    // Handle both 'roles' and 'exeat_roles' field names
                    const exeatRoles = (payload.user as any)?.exeat_roles || (payload as any).roles;
                    const user = { ...payload.user, role: payload.role, roles: exeatRoles };
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

    },
});

export const { startLoading, stopLoading, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;