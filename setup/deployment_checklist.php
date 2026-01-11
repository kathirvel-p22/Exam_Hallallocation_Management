<?php
/**
 * Exam Seat Allocation Management System - Deployment Checklist
 * 
 * This script validates the deployment and configuration of the application.
 * Run this script to ensure everything is working correctly.
 * 
 * Usage: php deployment_checklist.php
 */

// Set error reporting for validation
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
    colored_output("║                  Deployment Validation                       ║", 'cyan');
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
        return false;
    }

    return true;
}

function check_file_structure()
{
    colored_output("Checking file structure...", 'blue');

    $required_files = [
        'index.php',
        'config/config.php',
        'config/database.php',
        'database_schema.sql',
        'auth/auth.php',
        'auth/login.php',
        'auth/register.php',
        'admin/dashboard.php',
        'student/dashboard.php'
    ];

    $required_directories = [
        'config',
        'models',
        'services',
        'lib',
        'auth',
        'admin',
        'student',
        'public',
        'assets'
    ];

    $all_good = true;

    // Check files
    foreach ($required_files as $file) {
        if (file_exists($file)) {
            colored_output("✓ $file", 'green');
        } else {
            colored_output("✗ $file", 'red');
            $all_good = false;
        }
    }

    // Check directories
    foreach ($required_directories as $dir) {
        if (is_dir($dir)) {
            colored_output("✓ $dir/", 'green');
        } else {
            colored_output("✗ $dir/", 'red');
            $all_good = false;
        }
    }

    return $all_good;
}

function check_database_connection()
{
    colored_output("Checking database connection...", 'blue');

    // Try to load config
    if (!file_exists('config/config.php')) {
        colored_output("✗ Configuration file not found", 'red');
        return false;
    }

    require_once 'config/config.php';

    // Check if constants are defined
    if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER')) {
        colored_output("✗ Database configuration not found", 'red');
        return false;
    }

    // Try to connect
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS ?? '', DB_NAME);

    if ($conn->connect_error) {
        colored_output("✗ Database connection failed: " . $conn->connect_error, 'red');
        $conn->close();
        return false;
    }

    colored_output("✓ Database connection successful", 'green');

    // Check if tables exist
    $tables = ['users', 'classes', 'rooms', 'exams', 'allocations'];
    $missing_tables = [];

    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows == 0) {
            $missing_tables[] = $table;
        }
    }

    if (empty($missing_tables)) {
        colored_output("✓ All required tables exist", 'green');
    } else {
        colored_output("✗ Missing tables: " . implode(', ', $missing_tables), 'red');
        $conn->close();
        return false;
    }

    $conn->close();
    return true;
}

function check_file_permissions()
{
    colored_output("Checking file permissions...", 'blue');

    $files_to_check = [
        'config/config.php' => 644,
        'config/database.php' => 644,
        'uploads' => 755,
        'logs' => 755,
        'cache' => 755
    ];

    $all_good = true;

    foreach ($files_to_check as $file => $expected_mode) {
        if (file_exists($file)) {
            $actual_mode = substr(sprintf('%o', fileperms($file)), -4);
            if ($actual_mode == $expected_mode) {
                colored_output("✓ $file (permissions: $actual_mode)", 'green');
            } else {
                colored_output("✗ $file (expected: $expected_mode, actual: $actual_mode)", 'red');
                $all_good = false;
            }
        } else {
            colored_output("✗ $file (not found)", 'red');
            $all_good = false;
        }
    }

    return $all_good;
}

function check_web_server_config()
{
    colored_output("Checking web server configuration...", 'blue');

    // Check for .htaccess
    if (file_exists('.htaccess')) {
        colored_output("✓ .htaccess file found", 'green');
    } else {
        colored_output("✗ .htaccess file not found", 'red');
        return false;
    }

    // Check if mod_rewrite is enabled (Apache)
    if (function_exists('apache_get_modules')) {
        $modules = apache_get_modules();
        if (in_array('mod_rewrite', $modules)) {
            colored_output("✓ mod_rewrite enabled", 'green');
        } else {
            colored_output("✗ mod_rewrite not enabled", 'red');
            return false;
        }
    }

    // Check server software
    $server_software = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
    colored_output("Web server: $server_software", 'blue');

    return true;
}

function check_security_settings()
{
    colored_output("Checking security settings...", 'blue');

    $security_issues = [];

    // Check if debug mode is disabled in production
    if (defined('DEBUG_MODE') && DEBUG_MODE === true) {
        $security_issues[] = "Debug mode is enabled";
    }

    // Check if default admin password is changed
    if (file_exists('config/config.php')) {
        $config_content = file_get_contents('config/config.php');
        if (strpos($config_content, 'admin123') !== false) {
            $security_issues[] = "Default admin password detected";
        }
    }

    // Check for exposed sensitive files
    $sensitive_files = ['.env', 'config.php.bak', 'database_schema.sql'];
    foreach ($sensitive_files as $file) {
        if (file_exists($file)) {
            $security_issues[] = "Sensitive file exposed: $file";
        }
    }

    if (empty($security_issues)) {
        colored_output("✓ Security settings look good", 'green');
        return true;
    } else {
        foreach ($security_issues as $issue) {
            colored_output("✗ $issue", 'red');
        }
        return false;
    }
}

