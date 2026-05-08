PROMPT-1

You are a senior full-stack engineer building a complete college-submission project: a Teacher Attendance & Proxy Verification System for rural government primary schools near Dhule, Maharashtra, India. 

Generate the entire application from scratch with clean code, proper folder structure, and a detailed README.md. Follow all specifications exactly.

PROJECT OVERVIEW

Goal: Bring transparency to teacher attendance in 3 Zilla Parishad primary schools (ZPPS Nandre, ZPPS Kusumbe, ZPPS Fagne) near Dhule. The system must:
- Let a Headmaster open a daily attendance window
- Force teachers to sign in and sign out using geo‑tagged selfies that MUST include at least 5 students (to prove classroom presence)
- Calculate monthly attendance % per teacher
- Flag any teacher whose attendance is below 60% → salary‑block recommendation visible to Block Education Officer (BEO)
- Display a public dashboard so any villager/parent can view today's attendance status per school (no login)
- Work mobile‑first because teachers will use phones, but the entire demo must also run perfectly on a laptop browser

⸻

TECH STACK

Frontend:
- React (Vite)
- React Router v6
- Axios
- Tailwind CSS (mobile‑first responsive)
- React Webcam (for capturing selfies)
- react‑router‑dom, react‑hot‑toast (for notifications)

Backend (Microservice Architecture with Django):
- Each service is a separate Django app INSIDE one Django project to simulate microservices but keep the submission simple
- Use Django REST Framework (DRF), SimpleJWT for authentication
- SQLite database (one per service or a single file – acceptable for submission)
- Services:
  1. auth_service – handles all authentication & role management
  2. school_service – school, teacher, class data (1-5 standard, class teacher system)
  3. attendance_service – attendance windows, sign‑in/out, selfie upload, geo‑validation
  4. reporting_service – monthly attendance percentage, salary‑block flags
  5. dashboard_service – public read‑only APIs for the public dashboard

