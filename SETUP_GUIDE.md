# AcadeX Platform Setup Guide

## Current Status: ✅ Dependencies Installed

### What's Ready:
- ✅ Node.js 24.6.0 (exceeds requirement of >=20)
- ✅ npm 11.5.1 (exceeds requirement of >=10)
- ✅ All npm dependencies installed (backend + frontend)
- ✅ Environment files created
- ✅ Project structure analyzed

### Next Steps to Complete Setup:

#### Option 1: Quick Start with Cloud Database (Recommended)

1. **Get a Free Supabase Database:**
   - Go to https://supabase.com
   - Create a free account
   - Create a new project
   - Go to Settings > Database
   - Copy the connection string
   - Replace the DATABASE_URL in `backend/.env`

2. **Run Database Setup:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```

3. **Start the Platform:**
   ```bash
   cd ..
   npm run dev
   ```

#### Option 2: Local PostgreSQL Setup

1. **Install PostgreSQL:**
   - Download from https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set

2. **Create Database:**
   ```sql
   CREATE DATABASE acadex_db;
   CREATE USER acadex_user WITH PASSWORD 'acadex_secret';
   GRANT ALL PRIVILEGES ON DATABASE acadex_db TO acadex_user;
   ```

3. **Update Environment:**
   ```env
   DATABASE_URL="postgresql://acadex_user:acadex_secret@localhost:5432/acadex_db"
   ```

4. **Run Setup:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

#### Option 3: Docker Setup (If Docker Available)

```bash
# Install Docker Desktop first, then:
docker-compose up -d
docker exec acadex_backend npx prisma migrate dev --name init
docker exec acadex_backend node prisma/seed.js
```

### Demo Login Credentials:

| Role         | Email                          | Password          |
|--------------|-------------------------------|-------------------|
| Super Admin  | superadmin@acadex.edu          | SuperAdmin@2025   |
| Exam Admin   | admin@acadex.edu               | Admin@2025        |
| Invigilator  | priya.nair@acadex.edu          | Invig@2025        |
| Student      | arjun@student.acadex.edu       | Student@2025      |

### URLs After Setup:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555

### Optional Services (Can be added later):
- Redis (for caching) - Uses in-memory fallback if not available
- Groq API (for AI chatbot) - Get free key from https://console.groq.com
- Firebase FCM (for push notifications)
- Gmail SMTP (for email notifications)
- Cloudinary (for file storage)

### Current Configuration:
- Database: Needs setup (see options above)
- Redis: In-memory fallback (no setup needed)
- JWT: Configured with development secrets
- QR Codes: Configured
- Email/Push: Optional (can be added later)