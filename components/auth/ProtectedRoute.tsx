'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/lib/services/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (requiredRole && user?.role !== requiredRole) {
            router.push(user?.role === 'student' ? '/student/dashboard' : '/staff/dashboard');
        }
    }, [isAuthenticated, user, requiredRole, router]);

    // Show nothing while checking auth
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
}