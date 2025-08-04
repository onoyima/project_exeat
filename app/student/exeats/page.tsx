'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Stethoscope,
    Palmtree,
    AlertCircle,
    Briefcase,
    Search,
    Calendar,
    MapPin,
    Phone,
} from 'lucide-react';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { getStatusColor, getStatusText } from '@/lib/utils/exeat';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const categories = [
    { id: 1, name: 'Medical', icon: Stethoscope },
    { id: 2, name: 'Casual', icon: Palmtree },
    { id: 3, name: 'Emergency', icon: AlertCircle },
    { id: 4, name: 'Official', icon: Briefcase },
];

const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'cmd_review', label: 'CMD Review' },
    { value: 'deputy-dean_review', label: 'Deputy Dean Review' },
    { value: 'parent_consent', label: 'Parent Consent' },
    { value: 'dean_review', label: 'Dean Review' },
    { value: 'hostel_signin', label: 'Hostel Sign In' },
    { value: 'hostel_signout', label: 'Hostel Sign Out' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
];

export default function ExeatHistory() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data: exeatData, isLoading } = useGetExeatRequestsQuery();
    const exeatRequests = exeatData?.exeat_requests || [];

    // Filter exeat requests
    const filteredRequests = exeatRequests.filter(request => {
        const searchTerm = search.toLowerCase();
        const matchesSearch = search === '' ||
            request.reason.toLowerCase().includes(searchTerm) ||
            request.destination.toLowerCase().includes(searchTerm) ||
            request.matric_no.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || request.category_id === Number(categoryFilter);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort requests
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
            // Get status order based on workflow
            const getStatusOrder = (status: string) => {
                const order = [
                    'pending',
                    'cmd_review',
                    'deputy-dean_review',
                    'parent_consent',
                    'dean_review',
                    'hostel_signin',
                    'hostel_signout',
                    'approved',
                    'rejected'
                ];
                return order.indexOf(status);
            };

            const orderA = getStatusOrder(a.status);
            const orderB = getStatusOrder(b.status);
            return sortOrder === 'desc' ? orderB - orderA : orderA - orderB;
        }
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Exeat History</CardTitle>
                    <CardDescription>
                        View and manage all your exeat requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters and Sorting */}
                    <div className="space-y-4">
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by reason, destination, or matric number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sorting */}
                        <div className="flex items-center gap-4 border-t pt-4">
                            <span className="text-sm font-medium">Sort by:</span>
                            <Select
                                value={sortBy}
                                onValueChange={(value) => setSortBy(value as 'date' | 'status')}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date Created</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortOrder}
                                onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Newest First</SelectItem>
                                    <SelectItem value="asc">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-x-auto mt-4">
                        <Table>
                            <TableHeader className="bg-white sticky top-0">
                                <TableRow>
                                    <TableHead className="w-[200px]">Category</TableHead>
                                    <TableHead className="min-w-[200px]">Reason</TableHead>
                                    <TableHead className="min-w-[150px]">Destination</TableHead>
                                    <TableHead className="min-w-[200px]">Dates</TableHead>
                                    <TableHead className="min-w-[120px]">Contact</TableHead>
                                    <TableHead className="min-w-[120px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : sortedRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No exeat requests found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedRequests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            className="group cursor-pointer hover:bg-accent/50"
                                            onClick={() => router.push(`/student/exeats/${request.id}`)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "p-1.5 rounded-md",
                                                        "bg-primary/5 group-hover:bg-primary/10",
                                                        getStatusColor(request.status)
                                                    )}>
                                                        {request.is_medical || request.category_id === 1 ? (
                                                            <Stethoscope className="h-4 w-4" />
                                                        ) : request.category_id === 2 ? (
                                                            <Palmtree className="h-4 w-4" />
                                                        ) : request.category_id === 3 ? (
                                                            <AlertCircle className="h-4 w-4" />
                                                        ) : (
                                                            <Briefcase className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {request.is_medical ? 'Medical' : request.category_id === 1 ? 'Medical' :
                                                            request.category_id === 2 ? 'Casual' :
                                                                request.category_id === 3 ? 'Emergency' :
                                                                    request.category_id === 4 ? 'Official' : 'Unknown'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <p className="truncate" title={request.reason}>
                                                    {request.reason}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="truncate max-w-[150px]" title={request.destination}>
                                                        {request.destination}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>
                                                        {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="capitalize">
                                                        {request.preferred_mode_of_contact}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("whitespace-nowrap", getStatusColor(request.status))}
                                                >
                                                    {getStatusText(request.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}