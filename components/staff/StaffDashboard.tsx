import React from 'react'
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { extractRoleName } from '@/lib/utils/csrf';

const StaffDashboard = () => {
    const currentUser = useSelector(selectCurrentUser);

    // Debug information to help troubleshoot admin role issue
    const debugInfo = {
        user: currentUser,
        role: currentUser?.role,
        roles: (currentUser as any)?.roles,
        exeatRoles: (currentUser as any)?.exeat_roles, // Check if exeat_roles exists
        hasAdminRole: (currentUser as any)?.roles?.includes('admin'),
        hasAdminInExeatRoles: (currentUser as any)?.exeat_roles?.some((role: any) => {
            const roleName = extractRoleName(role);
            return roleName === 'admin';
        }),
        isAdmin: currentUser?.role === 'admin' || (currentUser as any)?.roles?.includes('admin')
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to your Staff Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is your staff dashboard. If you have admin privileges, you should see additional admin routes in the sidebar.</p>
                        {debugInfo.isAdmin && (
                            <p className="mt-2 text-green-600">✅ Admin routes should be visible in the sidebar!</p>
                        )}
                        {!debugInfo.isAdmin && (
                            <p className="mt-2 text-orange-600">⚠️ Admin routes are hidden. Check the debug info above.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default StaffDashboard