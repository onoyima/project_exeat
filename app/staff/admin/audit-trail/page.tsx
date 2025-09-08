'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetAdminAuditTrailQuery } from '@/lib/services/adminApi';
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    Activity,
    Search,
    User,
    Shield,
    Calendar,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function AdminAuditTrailPage() {
    const { data: auditTrail, isLoading: auditTrailLoading } = useGetAdminAuditTrailQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');

    const auditData = auditTrail?.data;
    const auditLogs = auditData?.audit_trail.audit_logs || [];
    const actionSummary = auditData?.audit_trail.action_summary || {};

    // Filter audit logs based on search and action filter
    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target_type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = actionFilter === 'all' || log.action === actionFilter;

        return matchesSearch && matchesAction;
    });

    // Get unique actions for filter dropdown
    const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'approve':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'reject':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'parent consent approve':
                return <User className="h-4 w-4 text-blue-600" />;
            case 'parent consent request':
                return <Shield className="h-4 w-4 text-purple-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActionBadgeColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'approve':
                return 'border-green-200 text-green-700 bg-green-50';
            case 'reject':
                return 'border-red-200 text-red-700 bg-red-50';
            case 'parent consent approve':
                return 'border-blue-200 text-blue-700 bg-blue-50';
            case 'parent consent request':
                return 'border-purple-200 text-purple-700 bg-purple-50';
            default:
                return 'border-gray-200 text-gray-700 bg-gray-50';
        }
    };

    if (auditTrailLoading) {
        return (
            <div className="space-y-6 p-4 lg:p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-muted rounded"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Audit Trail</h1>
                <p className="text-muted-foreground mt-1">Comprehensive system activity and approval tracking</p>
            </div>

            {/* Overview Statistics */}
            {auditData && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Department Students"
                        value={auditData.overview.department_students}
                        description="Total students in department"
                        icon={Users}
                        className="border-l-4 border-l-primary"
                    />
                    <StatsCard
                        title="Pending Approvals"
                        value={auditData.overview.pending_approvals}
                        description="Awaiting approval"
                        icon={Clock}
                        className="border-l-4 border-l-yellow-500"
                    />
                    <StatsCard
                        title="Approved Today"
                        value={auditData.overview.approved_today}
                        description="Approved today"
                        icon={CheckCircle2}
                        className="border-l-4 border-l-green-500"
                    />
                    <StatsCard
                        title="Approval Rate"
                        value={`${auditData.overview.department_approval_rate}%`}
                        description="Department approval rate"
                        icon={TrendingUp}
                        className="border-l-4 border-l-blue-500"
                    />
                </div>
            )}

            {/* Department Statistics */}
            {auditData && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <StatsCard
                        title="Total Requests"
                        value={auditData.department_statistics.total_requests}
                        description="All time requests"
                        icon={FileText}
                        className="border-l-4 border-l-primary"
                    />
                    <StatsCard
                        title="Avg Processing Time"
                        value={auditData.department_statistics.average_processing_time}
                        description="Average processing time"
                        icon={Clock}
                        className="border-l-4 border-l-purple-500"
                    />
                    <StatsCard
                        title="Most Active Day"
                        value={auditData.department_statistics.most_active_day}
                        description="Highest activity day"
                        icon={Calendar}
                        className="border-l-4 border-l-indigo-500"
                    />
                </div>
            )}

            {/* Action Summary */}
            {Object.keys(actionSummary).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Action Summary</CardTitle>
                        <CardDescription>Distribution of actions performed in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            {Object.entries(actionSummary).map(([action, count]) => (
                                <div key={action} className="flex items-center gap-3 p-4 border rounded-lg">
                                    {getActionIcon(action)}
                                    <div>
                                        <p className="font-medium text-sm">{action}</p>
                                        <p className="text-2xl font-bold text-primary">{count}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Audit Logs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Audit Logs</CardTitle>
                        <CardDescription>
                            Detailed system activity logs ({filteredLogs.length} of {auditLogs.length} entries)
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                            <option value="all">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No audit logs found</p>
                            <p className="text-sm">
                                {searchTerm || actionFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No audit activity recorded yet'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getActionBadgeColor(log.action))}
                                            >
                                                {log.action}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {log.target_type} #{log.target_id}
                                            </span>
                                        </div>
                                        <p className="font-medium text-sm mb-1">
                                            {log.actor.name}
                                            <span className="text-muted-foreground ml-2">
                                                ({log.actor.type})
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {log.details}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{log.formatted_time}</span>
                                            <span>•</span>
                                            <span>{format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}</span>
                                            {log.actor.email && (
                                                <>
                                                    <span>•</span>
                                                    <span>{log.actor.email}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                <p className="text-sm text-muted-foreground mt-2">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}





