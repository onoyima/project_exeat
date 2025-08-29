import React from 'react'
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StaffDashboard = () => {
    const currentUser = useSelector(selectCurrentUser);

    // Debug information to help troubleshoot admin role issue
    const debugInfo = {
        user: currentUser,
        role: currentUser?.role,
        roles: (currentUser as any)?.roles,
        exeatRoles: (currentUser as any)?.exeat_roles, // Check if exeat_roles exists
        hasAdminRole: (currentUser as any)?.roles?.includes('admin'),
        hasAdminInExeatRoles: (currentUser as any)?.exeat_roles?.some((role: any) => role.name === 'admin' || role.role?.name === 'admin'),
        isAdmin: currentUser?.role === 'admin' || (currentUser as any)?.roles?.includes('admin')
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>

                {/* Debug Card - Remove this after fixing the issue */}
                {process.env.NODE_ENV === 'development' && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="text-orange-800">🔧 Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div><strong>User ID:</strong> {currentUser?.id}</div>
                                <div><strong>Role:</strong> <Badge variant="outline">{currentUser?.role}</Badge></div>
                                <div><strong>Roles Array:</strong> {(currentUser as any)?.roles ? (
                                    <div className="flex gap-1 mt-1">
                                        {(currentUser as any).roles.map((role: string) => (
                                            <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : 'No roles array found'}</div>
                                <div><strong>Exeat Roles (Raw):</strong> {(currentUser as any)?.exeat_roles ? (
                                    <div className="flex gap-1 mt-1">
                                        {(currentUser as any).exeat_roles.map((role: any) => (
                                            <Badge key={role.id} variant={role.role?.name === 'admin' ? 'default' : 'secondary'}>
                                                {role.role?.name || role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : 'No exeat_roles found'}</div>
                                <div><strong>Has Admin Role:</strong>
                                    <Badge variant={debugInfo.hasAdminRole ? 'default' : 'destructive'}>
                                        {debugInfo.hasAdminRole ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div><strong>Admin in Exeat Roles:</strong>
                                    <Badge variant={debugInfo.hasAdminInExeatRoles ? 'default' : 'destructive'}>
                                        {debugInfo.hasAdminInExeatRoles ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div><strong>Should Show Admin Routes:</strong>
                                    <Badge variant={debugInfo.isAdmin ? 'default' : 'destructive'}>
                                        {debugInfo.isAdmin ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                                <strong>Raw User Data:</strong>
                                <pre>{JSON.stringify(currentUser, null, 2)}</pre>
                            </div>
                        </CardContent>
                    </Card>
                )}

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