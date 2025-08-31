'use client';

export default function StaffHistoryPage() {

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Exeat History</h1>
                            <p className="text-muted-foreground mt-1">
                                View all your completed exeat requests
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
