@echo off
REM =============================
REM  VUA Exeat Management System
REM  Comprehensive Setup & Usage
REM =============================

REM -----------
REM Prerequisites
REM -----------
REM - Node.js (v16+ recommended)
REM - npm (v8+ recommended)
REM - PHP (v8.0+ recommended)
REM - Composer (latest)
REM - MySQL or compatible database
REM - Git

REM -----------
REM 1. Clone the Repository
REM -----------
git clone <your-repo-url> vua-exeat
cd vua-exeat

REM -----------
REM 2. Backend Setup
REM -----------
cd backend

REM 2.1 Install PHP dependencies
composer install

REM 2.2 Copy environment file and configure
copy .env.example .env
REM Edit .env to set DB credentials and other settings

REM 2.3 Generate application key
php artisan key:generate

REM 2.4 Run migrations and seeders
php artisan migrate --seed

REM 2.5 (Optional) Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

REM 2.6 Start backend server
php artisan serve
REM By default, runs at http://localhost:8000
REM By default, runs at http://attendance.veritas.edu.ng/

cd ..


REM -----------
REM 3. Frontend Setup
REM -----------

REM 3.1 Install Node dependencies
npm install

REM 3.2 (Optional) Copy and configure environment variables
REM If using .env.local or similar, copy and edit as needed

REM 3.3 Start frontend development server
npm run dev
REM By default, runs at http://localhost:3000

REM -----------
REM 4. Usage
REM -----------
REM - Access the backend API at http://localhost:8000
REM - Access the backend API at http://attendance.veritas.edu.ng/
REM - Access the frontend at http://localhost:3000
REM - Login as admin/staff/student using seeded credentials or register as needed

REM -----------
REM 5. Project Structure
REM -----------
REM - backend\ : Laravel PHP backend (API, models, controllers)
REM - app\     : Next.js frontend (pages, components)
REM - lib\     : Frontend utilities and API wrappers
REM - components\ : Shared React components
REM - public\  : Static assets

REM -----------
REM 6. Common Commands
REM -----------
REM Backend:
REM   php artisan migrate:fresh --seed   (reset DB)
REM   php artisan tinker                 (interactive shell)
REM   php artisan test                   (run backend tests)
REM Frontend:
REM   npm run build                      (production build)
REM   npm run lint                       (lint code)

REM -----------
REM 7. Troubleshooting
REM -----------
REM - Check backend logs: backend\storage\logs\laravel.log
REM - Check frontend errors in browser console
REM - Ensure DB is running and credentials are correct
REM - For CORS/API issues, verify .env and proxy settings

REM -----------
REM 8. Deployment
REM -----------
REM - Build frontend: npm run build
REM - Serve backend with production web server (e.g., Apache/Nginx)
REM - Set environment variables for production
REM - Configure database and storage permissions

REM -----------
REM 9. Additional Documentation
REM -----------
REM - See exeat_structure.sql for DB schema
REM - See backend\README.md for backend-specific docs (if available)
REM - See app\ for frontend code

REM -----------
REM End of README
REM -----------