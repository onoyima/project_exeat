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