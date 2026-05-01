# System Architecture Diagram

This diagram illustrates the high-level architecture of the Teacher Attendance & Proxy Verification System.

## Architecture Overview

The system follows a microservices architecture simulated within a single Django project for simplicity. Services communicate via internal HTTP calls. The frontend is a React SPA with role-based routing. Authentication uses JWT tokens. Data is stored in SQLite.

```mermaid
graph TD
    A[Browser] --> B[React Frontend]
    B --> C[Login Page]
    B --> D[Headmaster Dashboard]
    B --> E[Teacher Attendance Page]
    B --> F[BEO Dashboard]
    B --> G[Public Dashboard]

    C --> H[JWT Auth]
    D --> H
    E --> H
    F --> H

    H --> I[auth_service]
    D --> J[school_service]
    E --> K[attendance_service]
    F --> L[reporting_service]
    G --> M[dashboard_service]

    I --> N[SQLite Database]
    J --> N
    K --> N
    L --> N
    M --> N

    A --> O[Geolocation API]
    A --> P[Webcam API]

    subgraph "Django Microservices"
        I
        J
        K
        L
        M
    end

    subgraph "External APIs"
        O
        P
    end

    N --> Q[(Database Files)]
```

## Component Descriptions

- **React Frontend**: Single-page application with Vite, Tailwind CSS, mobile-first design.
- **Microservices**: Separate Django apps for different domains, communicating via REST APIs.
- **Database**: Single SQLite file with logical table separation.
- **External APIs**: Browser geolocation for location validation, webcam for selfie capture.
- **Authentication**: JWT tokens issued by auth_service, validated by all services.

For production, an API Gateway (e.g., NGINX) could be added to route external requests, but internal calls are direct for this submission.