function check_authentication_system()
{
    colored_output("Checking authentication system...", 'blue');

    // Check if auth files exist
    $auth_files = [
        'auth/auth.php',
        'auth/login.php',
        'auth/register.php',
        'auth/session.php',
        'auth/csrf.php'
    ];

    foreach ($auth_files as $file) {
        if (!file_exists($file)) {
            colored_output("✗ Authentication file missing: $file", 'red');
            return false;
        }
    }

    // Check if admin user exists
    if (file_exists('config/config.php')) {
        require_once 'config/config.php';

        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS ?? '', DB_NAME);
        if ($conn->connect_error) {
            colored_output("✗ Cannot connect to database for auth check", 'red');
            return false;
        }

        $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        if ($result) {
            $row = $result->fetch_assoc();
            if ($row['count'] > 0) {
                colored_output("✓ Admin user exists", 'green');
            } else {
                colored_output("✗ No admin user found", 'red');
                $conn->close();
                return false;
            }
        }

        $conn->close();
    }

    colored_output("✓ Authentication system appears functional", 'green');
    return true;
}

function check_email_configuration()
{
    colored_output("Checking email configuration...", 'blue');

    if (file_exists('config/config.php')) {
        require_once 'config/config.php';

        if (defined('SMTP_ENABLED') && SMTP_ENABLED === true) {
            if (defined('SMTP_HOST') && defined('SMTP_USER') && defined('SMTP_PASS')) {
                colored_output("✓ Email configuration found", 'green');

                // Test email configuration
                if (function_exists('mail')) {
                    colored_output("✓ PHP mail() function available", 'green');
                } else {
                    colored_output("✗ PHP mail() function not available", 'yellow');
                }
            } else {
                colored_output("✗ Incomplete email configuration", 'yellow');
            }
        } else {
            colored_output("ℹ Email notifications disabled (development mode)", 'yellow');
        }
    }

    return true;
}

function check_performance_settings()
{
    colored_output("Checking performance settings...", 'blue');

    $memory_limit = ini_get('memory_limit');
    $max_execution_time = ini_get('max_execution_time');

    colored_output("Memory limit: $memory_limit", 'blue');
    colored_output("Max execution time: $max_execution_time seconds", 'blue');

    if (intval($memory_limit) >= 128) {
        colored_output("✓ Memory limit adequate", 'green');
    } else {
        colored_output("✗ Memory limit may be too low", 'yellow');
    }

    if (intval($max_execution_time) >= 30) {
        colored_output("✓ Execution time adequate", 'green');
    } else {
        colored_output("✗ Execution time may be too low", 'yellow');
    }

    return true;
}

function run_sample_queries()
{
    colored_output("Running sample database queries...", 'blue');

    if (!file_exists('config/config.php')) {
        colored_output("✗ Configuration file not found", 'red');
        return false;
    }

    require_once 'config/config.php';

    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS ?? '', DB_NAME);
    if ($conn->connect_error) {
        colored_output("✗ Database connection failed", 'red');
        return false;
    }

    // Test basic queries
    $tests = [
        "SELECT COUNT(*) as count FROM users" => "User count",
        "SELECT COUNT(*) as count FROM classes" => "Class count",
        "SELECT COUNT(*) as count FROM rooms" => "Room count",
        "SELECT COUNT(*) as count FROM exams" => "Exam count"
    ];

    $all_good = true;

    foreach ($tests as $query => $description) {
        $result = $conn->query($query);
        if ($result) {
            $row = $result->fetch_assoc();
            colored_output("✓ $description: {$row['count']}", 'green');
        } else {
            colored_output("✗ $description failed: " . $conn->error, 'red');
            $all_good = false;
        }
    }

    $conn->close();
    return $all_good;
}

function print_summary($results)
{
    echo PHP_EOL;
    colored_output("╔══════════════════════════════════════════════════════════════╗", 'cyan');
    colored_output("║                        Summary                               ║", 'cyan');
    colored_output("╚══════════════════════════════════════════════════════════════╝", 'cyan');
    echo PHP_EOL;

    $passed = 0;
    $failed = 0;
    $warnings = 0;

    foreach ($results as $test => $result) {
        if ($result === true) {
            $passed++;
            colored_output("✓ $test", 'green');
        } elseif ($result === false) {
            $failed++;
            colored_output("✗ $test", 'red');
        } else {
            $warnings++;
            colored_output("⚠ $test", 'yellow');
        }
    }

    echo PHP_EOL;
    colored_output("Tests passed: $passed", 'green');
    colored_output("Tests failed: $failed", 'red');
    colored_output("Warnings: $warnings", 'yellow');

    if ($failed > 0) {
        colored_output("Deployment has issues that need to be addressed.", 'red');
        return false;
    } elseif ($warnings > 0) {
        colored_output("Deployment is functional but has some warnings.", 'yellow');
        return true;
    } else {
        colored_output("Deployment is fully functional!", 'green');
        return true;
    }
}

function main()
{
    print_header();

    $tests = [
        'PHP Version' => check_php_version(),
        'PHP Extensions' => check_extensions(),
        'File Structure' => check_file_structure(),
        'Database Connection' => check_database_connection(),
        'File Permissions' => check_file_permissions(),
        'Web Server Config' => check_web_server_config(),
        'Security Settings' => check_security_settings(),
        'Authentication System' => check_authentication_system(),
        'Email Configuration' => check_email_configuration(),
        'Performance Settings' => check_performance_settings(),
        'Sample Queries' => run_sample_queries()
    ];

    $success = print_summary($tests);

    echo PHP_EOL;
    if ($success) {
        colored_output("Your Exam Seat Allocation Management System is ready to use!", 'green');
        colored_output("Visit your application in your browser to start using it.", 'blue');
    } else {
        colored_output("Please address the issues above before using the system.", 'red');
        colored_output("Refer to setup/setup_guide.md for detailed instructions.", 'blue');
    }

    echo PHP_EOL;
    colored_output("For more information:", 'blue');
    colored_output("- Setup Guide: setup/setup_guide.md", 'blue');
    colored_output("- User Guide: docs/USER_GUIDE.md", 'blue');
    colored_output("- API Documentation: docs/API_DOCS.md", 'blue');
}

// Run the validation
main();
?>