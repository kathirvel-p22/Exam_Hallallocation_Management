<?php
/**
 * Exam Seat Allocation Management System - Local Development Configuration
 * 
 * This configuration file is optimized for local development environments
 * like XAMPP, WAMP, and MAMP. Copy this file to config/config.php and
 * modify the settings as needed for your environment.
 */

// Application Settings
define('APP_NAME', 'Exam Seat Allocation System');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development, staging, production

// Debug and Error Reporting
define('DEBUG_MODE', true);
define('ERROR_REPORTING', E_ALL);
define('DISPLAY_ERRORS', true);
define('LOG_ERRORS', true);

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'exam_seat_allocation');
define('DB_USER', 'root');
define('DB_PASS', ''); // XAMPP/WAMP default is empty password
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATION', 'utf8mb4_unicode_ci');

// Database Connection Settings
define('DB_PERSISTENT', false);
define('DB_TIMEOUT', 30);
define('DB_RETRIES', 3);

// Session Configuration
define('SESSION_NAME', 'seat_allocation_session');
define('SESSION_LIFETIME', 3600); // 1 hour
define('SESSION_PATH', '/');
define('SESSION_DOMAIN', ''); // Set to your domain in production
define('SESSION_SECURE', false); // Set to true for HTTPS
define('SESSION_HTTPONLY', true);
define('SESSION_SAMESITE', 'Lax');

// Security Settings
define('CSRF_TOKEN_LIFETIME', 3600);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes
define('PASSWORD_MIN_LENGTH', 8);
define('SESSION_TIMEOUT', 3600);

// File Upload Settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', 'uploads/');
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);
define('UPLOAD_MAX_FILES', 10);

// Email Configuration (for notifications)
define('SMTP_ENABLED', false); // Set to true when SMTP is configured
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', 'tls'); // ssl or tls
define('SMTP_AUTH', true);
define('SMTP_USER', '');
define('SMTP_PASS', '');
define('EMAIL_FROM', 'noreply@localhost');
define('EMAIL_FROM_NAME', 'Exam Seat Allocation System');

// Paths and URLs
define('BASE_PATH', dirname(__DIR__) . '/');
define('BASE_URL', 'http://localhost/seat-management/'); // Update this for your setup
define('ASSETS_URL', BASE_URL . 'assets/');
define('CSS_URL', ASSETS_URL . 'css/');
define('JS_URL', ASSETS_URL . 'js/');
define('IMAGES_URL', ASSETS_URL . 'images/');

// Directory Paths
define('CONFIG_PATH', BASE_PATH . 'config/');
define('MODELS_PATH', BASE_PATH . 'models/');
define('SERVICES_PATH', BASE_PATH . 'services/');
define('LIB_PATH', BASE_PATH . 'lib/');
define('AUTH_PATH', BASE_PATH . 'auth/');
define('VIEWS_PATH', BASE_PATH . 'views/');
define('CONTROLLERS_PATH', BASE_PATH . 'controllers/');
define('PUBLIC_PATH', BASE_PATH . 'public/');
define('ADMIN_PATH', BASE_PATH . 'admin/');
define('STUDENT_PATH', BASE_PATH . 'student/');

// Logging Configuration
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'DEBUG'); // DEBUG, INFO, WARNING, ERROR
define('LOG_FILE', BASE_PATH . 'logs/application.log');
define('LOG_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('LOG_MAX_FILES', 5);

// Cache Configuration
define('CACHE_ENABLED', false); // Enable for better performance
define('CACHE_DIR', BASE_PATH . 'cache/');
define('CACHE_LIFETIME', 3600); // 1 hour

// Performance Settings
define('MEMORY_LIMIT', '256M');
define('MAX_EXECUTION_TIME', 300); // 5 minutes
define('TIMEZONE', 'Asia/Kolkata'); // Change to your timezone

// Development Tools
define('SHOW_SQL_QUERIES', false); // Set to true to debug database queries
define('SHOW_PERFORMANCE_METRICS', false); // Set to true to show page load times
define('ENABLE_API_DOCS', true); // Set to false in production

// Third-party Integrations
define('GOOGLE_ANALYTICS_ID', ''); // Add your GA ID for tracking
define('RECAPTCHA_ENABLED', false); // Set to true to enable reCAPTCHA
define('RECAPTCHA_SITE_KEY', '');
define('RECAPTCHA_SECRET_KEY', '');

// Feature Flags
define('ENABLE_REGISTRATION', true);
define('ENABLE_PASSWORD_RESET', true);
define('ENABLE_EMAIL_NOTIFICATIONS', false);
define('ENABLE_FILE_UPLOADS', true);
define('ENABLE_API', true);

// Database Backup Settings
define('BACKUP_ENABLED', false); // Enable for automatic backups
define('BACKUP_DIR', BASE_PATH . 'backups/');
define('BACKUP_SCHEDULE', 'daily'); // daily, weekly, monthly
define('BACKUP_RETENTION', 30); // Keep backups for 30 days

// Security Headers
define('ENABLE_SECURITY_HEADERS', true);
define('CSP_ENABLED', false); // Content Security Policy
define('HSTS_ENABLED', false); // HTTP Strict Transport Security

// Development Overrides
if (APP_ENV === 'development') {
    // Override settings for development
    ini_set('display_errors', DISPLAY_ERRORS ? 1 : 0);
    ini_set('error_reporting', ERROR_REPORTING);
    ini_set('log_errors', LOG_ERRORS ? 1 : 0);

    // Set timezone
    date_default_timezone_set(TIMEZONE);

    // Increase memory limit for development
    ini_set('memory_limit', MEMORY_LIMIT);
    ini_set('max_execution_time', MAX_EXECUTION_TIME);

    // Enable development features
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Production Overrides
if (APP_ENV === 'production') {
    // Disable debug features
    define('DEBUG_MODE', false);
    define('SHOW_SQL_QUERIES', false);
    define('SHOW_PERFORMANCE_METRICS', false);

    // Enable security features
    define('SESSION_SECURE', true); // Force HTTPS
    define('ENABLE_SECURITY_HEADERS', true);
    define('CSP_ENABLED', true);
    define('HSTS_ENABLED', true);

    // Enable caching
    define('CACHE_ENABLED', true);

    // Disable error display
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// Function to get configuration value
function config($key, $default = null)
{
    if (defined($key)) {
        return constant($key);
    }
    return $default;
}

// Function to check if running in development mode
function is_development()
{
    return APP_ENV === 'development';
}

// Function to check if running in production mode
function is_production()
{
    return APP_ENV === 'production';
}

// Function to get base URL with optional path
function base_url($path = '')
{
    return BASE_URL . ltrim($path, '/');
}

// Function to get asset URL
function asset_url($path)
{
    return ASSETS_URL . ltrim($path, '/');
}

// Function to get current timestamp
function current_timestamp()
{
    return date('Y-m-d H:i:s');
}

// Function to get current date
function current_date()
{
    return date('Y-m-d');
}

// Function to get current time
function current_time()
{
    return date('H:i:s');
}
?>