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
} from 'lucide-react';
import { useStaff, useStaffExeatRequests } from '@/hooks/use-staff';
import { ExeatRequestsTable } from '@/components/staff/ExeatRequestsTable';
import { ExeatRequestFilters } from '@/components/staff/ExeatRequestFilters';
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

    const { data: allRequests, isLoading, refetch } = useStaffExeatRequests(statusFilter);

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

    const getStatusCounts = () => {
        if (!requests) return { pending: 0, approved: 0, rejected: 0, signed_out: 0, cmd_review: 0, 'deputy-dean_review': 0 };

        return requests.reduce((acc: Record<string, number>, request: StaffExeatRequest) => {
            acc[request.status as keyof typeof acc] = (acc[request.status as keyof typeof acc] || 0) + 1;
            return acc;
        }, { pending: 0, approved: 0, rejected: 0, signed_out: 0, cmd_review: 0, 'deputy-dean_review': 0 });
    };

    const statusCounts = getStatusCounts();

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
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold">
                                Pending Exeat Requests
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl">
                                Review and manage exeat requests based on your roles. Filter, search, and take actions on student requests efficiently.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className="border-slate-300 hover:bg-slate-100 transition-colors"
                            >
                                <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Role Badges */}
                    {profile?.exeat_roles && (
                        <div className="flex gap-3 mt-6">
                            <span className="text-sm font-medium text-slate-600">Your Roles:</span>
                            {profile.exeat_roles.map((role: any) => (
                                <Badge key={role.id} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                                    {getRoleDisplayName(role.role.name)}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Requests</p>
                                    <p className="text-3xl font-bold text-slate-800">{requests?.length || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Pending</p>
                                    <p className="text-3xl font-bold text-orange-600">{statusCounts.pending}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">CMD Review</p>
                                    <p className="text-3xl font-bold text-purple-600">{statusCounts.cmd_review}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Stethoscope className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Deputy Dean</p>
                                    <p className="text-3xl font-bold text-indigo-600">{statusCounts['deputy-dean_review']}</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <User className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Toolbar */}
                <div className="mb-6">
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="border-slate-300 hover:bg-slate-100"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Card key={i} className="bg-white/80 backdrop-blur-sm border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-8 w-20" />
                                                <Skeleton className="h-8 w-20" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : requests && requests.length > 0 ? (
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription className="text-slate-600">
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
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="p-4 bg-slate-100 rounded-full mb-6">
                                    <AlertCircle className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">No requests found</h3>
                                <p className="text-slate-600 text-center max-w-md mb-6">
                                    {statusFilter !== 'all'
                                        ? `No requests with status "${statusFilter}" found. Try adjusting your filters or check back later.`
                                        : 'No exeat requests are currently available for your role. Check back later for new requests.'
                                    }
                                </p>
                                {statusFilter !== 'all' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setStatusFilter('all')}
                                        className="border-slate-300 hover:bg-slate-100"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
