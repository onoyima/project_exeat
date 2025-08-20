"use client";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    UserIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    UserCheck,
    RefreshCw,
    ArrowLeft,
    Home
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStaff } from '@/hooks/use-staff';
import { useGetExeatRequestByIdQuery } from '@/lib/services/staffApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ExeatRequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const exeatId = parseInt(params.id as string);

    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

    const { toast } = useToast();
    const {
        approveExeatRequest,
        rejectExeatRequest,
    } = useStaff();

    // Fetch the exeat request data using RTK Query
    const { data: request, isLoading: isLoadingRequest, error } = useGetExeatRequestByIdQuery(exeatId, {
        skip: !exeatId || isNaN(exeatId),
    });

    const avatarUrl = request?.student?.passport ? `data:image/jpeg;base64,${request.student.passport}` : '';

    const handleActionClick = (action: 'approve' | 'reject') => {
        // For rejections, require a comment
        if (action === 'reject' && !comment.trim()) {
            toast({
                title: 'Comment Required',
                description: 'Please provide a reason for rejection.',
                variant: 'destructive',
            });
            return;
        }

        setPendingAction(action);
        setShowConfirmDialog(true);
    };

    const handleConfirmAction = async () => {
        if (!request || !pendingAction) return;

        setIsLoading(true);
        try {
            if (pendingAction === 'approve') {
                await approveExeatRequest[0]({ exeat_request_id: request.id, comment: comment.trim() || undefined });
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
            } else {
                await rejectExeatRequest[0]({ exeat_request_id: request.id, comment: comment.trim() });
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
            }
            setComment('');
            setShowConfirmDialog(false);
            setPendingAction(null);
            // Redirect back to pending page after action
            router.push('/staff/pending');
        } catch (error) {
            toast({
                title: 'Error',
                description: `Failed to ${pendingAction} request. Please try again.`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelAction = () => {
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    if (isLoadingRequest) {
        return (
            <ProtectedRoute requiredRole="staff">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                            <p className="text-slate-600">Loading exeat request details...</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !request) {
        return (
            <ProtectedRoute requiredRole="staff">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                            <p className="text-slate-600">
                                {error ? 'Error loading exeat request' : 'Exeat request not found'}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => router.push('/staff/pending')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Pending Requests
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const duration = Math.ceil(
        (new Date(request.return_date).getTime() - new Date(request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header with Navigation */}
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/staff/pending')}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Pending
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/staff/dashboard')}
                                className="border-slate-300 hover:bg-slate-100"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Exeat Request Details
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Review and take action on this exeat request
                        </p>
                    </div>
                </div>

                {/* Student Image Only */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <Avatar className="size-60">
                            <AvatarImage
                                src={avatarUrl}
                                alt={`${request.student.fname} ${request.student.lname}`}
                                className="object-contain"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {request.student.fname?.[0] || request.student.lname?.[0] || 'S'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information */}
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                                        <p className="text-slate-800">{request.student.fname} {request.student.lname}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Matric Number</Label>
                                        <p className="text-slate-800">{request.matric_no}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Student ID</Label>
                                        <p className="text-slate-800">{request.student_id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Accommodation</Label>
                                        <p className="text-slate-800">{request.student_accommodation || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details */}
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Reason</Label>
                                        <p className="text-slate-800">{request.reason}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Destination</Label>
                                        <p className="text-slate-800">{request.destination}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Departure Date</Label>
                                        <p className="text-slate-800">{format(new Date(request.departure_date), 'PPP')}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Return Date</Label>
                                        <p className="text-slate-800">{format(new Date(request.return_date), 'PPP')}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Duration</Label>
                                        <p className="text-slate-800">{duration} day{duration !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Preferred Contact</Label>
                                        <p className="text-slate-800">{request.preferred_mode_of_contact}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information */}
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Parent/Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Parent Name</Label>
                                        <p className="text-slate-800">{request.parent_surname} {request.parent_othernames}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Primary Phone</Label>
                                        <p className="text-slate-800">{request.parent_phone_no}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Secondary Phone</Label>
                                        <p className="text-slate-800">{request.parent_phone_no_two || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                                        <p className="text-slate-800">{request.parent_email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Actions */}
                    <div className="space-y-6">
                        {/* Action Panel */}
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Take Action
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Comment Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="comment">
                                        Comment <span className="text-slate-500 text-sm">(required for rejection, optional for approval)</span>
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        placeholder="Add a comment (required for rejection, optional for approval)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <p className="text-sm text-slate-600">
                                        {comment.trim() ? (
                                            <span className="text-green-600">✓ Comment added</span>
                                        ) : (
                                            "Add a comment to provide context for your decision"
                                        )}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => handleActionClick('approve')}
                                        disabled={isLoading}
                                        className="w-full"
                                        variant="default"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Request
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleActionClick('reject')}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Request
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Metadata */}
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Request Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Created:</span>
                                    <span className="text-sm text-slate-800">{format(new Date(request.created_at), 'PPp')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Last Updated:</span>
                                    <span className="text-sm text-slate-800">{format(new Date(request.updated_at), 'PPp')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingAction === 'approve' ? (
                                <>
                                    Are you sure you want to approve this exeat request?
                                    This action cannot be undone.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to reject this exeat request?
                                    This action cannot be undone.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelAction} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            disabled={isLoading || (pendingAction === 'reject' && !comment.trim())}
                            variant={pendingAction === 'approve' ? 'default' : 'destructive'}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {pendingAction === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Approve
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Confirm Reject
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    );
}
