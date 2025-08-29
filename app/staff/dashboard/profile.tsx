"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getProfile } from "@/lib/api";
import { extractRoleName } from "@/lib/utils/csrf";

export default function StaffProfilePage() {
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

  const { user, contacts, positions, workProfiles } = profile;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Name:</strong> {user.fname} {user.lname} <br />
            <strong>Email:</strong> {user.email} <br />
            <strong>Title:</strong> {user.title || "-"} <br />
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
            <h3 className="font-semibold mb-2">Positions</h3>
            {positions && positions.length > 0 ? (
              <ul className="list-disc ml-6">
                {positions.map((p: any, i: number) => (
                  <li key={i}>{p.position || JSON.stringify(p)}</li>
                ))}
              </ul>
            ) : (
              <div>No positions.</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Work Profiles</h3>
            {workProfiles && workProfiles.length > 0 ? (
              <ul className="list-disc ml-6">
                {workProfiles.map((w: any, i: number) => (
                  <li key={i}>{w.department || extractRoleName(w.role) || JSON.stringify(w)}</li>
                ))}
              </ul>
            ) : (
              <div>No work profiles.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 