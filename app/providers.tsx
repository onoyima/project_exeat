'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { useEffect } from 'react';
import { initializeCsrfToken } from '@/lib/utils/csrf';

function CsrfInitializer() {
    useEffect(() => {
        // Initialize CSRF token on app startup
        initializeCsrfToken();
    }, []);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <CsrfInitializer />
            {children}
        </Provider>
    );
}