# Exam Seat Allocation Management System - Authentication

This authentication system provides secure session-based authentication with role-based access control for the Exam Seat Allocation Management System.

## Features

- **Secure Session Management**: Uses PHP sessions with security measures
- **Role-Based Access Control**: Admin and Student roles with different permissions
- **CSRF Protection**: Built-in Cross-Site Request Forgery protection
- **Password Security**: Strong password requirements and hashing
- **Login Security**: IP-based lockout and failed attempt tracking
- **Password Reset**: Secure password reset functionality with email tokens
- **Security Logging**: Comprehensive authentication event logging
- **Session Timeout**: Automatic session timeout and security validation

## Files Structure

```
auth/
├── config.php              # Authentication configuration
├── auth.php               # Core authentication functions
├── session.php            # Session management utilities
├── csrf.php               # CSRF protection functions
├── logger.php             # Authentication logging
├── database.php           # Database connection and helpers
├── login.php              # Login form and processing
├── logout.php             # Logout functionality
├── register.php           # Admin-only user registration
├── password_reset.php     # Password reset functionality
├── protect_admin.php      # Admin route protection
├── protect_student.php    # Student route protection
└── test_auth.php          # System test file
```

## Database Schema

The authentication system uses the following tables:

### Users Table

- `user_id` - Primary key
- `username` - Unique username
- `email` - User email address
- `password_hash` - BCrypt hashed password
- `role` - User role (admin/student)
- `full_name` - User's full name
- `is_active` - Account status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Login Attempts Table

- `id` - Primary key
- `ip_address` - IP address of login attempt
- `username` - Username attempted
- `attempt_time` - Timestamp of attempt
- `success` - Whether attempt was successful

### Password Resets Table

- `id` - Primary key
- `user_id` - User requesting reset
- `email` - Email address
- `token` - Unique reset token
- `expires_at` - Token expiration time
- `used` - Whether token has been used
- `created_at` - Token creation time

## Usage

### Basic Authentication

```php
// Include authentication system
require_once 'auth/auth.php';

// Check if user is logged in
if (is_logged_in()) {
    $user = get_current_user_data();
    echo "Welcome, " . $user['username'];
}

// Check user role
if (is_admin()) {
    // Admin-specific functionality
} elseif (is_student()) {
    // Student-specific functionality
}
```

### Protecting Routes

```php
// For admin pages
require_once 'auth/protect_admin.php';

// For student pages
require_once 'auth/protect_student.php';
```

### Admin Registration

```php
// Only accessible to admins
require_once 'auth/protect_admin.php';

// Register new user
$result = register_user('username', 'email@example.com', 'password', 'student');
if ($result['success']) {
    echo "User registered successfully";
} else {
    echo "Registration failed: " . implode(', ', $result['errors']);
}
```

### Password Reset

```php
// Generate reset token
$result = generate_password_reset_token('user@example.com');

// Validate token
$token_result = validate_password_reset_token($token);

// Update password
$result = update_user_password($user_id, 'new_password');
```

## Security Features

### Session Security

- Session ID regeneration on login
- IP address and user agent validation
- Session timeout enforcement
- Secure session cookie settings

### Password Security

- Minimum 8 character length
- Uppercase, lowercase, number, and special character requirements
- BCrypt hashing with salt
- Password change logging

### CSRF Protection

- Automatic token generation
- Token validation on form submissions
- AJAX-compatible tokens
- Token expiration handling

### Login Security

- Maximum 5 failed attempts per IP
- 15-minute lockout period
- Failed attempt logging
- IP-based security monitoring

## Configuration

Edit `auth/config.php` to customize:

- Session timeout (default: 30 minutes)
- CSRF token lifetime (default: 1 hour)
- Password requirements
- Security thresholds
- Redirect URLs
- Logging settings

## Default Admin User

After setting up the database, a default admin user is created:

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@examseat.com`

**Important**: Change the default password after first login!

## Testing

Run the test file to verify the authentication system:

```bash
php auth/test_auth.php
```

This will check:

- Authentication system loading
- Session status
- Database connectivity
- Table existence
- Function availability

## Integration

To integrate with your application:

1. Include `auth/auth.php` in your main application files
2. Use `auth/protect_admin.php` for admin routes
3. Use `auth/protect_student.php` for student routes
4. Direct users to `auth/login.php` for authentication
5. Use `auth/logout.php` for logout functionality

## Security Best Practices

1. **Always use HTTPS** in production
2. **Change default passwords** immediately
3. **Monitor authentication logs** regularly
4. **Use strong passwords** that meet requirements
5. **Implement proper error handling** without revealing sensitive information
6. **Regularly update and patch** the system
7. **Backup authentication data** regularly

## Troubleshooting

### Common Issues

1. **Session not working**: Check PHP session configuration
2. **Database connection failed**: Verify database credentials in config
3. **CSRF errors**: Ensure forms include CSRF tokens
4. **Login locked**: Wait for lockout period or clear login attempts table
5. **Password reset not working**: Check email configuration and token expiration

### Logs

Authentication events are logged to `logs/auth.log` by default. Check this file for:

- Failed login attempts
- Security violations
- System errors
- User activities

## Support

For issues or questions about the authentication system:

1. Check the test file output
2. Review authentication logs
3. Verify database connectivity
4. Ensure all required files are included
