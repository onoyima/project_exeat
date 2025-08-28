'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, User, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Stethoscope, UserCheck, Shield, Building, Home, Activity, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetExeatRequestDetailsQuery, useGetExeatRequestHistoryQuery } from '@/lib/services/exeatApi';
import { getStatusColor, getStatusText } from '@/lib/utils/exeat';
import { format } from 'date-fns';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

function ExeatDetailsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-20" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Timeline component for tracking exeat approval workflow
interface TimelineProps {
    approvals: Array<{
        id: number;
        exeat_request_id: number;
        staff_id: number | null;
        role: string;
        status: string;
        comment: string | null;
        method: string | null;
        created_at: string;
        updated_at: string;
        staff: {
            id: number;
            fname: string;
            lname: string;
        } | null;
    }>;
    auditLogs: Array<any>;
    exeatRequest: {
        status: string;
        created_at: string;
        is_medical: number;
        return_date?: string;
    };
}

function ExeatTimeline({ approvals, auditLogs, exeatRequest }: TimelineProps) {
    // Define the workflow stages with proper role mapping
    const workflowStages = [
        {
            key: 'submitted',
            label: 'Request Submitted',
            icon: FileText,
            description: 'Exeat request has been submitted',
            roleMatch: null // No approval record for submission
        },
        ...(exeatRequest.is_medical ? [{
            key: 'cmd_review',
            label: 'CMD Review',
            icon: Shield,
            description: 'Chief Medical Director review',
            roleMatch: 'cmd'
        },] : []),
        {
            key: 'deputy_dean_review',
            label: 'Deputy Dean Review',
            icon: UserCheck,
            description: 'Deputy Dean approval',
            roleMatch: 'deputy_dean'
        },
        {
            key: 'parent_consent',
            label: 'Parent Consent',
            icon: User,
            description: 'Parent/Guardian approval',
            roleMatch: 'unknown' // Parent consent is stored as "unknown" role
        },
        {
            key: 'dean_review',
            label: 'Dean Review',
            icon: Building,
            description: 'Dean final approval',
            roleMatch: 'dean'
        },
        {
            key: 'hostel_signout',
            label: 'Hostel Sign Out',
            icon: Home,
            description: 'Sign out from hostel',
            roleMatch: 'hostel_admin'
        },
        {
            key: 'security_signout',
            label: 'Security Sign Out',
            icon: Shield,
            description: 'Final security clearance',
            roleMatch: 'security'
        },
        {
            key: 'departed_school',
            label: 'Departed School',
            icon: MapPin,
            description: 'Successfully left school premises',
            roleMatch: 'security' // Same as security sign out but indicates departure
        },
        {
            key: 'approved',
            label: 'Approved',
            icon: CheckCircle2,
            description: 'Ready for departure',
            roleMatch: null // Final status, not tied to specific approval
        }
    ];

    const getApprovalForStage = (stageKey: string) => {
        // Find the stage configuration
        const stage = workflowStages.find(s => s.key === stageKey);
        if (!stage || !stage.roleMatch) return null;

        // Find approval that matches the role
        return approvals.find(approval => approval.role === stage.roleMatch);
    };

    // Get current stage based on approvals and status
    const getCurrentStageIndex = () => {
        // If request is rejected, find the stage where rejection occurred
        if (exeatRequest.status === 'rejected') {
            for (let i = workflowStages.length - 1; i >= 0; i--) {
                const stage = workflowStages[i];
                const approval = getApprovalForStage(stage.key);
                if (approval && approval.status === 'rejected') {
                    return i;
                }
            }
        }

        // Check if security sign out has been completed (user has departed)
        const securitySignOutApproval = getApprovalForStage('security_signout');
        const hasDepartedSchool = securitySignOutApproval && securitySignOutApproval.status === 'approved';

        console.log('Security sign out status:', {
            approval: securitySignOutApproval,
            hasDepartedSchool,
            exeatStatus: exeatRequest.status
        });

        // If user has departed school, show "departed school" stage
        if (hasDepartedSchool) {
            const departedStageIndex = workflowStages.findIndex(s => s.key === 'departed_school');
            if (departedStageIndex !== -1) {
                return departedStageIndex;
            }
        }

        // Find the last approved stage and set the next stage as current
        let lastApprovedIndex = -1;

        for (let i = 0; i < workflowStages.length; i++) {
            const stage = workflowStages[i];
            const approval = getApprovalForStage(stage.key);

            if (approval && approval.status === 'approved') {
                lastApprovedIndex = i;
            } else if (stage.key === 'submitted') {
                // Special case: submitted stage doesn't need approval, it's always approved
                lastApprovedIndex = i;
            }
        }

        // If request is fully approved or completed, handle final stages
        if (exeatRequest.status === 'approved' || exeatRequest.status === 'completed') {
            return workflowStages.length - 1; // Final stage (approved)
        }

        // If we found approved stages, return the next stage as current
        if (lastApprovedIndex >= 0) {
            const nextStageIndex = lastApprovedIndex + 1;
            // If we've reached the final stage, return it as current
            if (nextStageIndex >= workflowStages.length - 1) {
                return workflowStages.length - 1;
            }
            return nextStageIndex;
        }

        // Default to first stage if nothing is approved
        return 0;
    };

    const currentStageIndex = getCurrentStageIndex();

    const getStaffName = (staff: { fname: string; lname: string } | null) => {
        if (!staff) return null;
        return `${staff.fname} ${staff.lname}`.trim();
    };

    const getStageStatus = (index: number, stageKey: string) => {
        if (exeatRequest.status === 'rejected') {
            const approval = getApprovalForStage(stageKey);
            if (approval && approval.status === 'rejected') {
                return 'rejected';
            }
            if (index <= currentStageIndex) {
                return index < currentStageIndex ? 'completed' : 'rejected';
            }
            return 'pending';
        }

        if (index < currentStageIndex) return 'completed';
        if (index === currentStageIndex) return 'current';
        return 'pending';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return CheckCircle2;
            case 'rejected':
                return XCircle;
            case 'current':
                return Activity;
            default:
                return Clock;
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-3 text-lg">
                        <Activity className="h-5 w-5 text-primary" />
                        <span className="text-primary">
                            Request Timeline
                        </span>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                        Track the progress of your exeat request through the approval workflow
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 rounded-full" />

                        {/* Progress Bar Fill */}
                        <div
                            className="absolute left-6 top-0 w-0.5 rounded-full transition-all duration-1000 ease-out"
                            style={{
                                height: `${((currentStageIndex + (exeatRequest.status === 'approved' || exeatRequest.status === 'completed' ? 1 : 0)) / workflowStages.length) * 100}%`,
                                background: exeatRequest.status === 'rejected'
                                    ? 'linear-gradient(to bottom, #f87171, #dc2626)'
                                    : exeatRequest.status === 'approved' || exeatRequest.status === 'completed'
                                        ? 'linear-gradient(to bottom, #34d399, #059669)'
                                        : 'linear-gradient(to bottom, #60a5fa, #3b82f6)'
                            }}
                        />

                        <div className="space-y-6">
                            {workflowStages.map((stage, index) => {
                                const status = getStageStatus(index, stage.key);
                                const approval = getApprovalForStage(stage.key);
                                const StatusIcon = getStatusIcon(status);
                                const StageIcon = stage.icon;
                                const isCompleted = status === 'completed';
                                const isCurrent = status === 'current';
                                const isRejected = status === 'rejected';

                                return (
                                    <motion.div
                                        key={stage.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="relative"
                                    >
                                        <div className="flex items-start gap-6">
                                            {/* Status Icon with Enhanced Styling */}
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isCompleted
                                                    ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-green-200'
                                                    : isRejected
                                                        ? 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-red-200'
                                                        : isCurrent
                                                            ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-200'
                                                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <StatusIcon className="h-5 w-5" />
                                                {isCurrent && (
                                                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                                                )}
                                            </motion.div>

                                            {/* Content Card with Enhanced Styling */}
                                            <div className="flex-1 min-w-0">
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`p-4 rounded-xl border transition-all duration-200 ${isCompleted
                                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                                        : isRejected
                                                            ? 'bg-red-50 border-red-200 shadow-sm'
                                                            : isCurrent
                                                                ? 'bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-100'
                                                                : 'bg-white border-gray-200 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-1.5 rounded-lg ${isCompleted ? 'bg-green-100' :
                                                                isRejected ? 'bg-red-100' :
                                                                    isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                                                                }`}>
                                                                <StageIcon className={`h-4 w-4 ${isCompleted ? 'text-green-600' :
                                                                    isRejected ? 'text-red-600' :
                                                                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-gray-900">{stage.label}</h4>
                                                                <p className="text-xs text-gray-500">{stage.description}</p>
                                                            </div>
                                                        </div>

                                                        {/* Status Indicators */}
                                                        <div className="flex items-center gap-2">
                                                            {isCurrent && (
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">
                                                                    Current
                                                                </Badge>
                                                            )}
                                                            {status !== 'pending' && !isCurrent && (
                                                                <Badge
                                                                    variant={isCompleted ? 'default' : 'destructive'}
                                                                    className={isCompleted ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                                                >
                                                                    {status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Approval Details with Enhanced Styling */}
                                                    {approval && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="border-t pt-3 mt-3 space-y-2"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Badge
                                                                    variant={approval.status === 'approved' ? 'default' :
                                                                        approval.status === 'rejected' ? 'destructive' : 'secondary'}
                                                                    className={`text-xs ${approval.status === 'approved'
                                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                                        : approval.status === 'rejected'
                                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                                                        }`}
                                                                >
                                                                    {approval.status}
                                                                </Badge>
                                                                {getStaffName(approval.staff) && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                        <User className="h-3 w-3" />
                                                                        <span>by {getStaffName(approval.staff)}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {approval.comment && (
                                                                <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                                                                    <p className="text-xs text-gray-700 italic">
                                                                        "{approval.comment}"
                                                                    </p>
                                                                </div>
                                                            )}

                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(approval.updated_at), 'PPp')}
                                                            </p>
                                                        </motion.div>
                                                    )}

                                                    {/* Creation Time for Submitted Stage */}
                                                    {stage.key === 'submitted' && !approval && (
                                                        <div className="border-t pt-3 mt-3">
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(exeatRequest.created_at), 'PPp')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enhanced Overall Status Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-8"
                    >
                        <div className={`p-6 rounded-xl border-2 ${workflowStages[currentStageIndex]?.key === 'departed_school'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                : exeatRequest.status === 'approved' || exeatRequest.status === 'completed'
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                    : exeatRequest.status === 'rejected'
                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${workflowStages[currentStageIndex]?.key === 'departed_school'
                                            ? 'bg-blue-100'
                                            : exeatRequest.status === 'approved' || exeatRequest.status === 'completed'
                                                ? 'bg-green-100'
                                                : exeatRequest.status === 'rejected'
                                                    ? 'bg-red-100'
                                                    : 'bg-blue-100'
                                        }`}>
                                        {exeatRequest.status === 'rejected' ? (
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        ) : workflowStages[currentStageIndex]?.key === 'departed_school' ? (
                                            <LogOut className="h-6 w-6 text-blue-600" />
                                        ) : exeatRequest.status === 'approved' || exeatRequest.status === 'completed' ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        ) : (
                                            <Clock className="h-6 w-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Overall Status</h4>
                                        <p className="text-sm text-gray-600">
                                            {exeatRequest.status === 'rejected' ? 'Request has been rejected' :
                                                workflowStages[currentStageIndex]?.key === 'departed_school' ?
                                                    `You have departed school premises - expected return on ${exeatRequest.return_date ? format(new Date(exeatRequest.return_date), 'MMM d, yyyy') : 'return date'}` :
                                                    exeatRequest.status === 'approved' ? 'Request approved - ready for departure' :
                                                        exeatRequest.status === 'completed' ? 'Request completed successfully' :
                                                            `Currently at: ${workflowStages[currentStageIndex]?.label || 'Unknown stage'}`}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant={exeatRequest.status === 'approved' || exeatRequest.status === 'completed' ? 'default' :
                                        exeatRequest.status === 'rejected' ? 'destructive' : 'secondary'}
                                    className={`px-4 py-2 text-sm font-medium ${workflowStages[currentStageIndex]?.key === 'departed_school'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                                            : exeatRequest.status === 'approved' || exeatRequest.status === 'completed'
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : exeatRequest.status === 'rejected'
                                                    ? 'bg-red-100 text-red-700 border-red-200'
                                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}
                                >
                                    {workflowStages[currentStageIndex]?.key === 'departed_school' ? 'Awaiting Return' : getStatusText(exeatRequest.status)}
                                </Badge>
                            </div>
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ExeatDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // Convert string ID to number for the query
    const requestId = parseInt(id, 10);

    const {
        data: exeatData,
        isLoading,
        error,
        refetch
    } = useGetExeatRequestDetailsQuery(requestId, {
        skip: !requestId || isNaN(requestId)
    });

    const {
        data: historyData,
        isLoading: historyLoading,
        error: historyError
    } = useGetExeatRequestHistoryQuery(requestId, {
        skip: !requestId || isNaN(requestId)
    });

    // Handle invalid ID
    if (!id || isNaN(requestId)) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid exeat request ID. Please check the URL and try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Handle loading state
    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <ExeatDetailsSkeleton />
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load exeat request details. Please try again.
                    </AlertDescription>
                </Alert>
                <Button onClick={() => refetch()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    // Handle no data
    if (!exeatData?.exeat_request) {
        return (
            <div className="container max-w-4xl mx-auto py-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Exeat request not found.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const exeat = exeatData.exeat_request;

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'completed':
                return CheckCircle2;
            case 'rejected':
                return XCircle;
            case 'pending':
            case 'in_review':
            default:
                return Clock;
        }
    };

    const StatusIcon = getStatusIcon(exeat.status);

    return (
        <motion.div
            className="py-8"
            initial="initial"
            animate="animate"
            variants={stagger}
        >
            {/* Header */}
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Exeat Request Details</h1>
                </div>
            </motion.div>

            {/* Status Card */}
            <motion.div variants={fadeIn}>
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <StatusIcon className={`h-6 w-6 ${getStatusColor(exeat.status)}`} />
                                <div>
                                    <h3 className="font-semibold">Status</h3>
                                    <p className="text-sm text-muted-foreground">Current request status</p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={`${getStatusColor(exeat.status)} border-current`}
                            >
                                {getStatusText(exeat.status)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Request Information */}
                <motion.div variants={fadeIn}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Request Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Reason</h4>
                                <p className="text-sm leading-relaxed">{exeat.reason || 'No reason provided'}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Destination</h4>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{exeat.destination || 'N/A'}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Preferred Contact</h4>
                                <p className="capitalize">{exeat.preferred_mode_of_contact?.replace('_', ' ') || 'Any'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Timeline Information */}
                <motion.div variants={fadeIn}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Requested On</h4>
                                <p>{exeat.created_at ? format(new Date(exeat.created_at), 'PPP') : 'N/A'}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Departure Date</h4>
                                <p>{exeat.departure_date ? format(new Date(exeat.departure_date), 'PPP') : 'N/A'}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Expected Return</h4>
                                <p>{exeat.return_date ? format(new Date(exeat.return_date), 'PPP') : 'N/A'}</p>
                            </div>

                            {exeat.updated_at && exeat.updated_at !== exeat.created_at && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Last Updated</h4>
                                    <p>{format(new Date(exeat.updated_at), 'PPP')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Timeline Component */}
            {historyData?.history && (
                <motion.div variants={fadeIn} className="mt-6">
                    <ExeatTimeline
                        approvals={historyData.history.approvals}
                        auditLogs={historyData.history.audit_logs}
                        exeatRequest={{
                            ...historyData.history.exeat_request,
                            return_date: exeat.return_date
                        }}
                    />
                </motion.div>
            )}

            {/* Parent/Guardian Contact Information */}
            <motion.div variants={fadeIn} className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Parent/Guardian Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Full Name</h4>
                                <p>{exeat.parent_surname && exeat.parent_othernames
                                    ? `${exeat.parent_othernames} ${exeat.parent_surname}`
                                    : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                                <p className="text-sm">{exeat.parent_email || 'N/A'}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Primary Phone</h4>
                                <p className="font-mono text-sm">{exeat.parent_phone_no || 'N/A'}</p>
                            </div>

                            {exeat.parent_phone_no_two && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Secondary Phone</h4>
                                    <p className="font-mono text-sm">{exeat.parent_phone_no_two}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}