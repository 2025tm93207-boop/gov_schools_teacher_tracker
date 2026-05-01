# Teacher Attendance Transparency Portal

## Tagline
Bringing Transparency to Teacher Attendance in Zilla Parishad Primary Schools, Dhule District, Maharashtra.

## Problem Statement
Teacher absenteeism is a pervasive issue in rural government primary schools across Maharashtra, India, leading to compromised education quality for students. This system addresses the problem by implementing a robust attendance tracking mechanism using geo-tagged selfies, ensuring teachers are physically present in classrooms with students. The platform provides real-time transparency to parents, headmasters, and Block Education Officers (BEO), with automated salary block recommendations for chronic absentees.

## Key Features & Capabilities

- **Role-Based Access Control**: Separate, fully featured dashboards for Headmasters, Teachers, BEO, and the Public.
- **Geo-Tagged Selfie Verification**: Teachers must capture selfies with students visible, validated against strict school coordinates.
- **Automated Accountability Engine**: The system tracks monthly attendance percentages, automatically flags teachers dropping below 60%, and empowers the BEO to hold or release salaries directly from their dashboard.
- **Public Transparency Dashboard**: Citizens can view real-time data for all schools in the district, including "Top Performing Schools" (awards for >85% attendance) and "Schools Needing Attention" (red flags for <70% attendance).
- **Issue Reporting**: Teachers can report infrastructure, safety, or resource shortages directly from their portal.
- **Formal Government Aesthetic**: Designed with an official Indian government color palette (Navy, Saffron, Green), standard UI cards, and bilingual navigation capabilities (English / Marathi toggle placeholder).

## Tech Stack
- **Backend**: Django (Microservice Architecture), Django REST Framework, SimpleJWT, SQLite
- **Frontend**: React (Vite), React Router v6, Axios, Tailwind CSS, React Webcam, React Hot Toast
- **Database**: SQLite (single file for simplicity, with app-level separation)

## Architecture
The backend follows a microservice architecture simulated within a single Django project. Each "service" is a separate Django app communicating via local HTTP calls (using Django's internal networking). Services include:
- **auth_service**: Handles user authentication, JWT token issuance, and extended user profiles (photos, contact info).
- **school_service**: Manages detailed school data (locations, maps, established year) and class/division mappings.
- **attendance_service**: Manages daily attendance sessions, sign-in/out, geo-validation, and issue reporting.
- **reporting_service**: Calculates monthly attendance percentages and manages salary block recommendations.
- **dashboard_service**: Provides read-only aggregated APIs for the public dashboard (awards, red flags, high-level stats).

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd gov_schools_teacher_tracker
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   python manage.py makemigrations auth_service school_service attendance_service
   python manage.py migrate
   python manage.py seed_data
   python manage.py runserver 8000
   ```

3. **Frontend Setup** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**:
   - **Frontend App**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/api/schema/swagger-ui/

## Seeded Data & Login Credentials
The database is seeded with realistic historical data to demonstrate the system's tracking and penalty features:
- **3 Real Schools**: ZPPS Nandre, ZPPS Kusumbe, ZPPS Fagne
- **30 Teachers**: Mapped to 1st-4th standard (Divisions A/B) with realistic Marathi names.
- **Attendance History**: Over 30 days of pre-populated sign-ins/outs with variable performance profiles (High, Medium, Low attendance) to trigger the salary hold logic.

Use the "Quick Demo Login" buttons on the frontend to automatically log in as:
- **Headmaster (ZPPS Nandre)**: `hm_nandre` / `Test@123`
- **Teacher (ZPPS Nandre)**: `teacher1_nandre` / `Test@123`
- **BEO (Dhule)**: `beo_dhule` / `Test@123`

## Quick API Endpoint Reference

### Public Dashboard
- `GET /api/dashboard/schools/stats/` - Aggregated monthly stats for all schools
- `GET /api/dashboard/awards/` - Top performing schools (>85% attendance)
- `GET /api/dashboard/red-flags/` - Poorly performing schools (<70% attendance)
- `GET /api/dashboard/school/{id}/details/` - Comprehensive drill-down for a specific school

### Attendance & Sessions
- `POST /api/attendance/sessions/` - Create a daily session (Headmaster)
- `POST /api/attendance/sign-in/` - Submit selfie and coordinates (Teacher)
- `GET /api/attendance/teacher/{id}/monthly/` - Get monthly records for a teacher (Headmaster/Teacher)
- `POST /api/attendance/issues/` - Submit an infrastructure report (Teacher)

### BEO Reporting
- `POST /api/reporting/calculate-monthly/` - Trigger monthly stat aggregations
- `GET /api/reporting/salary-alerts/` - Fetch teachers eligible for salary blocks
- `POST /api/reporting/hold-salary/` - Enact a salary block
- `POST /api/reporting/release-salary/` - Lift a salary block

*(All endpoints except `/api/dashboard/*` require JWT authentication)*

## Future Enhancements
- AI-based face detection to automatically verify the number of students in the background of teacher selfies.
- Progressive Web App (PWA) offline mode for remote villages with intermittent connectivity.
- Direct API integration with the Maharashtra State Treasury for automated salary deduction.