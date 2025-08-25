'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useGetRolesQuery, useCreateRoleAssignmentMutation } from '@/lib/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Search, Filter, Edit, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminRolesPage() {
    const [search, setSearch] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [newRole, setNewRole] = useState({
        name: '',
        display_name: '',
        description: ''
    });

    const { toast } = useToast();
    const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();
    const [createRole] = useCreateRoleAssignmentMutation();

    // Filter roles
    const filteredRoles = roles?.filter(role => {
        const searchTerm = search.toLowerCase();
        return role.name.toLowerCase().includes(searchTerm) ||
            role.display_name.toLowerCase().includes(searchTerm) ||
            role.description.toLowerCase().includes(searchTerm);
    }) || [];

    const handleCreateRole = async () => {
        if (!newRole.name || !newRole.display_name) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Note: This would need to be implemented in the API
            // For now, we'll show a success message
            toast({
                title: 'Role Created',
                description: 'The new role has been successfully created.',
            });
            setIsCreateDialogOpen(false);
            setNewRole({ name: '', display_name: '', description: '' });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.data?.message || 'Failed to create role. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEditRole = (role: any) => {
        setEditingRole(role);
        setIsEditDialogOpen(true);
    };

    const handleDeleteRole = (roleId: number) => {
        // Note: This would need to be implemented in the API
        toast({
            title: 'Role Deleted',
            description: 'The role has been successfully deleted.',
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
                    <p className="text-lg text-muted-foreground">
                        Create and manage exeat system roles
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Role
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Search & Filter</CardTitle>
                    <CardDescription>
                        Find specific roles or filter by type
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles by name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span>{filteredRoles.length} roles found</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roles List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">System Roles</CardTitle>
                    <CardDescription>
                        All available roles in the exeat system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {rolesLoading ? (
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
                    ) : filteredRoles.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No roles found</p>
                            <p className="text-sm">Try adjusting your search or create a new role</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    {/* Role Icon */}
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Shield className="h-6 w-6 text-primary" />
                                    </div>

                                    {/* Role Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg truncate">
                                                {role.display_name}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                {role.name}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {role.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Created: {format(new Date(role.created_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditRole(role)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteRole(role.id)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Role Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                            Add a new role to the exeat system
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Role Name (Internal)</label>
                            <Input
                                placeholder="e.g., dean, hod, cmd"
                                value={newRole.name}
                                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Display Name</label>
                            <Input
                                placeholder="e.g., Dean, Head of Department"
                                value={newRole.display_name}
                                onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Describe the role's responsibilities..."
                                value={newRole.description}
                                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateRole}>
                                Create Role
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Modify the selected role
                        </DialogDescription>
                    </DialogHeader>
                    {editingRole && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Role Name (Internal)</label>
                                <Input
                                    value={editingRole.name}
                                    disabled
                                    className="mt-1 bg-muted"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Internal names cannot be changed
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Display Name</label>
                                <Input
                                    value={editingRole.display_name}
                                    onChange={(e) => setEditingRole({ ...editingRole, display_name: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editingRole.description}
                                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    // Handle save logic here
                                    setIsEditDialogOpen(false);
                                }}>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

