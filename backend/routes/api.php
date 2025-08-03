<?php

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('api', function ($request) {
    return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
});

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentExeatRequestController;
use App\Http\Controllers\StaffExeatRequestController;
use App\Http\Controllers\ParentConsentController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\ExeatAttachmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminStaffController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminStudentController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\DeanController;
use App\Http\Controllers\CmdController;
use App\Http\Controllers\HostelController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminExeatController;
use App\Http\Controllers\AdminConfigController;
use App\Http\Controllers\ExeatController; // ✅ Add this

// Log test route
Route::get('/test-log', function () {
    \Log::info('Test log entry from /api/test-log');
    return response()->json(['message' => 'Log written']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->get('/me', [MeController::class, 'me']);

Route::middleware('auth:sanctum')->group(function () {
    // Student routes
    Route::post('/student/exeat-requests', [StudentExeatRequestController::class, 'store']);
    Route::get('/student/exeat-requests', [StudentExeatRequestController::class, 'index']);
    Route::get('/student/exeat-requests/{id}', [StudentExeatRequestController::class, 'show']);
    Route::post('/student/exeat-requests/{id}/appeal', [StudentExeatRequestController::class, 'appeal']);
    Route::get('/student/exeat-requests/{id}/download', [StudentExeatRequestController::class, 'download']);
    Route::get('/student/profile', [StudentExeatRequestController::class, 'profile']);
    Route::get('/student/exeat-categories', [StudentExeatRequestController::class, 'categories']);

    // Exeat attachments
    Route::post('/exeat-requests/{id}/attachments', [ExeatAttachmentController::class, 'store']);
    Route::get('/exeat-requests/{id}/attachments', [ExeatAttachmentController::class, 'index']);

    // Staff routes
    Route::get('/staff/exeat-requests', [StaffExeatRequestController::class, 'index']);
    Route::get('/staff/exeat-requests/{id}', [StaffExeatRequestController::class, 'show']);
    Route::post('/staff/exeat-requests/{id}/approve', [StaffExeatRequestController::class, 'approve']);
    Route::post('/staff/exeat-requests/{id}/reject', [StaffExeatRequestController::class, 'reject']);
    Route::post('/staff/exeat-requests/{id}/send-parent-consent', [StaffExeatRequestController::class, 'sendParentConsent']);

    // Dean routes
    Route::get('/dean/exeat-requests', [DeanController::class, 'index']);
    Route::post('/dean/exeat-requests/bulk-approve', [DeanController::class, 'bulkApprove']);

    // CMD routes
    Route::get('/cmd/exeat-requests', [CmdController::class, 'index']);
    Route::post('/cmd/exeat-requests/{id}/approve', [CmdController::class, 'approve']);

    // Admin Staff Management
    Route::get('/admin/staff', [AdminStaffController::class, 'index']);
    Route::get('/admin/staff/assignments', [AdminStaffController::class, 'assignments']);
    Route::post('/admin/staff', [AdminStaffController::class, 'store']);
    Route::get('/admin/staff/{id}', [AdminStaffController::class, 'show']);
    Route::put('/admin/staff/{id}', [AdminStaffController::class, 'update']);
    Route::delete('/admin/staff/{id}', [AdminStaffController::class, 'destroy']);
    Route::post('/admin/staff/{id}/assign-exeat-role', [AdminStaffController::class, 'assignExeatRole']);

    // Admin Student Management
    Route::get('/admin/students', [AdminStudentController::class, 'index']);
    Route::post('/admin/students', [AdminStudentController::class, 'store']);
    Route::get('/admin/students/{id}', [AdminStudentController::class, 'show']);
    Route::put('/admin/students/{id}', [AdminStudentController::class, 'update']);
    Route::delete('/admin/students/{id}', [AdminStudentController::class, 'destroy']);

    // Role Management
    Route::get('/admin/roles', [AdminRoleController::class, 'index']);
    Route::post('/admin/roles', [AdminRoleController::class, 'store']);
    Route::put('/admin/roles/{id}', [AdminRoleController::class, 'update']);
    Route::delete('/admin/roles/{id}', [AdminRoleController::class, 'destroy']);

    // Hostel & Security
    Route::post('/hostel/signout/{exeat_request_id}', [HostelController::class, 'signOut']);
    Route::post('/hostel/signin/{exeat_request_id}', [HostelController::class, 'signIn']);
    Route::post('/security/validate', [SecurityController::class, 'validateStudent']);
    Route::post('/security/signout/{exeat_request_id}', [SecurityController::class, 'signOut']);
    Route::post('/security/signin/{exeat_request_id}', [SecurityController::class, 'signIn']);
    Route::get('/hostels', [HostelController::class, 'index']);
    Route::post('/hostels/{id}/assign-admin', [HostelController::class, 'assignAdmin']);

    // Notification Preferences
    Route::get('/user/notification-preferences', [NotificationPreferenceController::class, 'show']);
    Route::put('/user/notification-preferences', [NotificationPreferenceController::class, 'update']);

    // Communication Integration
    Route::post('/communication/test', [CommunicationController::class, 'test']);
    Route::get('/communication/channels', [CommunicationController::class, 'channels']);

    // Reports
    Route::get('/reports/exeats', [ReportController::class, 'exeats']);
    Route::get('/reports/audit-logs', [ReportController::class, 'auditLogs']);

    // Admin Exeat Management
    Route::post('/admin/exeats/{id}/revoke', [AdminExeatController::class, 'revoke']);

    // Admin Config
    Route::get('/admin/config', [AdminConfigController::class, 'show']);
    Route::put('/admin/config', [AdminConfigController::class, 'update']);

    // ✅ Exeat Approval and Parent Consent (authenticated)
    Route::prefix('exeats')->group(function () {
        Route::post('{exeat}/approvals/{approval}/approve', [ExeatController::class, 'approve']);
        Route::post('{exeat}/approvals/{approval}/reject', [ExeatController::class, 'reject']);
        Route::post('{exeat}/parent-consent/request', [ExeatController::class, 'requestParentConsent']);
    });
});

// ✅ Parent Consent (public - no auth)
Route::prefix('exeats')->group(function () {
    Route::get('parent-consent/approve/{token}', [ExeatController::class, 'parentConsentApprove']);
    Route::get('parent-consent/decline/{token}', [ExeatController::class, 'parentConsentDecline']);
});



// ✅ Parent Consent via token
Route::get('/parent/consent/{token}', [ParentConsentController::class, 'show']);
Route::post('/parent/consent/{token}/approve', [ParentConsentController::class, 'approve']);
Route::post('/parent/consent/{token}/decline', [ParentConsentController::class, 'decline']);

// ✅ Admin: Bulk parent reminder
Route::middleware(['auth:sanctum', 'can:admin'])->post('/parent/consent/remind', [ParentConsentController::class, 'remind']);

// ✅ Lookup & analytics
Route::get('/lookups/roles', [LookupController::class, 'roles']);
Route::get('/lookups/hostel-admins', [LookupController::class, 'hostelAdmins']);
Route::get('/lookups/hostels', [LookupController::class, 'hostels']);
Route::get('/analytics/exeat-usage', [LookupController::class, 'exeatUsage']);
Route::get('/api/audit-logs', [LookupController::class, 'auditLogs']);

// ✅ Notifications
Route::middleware('auth:sanctum')->get('/notifications', [NotificationController::class, 'index']);
Route::middleware('auth:sanctum')->post('/notifications/mark-read', [NotificationController::class, 'markRead']);
