-- =====================================
-- New Tables for Exeat System (newtables.sql)
-- References existing tables in exeat_structure.sql
-- =====================================

-- Table: exeat_requests
CREATE TABLE exeat_requests (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id BIGINT(20) UNSIGNED NOT NULL, -- FK to students(id)
    category VARCHAR(50) NOT NULL, -- e.g., medical, holiday, daily, etc.
    reason VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., pending, approved, rejected, completed
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for exeat_requests
INSERT INTO exeat_requests (student_id, category, reason, location, departure_date, return_date, status, created_at)
VALUES (1001, 'medical', 'Medical checkup at city hospital', 'Abuja', '2024-07-01', '2024-07-03', 'pending', NOW());

-- Table: exeat_approvals
CREATE TABLE exeat_approvals (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    exeat_request_id BIGINT(20) UNSIGNED NOT NULL, -- FK to exeat_requests(id)
    staff_id INT(10) UNSIGNED NOT NULL, -- FK to staff(id)
    role VARCHAR(50) NOT NULL, -- e.g., cmd, deputy_dean, dean, hostel_admin, security
    status VARCHAR(20) NOT NULL, -- approved, rejected, pending
    comment VARCHAR(255) DEFAULT NULL,
    method VARCHAR(50) DEFAULT NULL, -- web, sms, whatsapp, call
    created_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (exeat_request_id) REFERENCES exeat_requests(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for exeat_approvals
INSERT INTO exeat_approvals (exeat_request_id, staff_id, role, status, comment, method, created_at)
VALUES (1, 2001, 'cmd', 'approved', 'Approved for medical leave', 'web', NOW());

-- Table: staff_exeat_roles
CREATE TABLE staff_exeat_roles (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id INT(10) UNSIGNED NOT NULL, -- FK to staff(id)
    exeat_role VARCHAR(50) NOT NULL, -- e.g., cmd, dean, deputy_dean, hostel_admin, security, admin, master_admin
    assigned_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for staff_exeat_roles
INSERT INTO staff_exeat_roles (staff_id, exeat_role, assigned_at)
VALUES (2001, 'cmd', NOW()), (2002, 'deputy_dean', NOW());

-- Table: parent_consents
CREATE TABLE parent_consents (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    exeat_request_id BIGINT(20) UNSIGNED NOT NULL, -- FK to exeat_requests(id)
    student_contact_id BIGINT(20) UNSIGNED NOT NULL, -- FK to student_contacts(id)
    consent_status VARCHAR(20) NOT NULL, -- pending, approved, declined
    consent_method VARCHAR(20) DEFAULT NULL, -- sms, email, whatsapp, call
    consent_token VARCHAR(100) DEFAULT NULL, -- for secure links
    consent_timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (exeat_request_id) REFERENCES exeat_requests(id),
    FOREIGN KEY (student_contact_id) REFERENCES student_contacts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for parent_consents
INSERT INTO parent_consents (exeat_request_id, student_contact_id, consent_status, consent_method, consent_token, consent_timestamp)
VALUES (1, 3001, 'approved', 'whatsapp', 'abc123token', NOW());

-- Table: hostel_signouts
CREATE TABLE hostel_signouts (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    exeat_request_id BIGINT(20) UNSIGNED NOT NULL, -- FK to exeat_requests(id)
    hostel_admin_id INT(10) UNSIGNED NOT NULL, -- FK to staff(id)
    signout_time TIMESTAMP NULL DEFAULT NULL,
    signin_time TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL, -- signed_out, signed_in
    PRIMARY KEY (id),
    FOREIGN KEY (exeat_request_id) REFERENCES exeat_requests(id),
    FOREIGN KEY (hostel_admin_id) REFERENCES staff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for hostel_signouts
INSERT INTO hostel_signouts (exeat_request_id, hostel_admin_id, signout_time, status)
VALUES (1, 2003, NOW(), 'signed_out');

-- Table: security_signouts
CREATE TABLE security_signouts (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    exeat_request_id BIGINT(20) UNSIGNED NOT NULL, -- FK to exeat_requests(id)
    security_id INT(10) UNSIGNED NOT NULL, -- FK to staff(id)
    signout_time TIMESTAMP NULL DEFAULT NULL,
    signin_time TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL, -- signed_out, signed_in
    PRIMARY KEY (id),
    FOREIGN KEY (exeat_request_id) REFERENCES exeat_requests(id),
    FOREIGN KEY (security_id) REFERENCES staff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for security_signouts
INSERT INTO security_signouts (exeat_request_id, security_id, signout_time, status)
VALUES (1, 2004, NOW(), 'signed_out');

-- Table: notifications
CREATE TABLE notifications (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) UNSIGNED DEFAULT NULL, -- FK to students(id) or staff(id) as needed
    exeat_request_id BIGINT(20) UNSIGNED DEFAULT NULL, -- FK to exeat_requests(id)
    type VARCHAR(50) NOT NULL, -- parent_consent, approval, rejection, status_update, etc.
    channel VARCHAR(20) NOT NULL, -- sms, email, whatsapp
    status VARCHAR(20) NOT NULL, -- sent, failed, delivered
    message TEXT,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
    -- Foreign keys can be added as needed based on notification recipient
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for notifications
INSERT INTO notifications (user_id, exeat_request_id, type, channel, status, message, sent_at)
VALUES (1001, 1, 'parent_consent', 'whatsapp', 'sent', 'Parent consent requested for exeat.', NOW());

-- Table: audit_logs
CREATE TABLE audit_logs (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT(20) UNSIGNED NOT NULL, -- FK to students(id) or staff(id)
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- exeat_request, user, etc.
    target_id BIGINT(20) UNSIGNED NOT NULL,
    details TEXT DEFAULT NULL,
    timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
    -- Foreign keys can be added as needed
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for audit_logs
INSERT INTO audit_logs (user_id, action, target_type, target_id, details, timestamp)
VALUES (2001, 'approved', 'exeat_request', 1, 'CMD approved exeat request.', NOW());

-- Table: analytics (optional)
CREATE TABLE analytics (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    metric_type VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    computed_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for analytics
INSERT INTO analytics (metric_type, value, computed_at)
VALUES ('total_exeats', '150', NOW());

-- Table: attachments (optional)
CREATE TABLE attachments (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    exeat_request_id BIGINT(20) UNSIGNED NOT NULL, -- FK to exeat_requests(id)
    file_url VARCHAR(255) NOT NULL,
    uploaded_by BIGINT(20) UNSIGNED NOT NULL, -- FK to students(id) or staff(id)
    uploaded_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (exeat_request_id) REFERENCES exeat_requests(id)
    -- Foreign key for uploaded_by can be added as needed
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for attachments
INSERT INTO attachments (exeat_request_id, file_url, uploaded_by, uploaded_at)
VALUES (1, 'https://example.com/medical_report.pdf', 1001, NOW()); 