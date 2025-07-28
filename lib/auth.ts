import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Check if user is authenticated by validating token
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || !userRole) {
    return false;
  }
  
  // You can add token expiration check here if needed
  // For now, we'll just check if token exists
  return true;
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

/**
 * Redirect user based on their role
 */
export function redirectByRole(router: any) {
  const userRole = getUserRole();
  
  if (userRole === 'student') {
    router.push('/student/dashboard');
  } else if (userRole === 'staff') {
    router.push('/staff/dashboard');
  } else {
    router.push('/login');
  }
}

/**
 * Hook to check authentication and redirect if needed
 */
export function useAuthRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated()) {
      redirectByRole(router);
    }
  }, [router]);
}

/**
 * Hook to protect routes - redirect to login if not authenticated
 */
export function useAuthProtection() {
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);
} 