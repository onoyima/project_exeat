'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog-animation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCurrentUser } from '@/hooks/use-current-user';
import { format } from 'date-fns';
import ExeatApplicationForm from '@/components/ExeatApplicationForm';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  User,
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
} from 'lucide-react';
import Link from 'next/link';
import { useGetExeatRequestsQuery } from '@/lib/services/exeatApi';
import { getStatusColor, getStatusText, isActiveStatus } from '@/lib/utils/exeat';
import { cn } from '@/lib/utils';

export default function StudentDashboard() {
  const { user } = useGetCurrentUser();

  const { data: exeatData, isLoading: loadingExeats } = useGetExeatRequestsQuery();
  const exeatRequests = exeatData?.exeat_requests || [];

  // Calculate counts for different statuses
  const pendingCount = exeatRequests.filter(r => r.status === 'pending').length;
  const inReviewCount = exeatRequests.filter(r =>
    ['cmd_review', 'deputy-dean_review', 'dean_review'].includes(r.status)
  ).length;
  const parentConsentCount = exeatRequests.filter(r => r.status === 'parent_consent').length;
  const hostelCount = exeatRequests.filter(r =>
    ['hostel_signin', 'hostel_signout'].includes(r.status)
  ).length;
  const approvedCount = exeatRequests.filter(r => r.status === 'approved').length;
  const completedCount = exeatRequests.filter(r => r.status === 'completed').length;
  const rejectedCount = exeatRequests.filter(r => r.status === 'rejected').length;

  // Calculate active requests (all except completed, approved, and rejected)
  const activeCount = exeatRequests.filter(r =>
    !['completed', 'approved', 'rejected'].includes(r.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-primary/10">
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
                    <span className="text-lg font-medium text-primary">
                      {user?.fname?.[0]?.toUpperCase()}{user?.lname?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">Welcome back, {user?.fname}! 👋</CardTitle>
                <CardDescription className="text-base">
                  Here's an overview of your exeat requests and important information
                </CardDescription>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Exeat Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Request New Exeat</DialogTitle>
                  <DialogDescription>
                    Please provide the details for your exeat request. We'll guide you through the process.
                  </DialogDescription>
                </DialogHeader>
                <ExeatApplicationForm onSuccess={() => { }} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Requests"
          value={activeCount}
          description="Currently in process"
          icon={Clock}
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard
          title="Pending Review"
          value={inReviewCount}
          description="Under staff review"
          icon={FileText}
          className="border-l-4 border-l-yellow-500"
        />
        <StatsCard
          title="Parent Consent"
          value={parentConsentCount}
          description="Awaiting parent approval"
          icon={Users}
          className="border-l-4 border-l-purple-500"
        />
        <StatsCard
          title="Hostel Process"
          value={hostelCount}
          description="Sign in/out pending"
          icon={Home}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Outcome Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          title="Approved"
          value={approvedCount}
          description="Ready for departure"
          icon={CheckCircle2}
          className="border-l-4 border-l-green-500"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          description="Successfully returned"
          icon={CheckCircle2}
          className="border-l-4 border-l-emerald-500"
        />
        <StatsCard
          title="Rejected"
          value={rejectedCount}
          description="Not approved"
          icon={XCircle}
          className="border-l-4 border-l-red-500"
        />
      </div>

      {/* Quick Actions & Student Info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to do
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/student/exeats" className="w-full">
                <Button variant="outline" className="w-full">
                  <History className="mr-2 h-4 w-4" />
                  View All Exeats
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                View Active Permits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Your academic details
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoItem
              icon={GraduationCap}
              label="Matriculation Number"
              value={user?.matric_no}
            />
            <InfoItem
              icon={Home}
              label="Current Address"
              value={user?.address}
              fallback="Not specified"
            />
            <InfoItem
              icon={Users}
              label="Contact Number"
              value={user?.phone}
              fallback="Not specified"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Exeat Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exeat Requests</CardTitle>
          <CardDescription>
            Your latest exeat applications and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="space-y-4 p-4">
              {loadingExeats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="space-y-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">Loading exeat requests...</p>
                  </div>
                </div>
              ) : exeatRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No exeat requests found</p>
                </div>
              ) : (
                exeatRequests.map((request) => (
                  <Link
                    href={`/student/exeat/${request.id}`}
                    key={request.id}
                    className={cn(
                      "group relative block p-4 hover:bg-accent/50 rounded-lg transition-all duration-200",
                      "hover:shadow-md hover:-translate-y-0.5",
                      "border border-border/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div className={cn(
                        "flex-shrink-0 p-2.5 rounded-lg",
                        "bg-primary/5 group-hover:bg-primary/10 transition-colors",
                        getStatusColor(request.status)
                      )}>
                        {request.is_medical || request.category_id === 1 ? (
                          <Stethoscope className="h-5 w-5" />
                        ) : request.category_id === 2 ? (
                          <Palmtree className="h-5 w-5" />
                        ) : request.category_id === 3 ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <Briefcase className="h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium capitalize">
                              {request.is_medical ? 'Medical' : request.category_id === 1 ? 'Medical' :
                                request.category_id === 2 ? 'Casual' :
                                  request.category_id === 3 ? 'Emergency' :
                                    request.category_id === 4 ? 'Official' : 'Unknown'}
                            </h3>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(request.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusColor(request.status))}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>

                        {/* Reason */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.reason}
                        </p>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">{request.destination}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(request.departure_date), 'MMM d')} - {format(new Date(request.return_date), 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{request.preferred_mode_of_contact}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className={cn(
                          "p-2 rounded-full",
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          "bg-primary/5 group-hover:bg-primary/10"
                        )}>
                          <ArrowRight className="h-4 w-4 text-primary" />
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
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
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
  return (
    <div className="flex items-center gap-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">
          {value || fallback}
        </p>
        <p className="text-sm text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}