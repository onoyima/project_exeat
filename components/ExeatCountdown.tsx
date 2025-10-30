'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { format, differenceInMinutes, differenceInHours, differenceInDays, differenceInSeconds, endOfDay, startOfDay } from 'date-fns';
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
        seconds: number;
        totalMinutes: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });

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
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });
                    return;
                }

                // Deadline is 11:59 PM (end of day) of the return date itself
                // If return date is Oct 29, deadline is 11:59 PM Oct 29
                const returnDeadline = endOfDay(retDate); // End of the return date

                if (isSameDay) {
                    // For same-day exeats, treat overdue as crossing 11:59 PM of the return date
                    if (now > returnDeadline) {
                        // Overdue - past end of the return date
                        const totalOverdueSeconds = Math.abs(differenceInSeconds(now, returnDeadline));
                        const overdueDays = Math.ceil(totalOverdueSeconds / 86400);
                        const overdueHours = Math.floor(totalOverdueSeconds / 3600) % 24;
                        const overdueMinutes = Math.floor(totalOverdueSeconds / 60) % 60;
                        const overdueSeconds = totalOverdueSeconds % 60;
                        setTimeLeft({
                            days: overdueDays,
                            hours: overdueHours,
                            minutes: overdueMinutes,
                            seconds: overdueSeconds,
                            totalMinutes: -differenceInMinutes(now, returnDeadline)
                        });
                        return;
                    } else {
                        // Not overdue yet - still before end of return date
                        const remainingSeconds = Math.max(0, differenceInSeconds(returnDeadline, now));
                        const days = Math.floor(remainingSeconds / 86400);
                        setTimeLeft({
                            days: Math.max(0, days),
                            hours: 0,
                            minutes: 0,
                            seconds: remainingSeconds % 60,
                            totalMinutes: differenceInMinutes(returnDeadline, now)
                        });
                        return;
                    }
                }

                // For multi-day exeats, use detailed countdown
                const totalMinutes = differenceInMinutes(returnDeadline, now);

                if (totalMinutes <= 0) {
                    // Overdue - calculate overdue duration (counting from end of return date)
                    const totalOverdueSeconds = Math.abs(differenceInSeconds(now, returnDeadline));
                    const overdueDays = Math.ceil(totalOverdueSeconds / 86400);
                    const overdueHours = Math.floor(totalOverdueSeconds / 3600) % 24;
                    const overdueMinutes = Math.floor(totalOverdueSeconds / 60) % 60;
                    const overdueSeconds = totalOverdueSeconds % 60;
                    setTimeLeft({
                        days: overdueDays,
                        hours: overdueHours,
                        minutes: overdueMinutes,
                        seconds: overdueSeconds,
                        totalMinutes
                    });
                    return;
                }

                // Not overdue - show time remaining
                const totalRemainingSeconds = differenceInSeconds(returnDeadline, now);
                const days = Math.floor(totalRemainingSeconds / 86400);
                const hours = Math.floor(totalRemainingSeconds / 3600) % 24;
                const minutes = Math.floor(totalRemainingSeconds / 60) % 60;
                const seconds = totalRemainingSeconds % 60;

                setTimeLeft({ days, hours, minutes, seconds, totalMinutes });
            } catch (error) {
                console.error('Error in countdown calculation:', error);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMinutes: 0 });
            }
        };

        calculateTimeLeft();

        // Update every second when overdue for real-time counting, otherwise every minute
        // Check if currently overdue to set appropriate interval
        const now = new Date();
        const retDate = new Date(returnDate);
        // Deadline is 11:59 PM of the return date itself
        const returnDeadline = endOfDay(retDate);

        let isCurrentlyOverdue = false;
        if (isSameDay) {
            isCurrentlyOverdue = now > returnDeadline;
        } else {
            isCurrentlyOverdue = differenceInMinutes(returnDeadline, now) <= 0;
        }

        const interval = isCurrentlyOverdue ? 1000 : 60000; // Every second if overdue, every minute otherwise
        const timer = setInterval(calculateTimeLeft, interval);

        return () => clearInterval(timer);
    }, [returnDate, departureDate, isSameDay]);

    const isOverdue = timeLeft.totalMinutes <= 0;
    const isUrgent = !isSameDay && timeLeft.totalMinutes <= 1440 && timeLeft.totalMinutes > 0;

    // Calculate penalty amount (for students)
    const penaltyAmount = isOverdue ? timeLeft.days * 10000 : 0;

    // Student-specific messaging
    const getStudentTitle = () => isOverdue ? "Return Time Passed!" : "Expected Return Time";
    const getStudentDescription = () => {
        if (isOverdue) {
            return `Return was expected by end of ${format(new Date(returnDate), 'MMM d, yyyy')} - please sign back in immediately`;
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

                {/* Show countdown timer or overdue duration */}
                <div className="flex-shrink-0">
                    {isOverdue ? (
                        // Show overdue duration with seconds (for all exeats - same-day and multi-day)
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
                            <div className="text-center min-w-0 px-0.5 sm:px-1">
                                <div className="text-xl sm:text-2xl md:text-2xl font-bold text-red-600">
                                    {timeLeft.days}
                                </div>
                                <div className="text-xs text-red-700 font-medium mt-0.5">Days</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5 sm:px-1">
                                <div className="text-xl sm:text-2xl md:text-2xl font-bold text-red-600">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-red-700 font-medium mt-0.5">Hours</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5 sm:px-1">
                                <div className="text-xl sm:text-2xl md:text-2xl font-bold text-red-600">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-red-700 font-medium mt-0.5">Min</div>
                            </div>
                            <div className="text-center min-w-0 px-0.5 sm:px-1">
                                <div className="text-xl sm:text-2xl md:text-2xl font-bold text-red-600">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-red-700 font-medium mt-0.5">Sec</div>
                            </div>
                        </div>
                    ) : (
                        // Show time remaining (only for multi-day exeats)
                        !isSameDay && (
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
                        )
                    )}
                </div>
            </div>

            {/* Progress Bar - only show for multi-day exeats when not overdue */}
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

            {/* Penalty Information - only show for students when overdue */}
            {isOverdue && variant === 'student' && (
                <div className="mt-4 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-red-900 mb-1">
                                Late Return Penalty
                            </p>
                            <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                                You have been overdue for <span className="font-bold">{timeLeft.days} day{timeLeft.days !== 1 ? 's' : ''}</span>.
                                You will be charged <span className="font-bold">₦{penaltyAmount.toLocaleString()}</span>
                                {' '}(₦10,000 per day overdue).
                            </p>
                            {timeLeft.days === 0 && (
                                <p className="text-xs sm:text-sm text-red-800 mt-1.5">
                                    Note: Charges apply from the first full day overdue.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overdue warning for staff */}
            {isOverdue && variant === 'staff' && (
                <div className="mt-4 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-red-900 mb-1">
                                Student Overdue
                            </p>
                            <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                                Student has been overdue for <span className="font-bold">{timeLeft.days} day{timeLeft.days !== 1 ? 's' : ''}</span>
                                {timeLeft.hours > 0 && <>, <span className="font-bold">{timeLeft.hours} hour{timeLeft.hours !== 1 ? 's' : ''}</span></>}
                                {timeLeft.minutes > 0 && <>, and <span className="font-bold">{timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''}</span></>}.
                                <br className="mt-1" />
                                Late return penalty applies: <span className="font-bold">₦{penaltyAmount.toLocaleString()}</span>
                                {' '}(₦10,000 per day overdue).
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
