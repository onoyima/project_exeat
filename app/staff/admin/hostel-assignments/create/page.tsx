'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetHostelAssignmentOptionsQuery, useCreateHostelAssignmentMutation, useGetStaffListQuery } from '@/lib/services/adminApi';
import { Building2, User, ArrowLeft, Save, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

export default function CreateHostelAssignmentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        vuna_accomodation_id: '',
        staff_id: '',
        auto_assign_role: false,
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search states
    const [hostelSearch, setHostelSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');

    // Refs for managing focus
    const hostelSearchRef = useRef<HTMLInputElement>(null);
    const staffSearchRef = useRef<HTMLInputElement>(null);

    // Use debounced values to prevent focus loss during typing (300ms delay)
    const debouncedHostelSearch = useDebouncedValue(hostelSearch, 300);
    const debouncedStaffSearch = useDebouncedValue(staffSearch, 300);

    const { data: options, isLoading: optionsLoading } = useGetHostelAssignmentOptionsQuery({
        per_page: 100,
        page: 1,
    });

    const { data: staffList, isLoading: staffListLoading } = useGetStaffListQuery();

    const [createAssignment] = useCreateHostelAssignmentMutation();

    const hostels = options?.hostels?.data || [];
    
    // Process staff list from the same endpoint as assign-exeat-role
    const staff = staffList ? staffList.map(staff => ({
        id: staff.id,
        fname: staff.fname,
        lname: staff.lname,
        middle_name: staff.middle_name,
        email: staff.email
    })) : [];

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vuna_accomodation_id || !formData.staff_id) {
            toast({
                title: "Validation Error",
                description: "Please select both a hostel and staff member.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createAssignment({
                vuna_accomodation_id: parseInt(formData.vuna_accomodation_id),
                staff_id: parseInt(formData.staff_id),
                auto_assign_role: formData.auto_assign_role,
                notes: formData.notes || undefined,
            }).unwrap();

            toast({
                title: "Success",
                description: response.message || "Hostel assignment created successfully.",
            });

            router.push('/staff/admin/hostel-assignments');
        } catch (error: any) {
            console.error('Error creating assignment:', error);
            toast({
                title: "Error",
                description: error?.data?.message || "Failed to create hostel assignment.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedHostel = hostels.find(h => h.id.toString() === formData.vuna_accomodation_id);
    const selectedStaff = staff.find(s => s.id.toString() === formData.staff_id);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/staff/admin/hostel-assignments">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Create Hostel Assignment</h1>
                    <p className="text-muted-foreground mt-1">Assign a staff member to manage a hostel</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Assignment Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Assignment Details
                            </CardTitle>
                            <CardDescription>
                                Select the hostel and staff member for this assignment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Hostel Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="hostel">Hostel *</Label>
                                <Select
                                    value={formData.vuna_accomodation_id}
                                    onValueChange={(value) => handleInputChange('vuna_accomodation_id', value)}
                                    disabled={optionsLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a hostel" />
                                    </SelectTrigger>
                                    <SelectContent key="hostel-select-content">
                                        <div className="px-3 py-2">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    ref={hostelSearchRef}
                                                    key="hostel-search-input"
                                                    placeholder="Search hostels..."
                                                    value={hostelSearch}
                                                    onChange={(e) => {
                                                        setHostelSearch(e.target.value);
                                                        // Maintain focus after state update
                                                        setTimeout(() => hostelSearchRef.current?.focus(), 0);
                                                    }}
                                                    className={`pl-8 pr-8 ${hostelSearch !== debouncedHostelSearch ? 'border-primary' : ''}`}
                                                    disabled={optionsLoading}
                                                />
                                                {debouncedHostelSearch && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
                                                        onClick={() => setHostelSearch('')}
                                                        disabled={optionsLoading}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {hostels
                                                .filter((hostel) => {
                                                    const search = debouncedHostelSearch.toLowerCase();
                                                    return (
                                                        hostel.name.toLowerCase().includes(search) ||
                                                        hostel.gender.toLowerCase().includes(search)
                                                    );
                                                })
                                                .map((hostel) => (
                                                    <SelectItem key={hostel.id} value={hostel.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4" />
                                                            <span>{hostel.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({hostel.gender})
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </div>
                                    </SelectContent>
                                </Select>
                                {optionsLoading && (
                                    <p className="text-sm text-muted-foreground">Loading hostels...</p>
                                )}
                            </div>

                            {/* Staff Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="staff">Staff Member *</Label>
                                <Select
                                    value={formData.staff_id}
                                    onValueChange={(value) => handleInputChange('staff_id', value)}
                                    disabled={optionsLoading || staffListLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a staff member" />
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
                                                    className={`pl-8 pr-8 ${staffSearch !== debouncedStaffSearch ? 'border-primary' : ''}`}
                                                    disabled={optionsLoading || staffListLoading}
                                                />
                                                {debouncedStaffSearch && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
                                                        onClick={() => setStaffSearch('')}
                                                        disabled={optionsLoading || staffListLoading}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {staff
                                                .filter((staffMember) => {
                                                    const search = debouncedStaffSearch.toLowerCase();
                                                    return (
                                                        staffMember.fname.toLowerCase().includes(search) ||
                                                        staffMember.lname.toLowerCase().includes(search) ||
                                                        staffMember.email.toLowerCase().includes(search) ||
                                                        `${staffMember.fname} ${staffMember.lname}`.toLowerCase().includes(search)
                                                    );
                                                })
                                                .map((staffMember) => (
                                                    <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {staffMember.fname} {staffMember.lname}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {staffMember.email}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </div>
                                    </SelectContent>
                                </Select>
                                {(optionsLoading || staffListLoading) && (
                                    <p className="text-sm text-muted-foreground">Loading staff...</p>
                                )}
                            </div>

                            {/* Auto Assign Role */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_assign_role"
                                    checked={formData.auto_assign_role}
                                    onCheckedChange={(checked) => handleInputChange('auto_assign_role', checked as boolean)}
                                />
                                <Label htmlFor="auto_assign_role" className="text-sm">
                                    Automatically assign hostel admin role
                                </Label>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes about this assignment..."
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Preview</CardTitle>
                            <CardDescription>
                                Review the assignment details before creating
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedHostel && selectedStaff ? (
                                <>
                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{selectedHostel.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedHostel.gender} hostel
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {selectedStaff.fname} {selectedStaff.lname}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedStaff.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.auto_assign_role && (
                                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                <strong>Auto-assign:</strong> Hostel admin role will be automatically assigned
                                            </p>
                                        </div>
                                    )}

                                    {formData.notes && (
                                        <div className="p-3 border rounded-lg bg-gray-50">
                                            <p className="text-sm text-gray-800">
                                                <strong>Notes:</strong> {formData.notes}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Building2 className="mx-auto h-12 w-12 mb-2" />
                                    <p>Select a hostel and staff member to see preview</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/staff/admin/hostel-assignments">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !formData.vuna_accomodation_id || !formData.staff_id}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Assignment
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}