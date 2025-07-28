'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Phone, Mail, MessageSquare, Upload, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ExeatApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const exeatCategories = [
  { value: 'medical', label: 'Medical', description: 'Health-related appointments or treatments' },
  { value: 'holiday', label: 'Holiday', description: 'Vacation or seasonal breaks' },
  { value: 'daily', label: 'Daily', description: 'Same-day return trips' },
  { value: 'sleepover', label: 'Sleepover', description: 'Overnight stays (1-2 nights)' },
  { value: 'emergency', label: 'Emergency', description: 'Urgent family or personal matters' }
];

const contactMethods = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Phone }
];

export default function ExeatApplicationForm({ isOpen, onClose, onSubmit }: ExeatApplicationFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    reason: '',
    location: '',
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    contactMethod: '',
    parentContact: '',
    additionalInfo: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    if (!formData.departureDate || !formData.returnDate) {
      setIsSubmitting(false);
      return;
    }

    if (formData.returnDate <= formData.departureDate) {
      setIsSubmitting(false);
      return;
    }

    // Simulate API call with proper validation
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
      // Reset form
      setFormData({
        category: '',
        reason: '',
        location: '',
        departureDate: undefined,
        returnDate: undefined,
        contactMethod: '',
        parentContact: '',
        additionalInfo: ''
      });
      setAttachedFiles([]);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-university-primary">New Exeat Application</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit your exeat request. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm font-semibold">Exeat Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="Select exeat category" />
              </SelectTrigger>
              <SelectContent>
                {exeatCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold">Reason for Exeat *</Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for your exeat request..."
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">Destination *</Label>
            <Input
              id="location"
              placeholder="Where are you going? (City, State)"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Departure Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.departureDate ? format(formData.departureDate, 'PPP') : 'Select departure date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.departureDate}
                    onSelect={(date) => setFormData({...formData, departureDate: date})}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Return Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.returnDate ? format(formData.returnDate, 'PPP') : 'Select return date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.returnDate}
                    onSelect={(date) => setFormData({...formData, returnDate: date})}
                    initialFocus
                    disabled={(date) => date < (formData.departureDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Parent Contact Method */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Preferred Method to Contact Parent/Guardian *</Label>
            <RadioGroup 
              value={formData.contactMethod} 
              onValueChange={(value) => setFormData({...formData, contactMethod: value})}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {contactMethods.map((method) => (
                <div key={method.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer">
                    <method.icon className="w-4 h-4" />
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Parent Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="parentContact" className="text-sm font-semibold">Parent/Guardian Contact *</Label>
            <Input
              id="parentContact"
              placeholder={
                formData.contactMethod === 'email' ? 'parent@email.com' :
                formData.contactMethod === 'whatsapp' ? '+234 123 456 7890' :
                formData.contactMethod === 'sms' ? '+234 123 456 7890' :
                'Enter contact information'
              }
              value={formData.parentContact}
              onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
              required
            />
          </div>

          {/* File Upload */}
          {formData.category === 'medical' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Supporting Documents</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload medical documents, appointment letters, etc.</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  Choose Files
                </Button>
                {attachedFiles.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    {attachedFiles.length} file(s) selected
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-sm font-semibold">Additional Information (Optional)</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional details that might be relevant to your request..."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                <ul className="mt-2 space-y-1 text-yellow-700">
                  <li>• Your parent/guardian will be contacted for consent verification</li>
                  <li>• Applications must be submitted at least 24 hours before departure</li>
                  <li>• Medical exeats require CMD approval before other approvals</li>
                  <li>• Emergency exeats may require additional documentation</li>
                  <li>• You must return by the specified date to avoid penalties</li>
                  <li>• You must sign out/in at hostel and security for complete process</li>
                  <li>• False information may result in disciplinary action</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-university-primary hover:bg-university-secondary"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}