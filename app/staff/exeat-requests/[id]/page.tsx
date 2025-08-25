"use client";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
    Home,
    Calendar,
    MapPin,
    Clock,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStaff } from '@/hooks/use-staff';
import { useGetExeatRequestByIdQuery } from '@/lib/services/staffApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';

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
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
                            </div>
                            <p className="text-slate-600 font-medium">Loading exeat request details...</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !request) {
        return (
            <ProtectedRoute requiredRole="staff">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                                <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>
                            </div>
                            <p className="text-slate-600 font-medium">
                                {error ? 'Error loading exeat request' : 'Exeat request not found'}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 hover:bg-slate-100 transition-colors"
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

    const getCategoryIcon = (categoryId: number, isMedical: boolean) => {
        if (isMedical || categoryId === 1) return '🏥';
        if (categoryId === 2) return '🌴';
        if (categoryId === 3) return '🚨';
        if (categoryId === 4) return '💼';
        return '📋';
    };

    const getCategoryName = (categoryId: number, isMedical: boolean) => {
        if (isMedical || categoryId === 1) return 'Medical';
        if (categoryId === 2) return 'Casual';
        if (categoryId === 3) return 'Emergency';
        if (categoryId === 4) return 'Official';
        return 'General';
    };

    return (
        <ProtectedRoute requiredRole="staff">
            <div className="w-full px-4 sm:px-6 lg:px-8 h-full min-h-screen">
                {/* Header with Navigation */}
                <div className="mb-8 pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/staff/pending')}
                                className="border-slate-300 hover:bg-slate-100 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Pending
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/staff/dashboard')}
                                className="border-slate-300 hover:bg-slate-100 transition-all duration-200 hover:scale-105"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">
                                {getCategoryIcon(request.category_id || 0, Boolean(request.is_medical))}
                            </span>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">
                                    Exeat Request Review
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <StatusPill status={request.status} size="lg" />
                                    <Badge variant="outline" className="text-sm">
                                        {getCategoryName(request.category_id || 0, Boolean(request.is_medical))}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 mt-2">
                            Review and take action on this exeat request from {request.student.fname} {request.student.lname}
                        </p>
                    </div>
                </div>

                {/* Request Summary - Quick Overview */}
                <div className="mb-6">
                    <Card className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Reason & Destination */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Reason</Label>
                                    <p className="text-slate-800 font-medium text-lg">{request.reason}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Destination</Label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-lg">{request.destination}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Duration</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-lg">{duration} day{duration !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Dates</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-slate-800 font-medium text-sm">
                                            {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Priority Action Section - Prominently Displayed */}
                <div className="mb-8">
                    <Card className="bg-gradient-to-r from-orange-50 to-indigo-50 border-orange-200 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <AlertCircle className="h-5 w-5" />
                                Take Action
                            </CardTitle>
                            <CardDescription className="text-orange-700">
                                This request requires your decision. Please review carefully and provide appropriate feedback.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Comment Input */}
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-orange-900 font-medium">
                                    <MessageSquare className="h-4 w-4 inline mr-2" />
                                    Decision Comment
                                    <span className="text-orange-600 text-sm font-normal ml-2">
                                        (required for rejection, optional for approval)
                                    </span>
                                </Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Provide context for your decision..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[100px] border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-200"
                                />
                            </div>

                            {/* Action Buttons - Prominently Displayed */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <Button
                                    onClick={() => handleActionClick('approve')}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Approve Request
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleActionClick('reject')}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <XCircle className="h-5 w-5 mr-2" />
                                    Reject Request
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                    Student Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                                        <p className="text-slate-800 font-medium">{request.student.fname} {request.student.lname}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Matric Number</Label>
                                        <p className="text-slate-800 font-mono font-medium">{request.matric_no}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Student ID</Label>
                                        <p className="text-slate-800 font-medium">{request.student_id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Accommodation</Label>
                                        <p className="text-slate-800">{request.student_accommodation || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Reason</Label>
                                        <p className="text-slate-800 font-medium">{request.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Destination</Label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{request.destination}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Departure Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{format(new Date(request.departure_date), 'PPP')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Return Date</Label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{format(new Date(request.return_date), 'PPP')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Duration</Label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <p className="text-slate-800 font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Preferred Contact</Label>
                                        <p className="text-slate-800">{request.preferred_mode_of_contact}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parent Information */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <UserCheck className="h-5 w-5 text-blue-600" />
                                    Parent/Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Parent Name</Label>
                                        <p className="text-slate-800 font-medium">{request.parent_surname} {request.parent_othernames}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Primary Phone</Label>
                                        <p className="text-slate-800 font-medium">{request.parent_phone_no}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Secondary Phone</Label>
                                        <p className="text-slate-800">{request.parent_phone_no_two || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-slate-600">Email</Label>
                                        <p className="text-slate-800">{request.parent_email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Student Photo */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="text-center text-slate-800">Student Photo</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <div className="relative group">
                                    <Avatar className="size-48 border-4 border-slate-200 group-hover:border-blue-300 transition-all duration-300">
                                        <AvatarImage
                                            src={avatarUrl}
                                            alt={`${request.student.fname} ${request.student.lname}`}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-4xl font-bold">
                                            {request.student.fname?.[0] || request.student.lname?.[0] || 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-blue-200/50 transition-all duration-300"></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Metadata */}
                        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg text-slate-800">Request Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm text-slate-600">Created:</span>
                                        <span className="text-sm text-slate-800 font-medium">{format(new Date(request.created_at), 'PPp')}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm text-slate-600">Last Updated:</span>
                                        <span className="text-sm text-slate-800 font-medium">{format(new Date(request.updated_at), 'PPp')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {pendingAction === 'approve' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            {pendingAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            {pendingAction === 'approve' ? (
                                <>
                                    Are you sure you want to approve this exeat request?
                                    <br />
                                    <span className="font-medium text-green-700">This action cannot be undone.</span>
                                </>
                            ) : (
                                <>
                                    Are you sure you want to reject this exeat request?
                                    <br />
                                    <span className="font-medium text-red-700">This action cannot be undone.</span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancelAction}
                            disabled={isLoading}
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            disabled={isLoading || (pendingAction === 'reject' && !comment.trim())}
                            variant={pendingAction === 'approve' ? 'default' : 'destructive'}
                            className="transition-all duration-200 hover:scale-105"
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
