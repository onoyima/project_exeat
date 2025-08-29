'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Home,
  GraduationCap,
  Users,
  ArrowRight,
  Stethoscope,
  Palmtree,
  AlertCircle,
  Briefcase,
  Phone,
  FileText,
  History,
  TrendingUp,
  Timer,
  MapPinned,
} from 'lucide-react';
import Link from 'next/link';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { DashboardSkeleton } from '@/components/student/DashboardSkeletons';
import { useRouter } from 'next/navigation';
import { StatusPill } from '@/components/ui/status-pill';
import { cn } from '@/lib/utils';
import { ActionableInsights } from '@/components/student/ActionableInsights';
import { extractMatricFromEmail, formatMatricNumber } from '@/lib/utils/student';


export default function StudentDashboard() {
  const { user } = useGetCurrentUser();
  const router = useRouter()

  const { data: exeatData, isLoading: loadingExeats } = useGetExeatRequestsQuery();
  const exeatRequests = exeatData?.exeat_requests || [];

  // Show skeleton loading if exeat data is still loading
  if (loadingExeats) {
    return <DashboardSkeleton />;
  }

  // Helper function to determine if an exeat is effectively approved
  const isEffectivelyApproved = (exeat: any) => {
    // If status is explicitly approved or completed
    if (['approved', 'completed'].includes(exeat.status)) {
      return true;
    }

    // If status indicates the user has departed and is out of school
    // (security sign out completed OR security sign in pending - user is away)
    if (exeat.status === 'hostel_signout' ||
      exeat.status === 'security_signout' ||
      exeat.status === 'security_signin') {  // User has left school, needs to sign in on return
      return true;
    }

    // If status is in final stages of approval process
    if (['dean_review', 'hostel_signout', 'security_signout', 'security_signin'].includes(exeat.status)) {
      return true;
    }

    return false;
  };

  // Calculate counts for different statuses with progressive disclosure priority
  const inReviewCount = exeatRequests.filter(r =>
    ['cmd_review', 'deputy-dean_review', 'dean_review'].includes(r.status) && !isEffectivelyApproved(r)
  ).length;
  const parentConsentCount = exeatRequests.filter(r => r.status === 'parent_consent' && !isEffectivelyApproved(r)).length;
  const hostelCount = exeatRequests.filter(r =>
    ['hostel_signin', 'hostel_signout'].includes(r.status) && !isEffectivelyApproved(r)
  ).length;
  const approvedCount = exeatRequests.filter(r => isEffectivelyApproved(r)).length;
  const completedCount = exeatRequests.filter(r => r.status === 'completed').length;
  const rejectedCount = exeatRequests.filter(r => r.status === 'rejected').length;

  // Calculate active requests (all except completed, approved, and rejected) - Priority metric
  const activeCount = exeatRequests.filter(r =>
    !['completed', 'approved', 'rejected'].includes(r.status) && !isEffectivelyApproved(r)
  ).length;

  // Find active exeat (approved but not completed - user is currently out)
  const activeExeat = exeatRequests.find(r => {
    try {
      const currentDate = new Date();
      const departureDate = new Date(r.departure_date);
      const returnDate = new Date(r.return_date);
      const isEffectivelyApprovedStatus = isEffectivelyApproved(r);
      const isBeforeReturn = returnDate > currentDate;
      const isAfterDeparture = currentDate >= departureDate;

      // Handle invalid dates
      if (isNaN(departureDate.getTime()) || isNaN(returnDate.getTime())) {
        console.warn('Invalid date format for exeat:', r.id, r.departure_date, r.return_date);
        return false;
      }

      // Check if user has effectively departed and hasn't returned yet
      const hasDeparted = isEffectivelyApprovedStatus && currentDate >= departureDate;

      return (isEffectivelyApprovedStatus && isBeforeReturn && isAfterDeparture) || (hasDeparted && isBeforeReturn);
    } catch (error) {
      console.error('Error processing exeat dates:', error, r);
      return false;
    }
  });

  // Fallback: Show any effectively approved exeat for testing
  const testExeat = exeatRequests.find(r => isEffectivelyApproved(r));

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Welcome Section - Enhanced Mobile-First Responsive Design */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Mobile-first layout with improved stacking */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
              {user?.passport ? (
                <Image
                  src={`data:image/jpeg;base64,${user.passport}`}
                  alt={`${user.fname} ${user.lname}`}
                  fill
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-medium text-primary">
                    {user?.fname?.[0]?.toUpperCase()}{user?.lname?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">Welcome back, {user?.fname}! 👋</h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Here's an overview of your exeat requests and important information
              </p>
            </div>
          </div>

          {/* Mobile-optimized button placement */}
          <Button
            size="lg"
            className="h-12 md:h-14 w-full sm:w-auto sm:min-w-[200px] md:min-w-[220px] transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation text-base px-6"
            onClick={() => router.push("/student/apply-exeat")}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            <span>New Exeat Request</span>
          </Button>
        </div>
      </Card>

      {/* Active Exeat Countdown Timer */}
      {(activeExeat || testExeat) ? (
        <ReturnCountdown exeat={activeExeat || testExeat} />
      ) : (
        /* No exeats at all - with debug info */
        <Card className="p-4 md:p-6 border-2 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-100">
                <Timer className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">No Active Exeats</h3>
                <p className="text-sm text-gray-700">
                  Check browser console for detailed debug information
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total exeats: {exeatRequests.length} | Approved: {approvedCount}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Grid with Enhanced Mobile-First Progressive Disclosure */}
      <div className="space-y-4 md:space-y-6">
        {/* Priority Stats - Most Important Information - Mobile-First Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Requests"
            value={activeCount}
            description="Currently in process"
            icon={Clock}
            className="border-l-4 border-l-blue-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Pending Review"
            value={inReviewCount}
            description="Under staff review"
            icon={FileText}
            className="border-l-4 border-l-yellow-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Parent Consent"
            value={parentConsentCount}
            description="Awaiting parent approval"
            icon={Users}
            className="border-l-4 border-l-purple-500 h-full"
            priority="high"
          />
          <StatsCard
            title="Hostel Process"
            value={hostelCount}
            description="Sign in/out pending"
            icon={Home}
            className="border-l-4 border-l-orange-500 h-full"
            priority="high"
          />
        </div>

        {/* Outcome Stats - Secondary Information - Mobile-First Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Approved"
            value={approvedCount}
            description="Ready for departure"
            icon={CheckCircle2}
            className="border-l-4 border-l-green-500 h-full"
            priority="medium"
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            description="Successfully returned"
            icon={CheckCircle2}
            className="border-l-4 border-l-emerald-500 h-full"
            priority="medium"
          />
          <StatsCard
            title="Rejected"
            value={rejectedCount}
            description="Not approved"
            icon={XCircle}
            className="border-l-4 border-l-red-500 h-full"
            priority="medium"
          />
        </div>
      </div>

      {/* Actionable Insights */}
      <ActionableInsights exeatRequests={exeatRequests} isLoading={loadingExeats} />

      {/* Quick Actions & Student Info - Enhanced Mobile-First Layout */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 p-4 md:p-6">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-base md:text-lg">
              Common tasks you might want to do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/student/exeats" className="w-full">
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 md:h-14 w-full justify-start transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-[0.98] touch-manipulation text-base px-6"
                >
                  <History className="mr-3 h-5 w-5" />
                  <span>View All Exeats</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 md:h-14 w-full justify-start transition-all duration-200 hover:shadow-md hover:bg-gray-50 hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-[0.98] touch-manipulation text-base px-6"
              >
                <Clock className="mr-3 h-5 w-5" />
                <span>View Active Permits</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 p-4 md:p-6">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl font-semibold">Your Information</CardTitle>
            <CardDescription className="text-base md:text-lg">
              Essential academic and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Essential Information - Always Visible (Progressive Disclosure Level 1) */}
            <div className="space-y-4" role="region" aria-label="Essential student information">
              <InfoItem
                icon={GraduationCap}
                label="Matric Number"
                value={formatMatricNumber(extractMatricFromEmail(user?.email)) || user?.matric_no || 'Not available'}
              />
              <InfoItem
                icon={Phone}
                label="Contact"
                value={user?.phone}
                fallback="Not specified"
              />
            </div>

            {/* Progressive Disclosure - Additional Details (Level 2) */}
            <div
              className="pt-4 md:pt-6 space-y-4 border-t border-border/50"
              role="region"
              aria-label="Additional student details"
            >
              <InfoItem
                icon={MapPin}
                label="Address"
                value={user?.address}
                fallback="Not specified"
              />
              {user?.email && (
                <InfoItem
                  icon={Users}
                  label="Email"
                  value={user.email}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exeat Requests - Enhanced Mobile-First Design */}
      <Card className="">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-lg md:text-xl font-semibold">Recent Requests</CardTitle>
          <CardDescription className="text-base md:text-lg">
            Your latest exeat applications and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] md:h-[450px] w-full rounded-md">
            <div className="space-y-4 p-4 md:p-6">
              {exeatRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-base">No exeat requests found</p>
                </div>
              ) : (
                exeatRequests.map((request) => (
                  <Link
                    href={`/student/exeats/${request.id}`}
                    key={request.id}
                    className={cn(
                      "group relative block p-4 md:p-6 rounded-lg transition-all duration-200",
                      "hover:shadow-md hover:-translate-y-0.5 hover:bg-accent/30",
                      "border border-border/50 hover:border-border",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "touch-manipulation min-h-[120px] md:min-h-[140px]"
                    )}
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Category Icon with Enhanced Visual Hierarchy */}
                      <div className={cn(
                        "flex-shrink-0 p-3 md:p-4 rounded-lg transition-all duration-200",
                        "bg-primary/5 group-hover:bg-primary/10 group-hover:scale-105",
                        "border border-primary/10 group-hover:border-primary/20"
                      )}>
                        {request.is_medical || request.category_id === 1 ? (
                          <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                        ) : request.category_id === 2 ? (
                          <Palmtree className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                        ) : request.category_id === 3 ? (
                          <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                        ) : (
                          <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        )}
                      </div>

                      {/* Content with Improved Visual Hierarchy */}
                      <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                        {/* Header with Better Typography Hierarchy */}
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base md:text-lg font-semibold capitalize text-foreground group-hover:text-primary transition-colors duration-200">
                                {request.is_medical ? 'Medical' : request.category_id === 1 ? 'Medical' :
                                  request.category_id === 2 ? 'Casual' :
                                    request.category_id === 3 ? 'Emergency' :
                                      request.category_id === 4 ? 'Official' : 'Unknown'}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground hidden sm:inline">•</span>
                                <span className="text-sm md:text-base text-muted-foreground font-medium">
                                  {format(new Date(request.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Enhanced Status Badge Following Design Philosophy */}
                          <StatusPill status={request.status} size="sm" />
                        </div>

                        {/* Reason with Better Typography */}
                        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                          {request.reason}
                        </p>

                        {/* Details with Improved Spacing and Visual Hierarchy - Mobile-First */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-x-6 md:gap-x-8 sm:gap-y-3 pt-2">
                          <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground min-h-[44px] touch-manipulation">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                            <span className="truncate max-w-[200px] md:max-w-[240px] font-medium">{request.destination}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground min-h-[44px] touch-manipulation">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                            <span className="font-medium">
                              {format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground min-h-[44px] touch-manipulation">
                            <Phone className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                            <span className="font-medium capitalize">{request.preferred_mode_of_contact}</span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Arrow with Better Animation */}
                      <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2">
                        <div className={cn(
                          "p-2 md:p-3 rounded-full transition-all duration-200",
                          "opacity-0 group-hover:opacity-100 group-hover:scale-110",
                          "bg-primary/10 group-hover:bg-primary/20",
                          "border border-primary/20 group-hover:border-primary/30"
                        )}>
                          <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

    </div >
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

function StatsCard({ title, value, description, icon: Icon, className, priority = 'medium' }: StatsCardProps) {
  return (
    <Card className={cn(
      "flex flex-col transition-all duration-200 hover:shadow-md touch-manipulation min-h-[120px] md:min-h-[140px]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 flex-shrink-0 p-4 md:p-6">
        <CardTitle className={cn(
          "font-medium leading-tight",
          priority === 'high' ? "text-sm md:text-base" : "text-xs md:text-sm"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "text-muted-foreground flex-shrink-0",
          priority === 'high' ? "h-4 w-4 md:h-5 md:w-5" : "h-4 w-4"
        )} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between p-4 md:p-6 pt-0">
        <div className={cn(
          "font-bold mb-2 md:mb-3",
          priority === 'high' ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
        )}>
          {value}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-tight">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  fallback?: string;
}

function InfoItem({ icon: Icon, label, value, fallback = 'Not available' }: InfoItemProps) {
  const displayValue = value || fallback;
  const isValueMissing = !value;

  return (
    <div className="flex items-center gap-3 md:gap-4 min-h-[48px] touch-manipulation">
      <Icon
        className="h-5 w-5 text-muted-foreground flex-shrink-0"
        aria-hidden="true"
      />
      <div className="space-y-1 min-w-0 flex-1">
        <p
          className={cn(
            "text-sm md:text-base font-medium leading-none truncate",
            isValueMissing && "text-muted-foreground"
          )}
          title={displayValue}
        >
          {displayValue}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

interface ReturnCountdownProps {
  exeat: any;
}

function ReturnCountdown({ exeat }: ReturnCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    totalMinutes: number;
  }>({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 });

  console.log('ReturnCountdown received exeat:', {
    id: exeat.id,
    return_date: exeat.return_date,
    departure_date: exeat.departure_date,
    status: exeat.status
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const returnDate = new Date(exeat.return_date);

        console.log('Raw return date:', exeat.return_date);
        console.log('Parsed return date:', returnDate);
        console.log('Return date is valid:', !isNaN(returnDate.getTime()));

        if (isNaN(returnDate.getTime())) {
          console.error('Invalid return date format:', exeat.return_date);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 });
          return;
        }

        const totalMinutes = differenceInMinutes(returnDate, now);

        console.log('Countdown calculation:', {
          now: now.toISOString(),
          returnDate: returnDate.toISOString(),
          totalMinutes,
          isOverdue: totalMinutes <= 0
        });

        if (totalMinutes <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes });
          return;
        }

        const days = differenceInDays(returnDate, now);
        const hours = differenceInHours(returnDate, now) % 24;
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
  }, [exeat.return_date]);

  const isOverdue = timeLeft.totalMinutes <= 0;
  const isUrgent = timeLeft.totalMinutes <= 1440 && timeLeft.totalMinutes > 0; // Less than 24 hours

  return (
    <Card className={cn(
      "p-4 md:p-6 border-2 transition-all duration-300",
      isOverdue
        ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100"
        : isUrgent
          ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-orange-100"
          : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-full",
            isOverdue ? "bg-red-100" :
              isUrgent ? "bg-orange-100" : "bg-green-100"
          )}>
            {isOverdue ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : isUrgent ? (
              <Timer className="h-6 w-6 text-orange-600" />
            ) : (
              <MapPinned className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-lg",
              isOverdue ? "text-red-900" :
                isUrgent ? "text-orange-900" : "text-green-900"
            )}>
              {isOverdue ? "Return Time Passed!" : "Expected Return Time"}
            </h3>
            <p className={cn(
              "text-sm",
              isOverdue ? "text-red-700" :
                isUrgent ? "text-orange-700" : "text-green-700"
            )}>
              {isOverdue
                ? `Return was expected on ${format(new Date(exeat.return_date), 'MMM d, yyyy')} - please sign back in`
                : `Expected return on ${format(new Date(exeat.return_date), 'MMM d, yyyy')} - please sign back in upon return`
              }
            </p>
          </div>
        </div>

        {!isOverdue && (
          <div className="text-right">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center">
                <div className={cn(
                  "text-2xl md:text-3xl font-bold",
                  isUrgent ? "text-orange-600" : "text-green-600"
                )}>
                  {timeLeft.days}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl md:text-3xl font-bold",
                  isUrgent ? "text-orange-600" : "text-green-600"
                )}>
                  {timeLeft.hours}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Hours</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-2xl md:text-3xl font-bold",
                  isUrgent ? "text-orange-600" : "text-green-600"
                )}>
                  {timeLeft.minutes}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isOverdue && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-1000",
                isUrgent ? "bg-orange-500" : "bg-green-500"
              )}
              style={{
                width: `${Math.max(0, Math.min(100, ((new Date(exeat.return_date).getTime() - new Date(exeat.departure_date).getTime() - (new Date(exeat.return_date).getTime() - new Date().getTime())) / (new Date(exeat.return_date).getTime() - new Date(exeat.departure_date).getTime())) * 100))}%`
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isUrgent ? "⚠️ Less than 24 hours remaining - sign back in soon" : "Please sign back in by your return date"}
          </p>
        </div>
      )}
    </Card>
  );
}