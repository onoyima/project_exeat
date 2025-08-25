import type { ExeatStatus } from '@/types/student';

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
        case 'completed':
            return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
        case 'cmd_review':
        case 'deputy-dean_review':
        case 'dean_review':
            return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
        case 'parent_consent':
            return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
        case 'hostel_signin':
        case 'hostel_signout':
            return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
        case 'recommendation1':
        case 'recommendation2':
        case 'dean_approval':
        case 'hostel_approval':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
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