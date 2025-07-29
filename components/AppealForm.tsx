'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, FileText, Upload } from 'lucide-react';

interface AppealFormProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onSubmit: (appealData: any) => void;
}

export default function AppealForm({ isOpen, onClose, application, onSubmit }: AppealFormProps) {
  const [appealReason, setAppealReason] = useState('');
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit({
        applicationId: application.id,
        appealReason,
        additionalDocuments
      });
      setIsSubmitting(false);
    }, 2000);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const formData = new FormData();
  formData.append("applicationId", application.id);
  formData.append("appealReason", appealReason);
  additionalDocuments.forEach((file, index) =>
    formData.append(`documents[${index}]`, file)
  );

  try {
    const res = await fetch("/api/student/exeat-appeals", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (!res.ok || !result.success) throw new Error(result.message || "Submission failed");

    onSubmit(result.data);
    onClose();
  } catch (err: any) {
    console.error(err);
    // optionally show error toast
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Appeal - #{application.id}
          </DialogTitle>
          <DialogDescription>
            Submit an appeal for your rejected exeat application. Provide additional information or documentation to support your case.
          </DialogDescription>
        </DialogHeader>

        {/* Original Application Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Original Application</h3>
              <p className="text-sm text-red-700 mt-1">
                <strong>Reason:</strong> {application.reason}
              </p>
              <p className="text-sm text-red-700">
                <strong>Rejection Reason:</strong> {application.rejectionReason}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appeal Reason */}
          <div className="space-y-2">
            <Label htmlFor="appealReason" className="text-sm font-semibold">
              Appeal Reason *
            </Label>
            <Textarea
              id="appealReason"
              placeholder="Explain why you believe the rejection should be reconsidered. Provide any additional context, clarifications, or new information that supports your case..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-gray-600">
              Be specific and provide clear reasoning for your appeal. Include any new information that wasn't in your original application.
            </p>
          </div>

          {/* Additional Documents */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Additional Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload any additional documents that support your appeal
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="appeal-file-upload"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('appeal-file-upload')?.click()}
              >
                Choose Files
              </Button>
              {additionalDocuments.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  {additionalDocuments.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-semibold text-blue-800">Appeal Process</h4>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Appeals will be reviewed by the Dean within 3 business days</li>
                  <li>• You will receive a notification once the appeal is processed</li>
                  <li>• Only one appeal is allowed per application</li>
                  <li>• New evidence or compelling reasons improve appeal success</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !appealReason.trim()}
              className="flex-1 bg-university-primary hover:bg-university-secondary"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting Appeal...
                </div>
              ) : (
                'Submit Appeal'
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