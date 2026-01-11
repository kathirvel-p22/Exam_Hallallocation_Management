# Exam Hall Allocation Management System

A comprehensive PHP-based web application for managing exam hall allocations in educational institutions. This system provides efficient allocation of students to examination halls while ensuring proper department mixing and shift management.

## 🚀 Features

### Core Functionality

- **Smart Hall Allocation**: Automatic allocation of examination halls based on capacity and student strength
- **Department Mixing**: Ensures students from different departments are mixed within the same academic level
- **Shift Management**: Supports morning and afternoon examination shifts
- **Multi-Level Support**: Handles UG and PG level examinations separately
- **Real-time Allocation**: Live allocation status and seat management

### User Management

- **Admin Dashboard**: Complete control over allocations, rooms, and user management
- **Student Portal**: View allocation details and personal examination schedules
- **Authentication System**: Secure login with role-based access control
- **Password Management**: Secure password reset functionality

### Advanced Features

- **Room Utilization Analytics**: Track hall usage and capacity optimization
- **Department-wise Reports**: Detailed allocation reports by department
- **CSV/PDF Export**: Generate reports in multiple formats
- **Database Integrity**: Comprehensive data validation and constraints

## 📋 System Requirements

### Server Requirements

- **Web Server**: Apache 2.4+ or Nginx 1.10+
- **PHP**: 7.4 or higher (8.0+ recommended)
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **Extensions**:
  - `mysqli` or `pdo_mysql`
  - `session`
  - `openssl`
  - `mbstring`
  - `json`

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kathirvel-p22/Exam_Hallallocation_Management.git
cd Exam_Hallallocation_Management
```

### 2. Database Setup

1. Import the database schema:

```bash
mysql -u username -p seat_management < database_schema.sql
```

2. Configure database connection in `config/database.php`

### 3. Web Server Configuration

#### Apache Configuration

Create a virtual host or use the provided `.htaccess` file:

```apache
<VirtualHost *:80>
    ServerName exam-system.local
    DocumentRoot /path/to/Exam_Hallallocation_Management/public

    <Directory /path/to/Exam_Hallallocation_Management/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name exam-system.local;
    root /path/to/Exam_Hallallocation_Management/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Application Configuration

1. Copy `config/config.php.example` to `config/config.php`
2. Update database credentials and system settings
3. Set proper file permissions:

```bash
chmod -R 755 storage/
chmod -R 755 logs/
```

### 5. Initial Setup

1. Access the application through your web browser
2. Default admin credentials:
   - Username: `admin`
   - Password: `admin123` (change after first login)

## 📁 Project Structure

```
Exam_Hallallocation_Management/
├── admin/                  # Admin panel files
│   ├── dashboard.php       # Admin dashboard
│   ├── allocations.php     # Allocation management
│   ├── rooms.php          # Room management
│   ├── exams.php          # Exam management
│   └── reports.php        # Administrative reports
├── student/               # Student portal files
│   ├── dashboard.php      # Student dashboard
│   ├── allocations.php    # Student allocation view
│   └── profile.php        # Profile management
├── auth/                  # Authentication system
│   ├── login.php          # Login functionality
│   ├── register.php       # User registration
│   └── session.php        # Session management
├── models/                # Database models
│   ├── AllocationModel.php
│   ├── ClassModel.php
│   └── RoomModel.php
├── services/              # Business logic services
│   └── AllocationService.php
├── config/                # Configuration files
│   ├── database.php       # Database configuration
│   └── config.php         # System configuration
├── css/                   # Stylesheets
├── js/                    # JavaScript files
├── assets/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Test files
└── public/                # Public web root
    ├── index.php          # Main entry point
    ├── header.php         # Header template
    └── footer.php         # Footer template
```

## 🔧 Usage

### For Administrators

1. **Login to Admin Panel**: Access `/admin/dashboard.php`
2. **Manage Rooms**: Add, edit, or delete examination halls
3. **Create Exams**: Set up examination schedules and shifts
4. **Allocate Halls**: Use the allocation service to assign halls
5. **Generate Reports**: Export allocation details and analytics

### For Students

1. **Login to Student Portal**: Access `/student/dashboard.php`
2. **View Allocations**: Check assigned examination halls and seats
3. **Download Reports**: Generate personal allocation reports

### Allocation Process

1. **Data Preparation**: Ensure all classes, rooms, and exams are configured
2. **Run Allocation**: Use the allocation service to process assignments
3. **Review Results**: Check allocation details and make adjustments if needed
4. **Confirm Allocations**: Finalize and publish allocation results

## 📊 Database Schema

The system uses a comprehensive database schema with the following key tables:

- **users**: User authentication and roles
- **departments**: Department information
- **classes**: Class details with academic levels
- **rooms**: Examination hall information
- **exams**: Examination schedules and shifts
- **allocations**: Main allocation records
- **allocation_details**: Department-wise allocation details

For detailed schema information, see [`database_schema.sql`](database_schema.sql).

## 🔒 Security Features

- **Password Hashing**: Bcrypt encryption for passwords
- **Session Management**: Secure session handling
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Comprehensive data validation
- **Role-based Access**: Admin and student role separation
- **Audit Logging**: Login attempt tracking

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Run authentication tests
php auth/test_auth.php

# Run allocation tests
php test_allocation.php

# Run admin panel tests
php admin/test_admin.php

# Run student portal tests
php student/test_student.php
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexing
- **Caching**: Session and query result caching
- **Batch Processing**: Efficient handling of large datasets
- **Memory Management**: Optimized memory usage for large allocations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the [documentation](docs/)
- Contact the development team

## 🙏 Acknowledgments

- Built with PHP and MySQL
- Uses Bootstrap for responsive design
- Implements modern web security practices
- Follows PHP best practices and coding standards

---

**Note**: This system is designed for educational institutions and examination management. Always ensure proper backup procedures and test in a development environment before production deployment.
