"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { getExeatRoles, assignExeatRoleToStaff, getStaffList, getExeatRoleAssignments } from "@/lib/api";
import { unassignExeatRoleFromStaff } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";

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
  const [unassigning, setUnassigning] = useState<{[key:string]:boolean}>({});
  const [unassignError, setUnassignError] = useState("");

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
    async function fetchHistory() {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const res = await getExeatRoleAssignments();
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data.history)) {
          setAssignmentHistory(res.data.history);
        } else {
          setHistoryError("Failed to load assignment history");
        }
      } catch (e) {
        if (isMounted) setHistoryError("Failed to load assignment history");
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [assignSuccess]);

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
      } else {
        setAssignError(result.error || "Failed to assign role.");
      }
    } catch (e) {
      setAssignError("Failed to assign role.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassignRole(staffEmail: string, roleName: string) {
    setUnassignError("");
    setUnassigning(u => ({...u, [staffEmail+roleName]: true}));
    try {
      const staff = staffList.find((s: Staff) => s.email === staffEmail);
      const role = exeatRoles.find((r: ExeatRole) => r.name === roleName);
      if (!staff || !role) throw new Error("Staff or role not found");
      const result = await unassignExeatRoleFromStaff(staff.id, role.id);
      if (!result.success) throw new Error(result.error || "Failed to unassign role");
      setAssignSuccess("Role unassigned successfully.");
    } catch (e: any) {
      setUnassignError(e.message || "Failed to unassign role.");
    } finally {
      setUnassigning(u => ({...u, [staffEmail+roleName]: false}));
    }
  }

  if (loading) return (
    <div className="p-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      <p className="mt-4 text-lg font-medium">Loading data...</p>
    </div>
  );

  if (error) return (
    <Alert variant="destructive" className="m-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error}
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 font-inter">
      <Card className="p-6 shadow-lg rounded-xl bg-white border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Assign Exeat Role to Staff</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="flex flex-col w-full md:w-1/2">
            <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={assigning}>
              <SelectTrigger className="min-w-[200px]"> <SelectValue placeholder="Select Staff" /> </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 sticky top-0 bg-white z-10">
                  <input
                    type="text"
                    placeholder="Search staff..."
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    disabled={assigning}
                  />
                </div>
                {staffList.filter((staff: any) => {
                  const search = staffSearch.toLowerCase();
                  return (
                    (staff.fname && staff.fname.toLowerCase().includes(search)) ||
                    (staff.lname && staff.lname.toLowerCase().includes(search)) ||
                    (staff.middle_name && staff.middle_name.toLowerCase().includes(search)) ||
                    (`${staff.fname} ${staff.lname}`.toLowerCase().includes(search))
                  );
                }).map((staff: any) => (
                  <SelectItem key={staff.id} value={String(staff.id)}>
                    {staff.fname} {staff.middle_name ? staff.middle_name + ' ' : ''}{staff.lname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={assigning}>
              <SelectTrigger className="min-w-[200px]"> <SelectValue placeholder="Select Exeat Role" /> </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 sticky top-0 bg-white z-10">
                  <input
                    type="text"
                    placeholder="Search role..."
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={roleSearch}
                    onChange={e => setRoleSearch(e.target.value)}
                    disabled={assigning}
                  />
                </div>
                {exeatRoles.filter((role: any) =>
                  (role.display_name || role.name).toLowerCase().includes(roleSearch.toLowerCase())
                ).map((role: any) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.display_name || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-md"
            onClick={handleAssignRole}
            disabled={!selectedStaff || !selectedRole || assigning}
          >
            {assigning ? "Assigning..." : "Assign Role"}
          </button>
        </div>
        {assignError && <div className="text-red-600 mt-2">{assignError}</div>}
        {assignSuccess && <div className="text-green-600 mt-2">{assignSuccess}</div>}
      </Card>
      {/* Assignment History Card */}
      <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-green-800">Assignment History</h3>
        {historyLoading ? (
          <div>Loading assignment history...</div>
        ) : historyError ? (
          <div className="text-red-600">{historyError}</div>
        ) : assignmentHistory.length === 0 ? (
          <div className="text-gray-500">No assignments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignmentHistory.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{item.staff_name || item.staff_email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{item.role_display_name || item.role_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{item.assigned_at}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        disabled={unassigning[item.staff_email+item.role_name]}
                        onClick={() => handleUnassignRole(item.staff_email, item.role_name)}
                      >
                        {unassigning[item.staff_email+item.role_name] ? "Unassigning..." : "Unassign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {/* Exeat Roles Table Card */}
      <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-green-800">All Exeat Roles</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exeatRoles.map((role: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{role.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{role.display_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{role.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {unassignError && (
  <div className="text-red-600 mt-2">{unassignError}</div>
)}
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