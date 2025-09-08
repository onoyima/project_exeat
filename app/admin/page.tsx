'use client';

import { useGetAdminDashboardStatsQuery } from '@/lib/services/adminApi';

export default function AdminDashboard() {
    const { data: dashboardStats, isLoading: dashboardStatsLoading } = useGetAdminDashboardStatsQuery();

    console.log("dashboardStats", dashboardStats);

    return (
        <div className="space-y-6 p-6">

        </div>
    );
}

