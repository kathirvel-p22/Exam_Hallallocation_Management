# Running the Exam Hall Allocation Management System

This guide provides multiple ways to run the Exam Hall Allocation Management System on your local machine or in the cloud.

## 🚀 Quick Start Options

### Option 1: Install PHP Locally (Recommended for Development)

#### Windows

1. **Download PHP**:

   - Visit [php.net/downloads.php](https://www.php.net/downloads.php)
   - Download the Thread Safe version for Windows
   - Extract to `C:\php\`

2. **Add PHP to PATH**:

   - Open System Properties → Advanced → Environment Variables
   - Add `C:\php\` to your PATH variable
   - Restart your command prompt

3. **Start the Server**:

   ```bash
   # Navigate to project directory
   cd Exam_Hallallocation_Management

   # Start development server
   php -S localhost:8000 -t public
   ```

4. **Access the System**:
   - Open browser and go to: http://localhost:8000

#### macOS

```bash
# Install PHP using Homebrew
brew install php

# Start the server
cd Exam_Hallallocation_Management
php -S localhost:8000 -t public
```

#### Linux

```bash
# Install PHP
sudo apt update
sudo apt install php php-mysql php-cli

# Start the server
cd Exam_Hallallocation_Management
php -S localhost:8000 -t public
```

### Option 2: Use XAMPP/WAMP (Easiest for Beginners)

#### Windows with XAMPP

1. **Download and Install XAMPP**:

   - Visit [apachefriends.org](https://www.apachefriends.org/)
   - Download and install XAMPP

2. **Copy Project Files**:

   - Copy the entire project folder to `C:\xampp\htdocs\`

3. **Start Services**:

   - Open XAMPP Control Panel
   - Start Apache and MySQL

4. **Setup Database**:

   - Open browser and go to http://localhost/phpmyadmin
   - Create database named `seat_management`
   - Import `database_schema.sql`

5. **Access the System**:
   - Go to http://localhost/Exam_Hallallocation_Management

#### macOS with MAMP

1. **Download and Install MAMP**
2. **Copy project to MAMP/htdocs/**
3. **Start MAMP servers**
4. **Setup database via phpMyAdmin**
5. **Access via http://localhost:8888/Exam_Hallallocation_Management**

### Option 3: Use Docker (Containerized)

#### Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### Quick Docker Setup

1. **Create docker-compose.yml**:

   ```yaml
   version: "3.8"
   services:
     web:
       image: php:8.1-apache
       ports:
         - "8000:80"
       volumes:
         - .:/var/www/html
       working_dir: /var/www/html
       command: php -S 0.0.0.0:80 -t public

     db:
       image: mysql:8.0
       environment:
         MYSQL_ROOT_PASSWORD: rootpassword
         MYSQL_DATABASE: seat_management
       ports:
         - "3306:3306"
       volumes:
         - db_data:/var/lib/mysql

   volumes:
     db_data:
   ```

2. **Run Docker**:

   ```bash
   docker-compose up -d
   ```

3. **Import Database**:

   ```bash
   docker exec -i container_name mysql -u root -prootpassword seat_management < database_schema.sql
   ```

4. **Access the System**:
   - http://localhost:8000

### Option 4: Cloud Deployment (No Local Setup Required)

#### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done ✅)
2. **Go to [vercel.com](https://vercel.com)**
3. **Connect your GitHub repository**
4. **Configure environment variables**:
   ```
   DB_HOST=your-database-host
   DB_NAME=seat_management
   DB_USER=your-username
   DB_PASS=your-password
   ```
5. **Deploy with one click!**

#### Deploy to Netlify

1. **Go to [netlify.com](https://netlify.com)**
2. **Connect your GitHub repository**
3. **Set build settings** (use the provided `netlify.toml`)
4. **Configure environment variables**
5. **Deploy!**

### Option 5: Use Online PHP Sandbox

For quick testing without any setup:

- **Visit**: [3v4l.org](https://3v4l.org) or [phpfiddle.org](https://phpfiddle.org)
- **Upload your PHP files**
- **Test individual components**

## 🔧 System Requirements Verification

### Check PHP Installation

```bash
php -v
```

### Check Required Extensions

```bash
php -m | grep -E "(mysqli|pdo_mysql|session|openssl|mbstring|json)"
```

### Test Database Connection

```bash
# Test MySQL connection
mysql -u username -p -e "SHOW DATABASES;"
```

## 📋 Default Login Credentials

### Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Access**: http://localhost:8000/admin/dashboard.php

### Student Account

- **Username**: `student1`
- **Password**: `student123`
- **Access**: http://localhost:8000/student/dashboard.php

## 🌐 Access URLs

### Local Development

- **Main Page**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/dashboard.php
- **Student Portal**: http://localhost:8000/student/dashboard.php
- **Login Page**: http://localhost:8000/auth/login.php

### Production (After Cloud Deployment)

- Replace `localhost:8000` with your actual domain
- Example: https://your-app.vercel.app

## 🐛 Troubleshooting

### Common Issues

1. **"PHP is not recognized"**

   - PHP not installed or not in PATH
   - Solution: Install PHP and add to PATH

2. **"Port 8000 already in use"**

   - Another service is using the port
   - Solution: Use different port: `php -S localhost:8080 -t public`

3. **Database connection errors**

   - Check database credentials in `config/database.php`
   - Ensure MySQL server is running
   - Verify database exists and schema is imported

4. **Permission errors**
   - Ensure proper file permissions
   - On Linux/macOS: `chmod -R 755 .`

### Getting Help

- Check the [docs/](docs/) folder for detailed documentation
- Review error logs in `logs/` directory
- Create an issue on GitHub for support

## 🚀 Next Steps

1. **Choose your preferred method** from the options above
2. **Set up the environment** (local or cloud)
3. **Configure the database** with the provided schema
4. **Start the application** and test functionality
5. **Customize** settings in `config/` files as needed

The system is now ready for use! 🎉
