:: =============================
:: FRONTEND IMPLEMENTATION TASKS FOR EXEAT SYSTEM (NEXT.JS)
:: =============================

1. [ ] Implement Login Page
    - Show login form, submit credentials to /api/login
    - Handle error/success, redirect by role (Student, Staff, Parent)
    - Store/manage auth token/session
    - Implement logout

2. [ ] Fetch and display current user profile (/api/me)
    - Show role, permissions, and dashboard links

3. [ ] Implement role assignment for staff, the role should be fetched from the backend if the api 

:: --- STUDENT JOURNEY ---
3. [ ] Student Dashboard
    - Show analytics (previous/current exeat status)
    - Fetch from /api/student/exeat-requests, /api/analytics/exeat-usage

4. [ ] Exeat Application Form
    - Submit to /api/student/exeat-requests
    - Fields: type (medical, holiday, daily, sleepover, emergency), reason, location, departure/return date, parent contact method
    - Show real-time status

5. [ ] Exeat Request List & Details
    - Fetch from /api/student/exeat-requests, /api/student/exeat-requests/{id}
    - Show status, approval timeline, comments

6. [ ] Appeal Rejected Exeat
    - Show appeal form if rejected, submit to /api/student/exeat-requests/{id}/appeal

7. [ ] Download Approved Exeat (QR Code)
    - Fetch from /api/student/exeat-requests/{id}/download

:: --- CMD JOURNEY (MEDICAL ONLY) ---
8. [ ] CMD Dashboard
    - List all medical exeat requests (/api/cmd/exeat-requests?type=medical)
    - Show details, attachments

9. [ ] CMD Vet/Recommend/Reject
    - Approve/reject with comment (/api/cmd/exeat-requests/{id}/approve)
    - Notify student on rejection

:: --- DEPUTY DEAN JOURNEY ---
10. [ ] Deputy Dean Dashboard
    - List all student requests (medical/non-medical)
    - Show reason, history, CMD approval (if medical)

11. [ ] Initiate Parent Consent
    - Send consent request (/api/staff/exeat-requests/{id}/send-parent-consent)
    - Notify student when parent is contacted
    - Log consent timestamp/method

12. [ ] Deputy Dean Approve/Reject
    - Approve/reject with notes (/api/staff/exeat-requests/{id}/approve or /reject)
    - Only allow after CMD/parent consent (enforce in UI)

:: --- DEAN JOURNEY ---
13. [ ] Dean Dashboard
    - List all exeat requests (/api/dean/exeat-requests)
    - Show full request chain, analytics

14. [ ] Dean Approve/Reject (Override)
    - Approve/reject at any stage (/api/dean/exeat-requests/bulk-approve or /approve)
    - Can act even if CMD/parent not yet approved

:: --- PARENT/CONSENT JOURNEY ---
15. [ ] Parent Consent Page
    - Open via link (GET /api/parent/consent/{token})
    - Show request details, approve/decline (/api/parent/consent/{token}/approve or /decline)
    - Show confirmation, handle errors

:: --- HOSTEL ADMIN JOURNEY ---
16. [ ] Hostel Admin Dashboard
    - List students by hostel with approved exeats (/api/hostel/signout/{exeat_request_id})
    - Sign out/in students
    - Block future exeat if not signed back in

:: --- SECURITY JOURNEY ---
17. [ ] Security Dashboard
    - Validate exeat at gate (QR/matric) (/api/security/validate)
    - Sign out/in at gate (/api/security/signout/{exeat_request_id}, /signin)
    - Only show fully approved students

:: --- NOTIFICATIONS ---
18. [ ] Notification System
    - Fetch notifications (/api/notifications)
    - Mark as read (/api/notifications/mark-read)
    - Show badges/alerts
    - Notify at each approval/consent stage

:: --- ADMIN PANEL ---
19. [ ] Admin Dashboard
    - Manage users/roles (CRUD) (/api/admin/staff, /api/admin/students, /api/admin/roles)
    - View logs (/api/audit-logs)
    - Emergency override/revoke exeats (/api/admin/exeats/{id}/revoke)
    - System config (/api/admin/config)

:: --- ANALYTICS & AUDIT ---
20. [ ] Analytics Dashboard
    - Show charts, stats (/api/analytics/exeat-usage)
    - Export reports (/api/reports/exeats, /api/reports/audit-logs)

:: --- ATTACHMENTS & MEDICALS ---
21. [ ] Upload/View Attachments
    - Upload medical docs (/api/exeat-requests/{id}/attachments)
    - List/download attachments

:: --- LOOKUPS & MISC ---
22. [ ] Fetch roles, hostel-admins, hostels for dropdowns (/api/lookups/roles, /hostel-admins, /hostels)

:: --- ERROR HANDLING & UI/UX ---
23. [ ] Handle API errors, loading states, and user feedback for all pages
24. [ ] Ensure all forms and tables are responsive and accessible
25. [ ] Implement role-based navigation and access control in UI

:: --- TESTING ---
26. [ ] Test all user flows end-to-end (student, staff, parent, admin)
27. [ ] Document API contracts and data structures for frontend/backend integration 