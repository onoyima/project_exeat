'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import LogoutModal from '@/components/ui/logout-modal';
import {
    Users,
    Shield,
    Settings,
    BarChart3,
    FileText,
    Home,
    Menu,
    X,
} from 'lucide-react';

interface AdminSidebarProps {
    open: boolean;
    onClose: () => void;
}

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: Home,
        description: 'Overview and statistics',
    },
    {
        name: 'Staff Management',
        href: '/admin/staff',
        icon: Users,
        description: 'Manage staff roles and assignments',
    },
    {
        name: 'Role Management',
        href: '/admin/roles',
        icon: Shield,
        description: 'Create and manage exeat roles',
    },
    {
        name: 'Exeat Requests',
        href: '/admin/exeats',
        icon: FileText,
        description: 'View all exeat requests',
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Reports and insights',
    },
    {
        name: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'System configuration',
    },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Sidebar */}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-foreground">Admin Panel</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-4 py-6">
                        <nav className="space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={cn(
                                            'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-5 w-5 transition-colors duration-200',
                                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs opacity-70 truncate">
                                                {item.description}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="border-t border-border/40 p-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                            <Menu className="h-5 w-5" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                userName="Admin User"
                onLogoutSuccess={() => {
                    setShowLogoutModal(false);
                    // Redirect to login page or handle logout success
                    window.location.href = '/login';
                }}
            />
        </>
    );
}

