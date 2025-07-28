"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getProfile } from "@/lib/api";
import { User, Mail, IdCard, Phone, ClipboardList, GraduationCap, Edit } from "lucide-react";
import Image from "next/image";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <Alert variant="destructive">{error}</Alert>;
  if (!profile) return null;

  const { personal, academic, medical, sponsor_contact } = profile;
  const initials = personal.first_name?.[0]?.toUpperCase() + (personal.last_name?.[0]?.toUpperCase() || "");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Card */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-6 shadow-lg rounded-xl">
        <div className="flex-shrink-0">
          {/* Avatar: Use passport if available, else initials */}
          {personal.extras?.passport ? (
            <Image src={`data:image/jpeg;base64,${personal.extras.passport}`} alt="Avatar" width={96} height={96} className="rounded-full border-2 border-primary object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-700 border-2 border-primary">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold">{personal.first_name} {personal.last_name}</span>
            {personal.title && <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{personal.title}</span>}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{personal.contact?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <IdCard className="w-4 h-4" />
            <span>Matric No: {academic?.matric_no || <span className="text-gray-400">-</span>}</span>
          </div>
          <button className="mt-2 px-4 py-1 bg-primary text-white rounded flex items-center gap-1 hover:bg-primary/90 transition text-sm font-medium">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </Card>
      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sponsor/Contact */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Sponsor/Contact</h3>
          </div>
          {sponsor_contact ? (
            <ul className="space-y-1">
              <li><span className="font-medium">Name:</span> {sponsor_contact.full_name}</li>
              <li><span className="font-medium">Relationship:</span> {sponsor_contact.relationship}</li>
              <li><span className="font-medium">Phone:</span> {sponsor_contact.phone_no}</li>
              <li><span className="font-medium">Email:</span> {sponsor_contact.email}</li>
              <li><span className="font-medium">Address:</span> {sponsor_contact.address}</li>
              <li><span className="font-medium">City/State:</span> {sponsor_contact.city}, {sponsor_contact.state}</li>
            </ul>
          ) : (
            <div className="text-gray-400">No sponsor/contact info.</div>
          )}
        </Card>
        {/* Medical Records */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Medical Records</h3>
          </div>
          {medical ? (
            <ul className="space-y-1">
              <li><span className="font-medium">Physical:</span> {medical.physical || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Blood Group:</span> {medical.blood_group || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Genotype:</span> {medical.genotype || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Condition:</span> {medical.condition || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Allergies:</span> {medical.allergies || <span className="text-gray-400">-</span>}</li>
            </ul>
          ) : (
            <div className="text-gray-400">No medical records.</div>
          )}
        </Card>
        {/* Academic Records */}
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Academic Records</h3>
          </div>
          {academic ? (
            <ul className="space-y-1">
              <li><span className="font-medium">Course of Study:</span> {academic.course_study_id || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Level:</span> {academic.level || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Faculty:</span> {academic.faculty_id || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Department:</span> {academic.department_id || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Session:</span> {academic.academic_session_id || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Admission Type:</span> {academic.admissions_type_id || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">JAMB No:</span> {academic.jamb_no || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">JAMB Score:</span> {academic.jamb_score || <span className="text-gray-400">-</span>}</li>
              <li><span className="font-medium">Studentship:</span> {academic.studentship || <span className="text-gray-400">-</span>}</li>
            </ul>
          ) : (
            <div className="text-gray-400">No academic records.</div>
          )}
        </Card>
      </div>
    </div>
  );
}