import type { ExeatStatus } from '@/types/student';

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-50 text-yellow-900 border border-yellow-200';
        case 'approved':
            return 'bg-green-50 text-green-900 border border-green-200';
        case 'rejected':
            return 'bg-red-50 text-red-900 border border-red-200';
        case 'recommendation1':
        case 'recommendation2':
        case 'parent_consent':
        case 'dean_approval':
        case 'hostel_approval':
            return 'bg-blue-50 text-blue-900 border border-blue-200';
        default:
            return 'bg-gray-50 text-gray-900 border border-gray-200';
    }
};

export const getStatusText = (status: string) => {
    switch (status) {
        case 'pending':
            return 'Awaiting Review';
        case 'recommendation1':
            return 'Under Review';
        case 'recommendation2':
            return 'Under Review';
        case 'parent_consent':
            return 'Awaiting Parent';
        case 'dean_approval':
            return 'Dean Review';
        case 'hostel_approval':
            return 'Processing';
        case 'approved':
            return 'Approved';
        case 'rejected':
            return 'Not Approved';
        default:
            return status.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
    }
};

export const isActiveStatus = (status: string) => {
    return ['pending', 'recommendation1', 'recommendation2', 'parent_consent', 'dean_approval', 'hostel_approval'].includes(status);
};