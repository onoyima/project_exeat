// This file is the student dashboard page for the Digital Exeat System
// It displays student info, exeat application stats, recent applications, and allows new applications and appeals

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download,
  QrCode,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';
import ExeatApplicationForm from '@/components/ExeatApplicationForm';
import ExeatHistory from '@/components/ExeatHistory';
import AppealForm from '@/components/AppealForm';

/**
 * ExeatApplication interface defines the structure of an exeat application object.
 */
interface ExeatApplication {
  id: string; // Unique application ID
  category: string; // Exeat category (Medical, Holiday, etc.)
  reason: string; // Reason for exeat
  location: string; // Destination/location
  departureDate: string; // Departure date
  returnDate: string; // Return date
  status: 'pending' | 'cmd-review' | 'deputy-review' | 'parent-consent' | 'dean-review' | 'hostel-approval' | 'approved' | 'rejected'; // Application status
  submittedAt: string; // Submission timestamp
  approvals: {
    cmd?: { approved: boolean; date: string; comment?: string };
    deputyDean?: { approved: boolean; date: string; comment?: string };
    parentConsent?: { approved: boolean; date: string; method: string };
    dean?: { approved: boolean; date: string; comment?: string };
    hostelAdmin?: { approved: boolean; date: string };
  };
  rejectionReason?: string; // Reason for rejection (if any)
  qrCode?: string; // QR code for approved exeat
}

// Mock data for student applications (replace with API data in production)
const mockApplications: ExeatApplication[] = [
  {
    id: 'EXT-2024-001',
    category: 'Medical',
    reason: 'Dental appointment at Lagos University Teaching Hospital',
    location: 'Lagos, Nigeria',
    departureDate: '2024-01-15',
    returnDate: '2024-01-17',
    status: 'approved',
    submittedAt: '2024-01-10T09:30:00Z',
    approvals: {
      cmd: { approved: true, date: '2024-01-11T14:20:00Z', comment: 'Medical documentation verified' },
      deputyDean: { approved: true, date: '2024-01-12T10:15:00Z', comment: 'Parent consent obtained' },
      parentConsent: { approved: true, date: '2024-01-12T16:30:00Z', method: 'WhatsApp' },
      dean: { approved: true, date: '2024-01-13T11:45:00Z' },
      hostelAdmin: { approved: true, date: '2024-01-14T08:00:00Z' }
    },
    qrCode: 'QR123456789'
  },
  {
    id: 'EXT-2024-002',
    category: 'Holiday',
    reason: 'Christmas celebration with family',
    location: 'Abuja, Nigeria',
    departureDate: '2024-12-20',
    returnDate: '2024-01-08',
    status: 'dean-review',
    submittedAt: '2024-12-15T14:20:00Z',
    approvals: {
      deputyDean: { approved: true, date: '2024-12-16T09:30:00Z' },
      parentConsent: { approved: true, date: '2024-12-16T18:45:00Z', method: 'Email' }
    }
  },
  {
    id: 'EXT-2024-003',
    category: 'Emergency',
    reason: 'Family emergency requiring immediate attention',
    location: 'Port Harcourt, Nigeria',
    departureDate: '2024-01-20',
    returnDate: '2024-01-22',
    status: 'rejected',
    submittedAt: '2024-01-18T16:45:00Z',
    rejectionReason: 'Insufficient documentation provided for emergency claim',
    approvals: {}
  }
];

// Status color mapping for badges
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'cmd-review': 'bg-blue-100 text-blue-800 border-blue-300',
  'deputy-review': 'bg-purple-100 text-purple-800 border-purple-300',
  'parent-consent': 'bg-orange-100 text-orange-800 border-orange-300',
  'dean-review': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'hostel-approval': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300'
};

/**
 * Returns the progress percentage for a given application status.
 * @param status string - current status
 * @returns number - progress percent
 */
const getStatusProgress = (status: string) => {
  const stages = ['pending', 'cmd-review', 'deputy-review', 'parent-consent', 'dean-review', 'hostel-approval', 'approved'];
  return ((stages.indexOf(status) + 1) / stages.length) * 100;
};

/**
 * StudentDashboard component renders the main dashboard for students.
 * Shows stats, recent applications, exeat history, and profile info.
 */
import { getProfile } from '@/lib/api';
import { useAuthProtection } from '@/lib/auth';
import { useEffect } from 'react';

interface User {
  id: number;
  fname: string;
  lname: string;
  mname?: string;
  email: string;
  phone?: string;
  matric_number?: string;
}

export default function StudentDashboard() {
  // Protect this route - redirect to login if not authenticated
  useAuthProtection();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Get user data from localStorage first (faster)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
        } else {
          // Fallback to API call if localStorage is empty
          const fetchProfile = async () => {
            try {
              const result = await getProfile();
              if (result.success && result.data?.user) {
                setUser(result.data.user);
              } else {
                setError(result.error || 'Failed to load profile');
              }
            } catch (err) {
              setError('Failed to load profile');
            } finally {
              setLoading(false);
            }
          };
          fetchProfile();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <>
        {/* Skeleton content while loading */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="space-y-6">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Loading Modal Overlay */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      {/* Welcome Banner */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome back, {user ? `${user.fname} ${user.lname}` : 'Student'}
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Student {user?.matric_number ? `| ${user.matric_number}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Pending Exeats */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Exeats
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      2
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        {/* Approved Exeats */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Approved Exeats
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      5
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        {/* Rejected Exeats */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejected Exeats
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      1
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a href="/student/apply" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Apply for New Exeat
            </a>
            <a href="/student/permits" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Active Permits
            </a>
          </div>
        </div>
      </div>
      {/* Recent Exeats */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Exeat Applications
          </h3>
          <div className="flex flex-col">
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <div className="py-2 align-middle inline-block min-w-full">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2023-10-15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Medical
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2 days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">View</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2023-10-10
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Weekend
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          3 days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">View Permit</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2023-10-05
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Emergency
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1 day
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">Appeal</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}