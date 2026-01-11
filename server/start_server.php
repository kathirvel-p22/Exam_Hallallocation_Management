<?php
/**
 * Exam Seat Allocation Management System - Development Server
 * 
 * A standalone PHP development server that can run the system without external web server setup.
 * 
 * Usage: php start_server.php [options]
 * 
 * Options:
 *   --port PORT     Port to run the server on (default: 8000)
 *   --host HOST     Host to bind to (default: localhost)
 *   --demo          Start in demo mode with sample data
 *   --verbose       Enable verbose output
 *   --help          Show this help message
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration
$defaultPort = 8000;
$defaultHost = 'localhost';
$projectRoot = dirname(__DIR__);
$publicDir = $projectRoot . '/public';
$serverPidFile = sys_get_temp_dir() . '/seat_management_server.pid';

// Parse command line arguments
$options = getopt('', ['port:', 'host:', 'demo', 'verbose', 'help']);

if (isset($options['help'])) {
    showHelp();
    exit(0);
}

$port = $options['port'] ?? $defaultPort;
$host = $options['host'] ?? $defaultHost;
$demoMode = isset($options['demo']);
$verbose = isset($options['verbose']);

// Check if server is already running
if (isServerRunning($port)) {
    echo "❌ Server is already running on port $port\n";
    echo "Use 'php server/cli_manager.php stop' to stop it first\n";
    exit(1);
}

// Validate PHP version and extensions
if (!checkRequirements($verbose)) {
    exit(1);
}

// Setup database if needed
if (!setupDatabase($verbose)) {
    exit(1);
}

// Setup demo data if requested
if ($demoMode && !setupDemoData($verbose)) {
    exit(1);
}

// Start the server
echo "🚀 Starting Exam Seat Allocation Management System Development Server...\n";
echo "📍 Project Root: $projectRoot\n";
echo "🌐 Server URL: http://$host:$port\n";
echo "📁 Public Directory: $publicDir\n";

if ($demoMode) {
    echo "🎭 Demo Mode: Sample data will be available\n";
}

echo "\n";

// Change to project root directory
chdir($projectRoot);

// Start PHP built-in server
$command = "php -S $host:$port -t public";

if ($verbose) {
    echo "🔧 Command: $command\n\n";
    echo "Press Ctrl+C to stop the server\n";
    echo "================================\n";
}

// Store PID for management
$pid = getmypid();
file_put_contents($serverPidFile, $pid);

// Start the server
$pipes = [];
$process = proc_open($command, [
    0 => ['pipe', 'r'],  // stdin
    1 => ['pipe', 'w'],  // stdout
    2 => ['pipe', 'w']   // stderr
], $pipes);

if (is_resource($process)) {
    // Wait for the process to complete
    $status = proc_get_status($process);

    // Monitor the server
    while ($status['running']) {
        sleep(1);
        $status = proc_get_status($process);

        // Check if we should stop
        if (!file_exists($serverPidFile)) {
            echo "\n🛑 Server stopping...\n";
            proc_terminate($process);
            break;
        }
    }

    // Clean up
    proc_close($process);
    @unlink($serverPidFile);

    echo "\n✅ Server stopped successfully\n";
} else {
    echo "❌ Failed to start server\n";
    exit(1);
}

/**
 * Show help message
 */
function showHelp()
{
    echo "Exam Seat Allocation Management System - Development Server\n\n";
    echo "Usage: php start_server.php [options]\n\n";
    echo "Options:\n";
    echo "  --port PORT     Port to run the server on (default: 8000)\n";
    echo "  --host HOST     Host to bind to (default: localhost)\n";
    echo "  --demo          Start in demo mode with sample data\n";
    echo "  --verbose       Enable verbose output\n";
    echo "  --help          Show this help message\n\n";
    echo "Examples:\n";
    echo "  php start_server.php              # Start on localhost:8000\n";
    echo "  php start_server.php --demo       # Start with demo data\n";
    echo "  php start_server.php --port 9000  # Start on port 9000\n";
    echo "  php start_server.php --host 0.0.0.0 --verbose\n";
}

/**
 * Check if server is already running on the specified port
 */
function isServerRunning($port)
{
    $connection = @fsockopen('localhost', $port, $errno, $errstr, 1);
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    return false;
}

/**
 * Check PHP requirements and extensions
 */
function checkRequirements($verbose = false)
{
    $requiredExtensions = ['mysqli', 'session', 'json', 'filter', 'openssl'];
    $missingExtensions = [];

    // Check PHP version
    if (version_compare(PHP_VERSION, '7.4.0', '<')) {
        echo "❌ PHP version " . PHP_VERSION . " is too old. Required: 7.4.0+\n";
        return false;
    }

    if ($verbose) {
        echo "✅ PHP version: " . PHP_VERSION . "\n";
    }

    // Check extensions
    foreach ($requiredExtensions as $extension) {
        if (!extension_loaded($extension)) {
            $missingExtensions[] = $extension;
        } elseif ($verbose) {
            echo "✅ Extension: $extension\n";
        }
    }

    if (!empty($missingExtensions)) {
        echo "❌ Missing required extensions: " . implode(', ', $missingExtensions) . "\n";
        echo "Please install the missing extensions and try again.\n";
        return false;
    }

    return true;
}

/**
 * Setup database if needed
 */
function setupDatabase($verbose = false)
{
    $projectRoot = dirname(__DIR__);
    $dbConfigPath = $projectRoot . '/config/database.php';

    if (!file_exists($dbConfigPath)) {
        echo "❌ Database configuration file not found: $dbConfigPath\n";
        return false;
    }

    require_once $dbConfigPath;

    try {
        // Test database connection
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if ($conn->connect_error) {
            throw new Exception("Database connection failed: " . $conn->connect_error);
        }

        if ($verbose) {
            echo "✅ Database connection successful\n";
        }

        // Check if tables exist, if not create them
        $schemaPath = $projectRoot . '/database_schema.sql';
        if (file_exists($schemaPath)) {
            $sql = file_get_contents($schemaPath);
            if ($conn->multi_query($sql)) {
                if ($verbose) {
                    echo "✅ Database schema applied successfully\n";
                }
            } else {
                echo "❌ Failed to apply database schema: " . $conn->error . "\n";
                return false;
            }
        }

        $conn->close();
        return true;

    } catch (Exception $e) {
        echo "❌ Database setup failed: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Setup demo data
 */
function setupDemoData($verbose = false)
{
    $projectRoot = dirname(__DIR__);
    $demoScript = $projectRoot . '/server/demo_mode.php';

    if (!file_exists($demoScript)) {
        echo "❌ Demo script not found: $demoScript\n";
        return false;
    }

    if ($verbose) {
        echo "🎭 Setting up demo data...\n";
    }

    // Include demo script to setup data
    require_once $demoScript;

    if ($verbose) {
        echo "✅ Demo data setup complete\n";
    }

    return true;
}