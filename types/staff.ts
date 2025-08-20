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