"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';
import { FileText, LogOut, LogIn, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import type { StaffExeatRequest } from '@/lib/services/staffApi';

interface ExeatRequestsTableProps {
    requests: StaffExeatRequest[];
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignOut?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignIn?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onViewDetails: (request: StaffExeatRequest) => void;
}

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
    return 'Unknown';
};

const formatDate = (dateStr: string) => {
    try {
        return format(new Date(dateStr), 'PP');
    } catch {
        return dateStr;
    }
};

export const ExeatRequestsTable: React.FC<ExeatRequestsTableProps> = ({
    requests,
    onApprove,
    onReject,
    onSignOut,
    onSignIn,
    onViewDetails,
}) => {
    const getInitials = (fname: string, lname: string) => `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();
    const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);
    const [actionDialog, setActionDialog] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
        requestId: number | null;
        comment: string;
    }>({
        isOpen: false,
        type: null,
        requestId: null,
        comment: '',
    });

    const handleAction = (type: 'approve' | 'reject', requestId: number) => {
        setActionDialog({
            isOpen: true,
            type,
            requestId,
            comment: '',
        });
    };

    const submitAction = async () => {
        if (!actionDialog.requestId || !actionDialog.type) return;

        try {
            if (actionDialog.type === 'approve') {
                await onApprove(actionDialog.requestId, actionDialog.comment || undefined);
            } else {
                await onReject(actionDialog.requestId, actionDialog.comment || undefined);
            }
            setActionDialog({ isOpen: false, type: null, requestId: null, comment: '' });
        } catch (error) {
            console.error('Error processing action:', error);
        }
    };

    return (
        <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {requests.map((r) => {
                    const isApproved = r.status === 'approved';
                    const isSignedOut = r.status === 'signed_out';
                    const durationDays = Math.max(
                        1,
                        Math.ceil(
                            (new Date(r.return_date).getTime() - new Date(r.departure_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                    );

                    const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';

                    return (
                        <Card key={r.id} className="p-4 space-y-4">
                            {/* Header with Student Info */}
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                    <AvatarFallback>{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">
                                        {r.student.fname} {r.student.lname}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-mono">{r.matric_no}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-lg">{getCategoryIcon(r.category_id || 0, Boolean(r.is_medical))}</span>
                                        <Badge variant="outline" className="text-xs px-2 py-1">
                                            {getCategoryName(r.category_id || 0, Boolean(r.is_medical))}
                                        </Badge>
                                    </div>
                                </div>
                                <StatusPill status={r.status} size="sm" />
                            </div>

                            {/* Request Details */}
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Reason</h4>
                                    <p className="text-sm">{r.reason}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Destination</h4>
                                    <p className="text-sm">{r.destination}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Departure</h4>
                                        <p className="text-sm">{formatDate(r.departure_date)}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Return</h4>
                                        <p className="text-sm">{formatDate(r.return_date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Duration</h4>
                                    <p className="text-sm">{durationDays} day{durationDays > 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => onViewDetails(r)}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>

                                {/* Show approve/reject for pending and review statuses */}
                                {(r.status === 'pending' || r.status === 'cmd_review' || r.status === 'deputy-dean_review') && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleAction('approve', r.id)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
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
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleAction('approve', r.id)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
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
                                        className="flex-1"
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
                                        className="flex-1"
                                        onClick={() => onSignIn(r.id)}
                                    >
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Sign In
                                    </Button>
                                )}
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
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Matric No</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Destination</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Dates</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Duration</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Category</TableHead>
                            <TableHead className="whitespace-nowrap text-sm md:text-base">Status</TableHead>
                            <TableHead className="text-right whitespace-nowrap text-sm md:text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((r) => {
                            const isApproved = r.status === 'approved';
                            const isSignedOut = r.status === 'signed_out';
                            const durationDays = Math.max(
                                1,
                                Math.ceil(
                                    (new Date(r.return_date).getTime() - new Date(r.departure_date).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                            );

                            const avatarUrl = r.student.passport ? `data:image/jpeg;base64,${r.student.passport}` : '';

                            return (
                                <TableRow key={r.id} className="align-middle">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3 relative">
                                            <div
                                                className="relative"
                                                onMouseEnter={() => setHoveredAvatar(r.id)}
                                                onMouseLeave={() => setHoveredAvatar(null)}
                                            >
                                                <Avatar className="size-14 cursor-pointer">
                                                    <AvatarImage src={avatarUrl} alt={`${r.student.fname} ${r.student.lname}`} />
                                                    <AvatarFallback>{getInitials(r.student.fname, r.student.lname)}</AvatarFallback>
                                                </Avatar>

                                                {/* Custom Hover Preview */}
                                                {hoveredAvatar === r.id && (
                                                    <div className="absolute left-12 top-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[140px]">
                                                        <div className="text-center">
                                                            {avatarUrl ? (
                                                                <img
                                                                    src={avatarUrl}
                                                                    alt={`${r.student.fname} ${r.student.lname}`}
                                                                    className="w-32 h-32 rounded-lg object-cover border-2 border-white shadow-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-white shadow-lg">
                                                                    <span className="text-2xl font-bold text-primary">
                                                                        {getInitials(r.student.fname, r.student.lname)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <p className="mt-2 text-sm font-medium text-foreground">
                                                                {r.student.fname} {r.student.lname}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span>{r.student.fname} {r.student.lname}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">{r.matric_no}</TableCell>
                                    <TableCell className="max-w-[18rem] truncate">{r.destination}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                                            <span>{formatDate(r.departure_date)}</span>
                                            <span className="hidden md:inline">—</span>
                                            <span>{formatDate(r.return_date)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{durationDays} day{durationDays > 1 ? 's' : ''}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getCategoryIcon(r.category_id || 0, Boolean(r.is_medical))}</span>
                                            <Badge variant="outline" className="text-xs px-2 py-1">
                                                {getCategoryName(r.category_id || 0, Boolean(r.is_medical))}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusPill status={r.status} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-[13px] md:text-sm"
                                                onClick={() => onViewDetails(r)}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                View
                                            </Button>

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
                            {actionDialog.type === 'approve' ? 'Approve Exeat Request' : 'Reject Exeat Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.type === 'approve'
                                ? 'Are you sure you want to approve this exeat request? You can add an optional comment below.'
                                : 'Are you sure you want to reject this exeat request? Please provide a reason for rejection.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                {actionDialog.type === 'approve' ? 'Comment (Optional)' : 'Reason for Rejection *'}
                            </label>
                            <Textarea
                                placeholder={actionDialog.type === 'approve'
                                    ? 'Add any additional notes or conditions...'
                                    : 'Please provide a reason for rejection...'
                                }
                                value={actionDialog.comment}
                                onChange={(e) => setActionDialog(prev => ({ ...prev, comment: e.target.value }))}
                                className="mt-1"
                                rows={3}
                                required={actionDialog.type === 'reject'}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionDialog({ isOpen: false, type: null, requestId: null, comment: '' })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAction}
                            className={actionDialog.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            disabled={actionDialog.type === 'reject' && !actionDialog.comment.trim()}
                        >
                            {actionDialog.type === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExeatRequestsTable;


