'use client';

import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { SelectField } from './ui/select-field';
import { FormField } from './ui/form-field';
import {
  fetchStudentCategories,
  fetchStudentProfile,
  createStudentExeatRequest,
} from '../lib/api';
import type { ExeatCategory, StudentProfile } from '../lib/api';

const preferredModes = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'text', label: 'Text' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'any', label: 'Any' },
];

export default function ExeatApplicationForm() {
  const [categories, setCategories] = useState<ExeatCategory[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState({
    category_id: '',
    preferred_mode_of_contact: '',
    reason: '',
    destination: '',
    departure_date: '',
    return_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchStudentCategories()
      .then((res) => {
        if (!res.success) throw new Error(res.error || 'Failed to fetch categories');
        setCategories(res.data?.categories || []);
      })
      .catch((err: Error) => setCategoriesError(err.message));

    fetchStudentProfile()
      .then((res) => {
        if (!res.success) throw new Error(res.error || 'Failed to fetch profile');
        setProfile(res.data?.profile || null);
      })
      .catch((err: Error) => setProfileError(err.message));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (
      form.departure_date &&
      form.return_date &&
      form.return_date < form.departure_date
    ) {
      setError('Return date cannot be before departure date.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        preferred_mode_of_contact: form.preferred_mode_of_contact as
          | 'whatsapp'
          | 'text'
          | 'phone_call'
          | 'any',
        // Hidden fields: still submitted
        matric_no: profile?.matric_no,
        parent_surname: profile?.parent_surname,
        parent_othernames: profile?.parent_othernames,
        parent_phone_no: profile?.parent_phone_no,
        parent_phone_no_two: profile?.parent_phone_no_two,
        parent_email: profile?.parent_email,
        student_accommodation: profile?.student_accommodation,
      };

      const res = await createStudentExeatRequest(payload);

      if (res.status === 403) {
        setError('You cannot submit a new exeat request until your previous one is completed.');
      } else if (!res.success) {
        setError(res.error || 'Submission failed.');
      } else {
        setSuccess('Exeat request submitted successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (categoriesError || profileError) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded">
        {categoriesError && <div>Category Error: {categoriesError}</div>}
        {profileError && <div>Profile Error: {profileError}</div>}
      </div>
    );
  }

  if (!categories.length || !profile) {
    return <div className="text-gray-500 p-4">Loading form data...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto overflow-y-auto max-h-[90vh]"
    >
      <h2 className="text-2xl font-bold mb-4">Exeat Application</h2>

      {success && (
        <div className="p-3 bg-green-100 text-green-800 rounded">{success}</div>
      )}
      {error && <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      {/* Hidden inputs: not shown but submitted */}
      <input type="hidden" name="matric_no" value={profile.matric_no} />
      <input type="hidden" name="parent_surname" value={profile.parent_surname} />
      <input type="hidden" name="parent_othernames" value={profile.parent_othernames} />
      <input type="hidden" name="parent_phone_no" value={profile.parent_phone_no} />
      <input type="hidden" name="parent_phone_no_two" value={profile.parent_phone_no_two} />
      <input type="hidden" name="parent_email" value={profile.parent_email} />
      <input type="hidden" name="student_accommodation" value={profile.student_accommodation} />

      {/* Only showing necessary form fields to user */}
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
              <SelectValue placeholder="Select contact mode" />
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

      <FormField label="Reason for Exeat">
        <Input
          name="reason"
          value={form.reason}
          onChange={handleInputChange}
          required
          disabled={formDisabled}
        />
      </FormField>

      <FormField label="Destination">
        <Input
          name="destination"
          value={form.destination}
          onChange={handleInputChange}
          required
          disabled={formDisabled}
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
            disabled={formDisabled}
          />
        </FormField>
        <FormField label="Return Date">
          <Input
            type="date"
            name="return_date"
            value={form.return_date}
            onChange={handleInputChange}
            required
            disabled={formDisabled}
          />
        </FormField>
      </div>

      <Button type="submit" disabled={loading || formDisabled} className="w-full">
        {loading ? 'Submitting...' : 'Submit Exeat Request'}
      </Button>
    </form>
  );
}
