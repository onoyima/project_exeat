'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusPill } from '@/components/ui/status-pill';
import { useGetAllExeatRequestsQuery, StaffExeatRequest } from '@/lib/services/staffApi';
import { History, Search, Filter, Calendar, MapPin, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
];

const categories = [
    { id: 1, name: "Medical", icon: "🏥" },
    { id: 2, name: "Casual", icon: "🌴" },
    { id: 3, name: "Emergency", icon: "🚨" },
    { id: 4, name: "Official", icon: "💼" },
];

export default function StaffHistoryPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const { data: historyRequests = [], isLoading, refetch } = useGetAllExeatRequestsQuery();

    // Filter requests
    const filteredRequests = historyRequests.filter((request: StaffExeatRequest) => {
        const searchTerm = search.toLowerCase();
        const matchesSearch =
            search === '' ||
            request.reason.toLowerCase().includes(searchTerm) ||
            request.destination.toLowerCase().includes(searchTerm);

        const matchesStatus =
            statusFilter === 'all' || request.status === statusFilter;
        const matchesCategory =
            categoryFilter === 'all' ||
            request.category_id === Number(categoryFilter);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort by creation date (newest first)
    const sortedRequests = [...filteredRequests].sort((a: StaffExeatRequest, b: StaffExeatRequest) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    // Calculate statistics
    const totalRequests = historyRequests.length;
    const approvedCount = historyRequests.filter((r: StaffExeatRequest) => r.status === 'approved').length;
    const rejectedCount = historyRequests.filter((r: StaffExeatRequest) => r.status === 'rejected').length;
    const completedCount = historyRequests.filter((r: StaffExeatRequest) => r.status === 'completed').length;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Exeat History</h1>
                            <p className="text-muted-foreground mt-1">
                                View all your exeat request history and status updates
                            </p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-8">
                    <StatsCard
                        title="Total Requests"
                        value={totalRequests}
                        description="All time"
                        icon={History}
                    />
                    <StatsCard
                        title="Approved"
                        value={approvedCount}
                        description="Successful"
                        icon={Clock}
                        className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                    />
                    <StatsCard
                        title="Rejected"
                        value={rejectedCount}
                        description="Not approved"
                        icon={Clock}
                        className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                    />
                    <StatsCard
                        title="Completed"
                        value={completedCount}
                        description="Returned"
                        icon={Clock}
                        className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    />
                </div>

                {/* Filters */}
                <div className="bg-card border rounded-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Search & Filters</h2>
                            <p className="text-sm text-muted-foreground">Find specific exeat requests</p>
                        </div>
                        {(statusFilter !== 'all' || categoryFilter !== 'all' || search) && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setCategoryFilter('all');
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by reason, destination..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        <span className="mr-2">{category.icon}</span>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span>{sortedRequests.length} of {totalRequests} requests</span>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Your Exeat Requests</h2>
                                <p className="text-sm text-muted-foreground">Complete history of your applications</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {sortedRequests.length} request{sortedRequests.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                                            <div className="h-10 w-10 rounded-full bg-muted" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-muted rounded w-3/4" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                            </div>
                                            <div className="h-6 w-16 bg-muted rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-base font-medium text-muted-foreground">No exeat requests found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {totalRequests === 0
                                        ? "You haven't submitted any exeat requests yet."
                                        : "Try adjusting your search or filters."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sortedRequests.map((request: StaffExeatRequest) => (
                                    <div key={request.id} className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-lg">
                                                        {request.is_medical || request.category_id === 1 ? '🏥' :
                                                            request.category_id === 2 ? '🌴' :
                                                                request.category_id === 3 ? '🚨' :
                                                                    request.category_id === 4 ? '💼' : '📋'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-base truncate">
                                                        {request.reason}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">ID: {request.id}</p>
                                                </div>
                                            </div>
                                            <StatusPill status={request.status} size="sm" />
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="truncate">{request.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
    return (
        <div className={cn("bg-card border rounded-lg p-4 transition-all duration-200", className)}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">
                {description}
            </p>
        </div>
    );
}
