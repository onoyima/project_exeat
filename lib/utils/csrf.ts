/**
 * CSRF Token utilities for Laravel Sanctum
 */

// Helper function to get cookie value
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

// Helper function to safely extract role name from role objects
export const extractRoleName = (role: any): string => {
    if (!role) return 'Unknown Role';

    // Handle different role object structures
    if (typeof role === 'string') return role;
    if (typeof role === 'object') {
        // Handle nested role objects like { role: { name: 'admin' } }
        if (role.role && typeof role.role === 'object' && role.role.name) {
            return role.role.name;
        }
        // Handle direct role objects like { name: 'admin' }
        if (role.name) {
            return role.name;
        }
    }

    return 'Unknown Role';
};

// Function to fetch CSRF token from Laravel
export const fetchCsrfToken = async (baseUrl: string = 'https://attendance.veritas.edu.ng/api'): Promise<string | null> => {
    try {
        const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            // Wait a moment for the cookie to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            return getCookie('XSRF-TOKEN') || getCookie('csrf_token');
        }
    } catch (error) {
        console.warn('Failed to fetch CSRF token:', error);
    }
    return null;
};

// Function to ensure CSRF token is available
export const ensureCsrfToken = async (baseUrl?: string): Promise<string | null> => {
    let csrfToken = getCookie('XSRF-TOKEN') || getCookie('csrf_token');

    if (!csrfToken) {
        csrfToken = await fetchCsrfToken(baseUrl);
    }

    return csrfToken;
};

// Function to get CSRF token for headers
export const getCsrfTokenForHeaders = (): string | null => {
    return getCookie('XSRF-TOKEN') || getCookie('csrf_token');
};

// Function to initialize CSRF token on app startup
export const initializeCsrfToken = async (baseUrl?: string): Promise<void> => {
    try {
        await ensureCsrfToken(baseUrl);
    } catch (error) {
        console.warn('Failed to initialize CSRF token:', error);
    }
};
