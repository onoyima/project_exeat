'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetAdminDashboardStatsQuery, useGetStaffAssignmentsQuery } from '@/lib/services/adminApi';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import {
    Users,
    Shield,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Plus,
    Activity,
    Server,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { extractRoleName } from '@/lib/utils/csrf';
import type { AdminDashboardResponse } from '@/types/staff';

export default function AdminDashboard() {
    const { user } = useGetCurrentUser();
    const router = useRouter();
    const { data: staffAssignments, isLoading: staffLoading } = useGetStaffAssignmentsQuery();
    const { data: exeatData, isLoading: exeatLoading } = useGetExeatRequestsQuery();
    const { data: dashboardStats, isLoading: dashboardStatsLoading } = useGetAdminDashboardStatsQuery() as {
        data: AdminDashboardResponse['data'] | undefined;
        isLoading: boolean;
    };


    const exeatRequests = exeatData?.exeat_requests || [];
    const totalStaff = staffAssignments?.length || 0;
    const totalRoles = staffAssignments?.reduce((acc, assignment) => {
        const roleName = extractRoleName(assignment);
        if (!acc.includes(roleName)) {
            acc.push(roleName);
        }
        return acc;
    }, [] as string[]).length || 0;

    // Calculate exeat statistics
    const pendingCount = exeatRequests.filter(r => r.status === 'pending').length;
    const approvedCount = exeatRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = exeatRequests.filter(r => r.status === 'rejected').length;
    const completedCount = exeatRequests.filter(r => r.status === 'completed').length;

    // Get recent staff assignments
    const recentAssignments = staffAssignments?.slice(0, 5) || [];

    // Get recent exeat requests
    const recentExeats = exeatRequests.slice(0, 5);

    return (
        <div className="space-y-6 p-4">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user?.fname} {user?.lname}</p>
            </div>

            {/* System Overview Stats */}
            {
                dashboardStats && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Students"
                            value={dashboardStats.overview.total_students}
                            description="Registered students"
                            icon={Users}
                            className="border-l-4 border-l-primary"
                        />
                        <StatsCard
                            title="Total Staff"
                            value={dashboardStats.overview.total_staff}
                            description="Active staff members"
                            icon={Shield}
                            className="border-l-4 border-l-green-500"
                        />
                        <StatsCard
                            title="Active Exeats"
                            value={dashboardStats.overview.active_exeats}
                            description="Currently active"
                            icon={Activity}
                            className="border-l-4 border-l-blue-500"
                        />
                        <StatsCard
                            title="System Uptime"
                            value={dashboardStats.overview.system_uptime}
                            description="Service availability"
                            icon={Server}
                            className="border-l-4 border-l-purple-500"
                        />
                    </div>
                )
            }


            {/* Exeat Statistics */}
            {
                dashboardStats && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <StatsCard
                            title="Total Requests"
                            value={dashboardStats.exeat_statistics.total_requests}
                            description="All time requests"
                            icon={FileText}
                            className="border-l-4 border-l-primary"
                        />
                        <StatsCard
                            title="Approved Requests"
                            value={dashboardStats.exeat_statistics.approved_requests}
                            description="Successfully approved"
                            icon={CheckCircle2}
                            className="border-l-4 border-l-green-500"
                        />
                        <StatsCard
                            title="Rejected Requests"
                            value={dashboardStats.exeat_statistics.rejected_requests}
                            description="Not approved"
                            icon={XCircle}
                            className="border-l-4 border-l-red-500"
                        />
                    </div>
                )
            }


            {/* Audit Trail & Recent Activities */}
            {
                dashboardStats && (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {/* Audit Trail */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Recent Audit Activity</CardTitle>
                                    <CardDescription>
                                        Latest system actions and changes
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/staff/admin/audit">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {dashboardStats.audit_trail.audit_logs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No recent audit activity</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardStats.audit_trail.audit_logs.slice(0, 5).map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Activity className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {log.action} - {log.target_type}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        by {log.actor.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.formatted_time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Recent Exeat Activities</CardTitle>
                                    <CardDescription>
                                        Latest exeat request activities
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/staff/pending">
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {dashboardStats.recent_activities.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No recent activities</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboardStats.recent_activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/staff/exeat-requests/${activity.id}`)}
                                            >
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {activity.student_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {activity.approved_by ? `Approved by ${activity.approved_by}` : 'Pending approval'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-xs",
                                                            activity.status === 'approved' ? 'border-green-200 text-green-700' :
                                                                activity.status === 'rejected' ? 'border-red-200 text-red-700' :
                                                                    activity.status === 'completed' ? 'border-emerald-200 text-emerald-700' :
                                                                        'border-primary/20 text-primary'
                                                        )}
                                                    >
                                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.created_at}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Main Content Grid */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Recent Staff Assignments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Recent Staff Assignments</CardTitle>
                            <CardDescription>
                                Latest role assignments and updates
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/staff/assign-exeat-role">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View All Assignments
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {staffLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentAssignments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No staff assignments yet</p>
                                <Button asChild variant="outline" className="mt-4">
                                    <Link href="/staff/assign-exeat-role">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Assign First Role
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAssignments.map((assignment) => (
                                    <div
                                        key={`${assignment.staff_id}-${extractRoleName(assignment)}`}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {assignment.staff_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {assignment.staff_email}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                                {assignment.role_display_name}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(assignment.assigned_at), 'MMM d')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Exeat Requests */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Recent Exeat Requests</CardTitle>
                            <CardDescription>
                                Latest student exeat applications
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/staff/pending">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View All
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {exeatLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentExeats.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No exeat requests yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentExeats.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/staff/exeat-requests/${request.id}`)}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {request.reason}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {request.destination}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    request.status === 'approved' ? 'border-green-200 text-green-700' :
                                                        request.status === 'rejected' ? 'border-red-200 text-red-700' :
                                                            request.status === 'pending' ? 'border-yellow-200 text-yellow-700' :
                                                                'border-primary/20 text-primary'
                                                )}
                                            >
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(request.created_at), 'MMM d')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription>
                        Common administrative tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/assign-exeat-role">
                                <Users className="h-6 w-6" />
                                <span>Assign Roles</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/admin/roles">
                                <Shield className="h-6 w-6" />
                                <span>Manage Roles</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/pending">
                                <FileText className="h-6 w-6" />
                                <span>View Exeats</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20 flex-col gap-2">
                            <Link href="/staff/admin/analytics">
                                <TrendingUp className="h-6 w-6" />
                                <span>Analytics</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}

interface StatsCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
}

function StatsCard({ title, value, description, icon: Icon, className, trend, trendValue }: StatsCardProps) {
    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                    {trend && trendValue && (
                        <div className={cn(
                            "flex items-center gap-1 text-sm font-medium",
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4" />
                            ) : (
                                <TrendingUp className="h-4 w-4 rotate-180" />
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

