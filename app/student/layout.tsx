'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentNavbar from '@/components/student/StudentNavbar';
import { Dialog } from '@/components/ui/dialog';
import ExeatApplicationForm from '@/components/ExeatApplicationForm';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ fname: '', lname: '', email: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [showExeatModal, setShowExeatModal] = useState(false);

  useEffect(() => {
    // Immediate loading for better UX
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    // Use requestAnimationFrame for smoother loading
    requestAnimationFrame(loadUserData);
  }, []);
  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <div className="flex flex-col h-full">
        <StudentNavbar onMenuClick={() => setSidebarOpen(true)} user={user} />
        <div className="flex flex-1 relative overflow-hidden">
          <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onApplyExeat={() => setShowExeatModal(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:ml-0 bg-gray-100">{children}</main>
        </div>
      </div>
      <Dialog open={showExeatModal} onOpenChange={setShowExeatModal}>
        <ExeatApplicationForm />
      </Dialog>
      {/* Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 font-medium">Loading user data...</p>
          </div>
        </div>
      )}
    </div>
  );
}