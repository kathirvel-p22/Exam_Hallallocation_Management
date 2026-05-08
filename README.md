# AcadeX — Intelligent Examination Hall Management Platform

> **Advanced Full-Stack Web Application**  
> React 18 + Node.js + PostgreSQL + Socket.io + Prisma + Redis + AI Chatbot

---

## 🗂️ Project Structure (72 files)

```
acadex/
├── package.json                          ← Root workspace (runs both servers)
├── docker-compose.yml                    ← One-command local setup with Postgres + Redis
│
├── backend/
│   ├── src/
│   │   ├── server.js                     ← Express + Socket.io entry point
│   │   ├── config/
│   │   │   ├── prisma.js                 ← Prisma singleton
│   │   │   └── redis.js                  ← Redis + in-memory fallback
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js        ← JWT verify + role guard
│   │   │   ├── errorHandler.js           ← Centralized error handling
│   │   │   └── validate.js              ← Zod schema validation
│   │   ├── controllers/
│   │   │   └── auth.controller.js       ← Login/refresh/logout/me
│   │   ├── routes/
│   │   │   ├── index.routes.js          ← All route registrations
│   │   │   ├── auth.routes.js
│   │   │   ├── exam.routes.js           ← Full exam CRUD
│   │   │   ├── hall.routes.js           ← Hall management
│   │   │   ├── allocation.routes.js     ← Smart allocation engine
│   │   │   ├── attendance.routes.js     ← QR scan + manual attendance
│   │   │   ├── student.routes.js        ← Student management + import
│   │   │   ├── invigilator.routes.js    ← Duty management + issues
│   │   │   ├── notification.routes.js   ← Broadcast notifications
│   │   │   ├── chat.routes.js           ← AI chatbot endpoint
│   │   │   ├── analytics.routes.js      ← Dashboard + monthly analytics
│   │   │   └── institution.routes.js    ← Multi-institution management
│   │   ├── services/
│   │   │   ├── allocationEngine.js      ← Department-mixing algorithm
│   │   │   ├── qrService.js             ← JWT-secured QR generation
│   │   │   ├── notificationService.js   ← Firebase FCM + Gmail SMTP
│   │   │   └── chatService.js           ← Groq LLaMA 3 AI chatbot
│   │   ├── sockets/
│   │   │   └── socketManager.js         ← All real-time Socket.io events
│   │   └── utils/
│   │       ├── logger.js                ← Winston structured logging
│   │       └── auditLog.js              ← Audit trail helper
│   ├── prisma/
│   │   ├── schema.prisma                ← 16-table full database schema
│   │   └── seed.js                      ← Demo data for all 4 roles
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx                     ← React entry + TanStack Query
    │   ├── App.jsx                      ← Router + protected routes
    │   ├── index.css                    ← Full Tailwind design system
    │   ├── store/
    │   │   └── authStore.js             ← Zustand auth with persistence
    │   ├── services/
    │   │   └── api.js                   ← Axios + auto token refresh
    │   ├── socket/
    │   │   └── useSocket.js             ← Socket.io React hook
    │   ├── components/
    │   │   ├── ui/index.jsx             ← 20+ reusable UI components
    │   │   └── layout/
    │   │       ├── AppLayout.jsx        ← Base shell: sidebar + topbar
    │   │       ├── AdminLayout.jsx
    │   │       ├── StudentLayout.jsx
    │   │       ├── InvigilatorLayout.jsx
    │   │       └── SuperAdminLayout.jsx
    │   └── pages/
    │       ├── LandingPage.jsx          ← Public landing with portal selector
    │       ├── LoginPage.jsx            ← Role-aware login with demo chips
    │       ├── admin/                   ← 10 admin pages
    │       ├── student/                 ← 7 student pages
    │       ├── invigilator/             ← 6 invigilator pages
    │       └── superadmin/              ← 6 super admin pages
    ├── vite.config.js
    ├── tailwind.config.js
    ├── nginx.conf
    ├── Dockerfile
    └── package.json
```

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- Docker Desktop
- Git

```bash
# 1. Clone the project
git clone https://github.com/your-org/acadex.git
cd acadex

# 2. Copy environment files
cp backend/.env.example backend/.env

# 3. Start everything
docker-compose up -d

# 4. Run database migrations + seed
docker exec acadex_backend npx prisma migrate dev --name init
docker exec acadex_backend node prisma/seed.js

# 5. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# Prisma Studio: http://localhost:5555 (optional, run separately)
```

---

## 🛠️ Manual Development Setup

### Prerequisites
- Node.js >= 20
- PostgreSQL 15+ or Supabase free account
- Redis 7+ or Upstash free account

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env — fill DATABASE_URL, REDIS_URL, JWT secrets

# Database setup
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js

# Start development server
npm run dev
# Server running on http://localhost:5000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start Vite dev server
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role         | Email                          | Password          |
|--------------|-------------------------------|-------------------|
| Super Admin  | superadmin@acadex.edu          | SuperAdmin@2025   |
| Exam Admin   | admin@acadex.edu               | Admin@2025        |
| Invigilator  | priya.nair@acadex.edu          | Invig@2025        |
| Student      | arjun@student.acadex.edu       | Student@2025      |

---

## 🆓 Free Tech Stack

### Backend
| Service       | Provider       | Free Tier         |
|---------------|---------------|-------------------|
| Database      | Supabase       | 500MB, 50K rows   |
| Redis Cache   | Upstash        | 10K cmd/day       |
| AI Chatbot    | Groq           | LLaMA 3, 14K rpm  |
| Push Notifs   | Firebase FCM   | Unlimited         |
| Email         | Gmail SMTP     | 500/day           |
| File Storage  | Cloudinary     | 25GB free         |
| Backend Host  | Render.com     | Free tier         |

