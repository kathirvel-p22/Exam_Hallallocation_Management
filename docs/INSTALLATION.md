# Installation and Setup Guide

This guide provides comprehensive instructions for installing and configuring the Exam Seat Allocation Management System.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Installation](#detailed-installation)
5. [Configuration](#configuration)
6. [Database Setup](#database-setup)
7. [Web Server Configuration](#web-server-configuration)
8. [Security Configuration](#security-configuration)
9. [Testing the Installation](#testing-the-installation)
10. [Troubleshooting](#troubleshooting)
11. [Post-Installation](#post-installation)

## System Requirements

### Server Requirements

#### Minimum Requirements

- **Operating System**: Linux, Windows, or macOS
- **Web Server**: Apache 2.4+ or Nginx 1.10+
- **PHP**: Version 7.4 or higher
- **Database**: MySQL 5.7+ or MariaDB 10.2+
- **Memory**: 512MB RAM
- **Storage**: 100MB disk space

#### Recommended Requirements

- **Operating System**: Linux (Ubuntu 20.04+ or CentOS 8+)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP**: Version 8.0 or higher
- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **Memory**: 1GB RAM or higher
- **Storage**: 500MB disk space or higher
- **Processor**: 2GHz dual-core or better

### PHP Extensions Required

```bash
# Required extensions
extension=mysqli
extension=openssl
extension=mbstring
extension=session
extension=ctype
extension=json
extension=gd
extension=zip

# Optional but recommended
extension=curl
extension=xml
extension=simplexml
```

### Browser Requirements

For optimal user experience, ensure users have one of these browsers:

- **Google Chrome**: Version 80+
- **Mozilla Firefox**: Version 75+
- **Safari**: Version 13+
- **Microsoft Edge**: Version 80+
- **Opera**: Version 67+

## Prerequisites

### 1. Web Server Setup

#### Apache Setup

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd
# or for newer versions
sudo dnf install httpd
```

#### Nginx Setup

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# or for newer versions
sudo dnf install nginx
```

### 2. PHP Installation

#### Ubuntu/Debian

```bash
# Add PHP repository
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update

# Install PHP and required extensions
sudo apt install php8.1 php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-session
```

#### CentOS/RHEL

```bash
# Enable EPEL and Remi repositories
sudo yum install epel-release
sudo yum install http://rpms.remirepo.net/enterprise/remi-release-8.rpm

# Install PHP
sudo yum install yum-utils
sudo yum-config-manager --enable remi-php81
sudo yum install php php-mysqlnd php-curl php-gd php-mbstring php-xml php-zip php-session
```

### 3. Database Setup

#### MySQL Installation

```bash
# Ubuntu/Debian
sudo apt install mysql-server mysql-client

# CentOS/RHEL
sudo yum install mysql-server
# or for newer versions
sudo dnf install mysql-server
```

#### MariaDB Installation

```bash
# Ubuntu/Debian
sudo apt install mariadb-server mariadb-client

# CentOS/RHEL
sudo yum install mariadb-server mariadb
# or for newer versions
sudo dnf install mariadb-server mariadb
```

## Quick Start

For experienced users, here's the quick installation process:

```bash
# 1. Download and extract
wget https://example.com/exam-system-latest.zip
unzip exam-system-latest.zip
sudo mv exam-system /var/www/

# 2. Set permissions
sudo chown -R www-data:www-data /var/www/exam-system
sudo chmod -R 755 /var/www/exam-system

# 3. Create database
mysql -u root -p -e "CREATE DATABASE exam_system;"

# 4. Import schema
mysql -u root -p exam_system < /var/www/exam-system/database_schema.sql

# 5. Configure web server (Apache example)
sudo cp /var/www/exam-system/config/apache.conf /etc/apache2/sites-available/exam-system.conf
sudo a2ensite exam-system.conf
sudo systemctl restart apache2

# 6. Configure application
cp /var/www/exam-system/config/config.php.example /var/www/exam-system/config/config.php
# Edit config.php with your settings
```

## Detailed Installation

### Step 1: Download and Extract Files

1. **Download the System**

   ```bash
   # Download from official source
   wget https://github.com/example/exam-system/archive/v1.0.0.zip

   # Or clone from repository
   git clone https://github.com/example/exam-system.git
   ```

2. **Extract Files**

   ```bash
   # Extract to web server directory
   unzip v1.0.0.zip
   sudo mv exam-system /var/www/html/
   ```

3. **Set File Permissions**

   ```bash
   # Set ownership
   sudo chown -R www-data:www-data /var/www/html/exam-system

   # Set directory permissions
   sudo find /var/www/html/exam-system -type d -exec chmod 755 {} \;

   # Set file permissions
   sudo find /var/www/html/exam-system -type f -exec chmod 644 {} \;

   # Make scripts executable
   sudo chmod +x /var/www/html/exam-system/scripts/*.sh
   ```

### Step 2: Database Setup

1. **Create Database**

   ```sql
   -- Connect to MySQL/MariaDB
   mysql -u root -p

   -- Create database
   CREATE DATABASE exam_allocation_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- Create user (optional)
   CREATE USER 'exam_user'@'localhost' IDENTIFIED BY 'secure_password';

   -- Grant permissions
   GRANT ALL PRIVILEGES ON exam_allocation_system.* TO 'exam_user'@'localhost';

   -- Flush privileges
   FLUSH PRIVILEGES;

   -- Exit
   EXIT;
   ```

2. **Import Database Schema**

   ```bash
   # Import the schema
   mysql -u root -p exam_allocation_system < /var/www/html/exam-system/database_schema.sql

   # Verify import
   mysql -u root -p -e "USE exam_allocation_system; SHOW TABLES;"
   ```

### Step 3: PHP Configuration

1. **Check PHP Installation**

   ```bash
   # Check PHP version
   php -v

   # Check installed extensions
   php -m

   # Check PHP configuration
   php --ini
   ```

2. **Configure PHP Settings**
   Edit `/etc/php/8.1/apache2/php.ini` (adjust version as needed):

   ```ini
   ; Maximum execution time
   max_execution_time = 300

   ; Maximum input time
   max_input_time = 300

   ; Memory limit
   memory_limit = 256M

   ; Upload settings
   upload_max_filesize = 10M
   post_max_size = 10M

   ; Session settings
   session.gc_maxlifetime = 1800
   session.cookie_httponly = 1
   session.cookie_secure = 1

   ; Error reporting
   display_errors = Off
   log_errors = On
   error_log = /var/log/php_errors.log
   ```

3. **Restart Web Server**

   ```bash
   # Apache
   sudo systemctl restart apache2

   # Nginx + PHP-FPM
   sudo systemctl restart nginx
   sudo systemctl restart php8.1-fpm
   ```

## Configuration

### Application Configuration

1. **Copy Configuration Template**

   ```bash
   cp /var/www/html/exam-system/config/config.php.example /var/www/html/exam-system/config/config.php
   ```

2. **Edit Configuration File**
   ```php
   <?php
   return [
       // Database configuration
       'database' => [
           'host' => 'localhost',
           'username' => 'exam_user',
           'password' => 'your_secure_password',
           'database' => 'exam_allocation_system',
           'charset' => 'utf8mb4',
           'port' => 3306
       ],

       // Security configuration
       'security' => [
           'session_timeout' => 1800, // 30 minutes
           'max_login_attempts' => 5,
           'lockout_duration' => 900, // 15 minutes
           'password_min_length' => 8,
           'require_https' => true
       ],

       // Email configuration
       'email' => [
           'smtp_host' => 'smtp.example.com',
           'smtp_port' => 587,
           'smtp_username' => 'noreply@example.com',
           'smtp_password' => 'your_email_password',
           'smtp_encryption' => 'tls',
           'from_email' => 'noreply@example.com',
           'from_name' => 'Exam Allocation System'
       ],

       // Application settings
       'app' => [
           'name' => 'Exam Seat Allocation System',
           'version' => '1.0.0',
           'debug' => false,
           'timezone' => 'Asia/Kolkata',
           'locale' => 'en'
       ]
   ];
   ?>
   ```

### Environment Variables (Optional)

For enhanced security, you can use environment variables:

```bash
# Create .env file
sudo nano /var/www/html/exam-system/.env
```

Add environment variables:

```env
DB_HOST=localhost
DB_USERNAME=exam_user
DB_PASSWORD=your_secure_password
DB_NAME=exam_allocation_system
DB_PORT=3306

EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=noreply@example.com
EMAIL_SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com

APP_DEBUG=false
APP_TIMEZONE=Asia/Kolkata
```

## Web Server Configuration

### Apache Configuration

1. **Create Virtual Host**

   ```bash
   sudo nano /etc/apache2/sites-available/exam-system.conf
   ```

2. **Add Virtual Host Configuration**

   ```apache
   <VirtualHost *:80>
       ServerName exam-system.local
       ServerAlias www.exam-system.local
       DocumentRoot /var/www/html/exam-system/public

       <Directory /var/www/html/exam-system/public>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted

           # Security headers
           Header always set X-Content-Type-Options nosniff
           Header always set X-Frame-Options DENY
           Header always set X-XSS-Protection "1; mode=block"

           # Rewrite rules
           RewriteEngine On
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule ^(.*)$ index.php [QSA,L]
       </Directory>

       # Log files
       ErrorLog ${APACHE_LOG_DIR}/exam-system_error.log
       CustomLog ${APACHE_LOG_DIR}/exam-system_access.log combined
   </VirtualHost>
   ```

3. **Enable Site and Modules**

   ```bash
   # Enable required modules
   sudo a2enmod rewrite
   sudo a2enmod headers

   # Enable the site
   sudo a2ensite exam-system.conf

   # Test configuration
   sudo apache2ctl configtest

   # Restart Apache
   sudo systemctl restart apache2
   ```

### Nginx Configuration

1. **Create Server Block**

   ```bash
   sudo nano /etc/nginx/sites-available/exam-system
   ```

2. **Add Server Block Configuration**

   ```nginx
   server {
       listen 80;
       listen [::]:80;

       server_name exam-system.local www.exam-system.local;
       root /var/www/html/exam-system/public;
       index index.php index.html index.htm;

       # Security headers
       add_header X-Content-Type-Options nosniff;
       add_header X-Frame-Options DENY;
       add_header X-XSS-Protection "1; mode=block";

       # Main location block
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       # PHP processing
       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }

       # Deny access to sensitive files
       location ~ /\. {
           deny all;
       }

       location ~ \.env$ {
           deny all;
       }

       # Log files
       access_log /var/log/nginx/exam-system_access.log;
       error_log /var/log/nginx/exam-system_error.log;
   }
   ```

3. **Enable Site**

   ```bash
   # Create symbolic link
   sudo ln -s /etc/nginx/sites-available/exam-system /etc/nginx/sites-enabled/

   # Test configuration
   sudo nginx -t

   # Restart Nginx
   sudo systemctl restart nginx
   ```

### HTTPS Configuration (Recommended)

1. **Obtain SSL Certificate**

   ```bash
   # Using Let's Encrypt
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d exam-system.local

   # Or for Nginx
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d exam-system.local
   ```

2. **Update Configuration for HTTPS**
   ```apache
   # Apache SSL configuration
   <VirtualHost *:443>
       ServerName exam-system.local
       DocumentRoot /var/www/html/exam-system/public

       # SSL configuration
       SSLEngine on
       SSLCertificateFile /path/to/cert.pem
       SSLCertificateKeyFile /path/to/private.key

       # Force HTTPS
       RewriteEngine On
       RewriteCond %{HTTPS} off
       RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

       # Rest of configuration...
   </VirtualHost>
   ```

## Security Configuration

### 1. File Permissions

```bash
# Set secure permissions
sudo find /var/www/html/exam-system -type f -exec chmod 644 {} \;
sudo find /var/www/html/exam-system -type d -exec chmod 755 {} \;

# Set specific permissions for sensitive directories
sudo chmod 750 /var/www/html/exam-system/config
sudo chmod 640 /var/www/html/exam-system/config/config.php
sudo chmod 600 /var/www/html/exam-system/.env

# Set ownership
sudo chown -R www-data:www-data /var/www/html/exam-system
```

### 2. Database Security

```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove test database
DROP DATABASE test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- Flush privileges
FLUSH PRIVILEGES;
```

### 3. PHP Security

Edit `/etc/php/8.1/apache2/php.ini`:

```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

; Disable remote file inclusion
allow_url_fopen = Off
allow_url_include = Off

; Enable safe mode (deprecated but still useful)
safe_mode = Off

; Error reporting (disable in production)
display_errors = Off
log_errors = On
```

### 4. Web Server Security

#### Apache Security

```apache
# Disable server signature
ServerTokens Prod
ServerSignature Off

# Disable directory browsing
Options -Indexes

# Hide PHP version
Header unset X-Powered-By
```

#### Nginx Security

```nginx
# Hide server version
server_tokens off;

# Limit request size
client_max_body_size 10M;

# Limit request rate
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

## Testing the Installation

### 1. Basic Functionality Test

1. **Access the Application**
   Open your browser and navigate to:

   - `http://exam-system.local` (HTTP)
   - `https://exam-system.local` (HTTPS)

2. **Check Database Connection**
   The application should automatically detect and connect to the database.

3. **Test User Registration**
   - Navigate to the registration page
   - Create a test user account
   - Verify email functionality (if configured)

### 2. Security Tests

1. **File Access Test**

   ```bash
   # Test that sensitive files are not accessible
   curl http://exam-system.local/config/config.php
   # Should return 403 Forbidden
   ```

2. **SQL Injection Test**
   Test input fields with SQL injection attempts:

   - `' OR '1'='1`
   - `'; DROP TABLE users; --`
   - Should be properly sanitized

3. **XSS Test**
   Test input fields with XSS attempts:
   - `<script>alert('test')</script>`
   - Should be properly escaped

### 3. Performance Tests

1. **Load Test**

   ```bash
   # Using Apache Bench
   ab -n 100 -c 10 http://exam-system.local/

   # Using wrk
   wrk -t12 -c400 -d30s http://exam-system.local/
   ```

2. **Database Performance**
   Monitor database performance during load testing
   Check for slow queries and optimization opportunities

## Troubleshooting

### Common Issues

#### 1. "500 Internal Server Error"

**Causes:**

- Incorrect file permissions
- PHP syntax errors
- Missing PHP extensions

**Solutions:**

```bash
# Check error logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/nginx/error.log

# Check PHP errors
sudo tail -f /var/log/php_errors.log

# Verify file permissions
sudo ls -la /var/www/html/exam-system/
```

#### 2. "Database Connection Failed"

**Causes:**

- Incorrect database credentials
- Database server not running
- Firewall blocking connection

**Solutions:**

```bash
# Check database service
sudo systemctl status mysql
sudo systemctl status mariadb

# Test database connection
mysql -u exam_user -p -h localhost exam_allocation_system

# Check firewall
sudo ufw status
sudo firewall-cmd --list-all
```

#### 3. "Page Not Found" (404)

**Causes:**

- Incorrect virtual host configuration
- Missing .htaccess file
- Rewrite rules not enabled

**Solutions:**

```bash
# Check virtual host configuration
sudo apache2ctl configtest
sudo nginx -t

# Enable rewrite module (Apache)
sudo a2enmod rewrite
sudo systemctl restart apache2

# Check .htaccess file
ls -la /var/www/html/exam-system/public/.htaccess
```

#### 4. "Permission Denied"

**Causes:**

- Incorrect file ownership
- SELinux restrictions
- AppArmor restrictions

**Solutions:**

```bash
# Fix file ownership
sudo chown -R www-data:www-data /var/www/html/exam-system

# Check SELinux status
sestatus
sudo setenforce 0  # Temporarily disable

# Check AppArmor
sudo aa-status
```

### Debug Mode

Enable debug mode in `config/config.php`:

```php
'app' => [
    'debug' => true,
    // ... other settings
]
```

This will provide detailed error messages and help with troubleshooting.

## Post-Installation

### 1. Initial Setup

1. **Create Administrator Account**

   - Access the application in your browser
   - Navigate to registration page
   - Create the first administrator account
   - Verify the account has admin privileges

2. **Configure System Settings**

   - Set application name and settings
   - Configure email settings
   - Set up security preferences
   - Configure backup settings

3. **Import Initial Data**
   - Import user data (if available)
   - Configure examination data
   - Set up room and class information

### 2. Security Hardening

1. **Change Default Passwords**

   - Change default database passwords
   - Update application configuration passwords
   - Change any default user passwords

2. **Enable Firewall**

   ```bash
   # Ubuntu/Debian
   sudo ufw enable
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS

   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-service=ssh
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

3. **Regular Updates**
   - Set up automatic security updates
   - Monitor for security advisories
   - Regularly update PHP, web server, and database

### 3. Monitoring and Maintenance

1. **Log Monitoring**

   ```bash
   # Monitor application logs
   sudo tail -f /var/log/apache2/exam-system_access.log
   sudo tail -f /var/log/apache2/exam-system_error.log

   # Monitor system logs
   sudo journalctl -f
   ```

2. **Backup Strategy**

   ```bash
   # Database backup script
   mysqldump -u exam_user -p exam_allocation_system > backup_$(date +%Y%m%d).sql

   # Application backup
   tar -czf exam-system-backup-$(date +%Y%m%d).tar.gz /var/www/html/exam-system
   ```

3. **Performance Monitoring**
   - Monitor server resources (CPU, memory, disk)
   - Track application performance metrics
   - Monitor database performance
   - Set up alerting for critical issues

### 4. Documentation and Training

1. **Create Documentation**

   - Document installation process
   - Create user guides
   - Document troubleshooting procedures
   - Create system architecture documentation

2. **User Training**
   - Train administrators on system management
   - Train users on application usage
   - Provide documentation and support materials
   - Set up help desk or support system

This completes the installation and setup process. The system should now be ready for use. Regular maintenance, monitoring, and security updates are essential for continued operation.
