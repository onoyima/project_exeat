"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { SelectField } from "./ui/select-field";
import { FormField } from "./ui/form-field"; // ✅ new component
import { createStudentExeatRequest } from "../lib/api";

interface ExeatCategory {
  id: number;
  name: string;
}

interface StudentProfile {
  matric_no: string;
  parent_surname: string;
  parent_othernames: string;
  parent_phone_no: string;
  parent_phone_no_two: string;
  parent_email: string;
  student_accommodation: string;
}

const preferredModes = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "text", label: "Text" },
  { value: "phone_call", label: "Phone Call" },
  { value: "any", label: "Any" },
];

export default function ExeatApplicationForm() {
  const [categories, setCategories] = useState<ExeatCategory[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState({
    category_id: "",
    preferred_mode_of_contact: "",
    reason: "",
    destination: "",
    departure_date: "",
    return_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/lookup/exeat-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));

    fetch("/api/student/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data.profile || null));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await createStudentExeatRequest(form);
      if (!res.success) throw new Error(res.error || "Submission failed");
      setSuccess("Exeat request submitted successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Exeat Application</h2>

      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Matric No">
            <Input value={profile.matric_no} readOnly />
          </FormField>
          <FormField label="Parent Surname">
           <Input
  defaultValue={profile?.parent_surname}
  readOnly
  className="bg-gray-100 cursor-not-allowed text-gray-700"
/>

          </FormField>
          <FormField label="Parent Othernames">
            <Input value={profile.parent_othernames} readOnly />
          </FormField>
          <FormField label="Parent Phone No">
            <Input value={profile.parent_phone_no} readOnly />
          </FormField>
          <FormField label="Parent Phone No 2">
            <Input value={profile.parent_phone_no_two} readOnly />
          </FormField>
          <FormField label="Parent Email">
            <Input value={profile.parent_email} readOnly />
          </FormField>
          <FormField label="Accommodation">
            <Input value={profile.student_accommodation} readOnly />
          </FormField>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Exeat Category">
          <Select
            value={form.category_id}
            onValueChange={(val) => setForm({ ...form, category_id: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>

        <SelectField label="Preferred Mode of Contact">
          <Select
            value={form.preferred_mode_of_contact}
            onValueChange={(val) =>
              setForm({ ...form, preferred_mode_of_contact: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent>
              {preferredModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectField>
      </div>
      <FormField label="Reason">
        <Input
          name="reason"
          value={form.reason}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <FormField label="Destination">
        <Input
          name="destination"
          value={form.destination}
          onChange={handleInputChange}
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Departure Date">
          <Input
            type="date"
            name="departure_date"
            value={form.departure_date}
            onChange={handleInputChange}
            required
          />
        </FormField>

        <FormField label="Return Date">
          <Input
            type="date"
            name="return_date"
            value={form.return_date}
            onChange={handleInputChange}
            required
          />
        </FormField>
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
