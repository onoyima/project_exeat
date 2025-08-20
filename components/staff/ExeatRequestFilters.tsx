import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Filter,
    Search,
    Calendar,
    User,
    MapPin,
    Clock
} from 'lucide-react';

interface ExeatRequestFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    dateFilter: string;
    setDateFilter: (date: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    onClearFilters: () => void;
    hasRole: (role: string) => boolean;
}

export const ExeatRequestFilters: React.FC<ExeatRequestFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,
    onClearFilters,
    hasRole,
}) => {
    const hasActiveFilters = searchTerm || statusFilter || dateFilter || sortBy !== 'created_at';

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="signed_out">Signed Out</SelectItem>
                                <SelectItem value="signed_in">Signed In</SelectItem>
                                <SelectItem value="cmd_review">CMD Review</SelectItem>
                                <SelectItem value="deputy-dean_review">Deputy Dean Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">This Quarter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Date Created</SelectItem>
                                <SelectItem value="start_date">Start Date</SelectItem>
                                <SelectItem value="end_date">End Date</SelectItem>
                                <SelectItem value="student_name">Student Name</SelectItem>
                                <SelectItem value="destination">Destination</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Search className="h-3 w-3" />
                                        {searchTerm}
                                    </Badge>
                                )}
                                {statusFilter && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {statusFilter}
                                    </Badge>
                                )}
                                {dateFilter && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {dateFilter}
                                    </Badge>
                                )}
                                {sortBy !== 'created_at' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {sortBy}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
