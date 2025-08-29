"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle, Search, UserPlus, Users, Shield, Trash2, Loader2, X } from "lucide-react";
import { getExeatRoles, assignExeatRoleToStaff, getStaffList, getExeatRoleAssignments } from "@/lib/api";
import { unassignExeatRoleFromStaff } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { extractRoleName } from "@/lib/utils/csrf";

// Custom debounced hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AssignExeatRolePage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [exeatRoles, setExeatRoles] = useState<ExeatRole[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [unassigning, setUnassigning] = useState<{ [key: string]: boolean }>({});
  const [unassignError, setUnassignError] = useState("");

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [roleToUnassign, setRoleToUnassign] = useState<{ staffEmail: string; roleName: string; staffName: string } | null>(null);

  // Refs for managing focus
  const staffSearchRef = useRef<HTMLInputElement>(null);
  const roleSearchRef = useRef<HTMLInputElement>(null);

  // Toast hook
  const { toast } = useToast();

  // Use debounced values to prevent focus loss during typing (300ms delay)
  const debouncedStaffSearch = useDebouncedValue(staffSearch, 300);
  const debouncedRoleSearch = useDebouncedValue(roleSearch, 300);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [staffRes, rolesRes] = await Promise.all([
          getStaffList(),
          getExeatRoles()
        ]);
        if (!isMounted) return;
        if (staffRes.success && Array.isArray(staffRes.data.staff)) {
          setStaffList(staffRes.data.staff);
        } else {
          setError("Failed to load staff list");
        }
        if (rolesRes.success && Array.isArray(rolesRes.data.roles)) {
          setExeatRoles(rolesRes.data.roles);
        } else {
          setError(rolesRes.error || "Failed to load exeat roles");
        }
      } catch (e) {
        if (isMounted) setError("Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  async function handleAssignRole() {
    setAssigning(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      const staffId = Number(selectedStaff);
      const roleId = Number(selectedRole);
      const result = await assignExeatRoleToStaff(staffId, roleId);
      if (result.success) {
        setAssignSuccess("Role assigned successfully.");
        setSelectedStaff("");
        setSelectedRole("");
        setStaffSearch("");
        setRoleSearch("");

        // Show success toast
        toast({
          title: "Role Assigned Successfully",
          description: `Role has been assigned to the staff member.`,
          variant: "success",
        });
      } else {
        setAssignError(result.error || "Failed to assign role.");

        // Show error toast
        toast({
          title: "Assignment Failed",
          description: result.error || "Failed to assign role.",
          variant: "destructive",
        });
      }
    } catch (e) {
      setAssignError("Failed to assign role.");

      // Show error toast
      toast({
        title: "Assignment Failed",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  }

  // Function to show confirmation dialog
  function handleUnassignClick(staffEmail: string, roleName: string, staffName: string) {
    setRoleToUnassign({ staffEmail, roleName, staffName });
    setConfirmDialogOpen(true);
  }

  // Function to handle actual unassignment after confirmation
  async function handleConfirmUnassign() {
    if (!roleToUnassign) return;

    const { staffEmail, roleName } = roleToUnassign;
    setConfirmDialogOpen(false);
    setUnassignError("");
    setUnassigning(u => ({ ...u, [staffEmail + roleName]: true }));

    try {
      const staff = staffList.find((s: Staff) => s.email === staffEmail);
      const role = exeatRoles.find((r: ExeatRole) => r.name === roleName);
      if (!staff || !role) throw new Error("Staff or role not found");

      const result = await unassignExeatRoleFromStaff(staff.id, role.id);
      if (!result.success) throw new Error(result.error || "Failed to unassign role");

      setAssignSuccess("Role unassigned successfully.");

      // Show success toast
      toast({
        title: "Role Removed Successfully",
        description: `Role "${roleName}" has been removed from ${roleToUnassign.staffName}.`,
        variant: "success",
      });

      // Refresh assignment history
      fetchHistory();

    } catch (e: any) {
      setUnassignError(e.message || "Failed to unassign role.");

      // Show error toast
      toast({
        title: "Removal Failed",
        description: e.message || "Failed to unassign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnassigning(u => ({ ...u, [staffEmail + roleName]: false }));
      setRoleToUnassign(null);
    }
  }

  // Function to fetch history (extracted for reuse)
  async function fetchHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await getExeatRoleAssignments();
      if (res.success && Array.isArray(res.data.history)) {
        setAssignmentHistory(res.data.history);
      } else {
        setHistoryError("Failed to load assignment history");
      }
    } catch (e) {
      setHistoryError("Failed to load assignment history");
    } finally {
      setHistoryLoading(false);
    }
  }

  if (loading) return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>

      {/* Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Assign and manage exeat roles for staff members
        </p>
      </div>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Exeat Role
          </CardTitle>
          <CardDescription>
            Select a staff member and assign them an exeat role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Staff Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Staff Member</label>
              <div className="relative">
                <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={assigning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent key="staff-select-content">
                    <div className="px-3 py-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={staffSearchRef}
                          key="staff-search-input"
                          placeholder="Search staff..."
                          value={staffSearch}
                          onChange={(e) => {
                            setStaffSearch(e.target.value);
                            // Maintain focus after state update
                            setTimeout(() => staffSearchRef.current?.focus(), 0);
                          }}
                          className={`pl-8 pr-8 ${staffSearch !== debouncedStaffSearch ? 'border-blue-400' : ''}`}
                          disabled={assigning}
                        />
                        {debouncedStaffSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => setStaffSearch('')}
                            disabled={assigning}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {staffList
                        .filter((staff: any) => {
                          const search = debouncedStaffSearch.toLowerCase();
                          return (
                            (staff.fname && staff.fname.toLowerCase().includes(search)) ||
                            (staff.lname && staff.lname.toLowerCase().includes(search)) ||
                            (staff.middle_name && staff.middle_name.toLowerCase().includes(search)) ||
                            (`${staff.fname} ${staff.lname}`.toLowerCase().includes(search))
                          );
                        })
                        .map((staff: any) => (
                          <SelectItem key={staff.id} value={String(staff.id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {staff.fname} {staff.middle_name ? staff.middle_name + ' ' : ''}{staff.lname}
                              </span>
                              <span className="text-xs text-muted-foreground">{staff.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exeat Role</label>
              <div className="relative">
                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={assigning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent key="role-select-content">
                    <div className="px-3 py-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={roleSearchRef}
                          key="role-search-input"
                          placeholder="Search roles..."
                          value={roleSearch}
                          onChange={(e) => {
                            setRoleSearch(e.target.value);
                            // Maintain focus after state update
                            setTimeout(() => roleSearchRef.current?.focus(), 0);
                          }}
                          className={`pl-8 pr-8 ${roleSearch !== debouncedRoleSearch ? 'border-blue-400' : ''}`}
                          disabled={assigning}
                        />
                        {debouncedRoleSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
                            onClick={() => setRoleSearch('')}
                            disabled={assigning}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {exeatRoles
                        .filter((role: any) =>
                          extractRoleName(role).toLowerCase().includes(debouncedRoleSearch.toLowerCase())
                        )
                        .map((role: any) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{extractRoleName(role)}</span>
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign Button */}
            <div className="flex items-end">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedStaff || !selectedRole || assigning}
                className="w-full"
                size="lg"
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Role
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {assignError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{assignError}</AlertDescription>
            </Alert>
          )}

          {assignSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">{assignSuccess}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment History
          </CardTitle>
          <CardDescription>
            View and manage current role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : historyError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load History</AlertTitle>
              <AlertDescription>{historyError}</AlertDescription>
            </Alert>
          ) : assignmentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No assignments found</p>
              <p className="text-sm">Staff members will appear here once roles are assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {assignmentHistory.map((item: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.staff_name || item.staff_email}</p>
                        <p className="text-sm text-muted-foreground">{item.staff_email}</p>
                      </div>
                      <Badge variant="secondary">
                        {extractRoleName(item)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Assigned: {item.assigned_at}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unassigning[item.staff_email + extractRoleName(item)]}
                        onClick={() => handleUnassignClick(item.staff_email, extractRoleName(item), item.staff_name || item.staff_email)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {unassigning[item.staff_email + extractRoleName(item)] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentHistory.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.staff_name || item.staff_email}</p>
                            <p className="text-sm text-muted-foreground">{item.staff_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {extractRoleName(item)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.assigned_at}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={unassigning[item.staff_email + extractRoleName(item)]}
                            onClick={() => handleUnassignClick(item.staff_email, extractRoleName(item), item.staff_name || item.staff_email)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {unassigning[item.staff_email + extractRoleName(item)] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Available Exeat Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Available Exeat Roles
          </CardTitle>
          <CardDescription>
            Overview of all system roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exeatRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No roles available</p>
              <p className="text-sm">Roles will be displayed here once created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {exeatRoles.map((role: any) => (
                  <Card key={role.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{extractRoleName(role)}</h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {extractRoleName(role)}
                        </Badge>
                      </div>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exeatRoles.map((role: any) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Badge variant="outline">{extractRoleName(role)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {extractRoleName(role)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert for Unassignment */}
      {unassignError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Remove Role</AlertTitle>
          <AlertDescription>{unassignError}</AlertDescription>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the <strong>"{roleToUnassign?.roleName}"</strong> role from{" "}
              <strong>{roleToUnassign?.staffName}</strong>?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoleToUnassign(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnassign}
              className="bg-red-600 hover:bg-red-700"
              disabled={roleToUnassign ? unassigning[roleToUnassign.staffEmail + roleToUnassign.roleName] : false}
            >
              {roleToUnassign && unassigning[roleToUnassign.staffEmail + roleToUnassign.roleName] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Role
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Define types for staff and role
interface Staff {
  id: number;
  fname: string;
  lname: string;
  middle_name?: string;
  email: string;
  status?: string;
}
interface ExeatRole {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

// Update usages of 'any' for staff and role in map/filter/find
// Example:
// staffList.filter((staff: Staff) => ...)
// staffList.find((s: Staff) => ...)
// exeatRoles.find((r: ExeatRole) => ...)