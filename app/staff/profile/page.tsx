"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getProfile } from "@/lib/api"; // Assuming getProfile handles both staff and student types
import { getExeatRoles, assignExeatRoleToStaff } from "@/lib/api";
import { extractRoleName } from "@/lib/utils/csrf";
import { User, Mail, Phone, Briefcase, Users, Edit, Building2, CalendarDays } from "lucide-react";
import Image from "next/image";

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exeatRoles, setExeatRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const result = await getProfile();
        if (result.success) {
          setProfile(result.data.profile);
        } else {
          setError(result.error || "Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchRoles() {
      const result = await getExeatRoles();
      if (result.success && result.data && Array.isArray(result.data.roles)) {
        setExeatRoles(result.data.roles);
      }
    }
    fetchRoles();
  }, []);

  async function handleAssignRole() {
    setAssigning(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      const staffId = profile.personal.id;
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

  if (loading) return <div className="p-8 text-center text-lg font-medium">Loading staff profile...</div>;
  if (error) return <Alert variant="destructive" className="m-8">Error: {error}</Alert>;
  if (!profile) return <div className="p-8 text-center text-lg font-medium text-gray-500">No staff profile data available.</div>;

  const { personal, contacts, work_profiles } = profile;
  const initials = personal.first_name?.[0]?.toUpperCase() + (personal.last_name?.[0]?.toUpperCase() || "");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-inter">
      {/* Profile Card */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-6 shadow-lg rounded-xl bg-white border border-gray-200">
        <div className="flex-shrink-0">
          {/* Avatar: Use passport if available, else initials */}
          {personal.extras?.passport ? (
            <Image
              src={`data:image/jpeg;base64,${personal.extras.passport}`}
              alt="Staff Avatar"
              width={96}
              height={96}
              className="rounded-full border-2 border-blue-500 object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 border-2 border-blue-500 shadow-md">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">{personal.title} {personal.first_name} {personal.middle_name ? personal.middle_name + ' ' : ''}{personal.last_name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{personal.contact?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{personal.contact?.phone || <span className="text-gray-400">-</span>}</span>
          </div>
          <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 text-base font-medium shadow-md">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </Card>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Assigned Exeat Roles */}
        <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200 md:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Briefcase className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">Assigned Exeat Roles</h3>
          </div>
          {personal.exeat_roles && personal.exeat_roles.length > 0 ? (
            <ul className="list-disc pl-5">
              {personal.exeat_roles.map((role: any) => (
                <li key={role.id} className="mb-1">
                  <span className="font-medium text-gray-800">{extractRoleName(role)}</span>
                  {role.description && <span className="text-gray-500 ml-2">- {role.description}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No roles assigned.</div>
          )}
        </Card>
        {/* Personal Details */}
        <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Personal Details</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li><span className="font-medium">Gender:</span> {personal.gender || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Date of Birth:</span> {personal.dob || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Marital Status:</span> {personal.marital_status || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Religion:</span> {personal.religion || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Address:</span> {personal.contact?.address || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">City:</span> {personal.nationality?.city || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">LGA:</span> {personal.nationality?.lga_name || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Nationality:</span> {personal.nationality?.country_id || <span className="text-gray-400">-</span>}</li>
            <li><span className="font-medium">Status:</span> {personal.extras?.status || <span className="text-gray-400">-</span>}</li>
          </ul>
        </Card>

        {/* Work Profiles */}
        <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Work Profiles</h3>
          </div>
          {work_profiles && work_profiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Number</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    {/* <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th> */}
                    {/* <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {work_profiles.map((workProfile: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{workProfile.staff_no || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{workProfile.department || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{workProfile.grade || '-'}</td>
                      {/* <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{workProfile.start_date || '-'}</td> */}
                      {/* <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{workProfile.end_date || '-'}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400">No work profiles found.</div>
          )}
        </Card>

        {/* Contacts (e.g., Emergency Contacts) */}
        <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200 md:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Other Contacts</h3>
          </div>
          {contacts && contacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contact.name || (contact.surname && contact.other_names ? `${contact.surname} ${contact.other_names}` : '-')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contact.relationship || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contact.phone_no || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contact.email || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contact.address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400">No additional contacts found.</div>
          )}
        </Card>
      </div>
      {/* Exeat Role  */}
      <Card className="p-6 shadow-md rounded-xl bg-white border border-gray-200 md:col-span-2">
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Assign Exeat Role I have been assigned</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">

        </div>
      </Card>
    </div>
  );
}
