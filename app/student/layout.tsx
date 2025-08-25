'use client';

import { useState } from 'react';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentNavbar from '@/components/student/StudentNavbar';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExeatModal, setShowExeatModal] = useState(false);
  const currentUser = useGetCurrentUser();

  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex min-h-screen flex-col">
        <StudentNavbar
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
        />

        <div className="flex-1 flex">
          <StudentSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onApplyExeat={() => setShowExeatModal(true)}
            currentUser={currentUser}
          />

          <main className="flex-1 relative">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Loading state is now handled by the auth hook */}
      </div>
    </ProtectedRoute>
  );
}