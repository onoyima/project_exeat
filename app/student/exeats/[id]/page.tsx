'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, User, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Stethoscope, UserCheck, Shield, Building, Home, Activity } from 'lucide-react';
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
            name: string;
        } | null;
    }>;
    auditLogs: Array<any>;
    exeatRequest: {
        status: string;
        created_at: string;
        is_medical: number;
    };
}

function ExeatTimeline({ approvals, auditLogs, exeatRequest }: TimelineProps) {
    // Define the workflow stages
    const workflowStages = [
        {
            key: 'submitted',
            label: 'Request Submitted',
            icon: FileText,
            description: 'Exeat request has been submitted'
        },
        ...(exeatRequest.is_medical ? [{
            key: 'medical_officer',
            label: 'Medical Officer Review',
            icon: Stethoscope,
            description: 'Medical clearance required'
        }] : []),
        {
            key: 'cmd_review',
            label: 'CMD Review',
            icon: Shield,
            description: 'Chief Medical Director review'
        },
        {
            key: 'deputy-dean_review',
            label: 'Deputy Dean Review',
            icon: UserCheck,
            description: 'Deputy Dean approval'
        },
        {
            key: 'parent_consent',
            label: 'Parent Consent',
            icon: User,
            description: 'Parent/Guardian approval'
        },
        {
            key: 'dean_review',
            label: 'Dean Review',
            icon: Building,
            description: 'Dean final approval'
        },
        {
            key: 'hostel_signout',
            label: 'Hostel Sign Out',
            icon: Home,
            description: 'Sign out from hostel'
        },
        {
            key: 'approved',
            label: 'Approved',
            icon: CheckCircle2,
            description: 'Ready for departure'
        }
    ];

    // Get current stage based on status
    const getCurrentStageIndex = () => {
        const statusToStageMap: Record<string, string> = {
            'pending': 'submitted',
            'cmd_review': 'cmd_review',
            'deputy-dean_review': 'deputy-dean_review',
            'parent_consent': 'parent_consent',
            'dean_review': 'dean_review',
            'hostel_signout': 'hostel_signout',
            'approved': 'approved',
            'rejected': 'rejected',
            'completed': 'approved'
        };

        const currentStage = statusToStageMap[exeatRequest.status] || 'submitted';
        return workflowStages.findIndex(stage => stage.key === currentStage);
    };

    const currentStageIndex = getCurrentStageIndex();

    const getApprovalForStage = (stageKey: string) => {
        return approvals.find(approval => approval.role === stageKey);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-800 bg-green-100';
            case 'rejected':
                return 'text-red-800 bg-red-100';
            case 'current':
                return 'text-blue-800 bg-blue-100';
            default:
                return 'text-gray-800 bg-gray-100';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Request Timeline
                </CardTitle>
                <CardDescription>
                    Track the progress of your exeat request through the approval workflow
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {workflowStages.map((stage, index) => {
                        const status = getStageStatus(index, stage.key);
                        const approval = getApprovalForStage(stage.key);
                        const StatusIcon = getStatusIcon(status);
                        const StageIcon = stage.icon;

                        return (
                            <div key={stage.key} className="relative">
                                {/* Connector Line */}
                                {index < workflowStages.length - 1 && (
                                    <div
                                        className={`absolute left-4 top-10 w-0.5 h-8 ${status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                                            }`}
                                    />
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                                        <StatusIcon className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <StageIcon className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="font-medium text-sm">{stage.label}</h4>
                                            {status === 'current' && (
                                                <Badge variant="outline" className="text-xs">Current</Badge>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground mb-2">
                                            {stage.description}
                                        </p>

                                        {/* Approval Details */}
                                        {approval && (
                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={approval.status === 'approved' ? 'default' :
                                                            approval.status === 'rejected' ? 'destructive' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {approval.status}
                                                    </Badge>
                                                    {approval.staff?.name && (
                                                        <span className="text-muted-foreground">
                                                            by {approval.staff.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {approval.comment && (
                                                    <p className="text-muted-foreground italic">
                                                        "{approval.comment}"
                                                    </p>
                                                )}

                                                <p className="text-muted-foreground">
                                                    {format(new Date(approval.updated_at), 'PPp')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Show creation time for submitted stage */}
                                        {stage.key === 'submitted' && (
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(exeatRequest.created_at), 'PPp')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Overall Status Summary */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Overall Status</h4>
                            <p className="text-sm text-muted-foreground">
                                {exeatRequest.status === 'rejected' ? 'Request has been rejected' :
                                    exeatRequest.status === 'approved' ? 'Request approved - ready for departure' :
                                        exeatRequest.status === 'completed' ? 'Request completed successfully' :
                                            `Currently at: ${workflowStages[currentStageIndex]?.label || 'Unknown stage'}`}
                            </p>
                        </div>
                        <Badge
                            variant={exeatRequest.status === 'approved' || exeatRequest.status === 'completed' ? 'default' :
                                exeatRequest.status === 'rejected' ? 'destructive' : 'secondary'}
                        >
                            {getStatusText(exeatRequest.status)}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
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
                        exeatRequest={historyData.history.exeat_request}
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