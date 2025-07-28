"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getProfile } from "@/lib/api";

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
          setProfile(result.data);
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

  const { user, contacts, medicals, academics } = profile;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Name:</strong> {user.fname} {user.lname} <br />
            <strong>Email:</strong> {user.email} <br />
            <strong>Matric Number:</strong> {user.matric_number || "-"} <br />
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Contacts</h3>
            {contacts && contacts.length > 0 ? (
              <ul className="list-disc ml-6">
                {contacts.map((c: any, i: number) => (
                  <li key={i}>{c.type}: {c.value}</li>
                ))}
              </ul>
            ) : (
              <div>No contact info.</div>
            )}
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Medical Records</h3>
            {medicals && medicals.length > 0 ? (
              <ul className="list-disc ml-6">
                {medicals.map((m: any, i: number) => (
                  <li key={i}>{m.condition || m.note || JSON.stringify(m)}</li>
                ))}
              </ul>
            ) : (
              <div>No medical records.</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Academic Records</h3>
            {academics && academics.length > 0 ? (
              <ul className="list-disc ml-6">
                {academics.map((a: any, i: number) => (
                  <li key={i}>{a.programme || a.course || JSON.stringify(a)}</li>
                ))}
              </ul>
            ) : (
              <div>No academic records.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 