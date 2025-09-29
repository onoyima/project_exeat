"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusPill } from '@/components/ui/status-pill';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, LogOut, LogIn, CheckCircle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
import type { StaffExeatRequest } from '@/lib/services/staffApi';
import { CountdownTimer } from '@/components/staff/CountdownTimer';
import { getApprovalConfirmationText, getRejectionConfirmationText } from '@/lib/utils/exeat-ui';
import { useToast } from '@/hooks/use-toast';

interface ExeatRequestsTableProps {
    requests: StaffExeatRequest[];
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignOut?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignIn?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSendComment?: (exeat_request_id: number, comment: string) => Promise<void>;
    onViewDetails: (request: StaffExeatRequest) => void;
}

export const ExeatRequestsTable: React.FC<ExeatRequestsTableProps> = ({
    requests,
    onApprove,
    onReject,
    onSignOut,
    onSignIn,
    onSendComment,
    onViewDetails,
}) => {
    const { toast } = useToast();
    const getInitials = (fname: string, lname: string) => `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();
    const [actionDialog, setActionDialog] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | 'see_me' | null;
        requestId: number | null;
        comment: string;
        request: StaffExeatRequest | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        type: null,
        requestId: null,
        comment: '',
        request: null,
        isLoading: false,
    });

    const handleAction = (type: 'approve' | 'reject' | 'see_me', requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        setActionDialog({
            isOpen: true,
            type,
            requestId,
            comment: '',
            request: request || null,
            isLoading: false,
        });
    };

    const submitAction = async () => {
        if (!actionDialog.requestId || !actionDialog.type) return;

        setActionDialog(prev => ({ ...prev, isLoading: true }));

        try {
            if (actionDialog.type === 'approve') {
                await onApprove(actionDialog.requestId, actionDialog.comment || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request approved successfully.',
                });
            } else if (actionDialog.type === 'reject') {
                await onReject(actionDialog.requestId, actionDialog.comment || undefined);
                toast({
                    title: 'Success',
                    description: 'Exeat request rejected successfully.',
                });
            } else if (actionDialog.type === 'see_me' && onSendComment) {
                try {
                    await onSendComment(actionDialog.requestId, actionDialog.comment);
                    toast({
                        title: 'Success',
                        description: 'Comment sent to student successfully.',
                    });
                } catch (error: any) {
                    console.error('Error sending comment:', error);
                    console.log('DEBUG: Error type in table:', typeof error);
                    console.log('DEBUG: Error message in table:', error.message);

                    // Extract detailed error message
                    let errorMessage = 'Failed to send comment. Please try again.';

                    if (error.message) {
                        errorMessage = error.message;
                    }

                    console.log('DEBUG: Final error message for toast:', errorMessage);

                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                    // Re-throw to prevent dialog from closing
                    throw error;
                }
            }
            setActionDialog({ isOpen: false, type: null, requestId: null, comment: '', request: null, isLoading: false });
        } catch (error) {
            console.error('Error processing action:', error);
            toast({
                title: 'Error',
                description: `Failed to ${actionDialog.type === 'see_me' ? 'send comment' : actionDialog.type} request. Please try again.`,
                variant: 'destructive',
            });
            setActionDialog(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {requests.map((r) => {
                    const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';

                    return (
                        <Card key={r.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                            {/* Header with Avatar and Status */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                        <AvatarFallback className="text-xs">{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate">
                                            {r.student.fname} {r.student.lname}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-mono truncate">{r.matric_no}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <StatusPill status={r.status} size="sm" />
                                </div>
                            </div>

                            {/* Countdown Timer for Active Requests */}
                            {(r.status === 'approved' || r.status === 'security_signin') && (
                                <div className="mb-3">
                                    <CountdownTimer
                                        returnDate={r.return_date}
                                        className="text-xs"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                {/* Primary Action Row */}
                                <div className="flex gap-2">
                                    {/* Show approve/reject for pending and review statuses */}
                                    {(r.status === 'pending' || r.status === 'cmd_review' || r.status === 'deputy-dean_review') && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleAction('approve', r.id)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="truncate">Approve</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1 min-w-0"
                                                onClick={() => handleAction('reject', r.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="truncate">Reject</span>
                                            </Button>
                                        </>
                                    )}

                                    {/* Show action buttons for other actionable statuses */}
                                    {r.status === 'dean_review' && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleAction('approve', r.id)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="truncate">Approve</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1 min-w-0"
                                                onClick={() => handleAction('reject', r.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1 sm:mr-2" />
                                                <span className="truncate">Reject</span>
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Secondary Action Row */}
                                <div className="flex gap-2">
                                    {/* Show sign out for approved requests */}
                                    {!!onSignOut && r.status === 'approved' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-0"
                                            onClick={() => onSignOut(r.id)}
                                        >
                                            <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                                            <span className="truncate">Sign Out</span>
                                        </Button>
                                    )}

                                    {/* Show sign in for signed out requests */}
                                    {!!onSignIn && r.status === 'signed_out' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-0"
                                            onClick={() => onSignIn(r.id)}
                                        >
                                            <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                                            <span className="truncate">Sign In</span>
                                        </Button>
                                    )}

                                    {/* Show See Me button for eligible requests */}
                                    {!!onSendComment && !['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'].includes(r.status) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-0"
                                            onClick={() => handleAction('see_me', r.id)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                                            <span className="truncate">See Me</span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 min-w-0"
                                        onClick={() => onViewDetails(r)}
                                    >
                                        <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="truncate">View Details</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-lg border bg-background">
                <Table className="text-[15px] md:text-base">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow className="bg-muted/50">
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Student</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Status</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-sm md:text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((r) => {
                            const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';

                            return (
                                <TableRow key={r.id} className="align-middle">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10">
                                                <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                                <AvatarFallback className="text-xs">{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{r.student.fname} {r.student.lname}</span>
                                                <span className="text-muted-foreground font-mono text-xs">{r.matric_no}</span>
                                                {/* Countdown Timer for Active Requests */}
                                                {(r.status === 'approved' || r.status === 'security_signin') && (
                                                    <div className="mt-1">
                                                        <CountdownTimer
                                                            returnDate={r.return_date}
                                                            className="text-xs scale-90 origin-left"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill status={r.status} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Show approve/reject for pending and review statuses */}
                                            {(r.status === 'pending' || r.status === 'cmd_review' || r.status === 'deputy-dean_review') && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-3 text-[13px] md:text-sm bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAction('approve', r.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 px-3 text-[13px] md:text-sm"
                                                        onClick={() => handleAction('reject', r.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            {/* Show action buttons for other actionable statuses */}
                                            {r.status === 'dean_review' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-3 text-[13px] md:text-sm bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAction('approve', r.id)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 px-3 text-[13px] md:text-sm"
                                                        onClick={() => handleAction('reject', r.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            {/* Show sign out for approved requests */}
                                            {!!onSignOut && r.status === 'approved' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-[13px] md:text-sm"
                                                    onClick={() => onSignOut(r.id)}
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    Sign Out
                                                </Button>
                                            )}

                                            {/* Show sign in for signed out requests */}
                                            {!!onSignIn && r.status === 'signed_out' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-[13px] md:text-sm"
                                                    onClick={() => onSignIn(r.id)}
                                                >
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    Sign In
                                                </Button>
                                            )}

                                            {/* Show See Me button for eligible requests */}
                                            {!!onSendComment && !['hostel_signout', 'hostel_signin', 'security_signout', 'security_signin', 'completed'].includes(r.status) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-[13px] md:text-sm"
                                                    onClick={() => handleAction('see_me', r.id)}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    See Me
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-[13px] md:text-sm"
                                                onClick={() => onViewDetails(r)}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>

                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Action Dialog */}
            <Dialog open={actionDialog.isOpen} onOpenChange={(open) => setActionDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type === 'approve'
                                ? 'Approve Exeat Request'
                                : actionDialog.type === 'reject'
                                    ? 'Reject Exeat Request'
                                    : 'Send Comment to Student'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.request && actionDialog.type === 'approve' ? (
                                <>
                                    {getApprovalConfirmationText(
                                        actionDialog.request.status,
                                        `${actionDialog.request.student.fname} ${actionDialog.request.student.lname}`,
                                        actionDialog.request.reason,
                                        actionDialog.request.destination,
                                        Math.ceil(
                                            (new Date(actionDialog.request.return_date).getTime() -
                                                new Date(actionDialog.request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
                                        )
                                    )}
                                    <br />
                                    <span className="font-medium text-green-700">This action cannot be undone.</span>
                                </>
                            ) : actionDialog.request && actionDialog.type === 'reject' ? (
                                <>
                                    {getRejectionConfirmationText(
                                        actionDialog.request.status,
                                        `${actionDialog.request.student.fname} ${actionDialog.request.student.lname}`,
                                        actionDialog.request.reason,
                                        actionDialog.request.destination,
                                        Math.ceil(
                                            (new Date(actionDialog.request.return_date).getTime() -
                                                new Date(actionDialog.request.departure_date).getTime()) / (1000 * 60 * 60 * 24)
                                        )
                                    )}
                                    <br />
                                    <span className="font-medium text-red-700">This action cannot be undone.</span>
                                </>
                            ) : actionDialog.request && actionDialog.type === 'see_me' ? (
                                <>
                                    Send a message to {actionDialog.request.student.fname} {actionDialog.request.student.lname} requesting them to see you.
                                </>
                            ) : (
                                actionDialog.type === 'approve'
                                    ? 'Are you sure you want to approve this exeat request? You can add an optional comment below.'
                                    : actionDialog.type === 'reject'
                                        ? 'Are you sure you want to reject this exeat request? Please provide a reason for rejection.'
                                        : 'Please provide a message for the student.'
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                {actionDialog.type === 'approve'
                                    ? 'Comment (Optional)'
                                    : actionDialog.type === 'reject'
                                        ? 'Reason for Rejection *'
                                        : 'Message for Student *'}
                            </label>
                            <Textarea
                                placeholder={actionDialog.type === 'approve'
                                    ? 'Add any additional notes or conditions...'
                                    : actionDialog.type === 'reject'
                                        ? 'Please provide a reason for rejection...'
                                        : 'Enter your message for the student...'
                                }
                                value={actionDialog.comment}
                                onChange={(e) => setActionDialog(prev => ({ ...prev, comment: e.target.value }))}
                                className="mt-1"
                                rows={3}
                                defaultValue={actionDialog.type === 'see_me' ? "Come to my office to see me" : ""}
                                required={actionDialog.type === 'reject' || actionDialog.type === 'see_me'}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionDialog({ isOpen: false, type: null, requestId: null, comment: '', request: null, isLoading: false })}
                            disabled={actionDialog.isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAction}
                            className={
                                actionDialog.type === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : actionDialog.type === 'reject'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : ''
                            }
                            disabled={actionDialog.isLoading || ((actionDialog.type === 'reject' || actionDialog.type === 'see_me') && !actionDialog.comment.trim())}
                        >
                            {actionDialog.isLoading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                actionDialog.type === 'approve'
                                    ? 'Approve Request'
                                    : actionDialog.type === 'reject'
                                        ? 'Reject Request'
                                        : 'Send Comment'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExeatRequestsTable;


