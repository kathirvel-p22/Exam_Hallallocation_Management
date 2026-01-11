<?php
/**
 * PHP Post-Installation Verification Script
 * 
 * This script performs comprehensive testing after PHP installation to ensure
 * everything is working correctly. It tests PHP functionality, web server
 * configuration, database connectivity, and common PHP features.
 * 
 * @author PHP Installation Guide
 * @version 1.0
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

class PostInstallationTest
{
    private $tests = [];
    private $passed = 0;
    private $failed = 0;
    private $warnings = 0;

    public function __construct()
    {
        echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>PHP Post-Installation Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-card { flex: 1; padding: 15px; border-radius: 5px; text-align: center; color: white; }
        .summary-pass { background-color: #28a745; }
        .summary-warn { background-color: #ffc107; color: #333; }
        .summary-fail { background-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .status-warn { color: #ffc107; font-weight: bold; }
        .description { font-size: 0.9em; color: #666; }
        .details { font-size: 0.9em; color: #666; background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px; }
        .error-box { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #721c24; }
        .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
        .code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>PHP Post-Installation Verification Test</h1>
        <p>This script tests your PHP installation to ensure everything is working correctly.</p>
        
        <div class='summary'>
            <div class='summary-card summary-pass'>
                <h3>Tests Passed</h3>
                <p id='passed-count'>0</p>
            </div>
            <div class='summary-card summary-warn'>
                <h3>Warnings</h3>
                <p id='warnings-count'>0</p>
            </div>
            <div class='summary-card summary-fail'>
                <h3>Tests Failed</h3>
                <p id='failed-count'>0</p>
            </div>
        </div>";

        $this->runAllTests();

        echo "<div class='footer'>
            <p><strong>Note:</strong> This test suite validates basic PHP functionality. 
            Some tests may fail in certain environments but your installation may still be functional.</p>
            <p><strong>Generated:</strong> " . date('Y-m-d H:i:s') . "</p>
        </div>
    </div>
</body>
</html>";
    }

    /**
     * Run all tests
     */
    private function runAllTests()
    {
        echo "<h2>Running Tests...</h2>";

        // Basic PHP Tests
        $this->testPHPVersion();
        $this->testPHPInfo();
        $this->testBasicFunctions();
        $this->testFileOperations();
        $this->testStringFunctions();
        $this->testArrayFunctions();

        // Web Server Tests
        $this->testWebServer();
        $this->testHeaders();
        $this->testCookies();
        $this->testSessions();

        // Database Tests
        $this->testMySQLi();
        $this->testPDO();

        // Security Tests
        $this->testHashFunctions();
        $this->testOpenSSL();

        // Performance Tests
        $this->testMemoryUsage();
        $this->testExecutionTime();

        // Display results
        $this->displayResults();
    }

    /**
     * Test PHP version
     */
    private function testPHPVersion()
    {
        $version = phpversion();
        $required = '7.4.0';
        $status = version_compare($version, $required, '>=');

        $this->addTest(
            'PHP Version',
            $status,
            "Current: $version, Required: $required",
            $status ? "PHP version is compatible" : "PHP version is too old"
        );
    }

    /**
     * Test phpinfo() function
     */
    private function testPHPInfo()
    {
        $status = function_exists('phpinfo');
        $this->addTest(
            'phpinfo() Function',
            $status,
            "phpinfo() function availability",
            $status ? "phpinfo() function is available" : "phpinfo() function is not available"
        );
    }

    /**
     * Test basic PHP functions
     */
    private function testBasicFunctions()
    {
        $functions = ['echo', 'print', 'var_dump', 'strlen', 'strpos', 'substr'];
        $status = true;
        $details = [];

        foreach ($functions as $function) {
            if (!function_exists($function)) {
                $status = false;
                $details[] = "$function() is not available";
            }
        }

        $this->addTest(
            'Basic Functions',
            $status,
            implode(', ', $details),
            $status ? "All basic functions are available" : "Some basic functions are missing"
        );
    }

    /**
     * Test file operations
     */
    private function testFileOperations()
    {
        $testFile = sys_get_temp_dir() . '/php_test_file.txt';
        $testContent = 'Test content for PHP installation verification';

        // Test file writing
        $writeResult = file_put_contents($testFile, $testContent);
        $writeStatus = $writeResult !== false;

        // Test file reading
        $readContent = file_get_contents($testFile);
        $readStatus = $readContent === $testContent;

        // Test file deletion
        $deleteResult = unlink($testFile);
        $deleteStatus = $deleteResult !== false;

        $status = $writeStatus && $readStatus && $deleteStatus;
        $details = "Write: " . ($writeStatus ? '✓' : '✗') .
            ", Read: " . ($readStatus ? '✓' : '✗') .
            ", Delete: " . ($deleteStatus ? '✓' : '✗');

        $this->addTest(
            'File Operations',
            $status,
            $details,
            $status ? "File operations working correctly" : "File operations failed"
        );
    }

    /**
     * Test string functions
     */
    private function testStringFunctions()
    {
        $testString = 'Hello World PHP Test';
        $status = true;
        $details = [];

        // Test common string functions
        if (strlen($testString) !== 20) {
            $status = false;
            $details[] = "strlen() failed";
        }

        if (strpos($testString, 'PHP') !== 12) {
            $status = false;
            $details[] = "strpos() failed";
        }

        if (substr($testString, 0, 5) !== 'Hello') {
            $status = false;
            $details[] = "substr() failed";
        }

        if (strtoupper($testString) !== 'HELLO WORLD PHP TEST') {
            $status = false;
            $details[] = "strtoupper() failed";
        }

        $this->addTest(
            'String Functions',
            $status,
            implode(', ', $details),
            $status ? "String functions working correctly" : "Some string functions failed"
        );
    }

    /**
     * Test array functions
     */
    private function testArrayFunctions()
    {
        $testArray = [1, 2, 3, 4, 5];
        $status = true;
        $details = [];

        // Test common array functions
        if (count($testArray) !== 5) {
            $status = false;
            $details[] = "count() failed";
        }

        if (array_sum($testArray) !== 15) {
            $status = false;
            $details[] = "array_sum() failed";
        }

        if (array_push($testArray, 6) !== 6) {
            $status = false;
            $details[] = "array_push() failed";
        }

        if (array_pop($testArray) !== 6) {
            $status = false;
            $details[] = "array_pop() failed";
        }

        $this->addTest(
            'Array Functions',
            $status,
            implode(', ', $details),
            $status ? "Array functions working correctly" : "Some array functions failed"
        );
    }

    /**
     * Test web server configuration
     */
    private function testWebServer()
    {
        $serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? '';
        $serverName = $_SERVER['SERVER_NAME'] ?? '';

        $status = !empty($serverSoftware) && !empty($serverName);
        $details = "Server: $serverSoftware, Name: $serverName";

        $this->addTest(
            'Web Server',
            $status,
            $details,
            $status ? "Web server detected and configured" : "Web server not properly configured"
        );
    }

    /**
     * Test HTTP headers
     */
    private function testHeaders()
    {
        // Test if we can send headers
        $status = true;
        $details = '';

        try {
            header('X-Test-Header: test');
            $details = "Headers can be sent";
        } catch (Exception $e) {
            $status = false;
            $details = "Cannot send headers: " . $e->getMessage();
        }

        $this->addTest(
            'HTTP Headers',
            $status,
            $details,
            $status ? "HTTP headers working" : "HTTP headers not working"
        );
    }

    /**
     * Test cookies
     */
    private function testCookies()
    {
        $cookieName = 'php_test_cookie';
        $cookieValue = 'test_value_' . time();

        // Set cookie
        $setResult = setcookie($cookieName, $cookieValue, time() + 3600, '/');
        $setStatus = $setResult !== false;

        // Check if cookie was set (in this request or next)
        $cookieExists = isset($_COOKIE[$cookieName]) || headers_sent() === false;

        $status = $setStatus || $cookieExists;
        $details = "Set: " . ($setStatus ? '✓' : '✗') .
            ", Exists: " . ($cookieExists ? '✓' : '✗');

        $this->addTest(
            'Cookies',
            $status,
            $details,
            $status ? "Cookie functionality working" : "Cookie functionality failed"
        );
    }

    /**
     * Test sessions
     */
    private function testSessions()
    {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $sessionKey = 'php_test_session';
        $sessionValue = 'test_session_value_' . time();

        // Set session variable
        $_SESSION[$sessionKey] = $sessionValue;
        $setStatus = isset($_SESSION[$sessionKey]);

        // Get session variable
        $getValue = $_SESSION[$sessionKey] ?? null;
        $getStatus = $getValue === $sessionValue;

        // Clean up
        unset($_SESSION[$sessionKey]);

        $status = $setStatus && $getStatus;
        $details = "Set: " . ($setStatus ? '✓' : '✗') .
            ", Get: " . ($getStatus ? '✓' : '✗');

        $this->addTest(
            'Sessions',
            $status,
            $details,
            $status ? "Session functionality working" : "Session functionality failed"
        );
    }

    /**
     * Test MySQLi extension
     */
    private function testMySQLi()
    {
        $status = extension_loaded('mysqli');
        $details = '';

        if ($status) {
            // Try to create a connection (may fail if MySQL not running)
            $connection = @mysqli_connect('localhost', 'root', '');
            if ($connection) {
                $mysqlVersion = mysqli_get_server_info($connection);
                mysqli_close($connection);
                $details = "MySQLi available, MySQL version: $mysqlVersion";
            } else {
                $details = "MySQLi available but cannot connect to MySQL server";
                // This is a warning, not a failure
                $this->warnings++;
            }
        } else {
            $details = "MySQLi extension not loaded";
        }

        $this->addTest(
            'MySQLi Extension',
            $status,
            $details,
            $status ? "MySQLi extension available" : "MySQLi extension not available"
        );
    }

    /**
     * Test PDO extension
     */
    private function testPDO()
    {
        $status = extension_loaded('pdo');
        $details = '';

        if ($status) {
            $drivers = PDO::getAvailableDrivers();
            $details = "PDO available, drivers: " . implode(', ', $drivers);

            if (!in_array('mysql', $drivers)) {
                $details .= " (MySQL driver not available)";
            }
        } else {
            $details = "PDO extension not loaded";
        }

        $this->addTest(
            'PDO Extension',
            $status,
            $details,
            $status ? "PDO extension available" : "PDO extension not available"
        );
    }

    /**
     * Test hash functions
     */
    private function testHashFunctions()
    {
        $testString = 'test_string_for_hashing';
        $status = true;
        $details = [];

        // Test common hash functions
        $hashes = [
            'md5' => md5($testString),
            'sha1' => sha1($testString),
            'sha256' => hash('sha256', $testString)
        ];

        foreach ($hashes as $algo => $hash) {
            if (empty($hash) || strlen($hash) === 0) {
                $status = false;
                $details[] = "$algo hash failed";
            }
        }

        $this->addTest(
            'Hash Functions',
            $status,
            implode(', ', $details),
            $status ? "Hash functions working" : "Some hash functions failed"
        );
    }

    /**
     * Test OpenSSL extension
     */
    private function testOpenSSL()
    {
        $status = extension_loaded('openssl');
        $details = '';

        if ($status) {
            $details = "OpenSSL extension available";

            // Test basic OpenSSL functions
            if (function_exists('openssl_random_pseudo_bytes')) {
                $random = openssl_random_pseudo_bytes(16);
                if ($random === false) {
                    $details .= ", but random bytes generation failed";
                }
            }
        } else {
            $details = "OpenSSL extension not loaded";
        }

        $this->addTest(
            'OpenSSL Extension',
            $status,
            $details,
            $status ? "OpenSSL extension available" : "OpenSSL extension not available"
        );
    }

    /**
     * Test memory usage
     */
    private function testMemoryUsage()
    {
        $initialMemory = memory_get_usage();

        // Create some data to use memory
        $data = [];
        for ($i = 0; $i < 1000; $i++) {
            $data[] = str_repeat('test', 100);
        }

        $peakMemory = memory_get_peak_usage();
        $finalMemory = memory_get_usage();

        $status = $peakMemory > $initialMemory;
        $details = "Initial: " . $this->formatBytes($initialMemory) .
            ", Peak: " . $this->formatBytes($peakMemory) .
            ", Final: " . $this->formatBytes($finalMemory);

        $this->addTest(
            'Memory Usage',
            $status,
            $details,
            $status ? "Memory functions working" : "Memory functions failed"
        );
    }

    /**
     * Test execution time
     */
    private function testExecutionTime()
    {
        $startTime = microtime(true);

        // Perform some operations
        $result = 0;
        for ($i = 0; $i < 100000; $i++) {
            $result += $i;
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $status = $executionTime > 0 && $executionTime < 10; // Should be less than 10 seconds
        $details = "Execution time: " . number_format($executionTime, 4) . " seconds";

        $this->addTest(
            'Execution Time',
            $status,
            $details,
            $status ? "Execution time reasonable" : "Execution time too slow or too fast"
        );
    }

    /**
     * Add test result
     */
    private function addTest($name, $status, $details, $message)
    {
        $this->tests[] = [
            'name' => $name,
            'status' => $status,
            'details' => $details,
            'message' => $message
        ];

        if ($status) {
            $this->passed++;
        } else {
            $this->failed++;
        }
    }

    /**
     * Display test results
     */
    private function displayResults()
    {
        echo "<h2>Test Results</h2>";
        echo "<table>";
        echo "<thead><tr><th>Test</th><th>Status</th><th>Details</th><th>Message</th></tr></thead>";
        echo "<tbody>";

        foreach ($this->tests as $test) {
            $statusClass = $test['status'] ? 'status-pass' : 'status-fail';
            $statusText = $test['status'] ? '✓ PASS' : '✗ FAIL';

            echo "<tr>";
            echo "<td>" . htmlspecialchars($test['name']) . "</td>";
            echo "<td><span class='$statusClass'>$statusText</span></td>";
            echo "<td class='description'>" . htmlspecialchars($test['details']) . "</td>";
            echo "<td class='description'>" . htmlspecialchars($test['message']) . "</td>";
            echo "</tr>";
        }

        echo "</tbody></table>";

        // Update summary counts
        echo "<script>
            document.getElementById('passed-count').textContent = '$this->passed';
            document.getElementById('warnings-count').textContent = '$this->warnings';
            document.getElementById('failed-count').textContent = '$this->failed';
        </script>";

        // Show final message
        if ($this->failed === 0) {
            echo "<div class='success-box'>
                <h3>✓ Installation Verification Complete!</h3>
                <p>All tests passed successfully. Your PHP installation is working correctly.</p>
            </div>";
        } else {
            echo "<div class='error-box'>
                <h3>⚠ Installation Issues Detected</h3>
                <p>Some tests failed. Please review the results above and check your PHP installation.</p>
                <p>Refer to the <a href='troubleshooting_guide.md'>troubleshooting guide</a> for help resolving issues.</p>
            </div>";
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Run the tests
new PostInstallationTest();
?>