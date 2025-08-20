"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, LogOut, LogIn } from 'lucide-react';
import type { StaffExeatRequest } from '@/lib/services/staffApi';

interface ExeatRequestsTableProps {
    requests: StaffExeatRequest[];
    onApprove: (exeat_request_id: number, comment?: string) => Promise<void>;
    onReject: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignOut?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onSignIn?: (exeat_request_id: number, comment?: string) => Promise<void>;
    onViewDetails: (request: StaffExeatRequest) => void;
    userRole: string;
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'approved':
        case 'signed_in':
        case 'completed':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        case 'signed_out':
            return 'outline';
        default:
            return 'default';
    }
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
    onSignOut,
    onSignIn,
    onViewDetails,
}) => {
    const getInitials = (fname: string, lname: string) => `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();
    const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);

    return (
        <div className="rounded-lg border bg-background">
            <Table className="text-[15px] md:text-base">
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted/50">
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Student</TableHead>
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Matric No</TableHead>
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Destination</TableHead>
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Dates</TableHead>
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Duration</TableHead>
                        <TableHead className="whitespace-nowrap text-sm md:text-base">Medical</TableHead>
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
                                <TableCell className="text-muted-foreground">{r.matric_no}</TableCell>
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
                                    <Badge variant={r.is_medical ? 'destructive' : 'secondary'} className="text-[12px] md:text-xs">
                                        {r.is_medical ? 'Yes' : 'No'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(r.status)} className="text-[12px] md:text-xs">
                                        {r.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
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

                                        {!!onSignOut && isApproved && !isSignedOut && (
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

                                        {!!onSignIn && isSignedOut && (
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
    );
};

export default ExeatRequestsTable;


