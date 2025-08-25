'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useGetStaffAssignmentsQuery, useGetRolesQuery, useAssignExeatRoleMutation, useUnassignExeatRoleMutation } from '@/lib/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Plus, Search, Filter, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStaffPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);

    const { toast } = useToast();
    const { data: staffAssignments, isLoading: staffLoading } = useGetStaffAssignmentsQuery();
    const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();

    const [assignRole] = useAssignExeatRoleMutation();
    const [unassignRole] = useUnassignExeatRoleMutation();

    // Filter staff assignments
    const filteredAssignments = staffAssignments?.filter(assignment => {
        const matchesSearch = search === '' ||
            assignment.staff_name.toLowerCase().includes(search.toLowerCase()) ||
            assignment.staff_email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || assignment.role_name === roleFilter;
        return matchesSearch && matchesRole;
    }) || [];

    // Get unique roles for filter
    const uniqueRoles = staffAssignments?.reduce((acc, assignment) => {
        if (!acc.includes(assignment.role_name)) {
            acc.push(assignment.role_name);
        }
        return acc;
    }, [] as string[]) || [];

    const handleAssignRole = async () => {
        if (!selectedStaff || !selectedRole) return;

        try {
            await assignRole({ staffId: selectedStaff, exeatRoleId: selectedRole }).unwrap();
            toast({
                title: 'Role Assigned',
                description: 'The role has been successfully assigned to the staff member.',
            });
            setIsAssignDialogOpen(false);
            setSelectedStaff(null);
            setSelectedRole(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.data?.message || 'Failed to assign role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnassignRole = async () => {
        if (!selectedStaff || !selectedRole) return;

        try {
            await unassignRole({ staffId: selectedStaff, exeatRoleId: selectedRole }).unwrap();
            toast({
                title: 'Role Unassigned',
                description: 'The role has been successfully unassigned from the staff member.',
            });
            setIsUnassignDialogOpen(false);
            setSelectedStaff(null);
            setSelectedRole(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.data?.message || 'Failed to unassign role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const openAssignDialog = (staffId: number) => {
        setSelectedStaff(staffId);
        setIsAssignDialogOpen(true);
    };

    const openUnassignDialog = (staffId: number, roleId: number) => {
        setSelectedStaff(staffId);
        setSelectedRole(roleId);
        setIsUnassignDialogOpen(true);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
                    <p className="text-lg text-muted-foreground">
                        Manage staff role assignments and permissions
                    </p>
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add New Staff
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Filters & Search</CardTitle>
                    <CardDescription>
                        Find specific staff members or filter by role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search staff by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {uniqueRoles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span>{filteredAssignments.length} staff members found</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Staff Role Assignments</CardTitle>
                    <CardDescription>
                        Current staff members and their assigned roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {staffLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                                    </div>
                                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No staff members found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAssignments.map((assignment) => (
                                <div
                                    key={`${assignment.staff_id}-${assignment.role_name}`}
                                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Staff Avatar */}
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>

                                    {/* Staff Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg truncate">
                                            {assignment.staff_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {assignment.staff_email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>

                                    {/* Role Badge */}
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        <Shield className="mr-2 h-3 w-3" />
                                        {assignment.role_display_name}
                                    </Badge>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openAssignDialog(assignment.staff_id)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Assign Role
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openUnassignDialog(assignment.staff_id, assignment.role_name === 'dean' ? 1 : 2)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assign Role Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign New Role</DialogTitle>
                        <DialogDescription>
                            Select a role to assign to the staff member
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Select value={selectedRole?.toString() || ''} onValueChange={(value) => setSelectedRole(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles?.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.display_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAssignRole} disabled={!selectedRole}>
                                Assign Role
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Unassign Role Dialog */}
            <Dialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Role Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this role assignment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsUnassignDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleUnassignRole}>
                            Remove Role
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

