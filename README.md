# Task Manager Web App

A full-stack task management application with JWT authentication, task CRUD operations, filtering, search, and analytics dashboard. Built with **React**, **FastAPI**, **MongoDB**, and **ngrok** for instant team access.

---

## 🎯 Features

- **Authentication**: JWT-based signup/login with bcrypt password hashing
- **Task Management**: Create, read, update, delete tasks with title, description, status, priority, and due dates
- **Filtering & Search**: Filter by status/priority, search by title, pagination (1-20 per page)
- **Sorting**: Sort by created date, due date, or priority (ascending/descending)
- **Analytics Dashboard**: Real-time task statistics with charts and completion percentage
- **Dark Theme UI**: Modern dark mode with grid borders aesthetic, IBM Plex Sans font
- **Mobile Responsive**: Full mobile support with hamburger menu navigation
- **Animations**: Smooth framer-motion transitions and task staggering

---

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (async via Motor)
- **Auth**: JWT + bcrypt
- **Server**: Uvicorn

### Frontend
- **Framework**: React 19 + React Router v7
- **Styling**: Tailwind CSS + custom dark theme
- **Components**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts
- **Animations**: framer-motion
- **HTTP**: Axios with interceptors

---

## 📋 Project Structure

```
login-task/
├── backend/
│   ├── server.py              # FastAPI app with all routes
│   ├── .env                   # DB URL, JWT secret, CORS origins
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/             # Login, Signup, Dashboard pages
│   │   ├── components/        # TaskDialog, TaskItem, AnalyticsPanel, UI components
│   │   ├── contexts/          # AuthContext for auth state
│   │   ├── lib/               # api.js (axios setup), utils.js
│   │   └── hooks/             # use-toast
│   ├── package.json
│   └── public/index.html
├── backend_test.py            # Automated test suite for all APIs
├── run_with_ngrok.sh          # Script to start backend, frontend, and ngrok tunnels
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or cloud via `MONGO_URL`)
- ngrok (for public sharing)

### 1. Clone & Install

```bash
git clone https://github.com/varunposhetty/login-task.git
cd login-task

# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Set Environment Variables

**Backend** (`backend/.env`):
```
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
DB_NAME=taskdb
JWT_SECRET=supersecret123
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend** (`frontend/.env` - optional):
```
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

> If unset, frontend defaults to `http://127.0.0.1:8000`

### 3. Start Servers (Local)

**Terminal 1 - Backend**:
```bash
cd backend
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

Open `http://localhost:3000/login`

---

## 🌐 Deploy with ngrok (Public Access)

Share your local dev with your team instantly using ngrok tunnels.

### Install ngrok

- **macOS**: `brew install --cask ngrok`
- **Linux**: `sudo snap install ngrok` or download from https://ngrok.com/download
- **Windows**: Download from https://ngrok.com/download

### Option A: Automatic (Recommended)

```bash
bash run_with_ngrok.sh
```

This starts backend, frontend, and ngrok tunnels. Check logs:
- `/tmp/backend.log`
- `/tmp/frontend.log`
- `/tmp/ngrok-backend.log`
- `/tmp/ngrok-frontend.log`

**Extract public URL**:
```bash
cat /tmp/ngrok-frontend.log | grep -o 'https://[^ ]*ngrok.io'
```

### Option B: Manual

```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - ngrok tunnels
ngrok http 3000  # Frontend
# In another terminal:
ngrok http 8000  # Backend (if needed)
```

ngrok prints public URLs:
```
Forwarding   https://abc12345.ngrok.io -> http://localhost:3000
```

Share `https://abc12345.ngrok.io` with your team! 🎉

---

## 🧪 API Testing

Run the comprehensive test suite:

```bash
cd /path/to/login-task
python backend_test.py
```

Tests check:
- Auth signup/login/logout
- Task CRUD (create, read, update, delete)
- Filtering, search, sorting, pagination
- Analytics endpoint structure

Expected output: `12/13 passed` (login test expects known user; signup path is tested).

---

## 📚 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user (requires Bearer token)

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks?status=todo&priority=high&search=query&sort_by=created_at&sort_order=desc&page=1&per_page=20` - List tasks with filters
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Analytics
- `GET /api/tasks/analytics` - Get task stats (total, done, in_progress, priority breakdown, completion %)

---

## 🔐 Authentication Flow

1. **Signup**: POST email/password/name → returns JWT token + user data → stored in `localStorage`
2. **Login**: POST email/password → returns JWT token → axios interceptor attaches to all requests
3. **Protected Routes**: Dashboard checks `localStorage.token`; if missing/expired, redirects to `/login`
4. **Token Expiry**: 7 days from issue time

---

## 🎨 UI Components

All components use **shadcn/ui** with dark theme:

- `LoginPage` / `SignupPage` - Split-screen auth forms
- `DashboardPage` - Main task interface with sidebar, table, filters
- `TaskDialog` - Modal to create/edit tasks with date picker
- `TaskItem` - Task row with completion toggle
- `AnalyticsPanel` - Stats cards, completion bar, charts
- `Responsive Menu` - Mobile hamburger nav

---

## 🧠 Key Implementation Details

### Frontend
- **State Management**: React Context (AuthContext, localStorage)
- **Routing**: React Router v7 (Login → Signup → Dashboard)
- **HTTP**: Axios with JWT bearer token interceptor
- **Error Handling**: Toast notifications via sonner library
- **Styling**: Tailwind CSS with custom dark theme; no CSS modules needed

### Backend
- **Async**: Motor (async MongoDB driver) for non-blocking DB calls
- **Validation**: Pydantic models for request/response schemas
- **Security**: bcrypt for password hashing, JWT for tokens
- **CORS**: Configurable origins from env
- **Indexes**: Unique email/id on users; user_id/id on tasks for performance

---

## 🛠️ Development Workflow

1. **Make changes** to backend (`server.py`) or frontend (`src/`)
2. **Backend**: Changes auto-reload via Uvicorn `--reload` flag (if added)
3. **Frontend**: Hot-reload via Create React App dev server
4. **Test API**: `python backend_test.py` (requires running backend)
5. **Commit & Push**: All changes go to GitHub main branch

---

## 🐛 Troubleshooting

### "Login failed" or 404 errors
- Check `REACT_APP_BACKEND_URL` matches backend host/port
- Default is `http://127.0.0.1:8000`; if backend running elsewhere, update `.env` or code

### MongoDB connection error
- Verify `MONGO_URL` in `backend/.env` is correct and network accessible
- Test with: `python -c "import pymongo; pymongo.MongoClient('<URL>').server_info()"`

### Port already in use
- Backend: `lsof -i :8000` to find process, then `kill <pid>`
- Frontend: `lsof -i :3000` similarly
- ngrok: `pkill -f ngrok`

### ngrok URL expires
- ngrok free tier URLs change every restart (~2 hours)
- For stable URL, upgrade to ngrok paid or use a static subdomain

---

## 📝 Notes

- **Frontend build**: `npm run build` generates optimized production build in `frontend/build/`
- **Deployment**: Use Docker for containerization, deploy backend to AWS/Heroku, frontend to Vercel/Netlify
- **Database backups**: MongoDB Atlas handles backups automatically
- **Env secrets**: Never commit `.env` files; use GitHub Secrets for CI/CD

---

## 📧 Contact & Support

For issues, questions, or contributions:
- GitHub: https://github.com/varunposhetty/login-task
- Check existing issues or create a new one

---

## 📄 License

MIT License. See LICENSE file for details.

---

**Last Updated**: March 26, 2026
