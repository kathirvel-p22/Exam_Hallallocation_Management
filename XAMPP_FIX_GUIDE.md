# XAMPP MySQL Port 3306 Fix Guide

## Problem

Your XAMPP shows this error:

```
Port 3306 in use by "Unable to open process"!
MySQL WILL NOT start without the configured ports free!
```

This means another MySQL service is already running on port 3306.

## Solutions

### Solution 1: Stop the Conflicting MySQL Service (Recommended)

#### Step 1: Identify the conflicting service

1. Press `Win + R`, type `services.msc`, press Enter
2. Look for services named:
   - MySQL
   - MariaDB
   - Any other MySQL-related services

#### Step 2: Stop the conflicting service

1. Right-click on the MySQL service
2. Select "Stop"
3. If you don't need this service permanently, set its "Startup type" to "Disabled"

#### Step 3: Restart XAMPP

1. Close XAMPP Control Panel completely
2. Reopen XAMPP Control Panel
3. Try starting MySQL again

### Solution 2: Change XAMPP MySQL Port

If you need to keep the other MySQL service running:

#### Step 1: Edit MySQL Configuration

1. Open XAMPP Control Panel
2. Click "Config" button next to MySQL
3. Select "my.ini" (MySQL configuration file)

#### Step 2: Change the port

Find this line:

```ini
port=3306
```

Change it to:

```ini
port=3307
```

#### Step 3: Update phpMyAdmin configuration

1. Navigate to `C:\xampp\phpMyAdmin\`
2. Open `config.inc.php`
3. Find this line:

```php
$cfg['Servers'][$i]['port'] = '3306';
```

4. Change it to:

```php
$cfg['Servers'][$i]['port'] = '3307';
```

#### Step 4: Update your application configuration

In your project's `config/database.php`, update the MySQL port:

```php
$this->host = 'localhost:3307';  // Instead of just 'localhost'
```

### Solution 3: Use Command Line to Find and Kill Process

#### Step 1: Find the process using port 3306

1. Open Command Prompt as Administrator
2. Run:

```cmd
netstat -ano | findstr :3306
```

#### Step 2: Kill the process

1. Note the PID (Process ID) from the output
2. Run:

```cmd
taskkill /PID [PID_NUMBER] /F
```

### Solution 4: Quick Fix - Use Different Port for XAMPP

#### Step 1: Edit httpd.conf for Apache (if needed)

1. In XAMPP Control Panel, click "Config" next to Apache
2. Select "httpd.conf"
3. Change:

```apache
Listen 80
```

to:

```apache
Listen 8080
```

#### Step 2: Update your project access URL

- Instead of `http://localhost`, use `http://localhost:8080`

## Verification Steps

### After applying any solution:

1. **Restart XAMPP Control Panel**
2. **Start Apache first**, then **MySQL**
3. **Check the status** - both should show "Running" in green
4. **Test MySQL via phpMyAdmin**:
   - Open browser
   - Go to `http://localhost/phpmyadmin` (or `http://localhost:8080/phpmyadmin` if you changed Apache port)
   - You should see the phpMyAdmin login page

### Create Database and Import Schema

1. **Open phpMyAdmin**
2. **Create new database**:

   - Click "New" in left sidebar
   - Database name: `seat_management`
   - Click "Create"

3. **Import schema**:
   - Select the `seat_management` database
   - Click "Import" tab
   - Choose file: `database_schema.sql` from your project
   - Click "Go"

## Alternative: Use WAMP Instead

If XAMPP continues to have issues:

1. **Download WAMP**: https://www.wampserver.com/
2. **Install WAMP** (it usually handles port conflicts better)
3. **Copy your project** to `C:\wamp64\www\`
4. **Start WAMP services**
5. **Access**: http://localhost/Exam_Hallallocation_Management

## Testing Your Setup

Once MySQL is running:

1. **Access your application**: http://localhost/Exam_Hallallocation_Management
2. **Test database connection** by trying to login
3. **Default credentials**:
   - Admin: `admin` / `admin123`
   - Student: `student1` / `student123`

## Troubleshooting

### If MySQL still won't start:

1. **Check Windows Event Viewer** for detailed error messages
2. **Look at MySQL error logs** in `C:\xampp\mysql\data\mysql_error.log`
3. **Try reinstalling XAMPP** if nothing works

### If you get "Access denied" errors:

1. **Reset MySQL root password** via XAMPP
2. **Update your application's database credentials** in `config/database.php`

## Quick Commands Reference

```cmd
# Find processes using port 3306
netstat -ano | findstr :3306

# Kill a process by PID
taskkill /PID [number] /F

# Check if MySQL is running
sc query mysql

# Stop MySQL service
net stop mysql

# Start MySQL service
net start mysql
```

Choose the solution that best fits your needs. **Solution 1** (stopping the conflicting service) is usually the easiest and most effective.
