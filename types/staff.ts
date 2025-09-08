/**
 * Staff member information
 */
export interface Staff {
    id: number;
    name: string;
    email: string;
    phone?: string;
    position?: string;
}

/**
 * Exeat role information
 */
export interface ExeatRole {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
}

/**
 * Staff exeat role assignment
 */
export interface ExeatRoleAssignment {
    staff_id: number;
    exeat_role_id: number;
    staff: Staff;
    role: ExeatRole;
    assigned_at?: string;
}

/**
 * Staff exeat approval request
 */
export interface StaffExeatApproval {
    exeat_request_id: number;
    staff_id: number;
    approved: boolean;
    comment?: string;
    approved_at: string;
}

/**
 * Hostel admin assignment
 */
export interface HostelAdminAssignment {
    staff_id: number;
    hostel_id: number;
    staff: Staff;
    hostel_name: string;
    assigned_at: string;
}

/**
 * Staff profile with roles
 */
export interface StaffProfile {
    id: number;
    user_type: number;
    fname: string;
    lname: string;
    mname?: string;
    maiden_name?: string;
    dob: string;
    title: string;
    country_id: string;
    state_id: string;
    lga_name: string;
    address: string;
    city: string;
    religion: string;
    phone: string;
    p_email: string;
    marital_status: string;
    gender: string;
    email: string;
    status: number;
    created_at: string;
    updated_at: string;
    contacts: Array<{
        id: number;
        staff_id: number;
        name: string;
        relationship: string;
        address: string;
        state: string;
        phone_no: string;
        phone_no_two?: string;
        email: string;
        status: number;
        created_at: string;
        updated_at: string;
    }>;
    exeat_roles: Array<{
        id: number;
        staff_id: number;
        exeat_role_id: number;
        assigned_at: string;
        updated_at: string;
        created_at: string;
        role: {
            id: number;
            name: string;
            display_name: string;
            description: string;
            created_at: string;
            updated_at: string;
        };
    }>;
}

/**
 * Staff approval action
 */
export interface StaffApprovalAction {
    exeat_request_id: number;
    action: 'approve' | 'reject';
    comment?: string;
}

/**
 * Student sign out/in action
 */
export interface StudentSignAction {
    exeat_request_id: number;
    action: 'sign_out' | 'sign_in';
    comment?: string;
}

/**
 * Exeat statistics for staff dashboard
 */
export interface ExeatStatistics {
    total_pending: number;
    total_approved: number;
    total_rejected: number;
    total_signed_out: number;
    total_signed_in: number;
    role_specific_stats: Record<string, {
        pending: number;
        approved: number;
        rejected: number;
    }>;
}

/**
 * Student information for completed exeat requests
 */
export interface CompletedExeatStudent {
    id: number;
    name: string;
    matric_no: string | null;
    email: string;
    passport?: string;
}

/**
 * Approval information for completed exeat requests
 */
export interface CompletedExeatApproval {
    staff_name: string;
    status: string;
    comments: string | null;
    approved_at: string;
}

/**
 * Individual completed exeat request
 */
export interface CompletedExeatRequest {
    id: number;
    student: CompletedExeatStudent;
    category: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    status: string;
    is_medical: boolean;
    approvals: CompletedExeatApproval[];
    created_at: string;
    updated_at: string;
}

/**
 * Pagination information for completed exeat requests
 */
export interface CompletedExeatRequestsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

/**
 * Status summary for completed exeat requests
 */
export interface CompletedExeatRequestsStatusSummary {
    status: string;
    total_count: number;
    medical_count: number;
    regular_count: number;
}

/**
 * Full response for completed exeat requests query
 */
export interface CompletedExeatRequestsResponse {
    success: boolean;
    data: CompletedExeatRequest[];
    pagination: CompletedExeatRequestsPagination;
    status_summary: CompletedExeatRequestsStatusSummary;
}

/**
 * Student information for rejected exeat requests
 */
export interface RejectedExeatStudent {
    id: number;
    name: string;
    matric_no: string | null;
    email: string;
}

/**
 * Approval information for rejected exeat requests
 */
export interface RejectedExeatApproval {
    staff_name: string;
    status: string;
    comments: string | null;
    approved_at: string;
}

/**
 * Individual rejected exeat request
 */
export interface RejectedExeatRequest {
    id: number;
    student: RejectedExeatStudent;
    category: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    status: string;
    is_medical: boolean;
    approvals: RejectedExeatApproval[];
    created_at: string;
    updated_at: string;
}

/**
 * Pagination information for rejected exeat requests
 */
export interface RejectedExeatRequestsPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

/**
 * Status summary for rejected exeat requests
 */
export interface RejectedExeatRequestsStatusSummary {
    status: string;
    total_count: number;
    medical_count: number;
    regular_count: number;
}

/**
 * Full response for rejected exeat requests query
 */
export interface RejectedExeatRequestsResponse {
    success: boolean;
    data: RejectedExeatRequest[];
    pagination: RejectedExeatRequestsPagination;
    status_summary: RejectedExeatRequestsStatusSummary;
}

/**
 * Admin Dashboard Overview
 */
export interface AdminDashboardOverview {
    total_students: number;
    total_staff: number;
    active_exeats: number;
    pending_approvals: number;
    total_requests_today: number;
    system_uptime: string;
}

