import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/ui/logout-modal';

// Define a proper type for currentUser
interface User {
  fname: string;
  lname: string;
  email: string;
  role?: string;
  roles?: string[];
}

export default function StaffSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({ fname: '', lname: '', email: '' });
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    const storedRoles = localStorage.getItem('userRoles');
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        setUserRoles(parsedRoles);
      } catch (error) {
        console.error('Error parsing stored userRoles:', error);
      }
    }
  }, []);

  // Determine if user is admin
  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.roles?.includes('admin') ||
    userRoles.includes('admin');

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    onClose(); // Close sidebar on mobile
  };

  const handleLogoutSuccess = () => {
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-40 w-64 h-full
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-white shadow-lg md:shadow-none
        overflow-y-auto overflow-x-hidden
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-green-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-green-900">ExeatFlow</span>
          </div>
          <button
            className="md:hidden text-green-900"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-4 py-2">
            <p className="text-xs uppercase text-green-700 font-semibold">Main</p>
          </div>
          <Link
            href="/staff/dashboard"
            className="flex items-center px-6 py-3 text-green-900 font-semibold bg-green-100 rounded-lg mb-1"
          >
            <span className="mx-3">Dashboard</span>
          </Link>
          <Link
            href="/staff/pending"
            className="flex items-center px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
          >
            <span className="mx-3">Pending Exeats</span>
          </Link>
          <Link
            href="/staff/medical"
            className="flex items-center px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
          >
            <span className="mx-3">Medical Exeats</span>
          </Link>
          <Link
            href="/staff/history"
            className="flex items-center px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
          >
            <span className="mx-3">Exeat History</span>
          </Link>
          {isAdmin && (
            <Link
              href="/staff/assign-exeat-role"
              className="flex items-center px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
            >
              <span className="mx-3">Assign Exeat Role</span>
            </Link>
          )}
          <div className="px-4 py-2 mt-6">
            <p className="text-xs uppercase text-green-700 font-semibold">Account</p>
          </div>
          <Link
            href="/staff/profile"
            className="flex items-center px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
          >
            <span className="mx-3">Profile</span>
          </Link>
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full px-6 py-3 text-green-900 hover:bg-green-50 rounded-lg mb-1"
          >
            <span className="mx-3">Logout</span>
          </button>
        </nav>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={`${currentUser.fname} ${currentUser.lname}`}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </>
  );
}
