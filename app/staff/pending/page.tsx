"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Clock,
    RefreshCw,
    AlertCircle,
    User,
    Filter,
    FileText,
    Stethoscope,
    CheckCircle2,
    MapPin,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import { useStaff, useStaffExeatRequests } from '@/hooks/use-staff';
import { ExeatRequestsTable } from '@/components/staff/ExeatRequestsTable';
import { ExeatRequestFilters } from '@/components/staff/ExeatRequestFilters';
import { extractRoleName } from '@/lib/utils/csrf';
import type { StaffExeatRequest } from '@/lib/services/staffApi';

export default function PendingExeatRequestsPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const {
        profile,
        allRoles,
        canSignStudents,
        approveExeatRequest,
        rejectExeatRequest,
        signStudentOut,
        signStudentIn
    } = useStaff();

    const { data: allRequests, isLoading, refetch } = useStaffExeatRequests();

    // Derive filtered and dated requests
    const requests = (allRequests || [])
        .filter((request: StaffExeatRequest) => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
                request.student.fname.toLowerCase().includes(s) ||
                request.student.lname.toLowerCase().includes(s) ||
                request.matric_no.toLowerCase().includes(s) ||
                request.destination.toLowerCase().includes(s) ||
                request.reason.toLowerCase().includes(s) ||
                request.parent_surname.toLowerCase().includes(s) ||
                request.parent_othernames.toLowerCase().includes(s)
            );
        })
        .filter((request: StaffExeatRequest) => {
            // Status filter - using grouped logic matching the stats cards
            if (statusFilter !== 'all') {
                const status = request.status;
                const statusGroups = {
                    pending: ['pending', 'recommendation1', 'recommendation2'],
                    medical: ['cmd_review'],
                    dean: ['deputy-dean_review', 'parent_consent', 'dean_review'],
                    approved: ['approved', 'hostel_signin', 'hostel_signout', 'security_signout'],
                    active: ['signed_out', 'security_signin'],
                    rejected: ['rejected'],
                    completed: ['completed']
                };

                return statusGroups[statusFilter as keyof typeof statusGroups]?.includes(status) ?? true;
            }
            return true;
        })
        .filter((request: StaffExeatRequest) => {
            if (dateFilter === 'all') return true;
            const created = new Date(request.created_at);
            const now = new Date();
            if (dateFilter === 'today') {
                return created.toDateString() === now.toDateString();
            }
            if (dateFilter === 'week') {
                const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            }
            if (dateFilter === 'month') {
                return (
                    created.getFullYear() === now.getFullYear() &&
                    created.getMonth() === now.getMonth()
                );
            }
            if (dateFilter === 'quarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                return (
                    created.getFullYear() === now.getFullYear() &&
                    Math.floor(created.getMonth() / 3) === quarter
                );
            }
            return true;
        })
        .filter((request: StaffExeatRequest) => {
            if (categoryFilter === 'all') return true;

            // Handle medical category
            if (categoryFilter === 'medical') {
                return request.is_medical === 1 || request.category_id === 1;
            }

            // Handle other categories
            if (categoryFilter === 'casual') return request.category_id === 2;
            if (categoryFilter === 'emergency') return request.category_id === 3;
            if (categoryFilter === 'official') return request.category_id === 4;

            return true;
        })
        .sort((a: StaffExeatRequest, b: StaffExeatRequest) => {
            // Default sort by creation date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const handleApprove = async (exeat_request_id: number, comment?: string) => {
        try {
            await approveExeatRequest[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error approving request:', error);
            throw error;
        }
    };

    const handleReject = async (exeat_request_id: number, comment?: string) => {
        try {
            await rejectExeatRequest[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    };

    const handleSignOut = async (exeat_request_id: number, comment?: string) => {
        try {
            await signStudentOut[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error signing student out:', error);
            throw error;
        }
    };

    const handleSignIn = async (exeat_request_id: number, comment?: string) => {
        try {
            await signStudentIn[0]({ exeat_request_id, comment });
            refetch();
        } catch (error) {
            console.error('Error signing student in:', error);
            throw error;
        }
    };

    const getRoleDisplayName = (roleName: string) => {
        const roleMap: Record<string, string> = {
            dean: 'Dean of Students',
            deputy_dean: 'Deputy Dean',
            cmd: 'Chief Medical Director',
            hostel_admin: 'Hostel Admin',
        };
        return roleMap[roleName] || roleName.replace('_', ' ').toUpperCase();
    };

    const getGroupedStatusCounts = () => {
        if (!allRequests) return {
            total: 0,
            pending: 0,
            medical: 0,
            dean: 0,
            approved: 0,
            active: 0,
            rejected: 0,
            completed: 0
        };

        const counts = allRequests.reduce((acc: Record<string, number>, request: StaffExeatRequest) => {
            const status = request.status;

            // Total count
            acc.total += 1;

            // Grouped status counts
            if (['pending', 'recommendation1', 'recommendation2'].includes(status)) {
                acc.pending += 1;
            } else if (status === 'cmd_review') {
                acc.medical += 1;
            } else if (['deputy-dean_review', 'parent_consent', 'dean_review'].includes(status)) {
                acc.dean += 1;
            } else if (['approved', 'hostel_signin', 'hostel_signout', 'security_signout'].includes(status)) {
                acc.approved += 1;
            } else if (['signed_out', 'security_signin'].includes(status)) {
                acc.active += 1;
            } else if (status === 'rejected') {
                acc.rejected += 1;
            } else if (status === 'completed') {
                acc.completed += 1;
            }

            return acc;
        }, {
            total: 0,
            pending: 0,
            medical: 0,
            dean: 0,
            approved: 0,
            active: 0,
            rejected: 0,
            completed: 0
        });

        return counts;
    };

    const groupedStatusCounts = getGroupedStatusCounts();

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || categoryFilter !== 'all';

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setCategoryFilter('all');
    };

    const handleViewDetails = (request: StaffExeatRequest) => {
        // Redirect to the dedicated exeat details page
        router.push(`/staff/exeat-requests/${request.id}`);
    };

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header */}
                <div className="mb-6 lg:mb-8 pt-4 lg:pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
                        <div className="space-y-2 flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                                My Exeat Requests
                            </h1>
                            <p className="text-base lg:text-lg text-slate-600 max-w-4xl">
                                Review and manage exeat requests assigned to your roles. Monitor request progress, approve or reject applications,
                                sign students in/out, and track student accommodation details. Use the filters below to narrow down requests by status,
                                leave type, or time period for efficient management.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                            <Button
                                variant="outline"
                                size="default"
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className="border-slate-300 hover:bg-slate-100 transition-colors w-full sm:w-auto"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Role Badges */}
                    {profile?.exeat_roles && (
                        <div className="mt-4 lg:mt-6">
                            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Your Roles:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profile.exeat_roles.map((role: any) => (
                                        <Badge
                                            key={role.id}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 border-blue-200 px-2 lg:px-3 py-1 text-xs lg:text-sm"
                                        >
                                            {getRoleDisplayName(extractRoleName(role))}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-3 lg:gap-4 mb-6 lg:mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Total</p>
                                    <p className="text-xl lg:text-2xl font-bold text-slate-800">{groupedStatusCounts.total}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">All requests</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-full flex-shrink-0">
                                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Pending</p>
                                    <p className="text-xl lg:text-2xl font-bold text-orange-600">{groupedStatusCounts.pending}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Awaiting review</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-orange-100 rounded-full flex-shrink-0">
                                    <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Medical</p>
                                    <p className="text-xl lg:text-2xl font-bold text-purple-600">{groupedStatusCounts.medical}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">CMD review</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-purple-100 rounded-full flex-shrink-0">
                                    <Stethoscope className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Dean</p>
                                    <p className="text-xl lg:text-2xl font-bold text-indigo-600">{groupedStatusCounts.dean}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Academic review</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-indigo-100 rounded-full flex-shrink-0">
                                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Approved</p>
                                    <p className="text-xl lg:text-2xl font-bold text-green-600">{groupedStatusCounts.approved}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Ready to depart</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-green-100 rounded-full flex-shrink-0">
                                    <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Active</p>
                                    <p className="text-xl lg:text-2xl font-bold text-blue-600">{groupedStatusCounts.active}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Students away</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-full flex-shrink-0">
                                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Rejected</p>
                                    <p className="text-xl lg:text-2xl font-bold text-red-600">{groupedStatusCounts.rejected}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Not approved</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-red-100 rounded-full flex-shrink-0">
                                    <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Completed</p>
                                    <p className="text-xl lg:text-2xl font-bold text-emerald-600">{groupedStatusCounts.completed}</p>
                                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">Request finished</p>
                                </div>
                                <div className="p-1.5 lg:p-2 bg-emerald-100 rounded-full flex-shrink-0">
                                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Toolbar */}
                <div className="mb-4 lg:mb-6">
                    <div className="flex-1 w-full">
                        <ExeatRequestFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            dateFilter={dateFilter}
                            setDateFilter={setDateFilter}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4 lg:space-y-6">
                    {isLoading ? (
                        <div className="space-y-3 lg:space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Card key={i} className="bg-white/80 backdrop-blur-sm border-slate-200">
                                    <CardContent className="p-4 lg:p-6">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton className="h-10 w-10 lg:h-12 lg:w-12 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                                                <Skeleton className="h-6 lg:h-8 w-16 lg:w-20" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : requests && requests.length > 0 ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 lg:pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardDescription className="text-slate-600 text-sm">
                                            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                                            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ExeatRequestsTable
                                    requests={requests}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onSignOut={canSignStudents ? handleSignOut : undefined}
                                    onSignIn={canSignStudents ? handleSignIn : undefined}
                                    onViewDetails={handleViewDetails}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-12 lg:py-16 px-4">
                                <div className="p-4 bg-slate-100 rounded-full mb-4 lg:mb-6">
                                    <AlertCircle className="h-10 w-10 lg:h-12 lg:w-12 text-slate-400" />
                                </div>
                                <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 text-center">
                                    {hasActiveFilters ? 'No requests match your filters' : 'All caught up! 🎉'}
                                </h3>
                                <p className="text-slate-600 text-center max-w-lg mb-4 lg:mb-6 text-sm lg:text-base">
                                    {hasActiveFilters
                                        ? 'No requests match your current search criteria. Try adjusting your filters to see more results, or clear all filters to view all requests.'
                                        : 'You currently have no exeat requests requiring your attention. All requests have been processed or are being handled by other staff members. New requests will appear here automatically.'
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            onClick={handleClearFilters}
                                            className="border-slate-300 hover:bg-slate-100 w-full sm:w-auto"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => refetch()}
                                        className="border-slate-300 hover:bg-slate-100 w-full sm:w-auto"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
