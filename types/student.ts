/**
 * Student profile information
 */
export interface StudentProfile {
    personal: {
        fname: string;
        middle_name: string;
        last_name: string;
        gender: string;
        dob: string;
        marital_status: string;
        title: number;
        nationality: {
            country_id: number;
            state_id: number;
            lga_name: string;
            city: string;
        };
        contact: {
            address: string;
            phone: string;
            email: string;
            username: string;
        };
        extras: {
            passport?: string;
            signature?: string;
            hobbies?: string;
            status: number;
        };
    };
    academic: {
        matric_no: string;
        old_matric_no: string;
        course_study_id: number;
        level: number;
        entry_mode_id: number;
        study_mode_id: number;
        academic_session_id: number;
        admissions_type_id: number;
        faculty_id: number;
        department_id: number;
        acad_status_id: number;
        admitted_date: string | null;
        jamb_no: string;
        jamb_score: number;
        is_hostel: boolean | null;
        studentship: number;
        studentship_id: number;
        program_type: string;
    };
    medical: {
        physical: string;
        blood_group: string;
        genotype: string;
        condition: string;
        allergies: string;
    };
    sponsor_contact: {
        title: string;
        full_name: string;
        relationship: string;
        address: string;
        state: string;
        city: string;
        phone_no: string;
        phone_no_two: string;
        email: string;
        email_two: string;
    };
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
    category?: {
        id: number;
        name: string;
    };
}

/**
 * Exeat category
 */
export interface ExeatCategory {
    id: number;
    name: string;
} 