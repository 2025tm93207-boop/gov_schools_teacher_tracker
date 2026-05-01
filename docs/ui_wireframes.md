# UI/UX Wireframes

This document provides textual wireframes for the key screens of the Teacher Attendance & Proxy Verification System. Each screen is designed mobile-first (375px width) with responsive scaling for laptops.

## 1. Login Screen

**Purpose**: Authenticate users with role-based redirect.

**Layout** (Mobile View):
```
+-----------------------------+
| Teacher Attendance System  |
| [Logo/Icon]                 |
+-----------------------------+
| Username: [input field]     |
| Password: [input field]     |
| [Login Button]              |
+-----------------------------+
```

**Key Components**:
- Title bar with system name.
- Form with username/password inputs.
- Primary login button.
- Error messages below form.

**Navigation**: Redirects to role-specific dashboard on success.

## 2. Headmaster Dashboard

**Purpose**: Manage attendance sessions and view teacher status.

**Layout** (Mobile View):
```
+-----------------------------+
| Navbar: System | Logout     |
+-----------------------------+
| Headmaster Dashboard        |
| [Start Attendance Button]   |
+-----------------------------+
| Today's Attendance          |
| Teacher1: Present           |
| Teacher2: Absent            |
| Teacher3: Partial           |
| ...                         |
+-----------------------------+
```

**Key Components**:
- Navbar with logout.
- Large "Start Attendance" button.
- Scrollable list of teacher status cards (green/red/yellow indicators).
- Status: Present (signed in + out), Absent, Partial (signed in only).

**Navigation**: Links to past sessions (not implemented in wireframe).

## 3. Teacher Attendance Page

**Purpose**: Capture attendance with selfie and location.

**Layout** (Mobile View):
```
+-----------------------------+
| Navbar: System | Logout     |
+-----------------------------+
| Teacher Attendance          |
| Ensure 5 students visible   |
+-----------------------------+
| [Camera Preview]            |
| [Capture Button]            |
+-----------------------------+
| Location: Auto/Manual       |
| [Sign In Button]            |
| [Sign Out Button]           |
+-----------------------------+
```

**Key Components**:
- Instruction text for selfie.
- Webcam component with live preview.
- Capture button to take photo.
- Geolocation prompt (auto or manual input).
- Sign In/Out buttons (contextual).

**Navigation**: Stays on page; buttons change based on state.

## 4. BEO Dashboard

**Purpose**: View all schools and salary alerts.

**Layout** (Mobile View):
```
+-----------------------------+
| Navbar: System | Logout     |
+-----------------------------+
| BEO Dashboard               |
| [Calculate Monthly Button]  |
+-----------------------------+
| School Cards:               |
| ZPPS Nandre: 85% Present    |
| ZPPS Kusumbe: 92% Present  |
| ZPPS Fagne: 78% Present    |
+-----------------------------+
| Alerts:                     |
| TeacherX (Nandre): Block    |
| TeacherY (Kusumbe): Block   |
+-----------------------------+
```

**Key Components**:
- Navbar.
- Button to trigger monthly calculation.
- Cards for each school with live attendance %.
- Alerts section with teachers flagged for salary block.

**Navigation**: Click school cards for details (not in wireframe).

## 5. Public Dashboard

**Purpose**: View attendance without login.

**Layout** (Mobile View):
```
+-----------------------------+
| Teacher Attendance System  |
+-----------------------------+
| Select School: [Dropdown]   |
+-----------------------------+
| Total Teachers: 10          |
| Signed In: 8                |
| Not Signed In: 2            |
+-----------------------------+
| Teacher List:               |
| Teacher1: Present           |
| Teacher2: Present           |
| ...                         |
+-----------------------------+
```

**Key Components**:
- School selector dropdown.
- Summary stats (counts).
- List of teachers with status (green/red/yellow).

**Navigation**: No login required; public access.

## Responsive Notes

- On laptops (1024px+), layouts expand with sidebars or wider cards.
- All screens use Tailwind CSS for mobile-first design.
- Colors: Green for present, red for absent, yellow for partial.