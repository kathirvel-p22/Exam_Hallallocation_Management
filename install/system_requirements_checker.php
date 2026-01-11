<?php
/**
 * PHP System Requirements Checker
 * 
 * This script checks if the current system meets the requirements for PHP development
 * on Windows. It validates PHP version, extensions, and system configuration.
 * 
 * @author PHP Installation Guide
 * @version 1.0
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

class SystemRequirementsChecker
{
    private $requirements = [];
    private $warnings = [];
    private $errors = [];

    public function __construct()
    {
        $this->checkPHPVersion();
        $this->checkExtensions();
        $this->checkSystemConfiguration();
        $this->checkWebServer();
        $this->checkDatabase();
        $this->checkFilePermissions();
    }

    /**
     * Check PHP version requirements
     */
    private function checkPHPVersion()
    {
        $phpVersion = phpversion();
        $requiredVersion = '7.4.0';

        $this->requirements[] = [
            'name' => 'PHP Version',
            'current' => $phpVersion,
            'required' => $requiredVersion,
            'status' => version_compare($phpVersion, $requiredVersion, '>='),
            'description' => 'PHP 7.4 or higher is recommended for modern development'
        ];
    }

    /**
     * Check required PHP extensions
     */
    private function checkExtensions()
    {
        $requiredExtensions = [
            'mysqli' => 'MySQL database connectivity',
            'pdo_mysql' => 'PDO MySQL driver',
            'json' => 'JSON support',
            'mbstring' => 'Multibyte string functions',
            'xml' => 'XML processing',
            'curl' => 'HTTP requests',
            'openssl' => 'SSL/TLS support',
            'gd' => 'Image processing',
            'zip' => 'ZIP archive support'
        ];

        foreach ($requiredExtensions as $extension => $description) {
            $isLoaded = extension_loaded($extension);
            $this->requirements[] = [
                'name' => "Extension: $extension",
                'current' => $isLoaded ? 'Loaded' : 'Not loaded',
                'required' => 'Required',
                'status' => $isLoaded,
                'description' => $description
            ];
        }

        // Check optional extensions
        $optionalExtensions = [
            'xdebug' => 'PHP debugging and profiling',
            'redis' => 'Redis caching support',
            'memcached' => 'Memcached caching support',
            'imagick' => 'Advanced image processing'
        ];

        foreach ($optionalExtensions as $extension => $description) {
            $isLoaded = extension_loaded($extension);
            if ($isLoaded) {
                $this->requirements[] = [
                    'name' => "Optional Extension: $extension",
                    'current' => 'Loaded',
                    'required' => 'Optional',
                    'status' => true,
                    'description' => $description
                ];
            } else {
                $this->warnings[] = [
                    'name' => "Optional Extension: $extension",
                    'message' => "Extension not loaded: $description"
                ];
            }
        }
    }

    /**
     * Check system configuration
     */
    private function checkSystemConfiguration()
    {
        // Check memory limit
        $memoryLimit = ini_get('memory_limit');
        $memoryLimitBytes = $this->convertToBytes($memoryLimit);
        $requiredMemory = 128 * 1024 * 1024; // 128MB

        $this->requirements[] = [
            'name' => 'Memory Limit',
            'current' => $memoryLimit,
            'required' => '128M',
            'status' => $memoryLimitBytes >= $requiredMemory,
            'description' => 'Minimum memory allocation for PHP scripts'
        ];

        // Check max execution time
        $maxExecutionTime = ini_get('max_execution_time');
        $requiredTime = 30;

        $this->requirements[] = [
            'name' => 'Max Execution Time',
            'current' => $maxExecutionTime . ' seconds',
            'required' => '30 seconds',
            'status' => $maxExecutionTime >= $requiredTime,
            'description' => 'Maximum time a script can run'
        ];

        // Check upload max file size
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $uploadMaxFilesizeBytes = $this->convertToBytes($uploadMaxFilesize);
        $requiredUploadSize = 2 * 1024 * 1024; // 2MB

        $this->requirements[] = [
            'name' => 'Upload Max Filesize',
            'current' => $uploadMaxFilesize,
            'required' => '2M',
            'status' => $uploadMaxFilesizeBytes >= $requiredUploadSize,
            'description' => 'Maximum file size for uploads'
        ];

        // Check post max size
        $postMaxSize = ini_get('post_max_size');
        $postMaxSizeBytes = $this->convertToBytes($postMaxSize);

        $this->requirements[] = [
            'name' => 'Post Max Size',
            'current' => $postMaxSize,
            'required' => '2M',
            'status' => $postMaxSizeBytes >= $requiredUploadSize,
            'description' => 'Maximum size for POST data'
        ];

        // Check safe mode (should be off)
        $safeMode = ini_get('safe_mode');
        if ($safeMode && $safeMode !== '0') {
            $this->warnings[] = [
                'name' => 'Safe Mode',
                'message' => 'Safe mode is deprecated and should be disabled'
            ];
        }

        // Check register globals (should be off)
        $registerGlobals = ini_get('register_globals');
        if ($registerGlobals && $registerGlobals !== '0') {
            $this->warnings[] = [
                'name' => 'Register Globals',
                'message' => 'Register globals is deprecated and should be disabled for security'
            ];
        }
    }

    /**
     * Check web server configuration
     */
    private function checkWebServer()
    {
        $serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
        $serverName = $_SERVER['SERVER_NAME'] ?? 'Unknown';

        // Check if running on localhost
        $isLocalhost = in_array($serverName, ['localhost', '127.0.0.1', '::1']);

        $this->requirements[] = [
            'name' => 'Web Server',
            'current' => $serverSoftware,
            'required' => 'Apache/Nginx/IIS',
            'status' => !empty($serverSoftware) && $serverSoftware !== 'Unknown',
            'description' => 'Web server software detected'
        ];

        $this->requirements[] = [
            'name' => 'Server Environment',
            'current' => $isLocalhost ? 'Local Development' : 'Production/Remote',
            'required' => 'Local Development (recommended for testing)',
            'status' => $isLocalhost,
            'description' => 'Running on localhost is recommended for development'
        ];
    }

    /**
     * Check database connectivity
     */
    private function checkDatabase()
    {
        // Check if MySQL is available
        $mysqlAvailable = function_exists('mysqli_connect') || function_exists('mysql_connect');

        $this->requirements[] = [
            'name' => 'MySQL Support',
            'current' => $mysqlAvailable ? 'Available' : 'Not Available',
            'required' => 'Available',
            'status' => $mysqlAvailable,
            'description' => 'MySQL database connectivity support'
        ];

        // Try to connect to MySQL if possible
        if ($mysqlAvailable) {
            $connection = @mysqli_connect('localhost', 'root', '');
            if ($connection) {
                $mysqlVersion = mysqli_get_server_info($connection);
                mysqli_close($connection);

                $this->requirements[] = [
                    'name' => 'MySQL Connection',
                    'current' => "Connected (v$mysqlVersion)",
                    'required' => 'Connected',
                    'status' => true,
                    'description' => 'Successfully connected to MySQL server'
                ];
            } else {
                $this->warnings[] = [
                    'name' => 'MySQL Connection',
                    'message' => 'Cannot connect to MySQL server. Check if MySQL is running and credentials are correct.'
                ];
            }
        }
    }

    /**
     * Check file permissions and directories
     */
    private function checkFilePermissions()
    {
        // Check if we can write to current directory
        $currentDir = getcwd();
        $canWrite = is_writable($currentDir);

        $this->requirements[] = [
            'name' => 'Current Directory Write Access',
            'current' => $canWrite ? 'Writable' : 'Not Writable',
            'required' => 'Writable',
            'status' => $canWrite,
            'description' => 'Current directory must be writable for file operations'
        ];

        // Check temporary directory
        $tempDir = sys_get_temp_dir();
        $tempDirWritable = is_writable($tempDir);

        $this->requirements[] = [
            'name' => 'Temporary Directory',
            'current' => $tempDir . ' (' . ($tempDirWritable ? 'Writable' : 'Not Writable') . ')',
            'required' => 'Writable',
            'status' => $tempDirWritable,
            'description' => 'System temporary directory for file operations'
        ];

        // Check if uploads directory exists and is writable (if it exists)
        $uploadsDir = $currentDir . DIRECTORY_SEPARATOR . 'uploads';
        if (file_exists($uploadsDir)) {
            $uploadsWritable = is_writable($uploadsDir);
            $this->requirements[] = [
                'name' => 'Uploads Directory',
                'current' => $uploadsDir . ' (' . ($uploadsWritable ? 'Writable' : 'Not Writable') . ')',
                'required' => 'Writable (if exists)',
                'status' => $uploadsWritable,
                'description' => 'Directory for file uploads'
            ];
        }
    }

    /**
     * Convert PHP memory size format to bytes
     */
    private function convertToBytes($size)
    {
        $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
        $size = preg_replace('/[^0-9]/', '', $size);
        return $size * pow(1024, stripos('bkmgtpezy', $unit[0]));
    }

    /**
     * Generate HTML report
     */
    public function generateReport()
    {
        ob_start();
        ?>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PHP System Requirements Check</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    color: #333;
                    border-bottom: 3px solid #007bff;
                    padding-bottom: 10px;
                }

                h2 {
                    color: #666;
                    margin-top: 30px;
                }

                .summary {
                    display: flex;
                    gap: 20px;
                    margin: 20px 0;
                }

                .summary-card {
                    flex: 1;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    color: white;
                }

                .summary-pass {
                    background-color: #28a745;
                }

                .summary-warn {
                    background-color: #ffc107;
                    color: #333;
                }

                .summary-fail {
                    background-color: #dc3545;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }

                .status-pass {
                    color: #28a745;
                    font-weight: bold;
                }

                .status-fail {
                    color: #dc3545;
                    font-weight: bold;
                }

                .status-warn {
                    color: #ffc107;
                    font-weight: bold;
                }

                .description {
                    font-size: 0.9em;
                    color: #666;
                }

                .warning-box {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }

                .error-box {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    color: #721c24;
                }

                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 0.9em;
                }
            </style>
        </head>

        <body>
            <div class="container">
                <h1>PHP System Requirements Check</h1>

                <div class="summary">
                    <div class="summary-card summary-pass">
                        <h3>Passed</h3>
                        <p><?php echo array_sum(array_column($this->requirements, 'status')); ?> /
                            <?php echo count($this->requirements); ?></p>
                    </div>
                    <div class="summary-card summary-warn">
                        <h3>Warnings</h3>
                        <p><?php echo count($this->warnings); ?></p>
                    </div>
                    <div class="summary-card summary-fail">
                        <h3>Errors</h3>
                        <p><?php echo count($this->errors); ?></p>
                    </div>
                </div>

                <h2>Requirements Check</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Current</th>
                            <th>Required</th>
                            <th>Status</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->requirements as $req): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($req['name']); ?></td>
                                <td><?php echo htmlspecialchars($req['current']); ?></td>
                                <td><?php echo htmlspecialchars($req['required']); ?></td>
                                <td>
                                    <?php if ($req['status']): ?>
                                        <span class="status-pass">✓ PASS</span>
                                    <?php else: ?>
                                        <span class="status-fail">✗ FAIL</span>
                                    <?php endif; ?>
                                </td>
                                <td class="description"><?php echo htmlspecialchars($req['description']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <?php if (!empty($this->warnings)): ?>
                    <h2>Warnings</h2>
                    <div class="warning-box">
                        <?php foreach ($this->warnings as $warning): ?>
                            <p><strong><?php echo htmlspecialchars($warning['name']); ?>:</strong>
                                <?php echo htmlspecialchars($warning['message']); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($this->errors)): ?>
                    <h2>Errors</h2>
                    <div class="error-box">
                        <?php foreach ($this->errors as $error): ?>
                            <p><strong><?php echo htmlspecialchars($error['name']); ?>:</strong>
                                <?php echo htmlspecialchars($error['message']); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <div class="footer">
                    <p><strong>Note:</strong> This checker validates basic PHP requirements for web development.
                        Some requirements may vary depending on your specific project needs.</p>
                    <p><strong>Generated:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
                </div>
            </div>
        </body>

        </html>
        <?php
        return ob_get_clean();
    }

    /**
     * Generate JSON report
     */
    public function generateJSONReport()
    {
        return json_encode([
            'timestamp' => date('Y-m-d H:i:s'),
            'requirements' => $this->requirements,
            'warnings' => $this->warnings,
            'errors' => $this->errors,
            'summary' => [
                'total' => count($this->requirements),
                'passed' => array_sum(array_column($this->requirements, 'status')),
                'warnings' => count($this->warnings),
                'errors' => count($this->errors)
            ]
        ], JSON_PRETTY_PRINT);
    }
}

// Run the checker
$checker = new SystemRequirementsChecker();

// Determine output format
$format = $_GET['format'] ?? 'html';

if ($format === 'json') {
    header('Content-Type: application/json');
    echo $checker->generateJSONReport();
} else {
    echo $checker->generateReport();
}
?>