'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffNavbar from '@/components/staff/StaffNavbar';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ fname: '', lname: '', email: '', image: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    requestAnimationFrame(loadUserData);
  }, []);

  if (loading) {
    // Show only loading overlay
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-1 flex items-center justify-center">
            <Image
              src="/vicon.png"
              alt="Loading"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-white text-base font-medium drop-shadow">Loading...</p>
      </div>
    );
  }

  // When loading is done, render layout and content
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <div className="flex flex-col h-full">
        <StaffNavbar onMenuClick={() => setSidebarOpen(true)} user={user} />
        <div className="flex flex-1 relative overflow-hidden">
          <StaffSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:ml-0 bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
