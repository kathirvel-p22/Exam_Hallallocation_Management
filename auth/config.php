<?php
/**
 * Authentication Configuration
 * 
 * Configuration settings for the authentication system
 */

// Session configuration
define('SESSION_TIMEOUT', 1800); // 30 minutes in seconds
define('SESSION_NAME', 'exam_seat_session');
define('SESSION_COOKIE_LIFETIME', 0); // Session cookie lifetime (0 = until browser close)

// Security settings
define('CSRF_TOKEN_LIFETIME', 3600); // 1 hour in seconds
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes in seconds
define('PASSWORD_MIN_LENGTH', 8);

// Password requirements
define('PASSWORD_REQUIRE_UPPERCASE', true);
define('PASSWORD_REQUIRE_LOWERCASE', true);
define('PASSWORD_REQUIRE_NUMBERS', true);
define('PASSWORD_REQUIRE_SPECIAL_CHARS', true);

// Roles
define('ROLE_ADMIN', 'admin');
define('ROLE_STUDENT', 'student');

// Redirect URLs
define('LOGIN_URL', '/auth/login.php');
define('LOGOUT_URL', '/auth/logout.php');
define('ADMIN_DASHBOARD_URL', '/admin/dashboard.php');
define('STUDENT_DASHBOARD_URL', '/student/dashboard.php');
define('HOME_URL', '/index.php');

// Database table names
define('USERS_TABLE', 'users');
define('LOGIN_ATTEMPTS_TABLE', 'login_attempts');
define('PASSWORD_RESETS_TABLE', 'password_resets');

// Email settings (for password reset)
define('EMAIL_FROM_ADDRESS', 'noreply@examseat.com');
define('EMAIL_FROM_NAME', 'Exam Seat Management System');
define('EMAIL_RESET_SUBJECT', 'Password Reset Request');

// Logging
define('LOG_AUTH_EVENTS', true);
define('LOG_FILE_PATH', __DIR__ . '/../logs/auth.log');