Communication between services:
- Services call each other via local HTTP (using Django's internal networking or localhost). The auth_service issues JWT tokens; other services validate them via a shared secret.

Database:
- SQLite (for easy submission). Use separate database files per service if you want to emphasise microservices, or one file with clear app‑level separation. Justify the choice in README.

⸻

AUTHENTICATION & ROLES

Use JWT (SimpleJWT). Role‑based access control:
1. headmaster – one per school. Can create daily attendance session, manage teacher list, view school analytics.
2. teacher – marks own attendance (sign‑in/out), views own history.
3. beo (Block Education Officer) – views all schools, gets alerts on teachers below 60%, can view any school's records.
4. public – no login; can view only the public dashboard (read‑only data per school).

All endpoints must be role‑protected. Provide a seeded initial user for each role (credentials in README).


DATA & SEEDING

Seed the database with realistic data:
- 3 schools: 
  1. ZPPS Nandre (lat: 20.9050, lon: 74.7730)
  2. ZPPS Kusumbe (lat: 20.9110, lon: 74.7790)
  3. ZPPS Fagne (lat: 20.8850, lon: 74.7670)
- Each school has 10 teachers, each assigned as class teacher for one standard (1 to 5, so 2 teachers per standard maybe, or just 2 teachers per class – you can distribute 10 teachers: 2 each for 1-5). Teachers have real‑sounding regional names.
- No subject‑wise split; class teacher handles all subjects.
- Seeded users:
  - Headmaster for each school (e.g., hm_nandre, password: Test@123)
  - 10 teacher accounts per school (teacher1_nandre, ...)
  - BEO account (beo_dhule, password: Test@123)
- The seed command should also set up the school’s expected geo‑fence radius (e.g., 100 metres)


CORE BUSINESS LOGIC

1. Attendance Window Creation (Headmaster)
   - Headmaster logs in, taps “Start Attendance” for the day → creates an attendance session with a start time and a 30‑minute window.
   - Teachers can only mark attendance during this window. If window expires, they cannot mark unless Headmaster extends it.

2. Teacher Sign‑In / Sign‑Out
   - Teacher logs in, sees if a session is active for their school.
   - If yes, they tap “Sign In”.
   - The app opens the camera (React Webcam). The teacher must take a photo that CLEARLY shows at least 5 students (we do NOT auto‑detect faces; a message says “Take a selfie with at least 5 students visible. It will be verified later by the BEO”).
   - At capture time, the browser’s Geolocation API grabs latitude & longitude. If denied, show a fallback where they manually confirm “I am at school” but mark the entry as unverified.
   - The system checks if the captured lat/lon is within 100 metres of the school’s registered coordinates. If not → flag “Suspicious – location mismatch”.
   - The selfie (base64 or file upload), timestamp, and location are saved.
   - The same flow repeats for Sign‑Out. A teacher must sign out to get full day attendance. If they forget, the system marks a “missing sign‑out” and counts it as half‑day absent for that day.

3. Attendance Calculation & Salary Block
   - A backend cron‑like task (can be a management command) runs on the 1st of every month (simulate by hitting an endpoint or manual command).
   - For each teacher, calculate:
     working_days = number of days attendance window was created
     present_days = days where teacher signed in AND signed out (or signed in with a valid reason if sign‑out missing, but we’ll keep simple: sign‑in + sign‑out = full day, only sign‑in = half day)
     attendance_percent = (present_days / working_days) * 100
   - If attendance_percent < 60%, set a field salary_block_recommended = true and increment a flag in the teacher record visible to BEO.
   - The system does NOT actually block salary; it shows a warning: “Salary hold recommended for [teacher name] due to attendance below 60%”.

4. Public Dashboard
   - Any person can visit /public without login.
   - They see a dropdown to select a school.
   - For the selected school, today’s date is automatically chosen; they see:
     - Total teachers: X
     - Signed in: Y
     - Not signed in: Z
     - List of teacher names with status: Present (green), Absent (red), or Partial (yellow)
   - The dashboard updates in near‑real‑time (poll every 30 seconds or use WebSocket if you want, but polling is fine).

5. BEO Dashboard & Alerts
   - BEO logs in, sees all three schools.
   - For each school, a live summary (today’s attendance %).
   - A dedicated “Alerts” tab showing any teacher with salary_block_recommended = true.
   - Ability to click a teacher and view monthly attendance history and all selfies (with location info).


MICROSERVICE ENDPOINTS (draft all APIs)

auth_service:
- POST /api/auth/register/ (admin only, create users)
- POST /api/auth/login/ → returns access & refresh tokens
- GET /api/auth/me/ → current user details

school_service:
- GET /api/schools/ (BEO/headmaster)
- GET /api/schools/{id}/teachers/ (headmaster/BEO)
- POST /api/schools/{id}/teachers/ (headmaster)

attendance_service:
- POST /api/attendance/sessions/ (headmaster: create session with date & window)
- GET /api/attendance/sessions/today/?school_id= (teacher sees active session)
- POST /api/attendance/sign-in/ (teacher: multipart form with selfie, lat, lon)
- POST /api/attendance/sign-out/ (teacher: similar)
- GET /api/attendance/my-history/ (teacher's own records)
- GET /api/attendance/school/{school_id}/today/ (headmaster/BEO)

reporting_service:
- POST /api/reporting/calculate-monthly/ (trigger calculation for a month – BEO/admin only)
- GET /api/reporting/teacher/{teacher_id}/monthly/?month=&year= (detail)
- GET /api/reporting/salary-alerts/ (BEO: list teachers with salary_block_recommended)

dashboard_service:
- GET /api/public/schools/ (list of schools for dropdown)
- GET /api/public/school/{school_id}/today/ (teacher statuses)

All services internally verify JWT and user role.


FRONTEND PAGES & COMPONENTS (React)

1. Login Page – role‑based redirect after login (headmaster → school admin, teacher → attendance, beo → BEO dashboard)

2. Headmaster Dashboard
   - “Start Attendance” button (with countdown timer showing remaining window)
   - List of teachers with today’s status
   - Button to view past sessions & teacher attendance history

3. Teacher Attendance Page (mobile‑first)
   - Shows if session is active
   - “Sign In” button → opens camera with guide overlay
   - After capturing, preview, then submit with geolocation auto‑attached
   - Once signed in, button changes to “Sign Out” (same flow)
   - Show success/failure messages

4. BEO Dashboard
   - School cards with live attendance %
   - Alerts section with salary‑block flags
   - Detailed teacher view (click to expand monthly breakdown and photo gallery)

5. Public Dashboard
   - School selector dropdown
   - Simple card showing counts and teacher list

6. Common Components: Navbar (role‑based links), ProtectedRoute, WebcamCapture, GeoLocationPrompt, Toast notifications

Make sure all pages are responsive: look good on a 375px wide screen AND on a laptop. Use Tailwind’s sm/md/lg breakpoints.


GEO‑VALIDATION & LOCATION SIMULATION FOR LAPTOP DEMO

Because running on a laptop may not have GPS, implement a fallback:
- If browser geolocation fails or is not available, show a small form where the teacher can manually enter latitude/longitude (pre-filled with the school’s coordinates for demo purposes). Clearly mark the entry as “Manual – location unverified”.
- Show an info box: “On a real device, GPS will be used automatically.”
- For the demo, pre‑fill the school’s coordinates so the teacher can easily submit.


STUDENT COUNT IN SELFIE (visual check only)

Do NOT implement automatic face counting. Instead:
- Before capture, display a checklist: “✅ Ensure at least 5 students are visible in the frame. ❗ Your photo will be reviewed by the Block Education Officer.”
- After upload, the photo is stored with a field `student_visible_verified = False`. The BEO can later manually approve it (optional future feature). For now, just store the flag.


SALARY BLOCK LOGIC

- The reporting_service’s calculation marks a boolean salary_block_recommended.
- The BEO alert view shows teachers where this is True.
- There is NO automated financial action; it's just a recommendation visible to the officer. This matches the transparency goal.

README.MD MUST INCLUDE:

- Project Title & Tagline
- Problem Statement (teacher absenteeism in rural Maharashtra)
- Features list with roles
- Tech Stack
- Architecture Diagram (textual description of microservices and how they communicate)
- Folder Structure
- Setup Instructions (clone, create venv, install dependencies, run migrations, seed data, start Django backend & React frontend)
- Seeded Login Credentials for each role (one per school + BEO)
- How to Demo on Laptop (explain geolocation simulation, mobile‑first responsive design)
- API Documentation (brief overview of endpoints with request/response examples)
- Future Enhancements section (face detection, offline mode, real salary integration)


FOLDER STRUCTURE

Deliver a single monorepo with:
/backend
   /auth_service
   /school_service
   /attendance_service
   /reporting_service
   /dashboard_service
   /attendance_project (settings, urls, wsgi)
   manage.py
   requirements.txt
/frontend
   /src
   /public
   package.json
   tailwind.config.js
README.md

------------------------------

Manual Fixes Applied:

- Python version fix (3.11)
- Pillow version correction to >=10.4
- Added gitignore

___

PROMPT - 2

Transform the current basic interface into a formal government‑style web application using Tailwind CSS (navy headers, saffron accents, responsive). Add placeholder images (Gemini) for Headmaster, BEO, Teacher.

**Headmaster Dashboard:** Header with school name, logo, address. Show classes 1–4; clicking a class reveals division‑vs‑teacher mapping. Provide “Start Attendance for Today” per teacher and a link to view any teacher’s attendance metrics for the current academic year.

**Teacher Dashboard:** Header with school logo, address, teacher name. Display assigned class, current month’s attendance record (dates, status). Buttons: “Mark Today’s Attendance” (existing camera/geo flow) and “Report an Issue” (new modal + backend endpoint POST `/api/reporting/teacher-issue/`).

**BEO Dashboard:** Overview lists all schools with logo, address, headmaster name/contact, monthly stats summary. Drill‑down to school detail shows teacher‑wise attendance % for current and previous month, plus “Hold Salary” / “Release Salary” actions (new `salary_on_hold` boolean field). No actual payment integration.

**Public Dashboard (no login):** District‑level view of all schools: name, address, BEO/headmaster names, student count, teacher‑wise monthly attendance %. Award dashboard (green badge for >90% attendance two consecutive months). Red‑flagged schools (any teacher <60% or salary hold active).

**Backend Updates:** Add `salary_on_hold` (Teacher), `student_count` (School), `headmaster_contact` (School). New reporting endpoints; seed realistic data (student counts 120‑250, contact numbers). Preserve all existing business logic (attendance window, geo‑validation, salary block flag). Deliver updated frontend components, migrations, seed command, and Swagger documentation.