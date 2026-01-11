<?php
/**
 * Health Check for Exam Seat Allocation Management System
 * 
 * Verifies that all system components are working correctly and ready for use.
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

class HealthCheck
{
    private $projectRoot;
    private $checks = [];
    private $verbose;

    public function __construct($verbose = false)
    {
        $this->projectRoot = dirname(__DIR__);
        $this->verbose = $verbose;
    }

    public function run()
    {
        echo "🏥 Exam Seat Allocation Management System - Health Check\n";
        echo "========================================================\n\n";

        // Run all checks
        $this->checkPhpVersion();
        $this->checkRequiredExtensions();
        $this->checkConfigurationFiles();
        $this->checkDatabaseConnection();
        $this->checkFilePermissions();
        $this->checkSecuritySettings();
        $this->checkServerStatus();

        // Show results
        $this->showResults();

        return $this->allPassed();
    }

    private function checkPhpVersion()
    {
        $this->startCheck("PHP Version");

        if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
            $this->pass("PHP " . PHP_VERSION);
        } else {
            $this->fail("PHP version " . PHP_VERSION . " is too old. Required: 7.4.0+");
        }
    }

    private function checkRequiredExtensions()
    {
        $this->startCheck("Required Extensions");

        $requiredExtensions = ['mysqli', 'session', 'json', 'filter', 'openssl', 'mbstring'];
        $missingExtensions = [];

        foreach ($requiredExtensions as $extension) {
            if (!extension_loaded($extension)) {
                $missingExtensions[] = $extension;
            }
        }

        if (empty($missingExtensions)) {
            $this->pass("All required extensions loaded");
        } else {
            $this->fail("Missing extensions: " . implode(', ', $missingExtensions));
        }
    }

    private function checkConfigurationFiles()
    {
        $this->startCheck("Configuration Files");

        $requiredFiles = [
            'config/database.php' => 'Database configuration',
            'config/config.php' => 'Application configuration',
            'database_schema.sql' => 'Database schema'
        ];

        $missingFiles = [];

        foreach ($requiredFiles as $file => $description) {
            if (!file_exists($this->projectRoot . '/' . $file)) {
                $missingFiles[] = $description;
            }
        }

        if (empty($missingFiles)) {
            $this->pass("All configuration files present");
        } else {
            $this->fail("Missing files: " . implode(', ', $missingFiles));
        }
    }

    private function checkDatabaseConnection()
    {
        $this->startCheck("Database Connection");

        try {
            require_once $this->projectRoot . '/config/database.php';

            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($conn->connect_error) {
                throw new Exception("Connection failed: " . $conn->connect_error);
            }

            // Check if tables exist
            $tables = ['users', 'students', 'classes', 'rooms', 'exams', 'allocations'];
            $missingTables = [];

            foreach ($tables as $table) {
                $result = $conn->query("SHOW TABLES LIKE '$table'");
                if ($result->num_rows == 0) {
                    $missingTables[] = $table;
                }
            }

            $conn->close();

            if (empty($missingTables)) {
                $this->pass("Database connection successful, all tables present");
            } else {
                $this->fail("Missing tables: " . implode(', ', $missingTables));
            }

        } catch (Exception $e) {
            $this->fail("Database connection failed: " . $e->getMessage());
        }
    }

    private function checkFilePermissions()
    {
        $this->startCheck("File Permissions");

        $writableDirs = [
            'uploads' => 'Upload directory',
            'logs' => 'Log directory',
            'temp' => 'Temporary directory'
        ];

        $permissionIssues = [];

        foreach ($writableDirs as $dir => $description) {
            $fullPath = $this->projectRoot . '/' . $dir;

            // Create directory if it doesn't exist
            if (!file_exists($fullPath)) {
                @mkdir($fullPath, 0755, true);
            }

            if (!is_writable($fullPath)) {
                $permissionIssues[] = $description;
            }
        }

        // Check critical files are readable
        $criticalFiles = [
            'index.php' => 'Main index file',
            'config/database.php' => 'Database config',
            'config/config.php' => 'App config'
        ];

        foreach ($criticalFiles as $file => $description) {
            $fullPath = $this->projectRoot . '/' . $file;
            if (!is_readable($fullPath)) {
                $permissionIssues[] = "Cannot read $description";
            }
        }

        if (empty($permissionIssues)) {
            $this->pass("File permissions are correct");
        } else {
            $this->fail("Permission issues: " . implode(', ', $permissionIssues));
        }
    }

    private function checkSecuritySettings()
    {
        $this->startCheck("Security Settings");

        $securityIssues = [];

        // Check if display_errors is off in production
        if (ini_get('display_errors') == 1) {
            $securityIssues[] = "display_errors is enabled (should be disabled in production)";
        }

        // Check if error reporting is appropriate
        if (ini_get('error_reporting') == E_ALL) {
            $securityIssues[] = "error_reporting is set to E_ALL (should be reduced in production)";
        }

        // Check if session security is configured
        if (!ini_get('session.cookie_httponly')) {
            $securityIssues[] = "session.cookie_httponly is not set";
        }

        if (empty($securityIssues)) {
            $this->pass("Security settings are appropriate");
        } else {
            $this->fail("Security issues: " . implode(', ', $securityIssues));
        }
    }

    private function checkServerStatus()
    {
        $this->startCheck("Server Status");

        // Check if development server can be started
        $testPort = 8001; // Use different port to avoid conflicts

        // Try to bind to the port
        $socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        if ($socket) {
            $result = @socket_bind($socket, '127.0.0.1', $testPort);
            if ($result === false) {
                $this->fail("Port $testPort is already in use");
            } else {
                $this->pass("Server can start on available port");
            }
            @socket_close($socket);
        } else {
            $this->fail("Cannot create socket for server");
        }
    }

    private function startCheck($name)
    {
        echo "🔍 Checking: $name... ";
    }

    private function pass($message)
    {
        echo "✅ $message\n";
        $this->checks[] = ['name' => $message, 'status' => 'pass'];
    }

    private function fail($message)
    {
        echo "❌ $message\n";
        $this->checks[] = ['name' => $message, 'status' => 'fail'];
    }

    private function showResults()
    {
        echo "\n📊 Health Check Results\n";
        echo "========================\n";

        $passed = 0;
        $failed = 0;

        foreach ($this->checks as $check) {
            if ($check['status'] == 'pass') {
                $passed++;
            } else {
                $failed++;
            }
        }

        echo "Total checks: " . count($this->checks) . "\n";
        echo "Passed: $passed\n";
        echo "Failed: $failed\n";

        if ($failed == 0) {
            echo "\n🎉 All checks passed! System is ready.\n";
        } else {
            echo "\n⚠️  Some checks failed. Please review and fix the issues above.\n";
        }

        if ($this->verbose) {
            echo "\n📋 Detailed Results:\n";
            foreach ($this->checks as $check) {
                $status = $check['status'] == 'pass' ? '✅' : '❌';
                echo "   $status {$check['name']}\n";
            }
        }
    }

    private function allPassed()
    {
        foreach ($this->checks as $check) {
            if ($check['status'] == 'fail') {
                return false;
            }
        }
        return true;
    }
}

// Run health check if called directly
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    $verbose = isset($argv) && in_array('--verbose', $argv);
    $healthCheck = new HealthCheck($verbose);
    $success = $healthCheck->run();

    exit($success ? 0 : 1);
}