/**
 * Admin Dashboard Exeat Statistics
 */
export interface AdminDashboardExeatStatistics {
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
    pending_requests: number;
    approval_rate: number;
    average_processing_time: string;
}

/**
 * Admin Dashboard User Analytics
 */
export interface AdminDashboardUserAnalytics {
    active_users: number;
    new_registrations: number;
    role_distribution: Record<string, number>;
}

/**
 * Admin Dashboard Performance Metrics
 */
export interface AdminDashboardPerformanceMetrics {
    average_response_time: string;
    system_load: string;
    database_queries_per_minute: number;
    cache_hit_rate: string;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
    id: number;
    action: string;
    target_type: string;
    target_id: number;
    actor: {
        type: string;
        name: string;
        email?: string;
        student_id?: number | null;
    };
    timestamp: string;
    details: string;
    formatted_time: string;
}

/**
 * Audit Trail Section
 */
export interface AdminDashboardAuditTrail {
    audit_logs: AuditLogEntry[];
    total_actions: number;
    action_summary: Record<string, number>;
}

/**
 * Chart Dataset
 */
export interface ChartDataset {
    label: string;
    data: (number | string)[];
    borderColor?: string;
    backgroundColor?: string | string[];
}

/**
 * Chart Configuration
 */
export interface ChartConfig {
    labels: string[];
    datasets: ChartDataset[];
    backgroundColor?: string[];
}

/**
 * Audit Statistics Charts
 */
export interface AdminDashboardAuditStatistics {
    daily_activity_chart: ChartConfig;
    action_types_chart: {
        labels: string[];
        data: number[];
        backgroundColor: string[];
    };
}

/**
 * Dashboard Charts
 */
export interface AdminDashboardCharts {
    exeat_trends: ChartConfig;
    status_distribution: {
        labels: string[];
        data: number[];
        backgroundColor: string[];
    };
    user_activity: ChartConfig;
    approval_rates: ChartConfig;
}

/**
 * Recent Activity Entry
 */
export interface RecentActivityEntry {
    id: number;
    student_name: string;
    status: string;
    created_at: string;
    approved_by: string | null;
}

/**
 * Admin Dashboard Response
 */
export interface AdminDashboardResponse {
    success: boolean;
    data: {
        overview: AdminDashboardOverview;
        exeat_statistics: AdminDashboardExeatStatistics;
        user_analytics: AdminDashboardUserAnalytics;
        performance_metrics: AdminDashboardPerformanceMetrics;
        audit_trail: AdminDashboardAuditTrail;
        audit_statistics: AdminDashboardAuditStatistics;
        charts: AdminDashboardCharts;
        recent_activities: RecentActivityEntry[];
    };
}

/**
 * Staff Dashboard Overview Statistics
 */
export interface StaffDashboardOverview {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
}

/**
 * Status Analytics Entry
 */
export interface StatusAnalytics {
    status: string;
    count: number;
}

/**
 * Department Analytics Entry
 */
export interface DepartmentAnalytics {
    department: string;
    count: number;
}

/**
 * Date Analytics Entry
 */
export interface DateAnalytics {
    date: string;
    count: number;
}

/**
 * Staff Dashboard Analytics
 */
export interface StaffDashboardAnalytics {
    by_status: StatusAnalytics[];
    by_department: DepartmentAnalytics[];
    by_date: DateAnalytics[];
}

// Types
export interface AdminStaffAssignment {
    staff_id?: number;
    staff_name: string;
    staff_email: string;
    role_name: string;
    role_display_name: string;
    assigned_at: string;
    exeat_role_id?: number;
}

export interface AdminRole {
    id: number;
    name: string;
    display_name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface AssignRoleRequest {
    staff_id: number;
    exeat_role_id: number;
}

export interface AssignRoleResponse {
    id: number;
    staff_id: number;
    exeat_role_id: number;
    assigned_at: string;
}

export interface StaffMember {
    id: number;
    fname: string;
    lname: string;
    middle_name?: string;
    email: string;
    title?: string;
    status?: number;
}

export interface UnassignRoleRequest {
    exeat_role_id: number;
}

/**
 * Staff Dashboard Statistics Response
 */
export interface StaffDashboardStats {
    data: {
        total_requests: number;
        pending_requests: number;
        approved_requests: number;
        rejected_requests: number;
        analytics: StaffDashboardAnalytics;
    };
}

/**
 * Audit Trail Overview Statistics
 */
export interface AuditTrailOverview {
    department_students: number;
    pending_approvals: number;
    approved_today: number;
    department_approval_rate: number;
}

/**
 * Department Statistics
 */
export interface DepartmentStatistics {
    total_requests: number;
    average_processing_time: string;
    most_active_day: string;
}

/**
 * Audit Trail Response
 */
export interface AuditTrailResponse {
    success: boolean;
    data: {
        overview: AuditTrailOverview;
        department_statistics: DepartmentStatistics;
        pending_approvals: any[];
        student_analytics: null;
        audit_trail: {
            audit_logs: AuditLogEntry[];
            total_actions: number;
            action_summary: Record<string, number>;
        };
        charts: {
            department_trends: null;
            approval_timeline: null;
            student_activity: null;
        };
        recent_requests: null;
    };
} 