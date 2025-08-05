"use client";
import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';

interface User {
  id: number;
  fname: string;
  lname: string;
  mname?: string;
  email: string;
  phone?: string;
  title?: string;
}

function StaffDashboardContent() {
  const currentUser = useSelector(selectCurrentUser);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else {
      // Fallback to API call if Redux state is empty
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
  }, [currentUser]);

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                Welcome back, {user ? `${user.title || ''} ${user.fname} ${user.lname}` : 'Staff Member'}
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Staff Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Pending Medical Exeats */}
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
                    Pending Medical Exeats
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      8
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <a href="/staff/pending" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all pending <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
        {/* Approved Today */}
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
                    Approved Today
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
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View details <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
        {/* Rejected Today */}
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
                    Rejected Today
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
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View details <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
      {/* Pending Medical Exeats Table */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pending Medical Exeats
          </h3>
          <a href="/staff/pending" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </a>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Requested
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          JD
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          John Doe
                        </div>
                        <div className="text-sm text-gray-500">
                          STU12345
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Medical
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2023-10-15
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          AS
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Alice Smith
                        </div>
                        <div className="text-sm text-gray-500">
                          STU67890
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Medical
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2023-10-14
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          RJ
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Robert Johnson
                        </div>
                        <div className="text-sm text-gray-500">
                          STU54321
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Medical
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2023-10-13
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Medical Exeat Analytics */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Medical Exeat Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Medical Exeat Types</h4>
              <div className="h-64">
                {/* Chart.js pie chart placeholder */}
                <canvas id="medicalTypesChart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Monthly Medical Exeats</h4>
              <div className="h-64">
                {/* Chart.js bar chart placeholder */}
                <canvas id="monthlyMedicalChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  return (
    <ProtectedRoute requiredRole="staff">
      <StaffDashboardContent />
    </ProtectedRoute>
  );
} 