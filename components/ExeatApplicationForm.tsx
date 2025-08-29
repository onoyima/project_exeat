'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { FormField } from './ui/form-field';
import { DatePicker } from './ui/date-picker';
import { toast } from '@/hooks/use-toast';
import {
  useGetCategoriesQuery,
  useCreateExeatRequestMutation,
} from '@/lib/services/exeatApi';

const preferredModes = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'text', label: 'Text' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'any', label: 'Any' },
] as const;

const exeatFormSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  preferred_mode_of_contact: z.enum(['whatsapp', 'text', 'phone_call', 'any'], {
    required_error: 'Please select a contact mode',
  }),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  destination: z.string().min(3, 'Please specify your destination'),
  departure_date: z.date({
    required_error: 'Please select a departure date',
  }),
  return_date: z.date({
    required_error: 'Please select a return date',
  }),
}).refine((data) => data.return_date > data.departure_date, {
  message: 'Return date must be after departure date',
  path: ['return_date'],
});

type ExeatFormValues = z.infer<typeof exeatFormSchema>;

interface ExeatApplicationFormProps {
  onSuccess?: () => void;
}

export default function ExeatApplicationForm({ onSuccess }: ExeatApplicationFormProps) {

  const { data: categoriesData, isLoading: loadingCategories, error: categoriesError } = useGetCategoriesQuery();
  const [createExeatRequest, { isLoading: isSubmitting }] = useCreateExeatRequestMutation();

  const form = useForm<ExeatFormValues>({
    resolver: zodResolver(exeatFormSchema),
    defaultValues: {
      category_id: '',
      preferred_mode_of_contact: 'any',
      reason: '',
      destination: '',
    },
    mode: 'onChange',
  });

  // Watch departure date to validate return date
  const watchedDepartureDate = form.watch('departure_date');
  const watchedReturnDate = form.watch('return_date');


  const onSubmit = async (values: ExeatFormValues) => {
    try {

      const payload = {
        ...values,
        category_id: Number(values.category_id),
        departure_date: format(values.departure_date, 'yyyy-MM-dd'),
        return_date: format(values.return_date, 'yyyy-MM-dd'),
        // // Include profile data
        // matric_no: profile.matric_no,
        // parent_surname: profile.parent_surname,
        // parent_othernames: profile.parent_othernames,
        // parent_phone_no: profile.parent_phone_no,
        // parent_phone_no_two: profile.parent_phone_no_two,
        // parent_email: profile.parent_email,
        // student_accommodation: profile.student_accommodation,
      };

      // Call the mutation
      const result = await createExeatRequest(payload).unwrap();
      console.log('result:', result);

      // Show success message and close modal
      toast({
        variant: "success",
        title: "Success",
        description: result.message || "Exeat request submitted successfully.",
        duration: 3000,
      });

      // Reset form and close modal immediately
      form.reset();
      onSuccess?.();
      return;
    } catch (error: any) {
      console.log('Error object:', error);

      // Force immediate toast display
      if (error?.status === 403 && error?.data?.message) {
        toast({
          variant: "destructive",
          title: "Existing Request",
          description: error.data.message,
          duration: 5000, // Show for 5 seconds
        });
        setTimeout(() => onSuccess?.(), 100); // Close modal after a brief delay
        return;
      }

      // Handle other errors
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit exeat request. Please try again.",
        duration: 5000, // Show for 5 seconds
      });
    }
  };

  // Handle loading states
  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Handle API errors
  if (categoriesError) {
    console.error('API Errors:', { categoriesError });
    return (
      <div className="space-y-4">
        {categoriesError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p>Failed to load exeat categories. Please try again later.</p>
            <p className="text-sm mt-2">{categoriesError.toString()}</p>
          </div>
        )}

      </div>
    );
  }

  // Verify data is available
  if (!categoriesData?.categories) {
    console.error('Missing required data:', { categoriesData });
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Unable to load required data. Please refresh the page and try again.</p>
      </div>
    );
  }

  const categories = categoriesData?.categories ? [...categoriesData.categories].sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Close button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0 absolute right-4 top-4"
          onClick={() => onSuccess?.()}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Exeat Category"
          error={form.formState.errors.category_id?.message}
        >
          <Controller
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Preferred Contact Method"
          error={form.formState.errors.preferred_mode_of_contact?.message}
        >
          <Controller
            control={form.control}
            name="preferred_mode_of_contact"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
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
            )}
          />
        </FormField>
      </div>

      <FormField
        label="Reason for Exeat"
        error={form.formState.errors.reason?.message}
      >
        <Controller
          control={form.control}
          name="reason"
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Please provide a detailed reason for your exeat request"
              className="min-h-[100px]"
            />
          )}
        />
      </FormField>

      <FormField
        label="Destination"
        error={form.formState.errors.destination?.message}
      >
        <Controller
          control={form.control}
          name="destination"
          render={({ field }) => (
            <Input {...field} placeholder="Where are you going?" />
          )}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Departure Date"
          error={form.formState.errors.departure_date?.message}
        >
          <Controller
            control={form.control}
            name="departure_date"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(date) => {
                  field.onChange(date);
                  // Clear return date if it becomes invalid
                  if (date && watchedReturnDate && watchedReturnDate <= date) {
                    form.setValue('return_date', null as any);
                  }
                }}
                disabled={(date) => {
                  const today = new Date();
                  const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

                  // Disable dates before today
                  if (date < today) return true;

                  // Disable dates more than 3 months from now
                  if (date > threeMonthsFromNow) return true;

                  return false;
                }}
              />
            )}
          />
        </FormField>

        <FormField
          label="Return Date"
          error={form.formState.errors.return_date?.message}
        >
          <Controller
            control={form.control}
            name="return_date"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                disabled={(date) => {
                  const today = new Date();
                  const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

                  // Disable dates before today
                  if (date < today) return true;

                  // Disable dates more than 3 months from now
                  if (date > threeMonthsFromNow) return true;

                  // Disable dates before departure date (if departure date is selected)
                  if (watchedDepartureDate) {
                    const departureDateOnly = new Date(watchedDepartureDate);
                    departureDateOnly.setHours(0, 0, 0, 0);
                    const checkDateOnly = new Date(date);
                    checkDateOnly.setHours(0, 0, 0, 0);
                    if (checkDateOnly <= departureDateOnly) return true;
                  }

                  return false;
                }}
              />
            )}
          />
        </FormField>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            Submitting...
          </>
        ) : (
          'Submit Exeat Request'
        )}
      </Button>
    </form>
  );
}