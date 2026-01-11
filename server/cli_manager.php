<?php
/**
 * Command Line Interface Manager for Exam Seat Allocation Management System
 * 
 * Provides a simple CLI for managing the development server and system operations.
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

class CLIManager
{
    private $projectRoot;
    private $serverPidFile;

    public function __construct()
    {
        $this->projectRoot = dirname(__DIR__);
        $this->serverPidFile = sys_get_temp_dir() . '/seat_management_server.pid';
    }

    public function run()
    {
        // Parse command line arguments
        $args = $_SERVER['argv'];
        $command = isset($args[1]) ? $args[1] : 'help';

        switch ($command) {
            case 'start':
                $this->startServer();
                break;
            case 'stop':
                $this->stopServer();
                break;
            case 'demo':
                $this->startDemo();
                break;
            case 'health':
                $this->runHealthCheck();
                break;
            case 'setup':
                $this->runSetup();
                break;
            case 'status':
                $this->showStatus();
                break;
            case 'help':
            default:
                $this->showHelp();
                break;
        }
    }

    private function startServer()
    {
        echo "🚀 Starting development server...\n";

        // Check if already running
        if ($this->isServerRunning()) {
            echo "❌ Server is already running\n";
            echo "Use 'php server/cli_manager.php status' to check status\n";
            echo "Use 'php server/cli_manager.php stop' to stop it\n";
            return;
        }

        // Start server
        $port = $this->getPortFromArgs();
        $host = $this->getHostFromArgs();
        $verbose = $this->hasFlag('--verbose');

        $command = "php server/start_server.php";
        if ($port)
            $command .= " --port $port";
        if ($host)
            $command .= " --host $host";
        if ($verbose)
            $command .= " --verbose";

        echo "🔧 Command: $command\n";
        echo "Press Ctrl+C to stop the server\n";
        echo "================================\n";

        passthru($command);
    }

    private function stopServer()
    {
        echo "🛑 Stopping development server...\n";

        if (file_exists($this->serverPidFile)) {
            $pid = file_get_contents($this->serverPidFile);

            if ($this->killProcess($pid)) {
                echo "✅ Server stopped successfully\n";
                @unlink($this->serverPidFile);
            } else {
                echo "❌ Failed to stop server. You may need to stop it manually.\n";
                echo "Try: taskkill /PID $pid /F (Windows) or kill $pid (Linux/macOS)\n";
            }
        } else {
            echo "ℹ️  No server PID file found. Server may not be running.\n";
        }
    }

    private function startDemo()
    {
        echo "🎭 Starting demo mode...\n";

        // Check if server is running
        if ($this->isServerRunning()) {
            echo "❌ Server is already running. Please stop it first.\n";
            return;
        }

        $verbose = $this->hasFlag('--verbose');
        $command = "php server/start_server.php --demo";
        if ($verbose)
            $command .= " --verbose";

        echo "🔧 Command: $command\n";
        echo "Press Ctrl+C to stop the server\n";
        echo "================================\n";

        passthru($command);
    }

    private function runHealthCheck()
    {
        echo "🏥 Running health check...\n";

        $verbose = $this->hasFlag('--verbose');
        $command = "php server/health_check.php";
        if ($verbose)
            $command .= " --verbose";

        passthru($command);
    }

    private function runSetup()
    {
        echo "⚙️  Running setup...\n";

        // Run health check first
        echo "Step 1: Running health check...\n";
        $healthResult = $this->runHealthCheckSilent();

        if (!$healthResult) {
            echo "❌ Health check failed. Please fix the issues above.\n";
            return;
        }

        echo "✅ Health check passed\n";

        // Setup database
        echo "Step 2: Setting up database...\n";
        require_once $this->projectRoot . '/config/database.php';

        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($conn->connect_error) {
                throw new Exception("Database connection failed: " . $conn->connect_error);
            }

            // Apply schema if exists
            $schemaPath = $this->projectRoot . '/database_schema.sql';
            if (file_exists($schemaPath)) {
                $sql = file_get_contents($schemaPath);
                if ($conn->multi_query($sql)) {
                    echo "✅ Database schema applied successfully\n";
                } else {
                    throw new Exception("Failed to apply schema: " . $conn->error);
                }
            }

            $conn->close();
            echo "✅ Database setup complete\n";

        } catch (Exception $e) {
            echo "❌ Database setup failed: " . $e->getMessage() . "\n";
            return;
        }

        echo "✅ Setup complete!\n";
    }

    private function showStatus()
    {
        echo "📊 Server Status\n";
        echo "================\n";

        // Check if server is running
        if ($this->isServerRunning()) {
            echo "✅ Server is running\n";

            // Show PID if available
            if (file_exists($this->serverPidFile)) {
                $pid = file_get_contents($this->serverPidFile);
                echo "   PID: $pid\n";
            }

            echo "🌐 Visit: http://localhost:8000\n";
        } else {
            echo "❌ Server is not running\n";
        }

        // Check database connection
        echo "\n🗄️  Database Status\n";
        echo "==================\n";

        try {
            require_once $this->projectRoot . '/config/database.php';
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($conn->connect_error) {
                echo "❌ Database connection failed\n";
            } else {
                echo "✅ Database connection successful\n";

                // Show table counts
                $tables = ['users', 'students', 'classes', 'rooms', 'exams', 'allocations'];
                echo "\n📊 Data Summary:\n";
                foreach ($tables as $table) {
                    $result = $conn->query("SELECT COUNT(*) as count FROM $table");
                    if ($result && $row = $result->fetch_assoc()) {
                        echo "   $table: {$row['count']}\n";
                    }
                }

                $conn->close();
            }
        } catch (Exception $e) {
            echo "❌ Database check failed: " . $e->getMessage() . "\n";
        }
    }

    private function showHelp()
    {
        echo "Exam Seat Allocation Management System - CLI Manager\n";
        echo "=====================================================\n\n";
        echo "Usage: php server/cli_manager.php [command] [options]\n\n";
        echo "Commands:\n";
        echo "  start     Start the development server\n";
        echo "  stop      Stop the development server\n";
        echo "  demo      Start server in demo mode\n";
        echo "  health    Run health check\n";
        echo "  setup     Run system setup\n";
        echo "  status    Show server and database status\n";
        echo "  help      Show this help message\n\n";
        echo "Options:\n";
        echo "  --port PORT     Port to use (default: 8000)\n";
        echo "  --host HOST     Host to bind to (default: localhost)\n";
        echo "  --verbose       Enable verbose output\n\n";
        echo "Examples:\n";
        echo "  php server/cli_manager.php start\n";
        echo "  php server/cli_manager.php start --port 9000\n";
        echo "  php server/cli_manager.php demo --verbose\n";
        echo "  php server/cli_manager.php health --verbose\n";
    }

    private function isServerRunning()
    {
        // Try to connect to default port
        $connection = @fsockopen('localhost', 8000, $errno, $errstr, 1);
        if (is_resource($connection)) {
            fclose($connection);
            return true;
        }
        return false;
    }

    private function killProcess($pid)
    {
        if (function_exists('posix_kill')) {
            return posix_kill($pid, 9);
        } else {
            // Windows fallback
            exec("taskkill /PID $pid /F", $output, $returnCode);
            return $returnCode === 0;
        }
    }

    private function getPortFromArgs()
    {
        $args = $_SERVER['argv'];
        $portIndex = array_search('--port', $args);
        return $portIndex !== false && isset($args[$portIndex + 1]) ? $args[$portIndex + 1] : null;
    }

    private function getHostFromArgs()
    {
        $args = $_SERVER['argv'];
        $hostIndex = array_search('--host', $args);
        return $hostIndex !== false && isset($args[$hostIndex + 1]) ? $args[$hostIndex + 1] : null;
    }

    private function hasFlag($flag)
    {
        return in_array($flag, $_SERVER['argv']);
    }

    private function runHealthCheckSilent()
    {
        ob_start();
        include $this->projectRoot . '/server/health_check.php';
        $output = ob_get_clean();

        // Check if output contains "All checks passed"
        return strpos($output, 'All checks passed') !== false;
    }
}

// Run CLI manager if called directly
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    $cli = new CLIManager();
    $cli->run();
}