:: =============================
:: FRONTEND TASKS CHECKLIST FOR EXEAT SYSTEM API INTEGRATION
:: =============================

:: --- AUTHENTICATION & staff or student MANAGEMENT ---
[ ] Show login form, submit credentials to /api/login (ensure proper error handling for the login and interactive ui for the login page)
[ ] Store and manage auth token/session 
[ ] Fetch current staff or student profile from /api/me (ensure proper error handling for the profile pages of either student  or staff )
[ ] Handle logout via /api/logout (ensure proper error handling for the logout page)

:: --- STUDENT EXEAT REQUESTS ---
[ ] Show exeat request form, submit to /api/student/exeat-requests (ensure proper error handling for the exeat request page and interactive ui for the exeat request page)
[ ] Fetch and display student exeat requests list (ensure proper error handling for the exeat request list page and interactive ui for the exeat request list page)
[ ] Show exeat request details (status, comments, etc.) (ensure proper error handling for the exeat request details page and interactive ui for the exeat request details page)
[ ] Allow appeal of rejected requests (ensure proper error handling for the appeal of rejected requests page and interactive ui for the appeal of rejected requests page)
[ ] Download and display QR code for approved exeat (ensure proper error handling for the QR code page and interactive ui for the QR code page)

:: --- STAFF EXEAT APPROVALS ---
[ ] Fetch assigned exeat requests for staff (ensure proper error handling for the exeat request list page and interactive ui for the exeat request list page)
[ ] Show request details, approve/reject with comments (ensure proper error handling for the exeat request details page and interactive ui for the exeat request details page)
[ ] Trigger parent consent request (Deputy Dean) (ensure proper error handling for the parent consent request page and interactive ui for the parent consent request page)
[ ] Display approval history and comments (ensure proper error handling for the approval history and comments page and interactive ui for the approval history and comments page)

:: --- PARENT CONSENT ---
[ ] Open consent link, fetch consent details (ensure proper error handling for the consent details page and interactive ui for the consent details page)
[ ] Show approve/decline options, submit response (ensure proper error handling for the consent page and interactive ui for the consent page)
[ ] Display confirmation and handle errors (ensure proper error handling for the confirmation page and interactive ui for the confirmation page)

:: --- DEAN & CMD DASHBOARDS ---
[ ] Fetch all exeat requests for dashboard (ensure proper error handling for the exeat request list page and interactive ui for the exeat request list page)
[ ] Filter by type/status (medical, pending, etc.) (ensure proper error handling for the exeat request list page and interactive ui for the exeat request list page)
[ ] Bulk approve requests (Dean) (ensure proper error handling for the exeat request list page and interactive ui for the exeat request list page)
[ ] Show analytics/charts for exeat usage (ensure proper error handling for the analytics page and interactive ui for the analytics page)

:: --- HOSTEL ADMIN & SECURITY ---
[ ] Mark student sign-out/in at hostel (scan QR or select) (ensure proper error handling for the hostel admin page and interactive ui for the hostel admin page)
[ ] Validate student at gate (scan QR or enter matric) (ensure proper error handling for the hostel admin page and interactive ui for the hostel admin page)
[ ] Show real-time status of students in/out (ensure proper error handling for the hostel admin page and interactive ui for the hostel admin page)

:: --- NOTIFICATIONS ---
[ ] Fetch and display notifications for staff or student (ensure proper error handling for the notifications page and interactive ui for the notifications page)
[ ] Mark notifications as read (ensure proper error handling for the notifications page and interactive ui for the notifications page)
[ ] Show notification badges/alerts (ensure proper error handling for the notifications page and interactive ui for the notifications page)

:: --- ADMIN: staff or student & ROLE MANAGEMENT ---
[ ] List, create, update, delete staff or students and roles (ensure proper error handling for the staff or student and role management page and interactive ui for the staff or student and role management page)
[ ] Show staff or student/role details and edit forms (ensure proper error handling for the staff or student and role management page and interactive ui for the staff or student and role management page)
[ ] Assign roles to staff or students (ensure proper error handling for the staff or student and role management page and interactive ui for the staff or student and role management page)

:: --- HOSTEL MANAGEMENT ---
[ ] List all hostels
[ ] Assign hostel admin to hostel (select from staff list)
[ ] Show hostel-admin assignments

:: --- ANALYTICS & AUDIT ---
[ ] Fetch and display analytics (charts, stats)
[ ] Fetch and display audit logs

:: --- ATTACHMENTS & MEDICALS ---
[ ] Upload medical documents/attachments to exeat requests
[ ] List and download attachments

:: --- LOOKUPS & MISC ---
[ ] Fetch roles, hostel-admins, hostels for dropdowns/filters
[ ] Handle API errors, loading states, and staff or student feedback 