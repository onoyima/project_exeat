:: =============================
:: DATABASE TABLES OVERVIEW (UPDATED)
:: =============================
REM staff                        - All staff info (reference only, do not alter)
REM staff_assigned_course        - Staff course assignments (reference only)
REM staff_contacts               - Staff contact info (reference only)
REM staff_work_profiles          - Staff work profiles (reference only)
REM students                     - All student info (reference only, do not alter)
REM student_academics            - Student academic info (reference only)
REM student_contacts             - Parent/guardian contact info (reference only)
REM student_medicals             - Student medical info (reference only)
REM student_role_users           - Student role assignments (reference only)
REM vuna_accomodation_histories  - Student hostel assignment history (reference only)
REM vuna_accomodations           - Hostels/accommodations (reference only)
REM 
REM exeat_requests               - All exeat (leave) applications (NEW, migration)
REM exeat_approvals              - Each approval step in the workflow (NEW, migration)
REM staff_exeat_roles            - Map staff to exeat roles (NEW, migration)
REM parent_consents              - Track parent consent actions (NEW, migration)
REM hostel_signouts              - Hostel admin sign-out/in actions (NEW, migration)
REM security_signouts            - Security sign-out/in actions (NEW, migration)
REM notifications                - System notifications (NEW, migration)
REM audit_logs                   - System audit logs (NEW, migration)
REM analytics                    - Exeat analytics/metrics (NEW, migration)
REM attachments                  - File uploads for exeat requests (NEW, migration)
REM hostel_admin_assignments     - Map hostels to staff with hostel_admin role (NEW, migration)
::
:: All models in the codebase have a corresponding table, either from the legacy schema (exeat_structure.sql) or from new migrations.
::
:: =============================
:: HOSTEL ADMIN ASSIGNMENT WORKFLOW (NEW)
:: =============================
REM - Hostels (vuna_accomodations) can be assigned to staff with the hostel_admin role.
REM - Assignment is managed in hostel_admin_assignments (NEW table).
REM - Only staff with a hostel_admin role in staff_exeat_roles can be assigned (enforced in application logic).
REM - Relationships:
REM     * VunaAccomodation hasMany HostelAdminAssignment (hostelAdmins)
REM     * Staff hasMany HostelAdminAssignment (hostelsManaged)
REM     * HostelAdminAssignment belongsTo VunaAccomodation, belongsTo Staff
::
:: =============================
:: ALL TABLES AND MODELS ARE IN SYNC (JULY 2024)
:: =============================
REM - All Eloquent models correspond to a table with the correct structure.
REM - No model is missing a table, and no table is missing a model for the exeat system.
REM - See migration files in backend/database/migrations for new tables.
::

:: Veritas University Digital Exeat System - Implementation Checklist
:: This .cmd file documents the major tasks, modules, and steps to be done for the project.
:: Use as a guide for development, integration, and project management.

:: =============================
:: 1. AUTHENTICATION & ACCESS CONTROL
:: =============================
REM - Implement SSO with university credentials
REM - Enforce role-based access (Student, CMD, Deputy Dean, Dean, Hostel Admin, Security, Admin)
REM - Optional: Multi-Factor Authentication
REM - Session management and expiry

:: =============================
:: 2. STUDENT MODULE
:: =============================
REM - Dashboard: Show analytics (current/past exeat status)
REM - Exeat Application Form: category, reason, location, dates, parent contact method
REM - Real-time status tracking
REM - Appeal form on rejection
REM - Downloadable permit with QR code and approval timeline

:: =============================
:: 3. CMD MODULE (Medical Only)
:: =============================
REM - Dashboard: List pending medical requests
REM - View application details and attachments
REM - Approve/Reject with mandatory comments
REM - Notify student on rejection
REM - Forward approved to next level

:: =============================
:: 4. DEPUTY DEAN MODULE
:: =============================
REM - View/filter requests by hostel
REM - Show reason, history, CMD approval
REM - Initiate parent consent (SMS, WhatsApp, Email)
REM - Notify student when parent is contacted
REM - Log consent timestamp/method
REM - Approve/Reject with notes
REM - Manual consent logging if parent unresponsive

:: =============================
:: 5. DEAN MODULE
:: =============================
REM - Analytics dashboard (approved, pending, overdue, etc.)
REM - View full request chain
REM - Individual or bulk approval
REM - Notify stakeholders on approval
REM - Visual analytics (pie, bar, line charts, tables)

:: =============================
:: 6. HOSTEL ADMIN MODULE
:: =============================
REM - View students by hostel with Dean-approved exeats
REM - Sign out/in students
REM - Block future exeat if not signed back in
REM - Hostel-specific analytics

:: =============================
:: 7. SECURITY MODULE
:: =============================
REM - QR code/matric number validation
REM - View approved exeat details
REM - Real-time status updates
REM - Prevent override of hostel approval
REM - Only show fully approved students

:: =============================
:: 8. NOTIFICATION SYSTEM
:: =============================
REM - Alerts for parent consent, approvals, rejections, status changes
REM - Log delivery status and timestamps

:: =============================
:: 9. COMMUNICATION INTEGRATION
:: =============================
REM - Integrate SMS, Email, WhatsApp (with fallback and error logging)
REM - Respect user communication preferences

:: =============================
:: 10. HISTORICAL RECORDS & AUDIT
:: =============================
REM - Archive all exeat records with audit trail
REM - Search by matric, date, category, status
REM - Exportable reports
REM - Full user action logs
REM - Data retention per university policy

:: =============================
:: 11. ADMIN PANEL
:: =============================
REM - User/role management (CRUD)
REM - System logs and activity monitoring
REM - Emergency override/revoke of exeats
REM - System configuration and maintenance

:: =============================
:: 12. DATABASE & API ENDPOINTS
:: =============================
REM - Design tables: Users, ExeatRequests, Approvals, ParentContacts
REM - Implement API endpoints (see requirements doc for full list)
REM - Secure all endpoints with authentication and role checks

:: =============================
:: 13. TESTING & DEPLOYMENT
:: =============================
REM - Test all user flows end-to-end
REM - Document API contracts and data structures
REM - Ensure all actions are logged and notifications sent
REM - Deploy to university infrastructure

:: =============================
:: EXEAT APPROVAL WORKFLOW (UPDATED JULY 2024)
:: =============================
REM - Student submits exeat request (type: medical or other)
REM - If medical:
REM     * CMD sees request first, vets and recommends to Dean
REM     * Dean or Deputy Dean can request parent/sponsor consent
REM     * Dean can approve/reject at any time (can override)
REM     * Deputy Dean can only approve after CMD or parent has recommended/approved
REM     * Parent/Sponsor gives consent if requested
REM     * Dean/Deputy Dean gives final approval/rejection
REM - If not medical:
REM     * Dean/Deputy Dean sees request (not CMD)
REM     * Dean/Deputy Dean can request parent/sponsor consent
REM     * Dean can approve/reject at any time (can override)
REM     * Deputy Dean can only approve after parent consent
REM     * Parent/Sponsor gives consent if requested
REM     * Dean/Deputy Dean gives final approval/rejection
REM - After approval:
REM     * Hostel Admin signs out/in student
REM     * Security signs out/in at gate
REM     * On return, Security then Hostel Admin signs in, exeat is closed
REM - Notifications sent to student at each stage
::
:: =============================
:: END OF CHECKLIST 