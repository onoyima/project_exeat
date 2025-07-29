'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/ui/logout-modal';

export default function StudentNavbar({
  onMenuClick,
  user,
}: {
  onMenuClick: () => void;
  user: { fname: string; lname: string; email: string; image?: string };
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const router = useRouter();

  // Sync user from localStorage
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
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutSuccess = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="text-green-900 md:hidden"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image
                src="/veritas-logo.png"
                alt="Veritas University Logo"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 32px, 40px"
                priority
              />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-green-900">
              Student Dashboard
            </h1>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center text-sm rounded-full focus:outline-none"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {currentUser.image ? (
                <img
                  src={currentUser.image}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-green-800 flex items-center justify-center text-white font-medium">
                  {currentUser.fname?.charAt(0).toUpperCase()}
                  {currentUser.lname?.charAt(0).toUpperCase() || 'ST'}
                </div>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border">
                <div className="px-4 py-2 border-b">
                  <div className="font-semibold text-gray-900">
                    {currentUser.fname} {currentUser.lname}
                  </div>
                  <div className="text-xs text-gray-500">{currentUser.email}</div>
                </div>
                <a
                  href="/student/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50"
                >
                  Profile
                </a>
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={`${currentUser.fname} ${currentUser.lname}`}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </header>
  );
}
