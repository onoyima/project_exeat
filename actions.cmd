:: =============================
:: BACKEND API ENDPOINTS CHECKLIST FOR EXEAT SYSTEM
:: =============================

:: --- AUTHENTICATION & USER MANAGEMENT ---
[✔] POST   /api/login                - Authenticate user (SSO or local)
[✔] POST   /api/logout               - Logout user
[✔] GET    /api/me                   - Get current user profile and roles

:: --- STUDENT EXEAT REQUESTS ---
[✔] POST   /api/student/exeat-requests                - Create new exeat request
[✔] GET    /api/student/exeat-requests                - List all exeat requests for student
[✔] GET    /api/student/exeat-requests/{id}           - Get details of a specific exeat request
[✔] POST   /api/student/exeat-requests/{id}/appeal    - Appeal a rejected exeat request
[✔] GET    /api/student/exeat-requests/{id}/download  - Download approved exeat (QR code)

:: --- STAFF EXEAT APPROVALS ---
[✔] GET    /api/staff/exeat-requests                  - List all exeat requests assigned to staff
[✔] GET    /api/staff/exeat-requests/{id}             - Get details of a specific exeat request
[✔] POST   /api/staff/exeat-requests/{id}/approve     - Approve an exeat request
[✔] POST   /api/staff/exeat-requests/{id}/reject      - Reject an exeat request
[✔] POST   /api/staff/exeat-requests/{id}/send-parent-consent - Send parent consent request

:: --- PARENT CONSENT ---
[✔] GET    /api/parent/consent/{token}                - View consent request
[✔] POST   /api/parent/consent/{token}/approve        - Approve consent
[✔] POST   /api/parent/consent/{token}/decline        - Decline consent

:: --- DEAN & CMD DASHBOARDS ---
[✔] GET    /api/dean/exeat-requests                   - List all verified/approved requests
[✔] POST   /api/dean/exeat-requests/bulk-approve      - Bulk approve multiple requests
[✔] GET    /api/cmd/exeat-requests?type=medical       - List all medical exeat requests
[✔] POST   /api/cmd/exeat-requests/{id}/approve       - Approve/reject medical exeat

:: --- HOSTEL ADMIN & SECURITY ---
[✔] POST   /api/hostel/signout/{exeat_request_id}      - Mark student as signed out of hostel
[✔] POST   /api/hostel/signin/{exeat_request_id}       - Mark student as signed in to hostel
[✔] POST   /api/security/validate                     - Validate student at gate (QR/matric)
[✔] POST   /api/security/signout/{exeat_request_id}    - Mark student as signed out at gate
[✔] POST   /api/security/signin/{exeat_request_id}     - Mark student as signed in at gate

:: --- NOTIFICATIONS ---
[✔] GET    /api/notifications                         - List notifications for user
[✔] POST   /api/notifications/mark-read               - Mark notifications as read

:: --- ADMIN: USER & ROLE MANAGEMENT ---
[✔] GET    /api/admin/staff                             - List all staff
[✔] POST   /api/admin/staff                             - Create new staff
[✔] GET    /api/admin/staff/{id}                        - Get staff details
[✔] PUT    /api/admin/staff/{id}                        - Update staff
[✔] DELETE /api/admin/staff/{id}                        - Delete staff
[✔] GET    /api/admin/students                          - List all students
[✔] POST   /api/admin/students                          - Create new student
[✔] GET    /api/admin/students/{id}                     - Get student details
[✔] PUT    /api/admin/students/{id}                     - Update student
[✔] DELETE /api/admin/students/{id}                     - Delete student
[✔] GET    /api/admin/roles                             - List all roles
[✔] POST   /api/admin/roles                             - Create new role
[✔] PUT    /api/admin/roles/{id}                        - Update role
[✔] DELETE /api/admin/roles/{id}                        - Delete role

:: --- HOSTEL MANAGEMENT ---
[✔] GET    /api/hostels                               - List all hostels
[✔] POST   /api/hostels/{id}/assign-admin             - Assign hostel admin to a hostel

:: --- ANALYTICS & AUDIT ---
[✔] GET    /api/analytics/exeat-usage                 - Get exeat usage statistics
[✔] GET    /api/audit-logs                            - List audit logs

:: --- ATTACHMENTS & MEDICALS ---
[✔] POST   /api/exeat-requests/{id}/attachments       - Upload attachment (medical doc)
[✔] GET    /api/exeat-requests/{id}/attachments       - List/download attachments

:: --- LOOKUPS & MISC ---
[✔] GET    /api/lookups/roles                         - Get list of available roles
[✔] GET    /api/lookups/hostel-admins                 - Get list of staff with hostel_admin role
[✔] GET    /api/lookups/hostels                       - Get list of hostels 

:: --- ADVANCED/OPTIONAL FEATURES ---
[✔] GET    /api/user/notification-preferences         - Get user notification preferences
[✔] PUT    /api/user/notification-preferences         - Update user notification preferences
[✔] POST   /api/communication/test                   - Test communication channel (SMS/Email/WhatsApp)
[✔] GET    /api/communication/channels               - List available communication channels
[✔] GET    /api/reports/exeats                       - Export exeat records
[✔] GET    /api/reports/audit-logs                   - Export audit logs
[✔] POST   /api/admin/exeats/{id}/revoke             - Emergency exeat override/revocation
[✔] POST   /api/parent/consent/remind                - Bulk parent consent reminders
[✔] GET    /api/admin/config                         - View system configuration
[✔] PUT    /api/admin/config                         - Update system configuration 

:: --- EXEAT APPROVAL FLOW (MEDICAL) ---
:: Student submits medical exeat request
:: CMD vets/recommends → Dean/Deputy Dean requests parent consent → Parent consents → Dean/Deputy Dean approves/rejects
:: Dean can approve at any time; Deputy Dean only after CMD/parent consent

:: --- EXEAT APPROVAL FLOW (NON-MEDICAL) ---
:: Student submits non-medical exeat request
:: Dean/Deputy Dean requests parent consent → Parent consents → Dean/Deputy Dean approves/rejects
:: Dean can approve at any time; Deputy Dean only after parent consent 