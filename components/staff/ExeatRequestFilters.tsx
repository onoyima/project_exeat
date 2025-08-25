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
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    onClearFilters: () => void;
}

export const ExeatRequestFilters: React.FC<ExeatRequestFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter,
    onClearFilters,
}) => {
    const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || categoryFilter !== 'all';

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
                                placeholder="Search by name, matric no, destination..."
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

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="official">Official</SelectItem>
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
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Search className="h-4 w-4" />
                                        {searchTerm}
                                    </Badge>
                                )}
                                {statusFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {statusFilter}
                                    </Badge>
                                )}
                                {categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {categoryFilter}
                                    </Badge>
                                )}
                                {dateFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {dateFilter}
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
