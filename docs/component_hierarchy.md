# React Component Hierarchy

This diagram shows the component tree of the React frontend application.

## Component Hierarchy

```mermaid
flowchart TD
    A[App] --> B[Router]
    B --> C[Navbar]
    B --> D[Routes]

    D --> E[Login]
    D --> F[ProtectedRoute - Headmaster]
    D --> G[ProtectedRoute - Teacher]
    D --> H[ProtectedRoute - BEO]
    D --> I[PublicDashboard]

    F --> J[HeadmasterDashboard]
    G --> K[TeacherAttendance]
    H --> L[BEODashboard]

    J --> M[StartSessionButton]
    J --> N[TeacherStatusList]
    N --> O[TeacherStatusCard]

    K --> P[WebcamCapture]
    K --> Q[GeoLocationPrompt]
    K --> R[SignInButton]
    K --> S[SignOutButton]

    L --> T[SchoolCards]
    L --> U[AlertsSection]
    U --> V[AlertItem]

    I --> W[SchoolSelector]
    I --> X[AttendanceSummary]
    X --> Y[TeacherList]
    Y --> Z[TeacherItem]

    P --> AA[Webcam]
    P --> BB[CaptureButton]

    Q --> CC[LocationInput]
    Q --> DD[ManualSubmitButton]
```

## Explanation

- **App**: Root component with router and toaster.
- **Navbar**: Top navigation with login/logout.
- **Routes**: Protected routes for different roles.
- **Dashboards**: Role-specific pages with sub-components.
- **Shared Components**: WebcamCapture, GeoLocationPrompt used in TeacherAttendance.

This hierarchy matches the actual file structure in src/components/ and src/pages/.