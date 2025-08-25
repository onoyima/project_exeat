'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { Menu, Bell, Search } from 'lucide-react';

interface AdminNavbarProps {
    onMenuClick: () => void;
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
    const { user } = useGetCurrentUser();
    const [showNotifications, setShowNotifications] = useState(false);

    const getInitials = (fname?: string, lname?: string) => {
        return `${(fname || '').charAt(0)}${(lname || '').charAt(0)}`.toUpperCase();
    };

    return (
        <nav className="sticky top-0 z-30 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuClick}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
                    </Button>

                    {/* Admin Profile */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-foreground">
                                {user?.fname} {user?.lname}
                            </p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
                        </div>
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user?.passport ? `data:image/jpeg;base64,${user.passport}` : undefined}
                                alt={`${user?.fname} ${user?.lname}`}
                            />
                            <AvatarFallback className="text-xs">
                                {getInitials(user?.fname, user?.lname)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </nav>
    );
}

