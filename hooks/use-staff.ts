import { useMemo } from 'react';
import {
    useGetStaffProfileQuery,
    useGetAllExeatRequestsQuery,
    useGetExeatRequestsByStatusQuery,
    useApproveExeatRequestMutation,
    useRejectExeatRequestMutation,
    useSignStudentOutMutation,
    useSignStudentInMutation,
    useGetExeatStatisticsQuery,
} from '@/lib/services/staffApi';
import type { StaffProfile } from '@/types/staff';
import { extractRoleName } from '@/lib/utils/csrf';

/**
 * Custom hook for staff functionality with role-based access control
 * Provides role-based permissions and exeat request management
 */
export const useStaff = () => {
    const { data: profile, isLoading: profileLoading, error: profileError } = useGetStaffProfileQuery();
    const { data: statistics, isLoading: statsLoading } = useGetExeatStatisticsQuery();

    // Role-based access control
    const hasRole = useMemo(() => {
        if (!profile?.exeat_roles) return () => false;

        const roles = profile.exeat_roles.map((role: any) => extractRoleName(role));

        return (roleName: string) => roles.includes(roleName);
    }, [profile]);

    // Check if staff has multiple roles
    const hasMultipleRoles = useMemo(() => {
        return profile?.exeat_roles && profile.exeat_roles.length > 1;
    }, [profile]);

    // Get primary role (first role in the list)
    const primaryRole = useMemo(() => {
        return profile?.exeat_roles?.[0]?.role;
    }, [profile]);

    // Get all roles
    const allRoles = useMemo(() => {
        return profile?.exeat_roles?.map((role: any) => role.role) || [];
    }, [profile]);

    // Role-specific permissions
    const canApproveExeat = useMemo(() => {
        return hasRole('dean') || hasRole('secretary');
    }, [hasRole]);

    const canVetMedical = useMemo(() => {
        return hasRole('cmd');
    }, [hasRole]);

    const canSignStudents = useMemo(() => {
        return hasRole('hostel_admin');
    }, [hasRole]);

    const canOverrideApprovals = useMemo(() => {
        return hasRole('dean');
    }, [hasRole]);

    // Get role-specific exeat requests
    const getRoleSpecificRequests = () => {
        if (hasRole('cmd')) {
            return useGetExeatRequestsByStatusQuery('cmd_review');
        }
        if (hasRole('dean') || hasRole('secretary')) {
            return useGetAllExeatRequestsQuery();
        }
        if (hasRole('hostel_admin')) {
            return useGetExeatRequestsByStatusQuery('approved');
        }
        return useGetAllExeatRequestsQuery();
    };

    return {
        // Profile
        profile,
        profileLoading,
        profileError,

        // Statistics
        statistics,
        statsLoading,

        // Role management
        hasRole,
        hasMultipleRoles,
        primaryRole,
        allRoles,

        // Permissions
        canApproveExeat,
        canVetMedical,
        canSignStudents,
        canOverrideApprovals,

        // Role-specific requests
        getRoleSpecificRequests,

        // Mutations
        approveExeatRequest: useApproveExeatRequestMutation(),
        rejectExeatRequest: useRejectExeatRequestMutation(),
        signStudentOut: useSignStudentOutMutation(),
        signStudentIn: useSignStudentInMutation(),
    };
};

/**
 * Hook for getting exeat requests based on staff role
 */
export const useStaffExeatRequests = (status?: string) => {
    const { hasRole } = useStaff();

    const allRequests = useGetAllExeatRequestsQuery();
    const statusRequests = useGetExeatRequestsByStatusQuery(status || '');

    // Return appropriate requests based on role
    if (hasRole('cmd')) {
        return useGetExeatRequestsByStatusQuery('cmd_review');
    }

    // If status is 'all' or undefined, return all requests
    if (!status || status === 'all') {
        return allRequests;
    }

    // Otherwise return status-specific requests
    return statusRequests;
};

/**
 * Hook for staff dashboard statistics
 */
export const useStaffDashboard = () => {
    const { data: statistics, isLoading } = useGetExeatStatisticsQuery();
    const { profile } = useStaff();

    const roleSpecificStats = useMemo(() => {
        if (!statistics || !profile?.exeat_roles) return {};

        const roleStats: Record<string, any> = {};
        profile.exeat_roles.forEach((role: any) => {
            const roleName = extractRoleName(role);
            roleStats[roleName] = statistics.role_specific_stats[roleName] || {
                pending: 0,
                approved: 0,
                rejected: 0,
            };
        });

        return roleStats;
    }, [statistics, profile]);

    return {
        statistics,
        roleSpecificStats,
        isLoading,
    };
};
