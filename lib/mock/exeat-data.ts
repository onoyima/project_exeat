import type { ExeatRequest } from '@/types/student';

export const mockExeatRequests: ExeatRequest[] = [
    {
        id: '1',
        category: 'Medical',
        reason: 'Dental appointment',
        location: 'Lagos',
        departureDate: '2024-03-20T10:00:00',
        returnDate: '2024-03-22T18:00:00',
        status: 'pending',
        submittedAt: '2024-03-15T09:30:00',
        approvals: {}
    },
    {
        id: '2',
        category: 'Weekend',
        reason: 'Family event',
        location: 'Abuja',
        departureDate: '2024-03-15T16:00:00',
        returnDate: '2024-03-17T18:00:00',
        status: 'approved',
        submittedAt: '2024-03-10T14:20:00',
        approvals: {
            cmd: { approved: true, date: '2024-03-11T10:00:00' },
            deputyDean: { approved: true, date: '2024-03-11T14:00:00' },
            parentConsent: { approved: true, date: '2024-03-12T09:00:00', method: 'phone' },
            dean: { approved: true, date: '2024-03-12T16:00:00' },
            hostelAdmin: { approved: true, date: '2024-03-13T11:00:00' }
        },
        qrCode: 'mock-qr-code'
    }
];