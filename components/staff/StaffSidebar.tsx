'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/services/authSlice';
import LogoutModal from '@/components/ui/logout-modal';
import { useLogoutMutation } from '@/lib/services/authApi';
import {
  LayoutDashboard,
  Clock,
  History,
  UserCircle,
  LogOut,
  X,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function StaffSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  // Create user display data
  const user = currentUser;
  const fullName = user ? `${user.fname} ${user.lname}` : 'Staff Member';

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    onClose();
  };

  const handleLogoutSuccess = () => {
    router.replace('/login');
  };

  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  // Determine if user has admin privileges
  const isAdmin = user?.role === 'admin' ||
    (user as any)?.roles?.includes('admin') ||
    user?.role === 'super-admin';

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => {
    const active = isLinkActive(href);

    const handleClick = () => {
      // Close sidebar when link is clicked (only on mobile)
      if (window.innerWidth < 1024) { // lg breakpoint
        onClose();
      }
    };

    return (
      <Link href={href} className="w-full my-2" onClick={handleClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          <Icon className="mr-2 h-4 w-4" />
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 w-[280px] h-[calc(100vh-3.5rem)]",
          "bg-white border-r border-border",
          "transition-all duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:h-screen",
          !open && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        {open && (
          <div className="absolute -right-12 top-3 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-white shadow-md border-border"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-2 overflow-y-auto h-[calc(100%-4rem)]">
          <div className="space-y-4">
            {/* Main Navigation */}
            <NavLink href="/staff/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>

            <NavLink href="/staff/pending" icon={Clock}>
              Pending Exeats
            </NavLink>

            <NavLink href="/staff/history" icon={History}>
              Exeat History
            </NavLink>

            {/* Admin-only navigation */}
            {isAdmin && (
              <NavLink href="/staff/assign-exeat-role" icon={UserCog}>
                Assign Exeat Role
              </NavLink>
            )}

            {/* Account Navigation */}
            <div className="pt-4 mt-4 border-t">
              <NavLink href="/staff/profile" icon={UserCircle}>
                Profile
              </NavLink>

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  handleLogoutClick();
                  // Close sidebar when logout is clicked (only on mobile)
                  if (window.innerWidth < 1024) { // lg breakpoint
                    onClose();
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={fullName || 'User'}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </>
  );
}