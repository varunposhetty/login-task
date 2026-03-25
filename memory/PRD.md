# Task Manager Web App - PRD

## Problem Statement
Build a full-stack Task Management Web Application with JWT auth, task CRUD, filtering/search, and analytics dashboard.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + Recharts + framer-motion
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Auth**: JWT + bcrypt password hashing
- **Design**: Dark theme, IBM Plex Sans, Grid Borders aesthetic

## User Personas
- Individual developers managing personal tasks
- Project managers tracking team deliverables
- Students organizing assignments and deadlines

## Core Requirements
- [x] JWT-based signup/login
- [x] Task CRUD (Create, Read, Update, Delete)
- [x] Task fields: Title, Description, Status, Priority, Due Date
- [x] Mark tasks as completed
- [x] Filter by status and priority
- [x] Search tasks by title
- [x] Analytics dashboard with stat cards and charts
- [x] Pagination and sorting
- [x] Responsive design with mobile menu
- [x] Dark mode UI

## What's Been Implemented (March 25, 2026)
### Backend
- POST /api/auth/signup - User registration with bcrypt hashing
- POST /api/auth/login - JWT token-based login
- GET /api/auth/me - Current user profile
- POST /api/tasks - Create task
- GET /api/tasks - List tasks with filters, search, sort, pagination
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- GET /api/tasks/analytics - Task statistics

### Frontend
- Login/Signup pages with split-screen layout
- Dashboard with sidebar navigation
- Task list with table headers and dense layout
- Task create/edit dialog with calendar date picker
- Task completion toggle
- Status/Priority/Search filters with Select components
- Sort dropdown (newest, oldest, due date, priority)
- Analytics panel with stat cards, completion bar, bar chart, pie chart
- Mobile responsive with hamburger menu
- framer-motion staggered animations
- Toasts for user feedback

## Prioritized Backlog
### P0 (Completed)
- Auth, Task CRUD, Filters, Analytics

### P1 (Next Phase)
- Task drag-and-drop reordering
- Bulk task operations (multi-select delete/update)
- Task labels/tags system
- Due date reminders/notifications

### P2 (Future)
- Team collaboration (shared tasks)
- Task comments/activity log
- Export tasks (CSV/PDF)
- Recurring tasks
- Email notifications
- Kanban board view

## Next Tasks
1. Add task drag-and-drop for status changes
2. Implement bulk operations
3. Add task categories/tags
4. Dark/Light theme toggle
