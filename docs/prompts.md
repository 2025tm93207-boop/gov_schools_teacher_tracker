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
- Each school has 10 teachers, each assigned as class teacher for one standard (1 to 5, so 2 teachers per standard maybe, or just 2 teachers per class – you can distribute 10 teachers: 2 each for 1-5). Teachers have real‑sounding Marathi names.
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

COMMANDS TO RUN:
Backend:
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # custom management command to populate
python manage.py runserver

Frontend:
cd frontend
npm install
npm run dev

Ensure all instructions are clear and production‑ready for a college submission.

Now, generate the complete code for this project.
------------------------------

PROMPT-2:

Do not change any business logic or existing endpoints; only add documentation, configuration, and diagram files.

1. AUTO-GENERATED SWAGGER API DOCUMENTATION
   - Integrate drf-spectacular into the Django project to automatically generate OpenAPI 3.0 schemas for all microservice endpoints.
   - Add a single Swagger UI page (e.g., /api/docs/) that groups endpoints by service (auth, school, attendance, reporting, dashboard).
   - Ensure all endpoints are decorated with appropriate tags, summaries, and descriptions using @extend_schema or DRF viewset docstrings.
   - The Swagger page must support JWT authentication (Authorize button) so evaluators can test protected endpoints directly from the browser.
   - Update requirements.txt to include drf-spectacular.
   - Add clear instructions in README.md on how to access the Swagger UI.

2. DATABASE SCHEMA / ER DIAGRAM
   - Analyse the final models across all services (User, School, Teacher, AttendanceSession, AttendanceRecord, MonthlyReport, etc.).
   - Generate a Mermaid ER diagram (mermaid erDiagram syntax) that shows all tables, their columns (key ones), primary keys, foreign keys, and relationships (one-to-many, many-to-many if any).
   - Place this diagram inside a new file /docs/database_er_diagram.md.
   - The diagram must be accurate according to the actual models.py files in the project.
   - Add a brief explanation of how the microservice split is reflected (e.g., separate schemas or logical separation).

3. ARCHITECTURE DIAGRAM AND COMPONENT HIERARCHY
   a) System Architecture Diagram:
      - Create a high-level architecture diagram using Mermaid (flowchart or graph) showing:
         * React frontend (with different pages for each role)
         * The five Django microservices (auth, school, attendance, reporting, dashboard)
         * The API Gateway (explain that internal calls are made directly for simplicity, but a gateway can be added; for now show a simple NGINX or direct HTTP arrows)
         * Database (SQLite files)
         * External browser geolocation and webcam
      - Place the diagram in /docs/architecture_diagram.md with a descriptive caption.
   b) React Component Hierarchy:
      - Create a Mermaid graph (flowchart TD) showing the full component tree:
         App -> RoleBasedRouter -> Login, HeadmasterDashboard, TeacherAttendance, BEODashboard, PublicDashboard.
         Expand each dashboard into its sub-components (e.g., HeadmasterDashboard -> StartSessionButton, TeacherStatusList, TeacherStatusCard).
         Ensure the diagram matches the actual frontend file structure.
      - Place this in /docs/component_hierarchy.md.

4. UI/UX WIREFRAMES (rough sketches)
   - Since we cannot generate actual images, provide clear, detailed textual wireframes using ASCII art or a Mermaid flowchart that outlines each screen layout with major UI elements.
   - For each of the 5 key screens (Login, Headmaster Dashboard, Teacher Attendance, BEO Dashboard, Public Dashboard), create a markdown section describing:
        * Screen title
        * Purpose
        * Key components (e.g., buttons, cards, camera preview, status lists)
        * Navigation links
   - You can optionally include simple box-and-line ASCII sketches for the mobile viewports (375×667) to show how elements stack.
   - Store these wireframes in /docs/ui_wireframes.md.

All generated documentation must be clean, well-formatted, and placed inside a /docs folder at the root of the repository. Ensure the README.md is updated with links to each of these new documents and to the Swagger UI endpoint.

------------------------------

Python version fix
Pillow version correction to >=10.4
Added gitignore

___

Models used -

DeepSeek - Prompt generation, Idea brainstorming
GitHub CoPilot - Initial Code Generation
Gemini 3.1 - Image Generation
Claude Sonnet 4.6 - Bug fixing

---------------------------

PROMPT-3:

study the current code, its very plain
the UI looks very basic
I want things to be mapped
when I login as a headmaster the header should show  my school name and logo, classes in my school (1st t0 4th standard) when I click on a class I see the divisions vs teacher mapping and option to start attendance for today
and option to view attendance records by teacher (metrics for any teacher for their class for current academic year)

when I login as a teacher, again I see the header for my school with logo and address of the school
I see my class, my own attendance records for current month, option to mark today's attendance and ability to report any issue

when  I login as BEO I see all schools under me -> logo, address, headmaster name, contact details
monthly stats summary for each school

clicking on the school leads to detailed teacher wise stats for current and previous month and ability to hold/release salary for a teacher/headmaster

when I login as public I see high level stats for all schools in my district
school name, address, beo name,  headmaster, teacherwise % attendance per month, student count, etc.
award dashbaord for schools doing well
red flagged schools doing poorly

update data for current month and previous month, backend APIs and frontend accordingly

add placeholder images for headmaster, beo, teacher

make it formal like a government website


 