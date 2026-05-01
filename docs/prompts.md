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


 