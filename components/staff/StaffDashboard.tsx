import React from 'react'
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusColor, getStatusText } from '@/lib/utils/exeat';
import { useGetStaffDashboardStatsQuery } from '@/lib/services/staffApi';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';

const StaffDashboard = () => {
    const currentUser = useSelector(selectCurrentUser);
    const { data: dashboardStats, isLoading: dashboardStatsLoading } = useGetStaffDashboardStatsQuery();

    const StatsCard = ({
        title,
        value,
        description,
        icon: Icon,
        className = "",
        trend
    }: {
        title: string;
        value: number | string;
        description: string;
        icon: any;
        className?: string;
        trend?: { value: number; isPositive: boolean };
    }) => (
        <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        {trend && (
                            <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {trend.value}% from last month
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );


    return (
        <div className="space-y-6 p-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Staff Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {currentUser?.fname} {currentUser?.lname}</p>
                </div>

                {/* Overview Statistics */}
                {dashboardStatsLoading ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-8 w-16" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : dashboardStats ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Requests"
                            value={dashboardStats.data.total_requests}
                            description="All time requests"
                            icon={FileText}
                            className="border-l-4 border-l-primary"
                        />
                        <StatsCard
                            title="Pending Requests"
                            value={dashboardStats.data.pending_requests}
                            description="Awaiting approval"
                            icon={Clock}
                            className="border-l-4 border-l-yellow-500"
                        />
                        <StatsCard
                            title="Approved Requests"
                            value={dashboardStats.data.approved_requests}
                            description="Successfully approved"
                            icon={CheckCircle}
                            className="border-l-4 border-l-green-500"
                        />
                        <StatsCard
                            title="Rejected Requests"
                            value={dashboardStats.data.rejected_requests}
                            description="Not approved"
                            icon={XCircle}
                            className="border-l-4 border-l-red-500"
                        />
                    </div>
                ) : null}

                {/* Analytics Section */}
                {dashboardStats && (
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Status Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Requests by Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardStats.data.analytics.by_status.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getStatusColor(item.status)}`}
                                                >
                                                    {getStatusText(item.status)}
                                                </Badge>
                                            </div>
                                            <span className="font-semibold">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Department Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Requests by Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardStats.data.analytics.by_department.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate flex-1 mr-4">
                                                {item.department}
                                            </span>
                                            <span className="font-semibold bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                                {item.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StaffDashboard