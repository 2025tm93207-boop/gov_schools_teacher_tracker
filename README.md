# Teacher Attendance & Proxy Verification System for Rural Government Primary Schools

## Tagline
Bringing Transparency to Teacher Attendance in Dhule, Maharashtra

## Problem Statement
Teacher absenteeism is a pervasive issue in rural government primary schools across Maharashtra, India, leading to compromised education quality for students. This system addresses the problem by implementing a robust attendance tracking mechanism using geo-tagged selfies, ensuring teachers are physically present in classrooms with students. The platform provides real-time transparency to parents, headmasters, and Block Education Officers (BEO), with automated salary block recommendations for chronic absentees.

## Features
- **Role-Based Access Control**: Separate dashboards for Headmasters, Teachers, BEO, and Public users
- **Geo-Tagged Selfie Verification**: Teachers must capture selfies with at least 5 students visible, validated against school coordinates
- **Attendance Window Management**: Headmasters create daily attendance sessions with time limits
- **Monthly Attendance Calculation**: Automated calculation of attendance percentages with salary block flags for <60% attendance
- **Public Dashboard**: Real-time view of daily attendance status for any villager/parent
- **Mobile-First Design**: Optimized for phones used by teachers, fully responsive on laptops
- **Fallback Geolocation**: Manual entry for laptop demos when GPS is unavailable

## Tech Stack
- **Backend**: Django (Microservice Architecture), Django REST Framework, SimpleJWT, SQLite
- **Frontend**: React (Vite), React Router v6, Axios, Tailwind CSS, React Webcam, React Hot Toast
- **Database**: SQLite (single file for simplicity, with app-level separation)

## Architecture
The backend follows a microservice architecture simulated within a single Django project. Each "service" is a separate Django app communicating via local HTTP calls (using Django's internal networking). Services include:
- **auth_service**: Handles user authentication, JWT token issuance, and role management
- **school_service**: Manages school, teacher, and class data
- **attendance_service**: Manages attendance sessions, sign-in/out, selfie uploads, and geo-validation
- **reporting_service**: Calculates monthly attendance percentages and salary block recommendations
- **dashboard_service**: Provides read-only APIs for the public dashboard

Services communicate via RESTful APIs with JWT validation for inter-service calls.

## Folder Structure
```
gov_schools_teacher_tracker/
├── backend/
│   ├── auth_service/
│   ├── school_service/
│   ├── attendance_service/
│   ├── reporting_service/
│   ├── dashboard_service/
│   ├── attendance_project/  # Main Django project settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions
1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd gov_schools_teacher_tracker
   ```

2. **Backend Setup**:
   ```
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_data
   python manage.py runserver
   ```

3. **Frontend Setup** (in a new terminal):
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Seeded Login Credentials
- **Headmaster (ZPPS Nandre)**: hm_nandre / Test@123
- **Headmaster (ZPPS Kusumbe)**: hm_kusumbe / Test@123
- **Headmaster (ZPPS Fagne)**: hm_fagne / Test@123
- **Teachers (ZPPS Nandre)**: teacher1_nandre to teacher10_nandre / Test@123
- **Teachers (ZPPS Kusumbe)**: teacher1_kusumbe to teacher10_kusumbe / Test@123
- **Teachers (ZPPS Fagne)**: teacher1_fagne to teacher10_fagne / Test@123
- **BEO**: beo_dhule / Test@123

## How to Demo on Laptop
- **Geolocation Simulation**: If GPS is unavailable, the app shows a manual entry form pre-filled with school coordinates. Mark entries as "Manual – location unverified".
- **Mobile-First Responsive**: Resize browser to 375px width to simulate mobile. All pages adapt seamlessly.
- **Camera Access**: Use laptop webcam for selfie capture. Ensure browser permissions are granted.

## API Documentation
### Authentication
- `POST /api/auth/login/` - Login with username/password, returns JWT tokens
- `GET /api/auth/me/` - Get current user details

### Schools
- `GET /api/schools/` - List all schools (BEO/Headmaster)
- `GET /api/schools/{id}/teachers/` - List teachers for a school

### Attendance
- `POST /api/attendance/sessions/` - Create attendance session (Headmaster)
- `GET /api/attendance/sessions/today/?school_id=X` - Get today's session (Teacher)
- `POST /api/attendance/sign-in/` - Sign in with selfie and location
- `POST /api/attendance/sign-out/` - Sign out with selfie and location

### Reporting
- `POST /api/reporting/calculate-monthly/` - Trigger monthly calculation (BEO)
- `GET /api/reporting/salary-alerts/` - Get teachers with salary block flags

### Dashboard
- `GET /api/public/schools/` - List schools for dropdown
- `GET /api/public/school/{id}/today/` - Today's attendance status

All endpoints require JWT authentication except public dashboard routes.

## Future Enhancements
- Face detection for automatic student count verification
- Offline mode for areas with poor internet
- Integration with government salary systems for automated blocks
- Push notifications for attendance reminders
- Advanced analytics and reporting dashboards