<?php
/**
 * Exam Seat Allocation Management System - Quick Start Script
 * 
 * This script automates the setup process for the application.
 * Run this script to quickly get the system running on localhost.
 * 
 * Usage: php quick_start.php
 */

// Set error reporting for setup
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Colors for output
$colors = [
    'reset' => "\033[0m",
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'magenta' => "\033[35m",
    'cyan' => "\033[36m"
];

function colored_output($text, $color = 'reset')
{
    global $colors;
    echo $colors[$color] . $text . $colors['reset'] . PHP_EOL;
}

function print_header()
{
    colored_output("╔══════════════════════════════════════════════════════════════╗", 'cyan');
    colored_output("║           Exam Seat Allocation Management System             ║", 'cyan');
    colored_output("║                    Quick Start Setup                         ║", 'cyan');
    colored_output("╚══════════════════════════════════════════════════════════════╝", 'cyan');
    echo PHP_EOL;
}

function check_php_version()
{
    colored_output("Checking PHP version...", 'blue');

    $php_version = phpversion();
    $required_version = '7.4.0';

    if (version_compare($php_version, $required_version, '>=')) {
        colored_output("✓ PHP $php_version (Required: $required_version)", 'green');
        return true;
    } else {
        colored_output("✗ PHP $php_version (Required: $required_version)", 'red');
        colored_output("Please upgrade your PHP version.", 'red');
        return false;
    }
}

function check_extensions()
{
    colored_output("Checking required PHP extensions...", 'blue');

    $required_extensions = ['mysqli', 'gd', 'mbstring', 'openssl', 'session', 'json', 'fileinfo'];
    $missing_extensions = [];

    foreach ($required_extensions as $extension) {
        if (extension_loaded($extension)) {
            colored_output("✓ $extension", 'green');
        } else {
            colored_output("✗ $extension", 'red');
            $missing_extensions[] = $extension;
        }
    }

    if (!empty($missing_extensions)) {
        colored_output("Missing extensions: " . implode(', ', $missing_extensions), 'red');
        colored_output("Please install the missing extensions and restart your web server.", 'red');
        return false;
    }

    return true;
}

function check_web_server()
{
    colored_output("Checking web server...", 'blue');

    $server_software = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
    colored_output("Web Server: $server_software", 'blue');

    // Check if running via command line
    if (php_sapi_name() === 'cli') {
        colored_output("✓ Running in CLI mode (suitable for setup)", 'green');
        return true;
    } else {
        colored_output("✓ Web server detected", 'green');
        return true;
    }
}

function check_mysql_connection()
{
    colored_output("Checking MySQL connection...", 'blue');

    // Try to connect to MySQL
    $link = @mysqli_connect('localhost', 'root', '');

    if ($link) {
        colored_output("✓ MySQL connection successful", 'green');
        mysqli_close($link);
        return true;
    } else {
        colored_output("✗ MySQL connection failed", 'red');
        colored_output("Please ensure MySQL is running and accessible.", 'red');
        return false;
    }
}

function create_database()
{
    colored_output("Creating database...", 'blue');

    $servername = "localhost";
    $username = "root";
    $password = "";

    // Create connection
    $conn = new mysqli($servername, $username, $password);

    // Check connection
    if ($conn->connect_error) {
        colored_output("✗ Database connection failed: " . $conn->connect_error, 'red');
        return false;
    }

    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS exam_seat_allocation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";

    if ($conn->query($sql) === TRUE) {
        colored_output("✓ Database 'exam_seat_allocation' created successfully", 'green');
    } else {
        colored_output("✗ Error creating database: " . $conn->error, 'red');
        $conn->close();
        return false;
    }

    $conn->close();
    return true;
}

function import_schema()
{
    colored_output("Importing database schema...", 'blue');

    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "exam_seat_allocation";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        colored_output("✗ Database connection failed: " . $conn->connect_error, 'red');
        return false;
    }

    // Read schema file
    $schema_file = __DIR__ . '/../database_schema.sql';

    if (!file_exists($schema_file)) {
        colored_output("✗ Schema file not found: $schema_file", 'red');
        return false;
    }

    $sql = file_get_contents($schema_file);

    // Execute SQL
    if ($conn->multi_query($sql)) {
        colored_output("✓ Database schema imported successfully", 'green');
    } else {
        colored_output("✗ Error importing schema: " . $conn->error, 'red');
        $conn->close();
        return false;
    }

    $conn->close();
    return true;
}

function create_config_file()
{
    colored_output("Creating configuration file...", 'blue');

    $config_content = <<<CONFIG
<?php
// Application Configuration
define('APP_NAME', 'Exam Seat Allocation System');
define('APP_VERSION', '1.0.0');
define('DEBUG_MODE', true);

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'exam_seat_allocation');
define('DB_USER', 'root');
define('DB_PASS', '');

// Security Configuration
define('SESSION_TIMEOUT', 3600);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900);

// File Upload Configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', 'uploads/');

// Email Configuration (optional)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');

// Paths
define('BASE_PATH', dirname(__DIR__) . '/');
define('CONFIG_PATH', BASE_PATH . 'config/');
define('MODELS_PATH', BASE_PATH . 'models/');
define('SERVICES_PATH', BASE_PATH . 'services/');
define('LIB_PATH', BASE_PATH . 'lib/');
define('AUTH_PATH', BASE_PATH . 'auth/');
?>
CONFIG;

    $config_file = __DIR__ . '/../config/config.php';

    if (file_put_contents($config_file, $config_content)) {
        colored_output("✓ Configuration file created: $config_file", 'green');
        return true;
    } else {
        colored_output("✗ Failed to create configuration file", 'red');
        return false;
    }
}

