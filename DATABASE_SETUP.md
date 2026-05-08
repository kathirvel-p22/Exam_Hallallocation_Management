# Database Setup for AcadeX

## Current Status: ✅ Servers Running
- Backend API: http://localhost:5000 ✅
- Frontend: http://localhost:5173 ✅

## Quick Database Setup (Choose One Option)

### Option 1: Free Supabase Database (Recommended)

1. **Create Supabase Account:**
   - Go to https://supabase.com
   - Sign up with GitHub/Google
   - Create a new project
   - Choose a region close to you

2. **Get Database URL:**
   - Go to Settings > Database
   - Copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Update Environment:**
   - Open `backend/.env`
   - Replace the DATABASE_URL with your Supabase URL

4. **Setup Database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```

### Option 2: Railway Database (Alternative Free Option)

1. **Create Railway Account:**
   - Go to https://railway.app
   - Sign up wi