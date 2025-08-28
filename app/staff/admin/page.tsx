'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetStaffAssignmentsQuery } from '@/lib/services/adminApi';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { useGetCurrentUser } from '@/hooks/use-current-user';
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
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const { user } = useGetCurrentUser();
    const { data: staffAssignments, isLoading: staffLoading } = useGetStaffAssignmentsQuery();
    const { data: exeatData, isLoading: exeatLoading } = useGetExeatRequestsQuery();

    const exeatRequests = exeatData?.exeat_requests || [];
    const totalStaff = staffAssignments?.length || 0;
    const totalRoles = staffAssignments?.reduce((acc, assignment) => {
        if (!acc.includes(assignment.role_name)) {
            acc.push(assignment.role_name);
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
        <div className="space-y-6 p-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center">
                                <Shield className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl text-primary">
                                    Welcome back, {user?.fname}! 👋
                                </CardTitle>
                                <CardDescription className="text-lg text-primary/80">
                                    Here's an overview of your administrative dashboard
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                                <Link href="/staff/assign-exeat-role">
                                    <Users className="mr-2 h-5 w-5" />
                                    Assign Roles
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/staff/admin/roles">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Manage Roles
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Staff"
                    value={totalStaff}
                    description="Staff members with roles"
                    icon={Users}
                    className="border-l-4 border-l-primary"
                    trend="up"
                    trendValue="+12%"
                />
                <StatsCard
                    title="Active Roles"
                    value={totalRoles}
                    description="Unique role types"
                    icon={Shield}
                    className="border-l-4 border-l-green-500"
                    trend="up"
                    trendValue="+5%"
                />
                <StatsCard
                    title="Pending Requests"
                    value={pendingCount}
                    description="Awaiting approval"
                    icon={Clock}
                    className="border-l-4 border-l-yellow-500"
                    trend="down"
                    trendValue="-8%"
                />
                <StatsCard
                    title="Total Exeats"
                    value={exeatRequests.length}
                    description="All time requests"
                    icon={FileText}
                    className="border-l-4 border-l-purple-500"
                    trend="up"
                    trendValue="+15%"
                />
            </div>

            {/* Exeat Status Overview */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <StatsCard
                    title="Approved"
                    value={approvedCount}
                    description="Successfully approved"
                    icon={CheckCircle2}
                    className="border-l-4 border-l-green-500"
                />
                <StatsCard
                    title="Rejected"
                    value={rejectedCount}
                    description="Not approved"
                    icon={XCircle}
                    className="border-l-4 border-l-red-500"
                />
                <StatsCard
                    title="Completed"
                    value={completedCount}
                    description="Successfully returned"
                    icon={CheckCircle2}
                    className="border-l-4 border-l-emerald-500"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
                                        key={`${assignment.staff_id}-${assignment.role_name}`}
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
                            <Link href="/staff/admin/exeats">
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
                                        onClick={() => window.open(`/staff/admin/exeats/${request.id}`, '_blank')}
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
                            <Link href="/staff/admin/exeats">
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
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: number;
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
                    <div className="text-3xl font-bold">{value}</div>
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