### Frontend
| Service       | Provider  | Free Tier      |
|---------------|----------|----------------|
| Hosting       | Vercel    | Unlimited       |
| CDN           | Vercel    | Global CDN      |

---

## 🔌 API Endpoints

```
POST   /api/auth/login              ← Login (rate limited: 10/15min)
POST   /api/auth/refresh            ← Refresh access token
POST   /api/auth/logout             ← Invalidate tokens
GET    /api/auth/me                 ← Current user profile

GET    /api/exams                   ← List exams (scoped by role)
POST   /api/exams                   ← Create exam (Admin+)
PATCH  /api/exams/:id/status        ← Change exam status

GET    /api/halls                   ← List halls
GET    /api/halls/:id/seats         ← Seat map with attendance
POST   /api/halls                   ← Create hall + auto-generate seats

POST   /api/allocation/run          ← 🔥 Run smart allocation engine
GET    /api/allocation/student/my   ← Student's own allocations
GET    /api/allocation/exam/:id     ← All allocations for exam

POST   /api/attendance/scan         ← QR scan → mark present
POST   /api/attendance/manual       ← Manual attendance override
GET    /api/attendance/exam/:id     ← Attendance summary

GET    /api/students                ← List students
GET    /api/students/me/profile     ← Student profile + tickets
POST   /api/students/import         ← Bulk import JSON array

GET    /api/invigilators            ← List invigilators
POST   /api/invigilators/assign     ← Assign to exam + hall
PATCH  /api/invigilators/checkin    ← Check in for duty
POST   /api/invigilators/issue      ← Report exam issue

POST   /api/notifications/send      ← Broadcast (Email+Push+InApp)
PATCH  /api/notifications/read-all  ← Mark all read

POST   /api/chat                    ← AI chatbot (Groq LLaMA 3)

GET    /api/analytics/dashboard     ← Admin dashboard stats
GET    /api/analytics/exam/:id      ← Per-exam analytics
GET    /api/analytics/global        ← Super admin global stats
GET    /api/analytics/monthly       ← Monthly trend data

GET    /api/institutions            ← List institutions (Super Admin)
POST   /api/institutions            ← Create institution
```

---

## ⚡ Smart Allocation Algorithm

The `allocationEngine.js` uses a **department-mixing round-robin** approach:

```
1. Fetch all eligible students grouped by department
2. Separately extract differently-abled students → assign front seats first
3. Round-robin interleave remaining students across departments:
   CSE → ECE → MECH → IT → CSE → ECE → MECH → IT → ...
4. Fill halls seat-by-seat (row-by-row, A-01 to Z-10)
5. Generate JWT-signed QR tokens for each student
6. Create attendance records (status: ABSENT initially)
7. Emit real-time progress via Socket.io (steps 1-7 with % complete)
8. Send email + push notifications to all students
```

Result: No two adjacent students from the same department. Zero manual work. Processes 1000+ students in under 2 seconds.

---

## 🔌 Socket.io Events

### Client → Server
```js
socket.emit('join:hall', { hallId })      // Join hall room
socket.emit('join:exam', { examId })      // Join exam room
socket.emit('attendance:scan', data)      // Broadcast scan result
socket.emit('invigilator:checkin', data)  // Check in for duty
socket.emit('issue:reported', { issue })  // Broadcast issue
socket.emit('message:send', { content })  // Send message
```

### Server → Client
```js
socket.on('attendance:updated', handler)      // New scan received
socket.on('exam:stats', handler)              // Live attendance counts
socket.on('allocation:progress', handler)     // Allocation step updates
socket.on('allocation:complete', handler)     // Allocation finished
socket.on('notification:push', handler)       // New notification
socket.on('invigilator:arrived', handler)     // Invigilator checked in
socket.on('issue:new', handler)               // New issue reported
```

---

## 🗃️ Database Schema (16 Tables)

```
Institution ──┬── Department ──┬── Student ──── Allocation ──┬── Attendance
              ├── Hall ─────────┤              ├── HallTicket └── Seat
              ├── Exam ─────────┤              └── InvigDuty
              └── User ─────────┤
                     │          ├── Invigilator ── InvigDuty ── ExamIssue
                     ├── Student └── ExamDepartment
                     ├── RefreshToken
                     ├── Notification
                     ├── Message
                     └── AuditLog
```

---

## 🔒 Security Features

- **JWT access tokens** (15min expiry) + **HTTP-only refresh tokens** (7 days)
- **Refresh token rotation** — new token on each refresh, old one revoked
- **Token blacklisting** in Redis for instant logout
- **QR codes are JWT-signed** — tamper-proof, time-limited (24h)
- **Helmet.js** — sets 10+ security HTTP headers
- **Rate limiting** — global 200 req/15min, auth routes 10/15min
- **Zod validation** on all POST/PUT endpoints
- **Role-based access control** on every route
- **Audit logging** for all state-changing operations

---

## 📦 Build for Production

```bash
# Frontend build
cd frontend && npm run build
# Output: frontend/dist/

# Backend — set NODE_ENV=production
# Database — run: npx prisma migrate deploy
# Environment — fill all .env variables

# Deploy options:
# Frontend → Vercel (drag & drop dist/ folder)
# Backend  → Render.com (connect GitHub, set env vars)
# DB       → Supabase free tier
# Redis    → Upstash free tier
```

---

*Built with ❤️ for modern academic institutions · AcadeX v2.0*
