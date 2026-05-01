# Database ER Diagram

This document contains the Entity-Relationship diagram for the Teacher Attendance & Proxy Verification System database.

The system uses a single SQLite database with logical separation into microservices. Each service's models are prefixed or grouped logically, but all tables share the same database file for simplicity.

## ER Diagram

```mermaid
erDiagram
    User {
        int id PK
        varchar username
        varchar role
        int school_id FK
    }

    School {
        int id PK
        varchar name
        float latitude
        float longitude
        float radius
    }

    Teacher {
        int id PK
        int user_id FK
        int standard
        boolean salary_block_recommended
    }

    AttendanceSession {
        int id PK
        int school_id FK
        date date
        time start_time
        time end_time
        boolean is_active
    }

    AttendanceRecord {
        int id PK
        int teacher_id FK
        int session_id FK
        datetime sign_in_time
        datetime sign_out_time
        varchar sign_in_selfie
        varchar sign_out_selfie
        float sign_in_lat
        float sign_in_lon
        float sign_out_lat
        float sign_out_lon
        boolean sign_in_verified
        boolean sign_out_verified
        boolean location_suspicious
    }

    User ||--o{ School : "belongs_to"
    School ||--o{ Teacher : "has"
    Teacher ||--o{ User : "is_a"
    School ||--o{ AttendanceSession : "hosts"
    AttendanceSession ||--o{ AttendanceRecord : "contains"
    Teacher ||--o{ AttendanceRecord : "participates_in"
```

## Explanation

- **User**: Central authentication model with role-based access.
- **School**: Represents each ZPPS school with geo-coordinates and radius for validation.
- **Teacher**: Extends User with class standard and salary block flag.
- **AttendanceSession**: Daily sessions created by headmasters.
- **AttendanceRecord**: Individual attendance entries with selfies and locations.

Relationships:
- One-to-Many: School to Teachers, School to Sessions, Session to Records, Teacher to Records.
- One-to-One: User to Teacher (since teacher is a user role).

The microservice split is logical: auth_service manages User, school_service manages School and Teacher, attendance_service manages Sessions and Records, etc. No separate databases; all in one SQLite file for submission simplicity.