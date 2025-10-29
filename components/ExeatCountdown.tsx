'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { format, differenceInMinutes, differenceInHours, differenceInDays, endOfDay, startOfDay } from 'date-fns';
import { AlertCircle, Timer, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExeatCountdownProps {
    departureDate: string;
    returnDate: string;
    variant?: 'student' | 'staff';
    className?: string;
}

export function ExeatCountdown({ departureDate, returnDate, variant = 'student', className }: ExeatCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        totalMinutes: number;
    }>({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 });

    // Check if same-day exeat (daily exeat)
    const isSameDay = useMemo(() => {
        try {
            const dep = new Date(departureDate);
            const ret = new Date(returnDate);
            return (
                dep.getFullYear() === ret.getFullYear() &&
                dep.getMonth() === ret.getMonth() &&
                dep.getDate() === ret.getDate()
            );
        } catch {
            return false;
        }
    }, [departureDate, returnDate]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            try {
                const now = new Date();
                const depDate = new Date(departureDate);
                const retDate = new Date(returnDate);

                if (isNaN(retDate.getTime()) || isNaN(depDate.getTime())) {
                    console.error('Invalid date format:', departureDate, returnDate);
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 });
                    return;
                }

                const returnDeadline = endOfDay(retDate);

                if (isSameDay) {
                    // For same-day exeats, only check date (not time)
                    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const returnDateOnly = new Date(retDate.getFullYear(), retDate.getMonth(), retDate.getDate());

                    if (nowDateOnly > returnDateOnly) {
                        // Overdue - past the return date
                        setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes: -1 });
                        return;
                    } else {
                        // Not overdue yet - still on or before return date
                        const days = differenceInDays(returnDeadline, now);
                        setTimeLeft({ days: Math.max(0, days), hours: 0, minutes: 0, totalMinutes: differenceInMinutes(returnDeadline, now) });
                        return;
                    }
                }

                // For multi-day exeats, use detailed countdown
                const totalMinutes = differenceInMinutes(returnDeadline, now);

                if (totalMinutes <= 0) {
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes });
                    return;
                }

                const days = differenceInDays(returnDeadline, now);
                const hours = differenceInHours(returnDeadline, now) % 24;
                const minutes = totalMinutes % 60;

                setTimeLeft({ days, hours, minutes, totalMinutes });
            } catch (error) {
                console.error('Error in countdown calculation:', error);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [returnDate, departureDate, isSameDay]);

    const isOverdue = timeLeft.totalMinutes <= 0;
    const isUrgent = !isSameDay && timeLeft.totalMinutes <= 1440 && timeLeft.totalMinutes > 0;

    // Student-specific messaging
    const getStudentTitle = () => isOverdue ? "Return Time Passed!" : "Expected Return Time";
    const getStudentDescription = () => {
        if (isOverdue) {
            return `Return was expected by end of ${format(new Date(returnDate), 'MMM d, yyyy')} - please sign back in`;
        }
        return `Return by end of ${format(new Date(returnDate), 'MMM d, yyyy')} - please sign back in upon return`;
    };

    // Staff-specific messaging
    const getStaffTitle = () => isOverdue ? 'Return Overdue' : 'Time Until Return';
    const getStaffDescription = () => {
        if (isOverdue) {
            return 'The student should have returned by now. Please follow up.';
        }
        if (!isSameDay && timeLeft.days === 0 && timeLeft.hours < 6) {
            return 'Student should return soon. Monitor closely.';
        }
        return 'Student is expected to return on schedule.';
    };

    const title = variant === 'student' ? getStudentTitle() : getStaffTitle();
    const description = variant === 'student' ? getStudentDescription() : getStaffDescription();

    return (
        <Card className={cn(
            "p-3 sm:p-4 md:p-6 border-2 transition-all duration-300",
            isOverdue
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100"
                : isUrgent
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-orange-100"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100",
            className
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={cn(
                        "p-2 sm:p-3 rounded-full flex-shrink-0",
                        isOverdue ? "bg-red-100" :
                            isUrgent ? "bg-orange-100" : "bg-green-100"
                    )}>
                        {isOverdue ? (
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                        ) : isUrgent ? (
                            <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                        ) : (
                            <MapPinned className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className={cn(
                            "font-semibold text-base sm:text-lg",
                            isOverdue ? "text-red-900" :
                                isUrgent ? "text-orange-900" : "text-green-900"
                        )}>
                            {title}
                        </h3>
                        <p className={cn(
                            "text-xs sm:text-sm mt-1",
                            isOverdue ? "text-red-700" :
                                isUrgent ? "text-orange-700" : "text-green-700"
                        )}>
                            {description}
                        </p>
                    </div>
                </div>

                {(!isOverdue && !isSameDay) && (
                    <div className="flex-shrink-0">
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                            <div className="text-center min-w-0 px-1 sm:px-0">
                                <div className={cn(
                                    "text-2xl sm:text-2xl md:text-3xl font-bold",
                                    isUrgent ? "text-orange-600" : "text-green-600"
                                )}>
                                    {timeLeft.days}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">Days</div>
                            </div>
                            <div className="text-center min-w-0 px-1 sm:px-0">
                                <div className={cn(
                                    "text-2xl sm:text-2xl md:text-3xl font-bold",
                                    isUrgent ? "text-orange-600" : "text-green-600"
                                )}>
                                    {timeLeft.hours}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">Hours</div>
                            </div>
                            <div className="text-center min-w-0 px-1 sm:px-0">
                                <div className={cn(
                                    "text-2xl sm:text-2xl md:text-3xl font-bold",
                                    isUrgent ? "text-orange-600" : "text-green-600"
                                )}>
                                    {timeLeft.minutes}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">Minutes</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar - only show for multi-day exeats */}
            {!isOverdue && !isSameDay && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={cn(
                                "h-2 rounded-full transition-all duration-1000",
                                isUrgent ? "bg-orange-500" : "bg-green-500"
                            )}
                            style={{
                                width: `${(() => {
                                    try {
                                        const start = startOfDay(new Date(departureDate)).getTime();
                                        const end = endOfDay(new Date(returnDate)).getTime();
                                        const now = Date.now();
                                        if (isNaN(start) || isNaN(end) || end <= start) return 0;
                                        const progress = ((now - start) / (end - start)) * 100;
                                        return Math.max(0, Math.min(100, progress));
                                    } catch {
                                        return 0;
                                    }
                                })()}%`
                            }}
                        />
                    </div>
                    {variant === 'student' && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 break-words">
                            {isUrgent ? "⚠️ Less than 24 hours remaining - sign back in soon" : "Please sign back in by your return date"}
                        </p>
                    )}
                    {variant === 'staff' && (
                        <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2 break-words">
                            {isUrgent ? "⚠️ Less than 24 hours remaining" : "Monitor return status"}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
