/**
 * Student profile information
 */
export interface StudentProfile {
    matric_no: string;
    parent_surname: string;
    parent_othernames: string;
    parent_phone_no: string;
    parent_phone_no_two: string;
    parent_email: string;
    student_accommodation: string;
}

/**
 * Exeat request form data
 */
export interface ExeatRequestForm {
    category_id: number;
    preferred_mode_of_contact: string;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
}

/**
 * Exeat request status type
 */
export type ExeatStatus =
    | 'pending'
    | 'cmd_review'
    | 'deputy-dean_review'
    | 'parent_consent'
    | 'dean_review'
    | 'hostel_signin'
    | 'hostel_signout'
    | 'approved'
    | 'rejected'
    | 'completed';

/**
 * Exeat request details
 */
export interface ExeatRequest {
    id: number;
    student_id: number;
    matric_no: string;
    category_id: number;
    reason: string;
    destination: string;
    departure_date: string;
    return_date: string;
    preferred_mode_of_contact: string;
    parent_surname: string;
    parent_othernames: string;
    parent_phone_no: string;
    parent_phone_no_two: string | null;
    parent_email: string;
    student_accommodation: string | null;
    status: string;
    is_medical: number;
    created_at: string;
    updated_at: string;
}

/**
 * Exeat category
 */
export interface ExeatCategory {
    id: number;
    name: string;
} 