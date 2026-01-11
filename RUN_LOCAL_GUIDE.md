# 🚀 Run Your Exam Hall Allocation System Locally

## Quick Start - See Your System Running NOW!

### Method 1: Simple PHP Server (No MySQL Required for Interface)

Since you want to see the output on localhost, let's start with a basic PHP server to view the interface:

#### Step 1: Check if PHP is Available

1. **Open Command Prompt**
2. **Type**: `php -v`
3. **If you see PHP version**, PHP is installed
4. **If not**, you need to install PHP first

#### Step 2: Start Simple Server

1. **Navigate to your project folder** in Command Prompt
2. **Run**: `php -S localhost:8000 -t public`
3. **Open browser** and go to: http://localhost:8000

#### Step 3: View the Interface

You should see the main landing page of your Exam Hall Allocation System!

### Method 2: Fix XAMPP MySQL Issue (For Full Functionality)

If you want full database functionality:

#### Nuclear Reset of MySQL Conflicts

1. **Press Win + R, type `cmd`, right-click → Run as administrator**
2. **Stop all MySQL services**:
   ```cmd
   net stop mysql
   sc config mysql start= disabled
   ```
3. **Kill MySQL processes**:
   ```cmd
   taskkill /f /im mysqld.exe
   taskkill /f /im mysql.exe
   ```
4. **Restart XAMPP**
5. **Start MySQL** - should work now!

#### Create Database

1. **Open http://localhost/phpmyadmin**
2. **Create database**: `seat_management`
3. **Import schema**: Use "Import" → Select `database_schema.sql`

### Method 3: Use Laragon (Better Alternative to XAMPP)

1. **Download Laragon**: https://laragon.org/download/
2. **Install and run**
3. **Copy your project** to `C:\laragon\www\Exam_Hallallocation_Management`
4. **Start all services**
5. **Access**: http://exam-hall-allocation.test

## 🎯 What You'll See

### Main Landing Page

- Beautiful hero section with system overview
- Admin and Student login buttons
- Feature highlights
- System statistics

### Admin Panel (After Login)

- Dashboard with system overview
- Room management
- Exam scheduling
- Allocation management
- Reports and analytics

### Student Portal (After Login)

- Personal dashboard
- Seat allocation view
- Exam schedule
- Profile management

## 🔧 Default Login Credentials

### Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Access**: http://localhost:8000/admin/dashboard.php

### Student Account

- **Username**: `student1`
- **Password**: `student123`
- **Access**: http://localhost:8000/student/dashboard.php

## 🚨 Troubleshooting

### If PHP is Not Installed

1. **Download PHP**: https://windows.php.net/download/
2. **Extract to**: `C:\php\`
3. **Add to PATH**: System Properties → Environment Variables
4. **Restart Command Prompt**

### If MySQL Still Won't Start

1. **Use the nuclear reset method above**
2. **Or switch to Laragon** (recommended)
3. **Or deploy to cloud** (Vercel) for immediate access

### If You See Errors

- **Check file permissions**
- **Ensure all files are in correct folders**
- **Verify database connection in config/database.php**

## 🌐 Alternative: Cloud Deployment (Instant Access)

If local setup is problematic:

1. **Go to [vercel.com](https://vercel.com)**
2. **Connect your GitHub repository**
3. **Deploy in 5 minutes**
4. **Get live URL** accessible from anywhere

## 📁 Files Created for You

- **`start_local_server.bat`** - One-click local server startup
- **`RUN_LOCAL_GUIDE.md`** - This guide
- **Complete documentation** in the repository

## 🎉 Next Steps

1. **Try Method 1** to see the interface immediately
2. **Choose your preferred setup method** (XAMPP, Laragon, or Cloud)
3. **Set up database** for full functionality
4. **Start using your Exam Hall Allocation System!**

**Your system is ready and waiting! Choose the method that works best for you and start managing exam allocations today!** 🚀
