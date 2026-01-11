# Exam Seat Allocation Management System - Setup Guide

This guide provides comprehensive instructions for setting up the Exam Seat Allocation Management System on your local machine.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Web Server Configuration](#web-server-configuration)
6. [Application Configuration](#application-configuration)
7. [Testing the Installation](#testing-the-installation)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- PHP 7.4+
- MySQL 5.7+
- Web server (Apache/Nginx)
- 2GB RAM
- 100MB disk space

### Recommended Requirements

- PHP 8.0+
- MySQL 8.0+
- Apache 2.4+ or Nginx 1.18+
- 4GB RAM
- 500MB disk space

## Prerequisites

### 1. Install a Local Development Environment

Choose one of the following options:

#### Option A: XAMPP (Recommended for Windows/macOS)

1. Download XAMPP from [Apache Friends](https://www.apachefriends.org/)
2. Install XAMPP with Apache, MySQL, and PHP components
3. Start Apache and MySQL services

#### Option B: WAMP (Windows Only)

1. Download WAMP from [wampserver.com](http://www.wampserver.com/)
2. Install WAMP with default settings
3. Start all services

#### Option C: MAMP (macOS/Windows)

1. Download MAMP from [MAMP.info](https://www.mamp.info/)
2. Install MAMP
3. Start Apache and MySQL

#### Option D: Manual LAMP Stack (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-gd php-mbstring php-xml

# Start services
sudo systemctl start apache2
sudo systemctl start mysql
```

### 2. Verify Installation

Create a test PHP file to verify your setup:

```php
<?php
phpinfo();
?>
```

Save as `info.php` in your web server's document root and access it via browser.

## Installation Steps

### Step 1: Download the Application

1. Download the Exam Seat Allocation System files
2. Extract to your web server's document root:
   - XAMPP: `C:\xampp\htdocs\` (Windows) or `/Applications/XAMPP/htdocs/` (macOS)
   - WAMP: `C:\wamp64\www\`
   - MAMP: `C:\MAMP\htdocs\` (Windows) or `/Applications/MAMP/htdocs/` (macOS)

### Step 2: Set File Permissions

Ensure proper file permissions for the application:

```bash
# Linux/macOS
chmod -R 755 /path/to/your/project
chmod -R 644 /path/to/your/project/*.php
```

### Step 3: Configure Environment

#### For XAMPP/WAMP/MAMP:

1. Copy `setup/local_config.php` to the project root
2. Rename it to `config.php`
3. Edit the configuration values as needed

## Database Setup

### Step 1: Create Database

1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click "Databases"
3. Create a new database named `exam_seat_allocation`
4. Set collation to `utf8mb4_unicode_ci`

### Step 2: Import Database Schema

1. In phpMyAdmin, select your new database
2. Click the "Import" tab
3. Browse and select `database_schema.sql` from the project
4. Click "Go" to import

### Step 3: Create Database User

1. In phpMyAdmin, go to "User accounts"
2. Click "Add user account"
3. Create user:
   - Username: `seat_admin`
   - Host: `localhost`
   - Password: Choose a strong password
4. Grant privileges:
   - Check "Check All" for global privileges
   - Click "Go"

### Step 4: Update Database Configuration

Edit `config/database.php` with your database credentials:

```php
<?php
$servername = "localhost";
$username = "seat_admin";
$password = "your_password_here";
$dbname = "exam_seat_allocation";
?>
```

## Web Server Configuration

### Apache Configuration

#### Option A: Using .htaccess (Recommended)

The project includes a `.htaccess` file in the setup directory. Copy it to your project root:

```apache
# Enable URL rewriting
RewriteEngine On

# Remove index.php from URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Prevent access to sensitive files
<Files ".htaccess">
    Order Allow,Deny
    Deny from all
</Files>

<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>
```

#### Option B: Virtual Host Configuration

Create a virtual host for better development experience:

```apache
<VirtualHost *:80>
    ServerName seat.local
    DocumentRoot "C:/xampp/htdocs/seat-management"

    <Directory "C:/xampp/htdocs/seat-management">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog "logs/seat.local-error.log"
    CustomLog "logs/seat.local-access.log" common
</VirtualHost>
```

Add to your hosts file:

```
127.0.0.1 seat.local
```

### Nginx Configuration

If using Nginx, add this server block:

```nginx
server {
    listen 80;
    server_name seat.local;
    root /var/www/seat-management;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

## Application Configuration

### Step 1: Environment Configuration

Copy and edit the configuration file:

```bash
cp setup/local_config.php config/config.php
```

Edit `config/config.php`:

```php
<?php
// Application settings
define('APP_NAME', 'Exam Seat Allocation System');
define('APP_VERSION', '1.0.0');
define('DEBUG_MODE', true);

// Database settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'exam_seat_allocation');
define('DB_USER', 'seat_admin');
define('DB_PASS', 'your_password_here');

// Security settings
define('SESSION_TIMEOUT', 3600);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900);

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', 'uploads/');

// Email settings (for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');
?>
```

### Step 2: Create Required Directories

Ensure these directories exist and are writable:

```bash
mkdir -p uploads
mkdir -p logs
mkdir -p cache
chmod -R 755 uploads logs cache
```

### Step 3: Set Up Sample Data

Run the sample data script:

```bash
php setup/sample_data.php
```

Or manually add sample data through the admin panel after login.

## Testing the Installation

### Step 1: Basic Functionality Test

1. Visit `http://localhost/your-project-name/`
2. You should see the main application page
3. Check for any PHP errors or warnings

### Step 2: Database Connection Test

1. Visit `http://localhost/your-project-name/setup/deployment_checklist.php`
2. This will run comprehensive tests
3. Check all tests pass

### Step 3: User Registration Test

1. Go to the registration page
2. Create a test account
3. Verify email functionality if configured

### Step 4: Admin Panel Test

1. Log in as admin (default: admin@example.com / admin123)
2. Navigate to admin panel
3. Test basic admin functions

## Troubleshooting

### Common Issues

#### 1. "Database Connection Failed"

**Solution:**

- Verify MySQL is running
- Check database credentials in `config/database.php`
- Ensure database exists and user has proper permissions

#### 2. "Page Not Found" or 404 Errors

**Solution:**

- Enable mod_rewrite in Apache
- Check .htaccess file exists in project root
- Verify AllowOverride is set to All in Apache config

#### 3. "PHP Extension Missing"

**Solution:**

- Install missing PHP extensions
- Restart web server after installation
- Verify extensions are enabled in php.ini

#### 4. "Permission Denied" Errors

**Solution:**

- Set proper file permissions (755 for directories, 644 for files)
- Ensure web server user owns the files
- Check SELinux/AppArmor settings on Linux

#### 5. "Session Issues"

**Solution:**

- Check session.save_path in php.ini
- Ensure session directory is writable
- Verify session_start() is called before output

### Debug Mode

Enable debug mode in `config/config.php`:

```php
define('DEBUG_MODE', true);
```

This will show detailed error messages and help with troubleshooting.

### Log Files

Check these log files for errors:

- Apache error log: `logs/error.log`
- PHP error log: Check php.ini setting for error_log
- Application logs: `logs/` directory

### Getting Help

If you're still having issues:

1. Run the deployment checklist: `php setup/deployment_checklist.php`
2. Check the requirements: `cat setup/requirements.txt`
3. Review error logs
4. Search existing issues or create a new one

## Security Considerations

### For Production

1. Change default admin credentials
2. Disable debug mode
3. Use HTTPS
4. Regular security updates
5. Backup database regularly
6. Monitor access logs

### File Security

1. Restrict access to sensitive directories
2. Use proper file permissions
3. Validate all user inputs
4. Use prepared statements for database queries

## Next Steps

1. **Customize the application** - Modify templates and styles
2. **Add users** - Create admin and student accounts
3. **Configure email** - Set up SMTP for notifications
4. **Backup regularly** - Implement database backup strategy
5. **Monitor performance** - Use the performance tests in `tests/`

## Support

For additional help:

- Check the [README.md](../README.md) in the project root
- Review the [API documentation](../docs/API_DOCS.md)
- Test with the provided test suite in `tests/`