function create_directories()
{
    colored_output("Creating required directories...", 'blue');

    $directories = [
        'uploads',
        'logs',
        'cache',
        'temp'
    ];

    $base_path = dirname(__DIR__);

    foreach ($directories as $dir) {
        $path = $base_path . '/' . $dir;
        if (!file_exists($path)) {
            if (mkdir($path, 0755, true)) {
                colored_output("✓ Created directory: $dir", 'green');
            } else {
                colored_output("✗ Failed to create directory: $dir", 'red');
                return false;
            }
        } else {
            colored_output("✓ Directory exists: $dir", 'green');
        }
    }

    return true;
}

function create_htaccess()
{
    colored_output("Creating .htaccess file...", 'blue');

    $htaccess_content = <<<HTACCESS
# Exam Seat Allocation Management System
# Apache Configuration

# Enable URL rewriting
RewriteEngine On

# Remove index.php from URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Prevent access to sensitive files
<Files ".htaccess">
    Order Allow,Deny
    Deny from all
</Files>

<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>

<Files "database_schema.sql">
    Order Allow,Deny
    Deny from all
</Files>

# PHP settings
php_flag display_errors On
php_value error_reporting E_ALL

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
</IfModule>
HTACCESS;

    $htaccess_file = dirname(__DIR__) . '/.htaccess';

    if (file_put_contents($htaccess_file, $htaccess_content)) {
        colored_output("✓ .htaccess file created", 'green');
        return true;
    } else {
        colored_output("✗ Failed to create .htaccess file", 'red');
        return false;
    }
}

function create_sample_data()
{
    colored_output("Creating sample data...", 'blue');

    // Use the sample data script instead of inline SQL
    $sample_data_script = __DIR__ . '/sample_data.php';

    if (file_exists($sample_data_script)) {
        // Include the sample data script
        ob_start(); // Capture output
        include $sample_data_script;
        $output = ob_get_clean();

        // Check if the script ran successfully
        if (strpos($output, 'Sample data creation completed!') !== false) {
            colored_output("✓ Sample data created successfully", 'green');
            return true;
        } else {
            colored_output("✗ Error creating sample data", 'red');
            return false;
        }
    } else {
        colored_output("✗ Sample data script not found", 'red');
        return false;
    }
}

function print_completion_message()
{
    colored_output("╔══════════════════════════════════════════════════════════════╗", 'green');
    colored_output("║                    Setup Complete!                           ║", 'green');
    colored_output("╚══════════════════════════════════════════════════════════════╝", 'green');
    echo PHP_EOL;

    colored_output("Your Exam Seat Allocation Management System is now ready!", 'green');
    echo PHP_EOL;

    colored_output("Next Steps:", 'blue');
    colored_output("1. Start your web server (Apache/MySQL)", 'blue');
    colored_output("2. Visit your application in browser:", 'blue');
    colored_output("   http://localhost/your-project-name/", 'cyan');
    echo PHP_EOL;

    colored_output("Default Admin Login:", 'blue');
    colored_output("Email: admin@example.com", 'blue');
    colored_output("Password: admin123", 'blue');
    echo PHP_EOL;

    colored_output("Important Notes:", 'yellow');
    colored_output("- Change the default admin password after first login", 'yellow');
    colored_output("- Configure email settings in config/config.php", 'yellow');
    colored_output("- Review security settings for production use", 'yellow');
    echo PHP_EOL;

    colored_output("For more information, see:", 'blue');
    colored_output("- setup/setup_guide.md (detailed setup instructions)", 'blue');
    colored_output("- docs/USER_GUIDE.md (user documentation)", 'blue');
    colored_output("- docs/API_DOCS.md (API documentation)", 'blue');
    echo PHP_EOL;

    colored_output("To validate your setup, run:", 'blue');
    colored_output("php setup/deployment_checklist.php", 'cyan');
}

function main()
{
    print_header();

    $checks = [
        'PHP Version' => check_php_version(),
        'PHP Extensions' => check_extensions(),
        'Web Server' => check_web_server(),
        'MySQL Connection' => check_mysql_connection()
    ];

    // Check if all prerequisites are met
    $prerequisites_met = true;
    foreach ($checks as $check => $result) {
        if (!$result) {
            $prerequisites_met = false;
        }
    }

    if (!$prerequisites_met) {
        colored_output("Prerequisites not met. Please fix the issues above and try again.", 'red');
        exit(1);
    }

    echo PHP_EOL;
    colored_output("All prerequisites met! Proceeding with setup...", 'green');
    echo PHP_EOL;

    // Run setup steps
    $setup_steps = [
        'Creating Database' => create_database(),
        'Importing Schema' => import_schema(),
        'Creating Directories' => create_directories(),
        'Creating Configuration' => create_config_file(),
        'Creating .htaccess' => create_htaccess(),
        'Creating Sample Data' => create_sample_data()
    ];

    // Check setup results
    $setup_successful = true;
    foreach ($setup_steps as $step => $result) {
        if (!$result) {
            $setup_successful = false;
        }
    }

    if ($setup_successful) {
        print_completion_message();
    } else {
        colored_output("Setup completed with errors. Please check the messages above.", 'red');
        colored_output("You may need to manually complete some steps.", 'yellow');
        exit(1);
    }
}

// Run the setup
main();
?>