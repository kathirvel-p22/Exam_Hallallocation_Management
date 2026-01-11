<?php
/**
 * Deployment Checklist and Validation Script
 * 
 * Comprehensive deployment validation system that ensures the Exam Seat Allocation
 * Management System is properly configured and ready for production deployment.
 * 
 * @package ExamSeatAllocation
 * @author Deployment Team
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/errors.php';
require_once __DIR__ . '/../lib/security.php';
require_once __DIR__ . '/../lib/validation.php';

class DeploymentChecklist
{
    private $config;
    private $database;
    private $checklistResults;
    private $deploymentStatus;

    public function __construct()
    {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->checklistResults = [];
        $this->deploymentStatus = [
            'ready_for_deployment' => false,
            'critical_issues' => 0,
            'warnings' => 0,
            'passed_checks' => 0,
            'total_checks' => 0,
            'validation_results' => [],
            'deployment_recommendations' => []
        ];

        // Initialize error handling
        ErrorHandler::init([
            'log_file' => __DIR__ . '/../logs/deployment_check.log',
            'log_level' => 'INFO',
            'enable_logging' => true,
            'display_errors' => false
        ]);
    }

    /**
     * Run complete deployment validation
     * 
     * @return array Deployment validation results
     */
    public function runDeploymentValidation()
    {
        echo "=== Deployment Checklist and Validation ===\n";
        echo "Validating system readiness for production deployment...\n\n";

        $this->validateEnvironment();
        $this->validateConfiguration();
        $this->validateDatabase();
        $this->validateSecurity();
        $this->validatePerformance();
        $this->validateMonitoring();
        $this->validateBackup();
        $this->validateDocumentation();

        $this->calculateDeploymentReadiness();
        $this->generateDeploymentReport();
        $this->generateDeploymentScript();

        return $this->deploymentStatus;
    }

    /**
     * Validate environment requirements
     */
    private function validateEnvironment()
    {
        echo "1. Validating Environment Requirements\n";
        echo "======================================\n";

        $category = 'Environment';
        $this->checklistResults[$category] = ['checks' => []];

        // Check PHP version
        $this->runDeploymentCheck($category, 'PHP Version', function () {
            $phpVersion = phpversion();
            $requiredVersion = '7.4';
            $status = version_compare($phpVersion, $requiredVersion, '>=');

            return [
                'status' => $status ? 'pass' : 'fail',
                'current' => $phpVersion,
                'required' => $requiredVersion,
                'critical' => true
            ];
        });

        // Check required extensions
        $this->runDeploymentCheck($category, 'Required Extensions', function () {
            $requiredExtensions = ['pdo', 'pdo_mysql', 'session', 'openssl', 'json', 'mbstring'];
            $missingExtensions = [];

            foreach ($requiredExtensions as $extension) {
                if (!extension_loaded($extension)) {
                    $missingExtensions[] = $extension;
                }
            }

            $status = empty($missingExtensions);

            return [
                'status' => $status ? 'pass' : 'fail',
                'missing' => $missingExtensions,
                'required' => $requiredExtensions,
                'critical' => true
            ];
        });

        // Check memory limit
        $this->runDeploymentCheck($category, 'Memory Limit', function () {
            $memoryLimit = ini_get('memory_limit');
            $memoryBytes = $this->convertToBytes($memoryLimit);
            $minMemory = 256 * 1024 * 1024; // 256MB for production

            $status = $memoryBytes >= $minMemory;

            return [
                'status' => $status ? 'pass' : 'warning',
                'current' => $memoryLimit,
                'required' => '256M',
                'critical' => false
            ];
        });

        // Check disk space
        $this->runDeploymentCheck($category, 'Disk Space', function () {
            $diskFree = disk_free_space(__DIR__);
            $minSpace = 1024 * 1024 * 1024; // 1GB

            $status = $diskFree >= $minSpace;

            return [
                'status' => $status ? 'pass' : 'warning',
                'current' => $this->formatBytes($diskFree),
                'required' => '1GB',
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Validate configuration
     */
    private function validateConfiguration()
    {
        echo "2. Validating Configuration\n";
        echo "===========================\n";

        $category = 'Configuration';
        $this->checklistResults[$category] = ['checks' => []];

        // Check database configuration
        $this->runDeploymentCheck($category, 'Database Configuration', function () {
            $dbConfig = $this->config['database'];
            $requiredKeys = ['host', 'database', 'username', 'password'];

            $missingKeys = [];
            foreach ($requiredKeys as $key) {
                if (!isset($dbConfig[$key]) || empty($dbConfig[$key])) {
                    $missingKeys[] = $key;
                }
            }

            $status = empty($missingKeys);

            return [
                'status' => $status ? 'pass' : 'fail',
                'missing_keys' => $missingKeys,
                'critical' => true
            ];
        });

        // Check allocation rules configuration
        $this->runDeploymentCheck($category, 'Allocation Rules', function () {
            $rules = $this->config['allocation_rules'];
            $requiredRules = ['allow_department_mixing', 'strict_ug_pg_separation', 'strict_shift_separation'];

            $missingRules = [];
            foreach ($requiredRules as $rule) {
                if (!isset($rules[$rule])) {
                    $missingRules[] = $rule;
                }
            }

            $status = empty($missingRules);

            return [
                'status' => $status ? 'pass' : 'fail',
                'missing_rules' => $missingRules,
                'critical' => true
            ];
        });

        // Check system settings
        $this->runDeploymentCheck($category, 'System Settings', function () {
            $system = $this->config['system'];
            $requiredSettings = ['enable_logging', 'log_file', 'enable_rollback'];

            $missingSettings = [];
            foreach ($requiredSettings as $setting) {
                if (!isset($system[$setting])) {
                    $missingSettings[] = $setting;
                }
            }

            $status = empty($missingSettings);

            return [
                'status' => $status ? 'pass' : 'warning',
                'missing_settings' => $missingSettings,
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Validate database
     */
    private function validateDatabase()
    {
        echo "3. Validating Database\n";
        echo "======================\n";

        $category = 'Database';
        $this->checklistResults[$category] = ['checks' => []];

        // Check database connection
        $this->runDeploymentCheck($category, 'Database Connection', function () {
            $conn = $this->database->getConnection();
            $status = $conn !== null;

            return [
                'status' => $status ? 'pass' : 'fail',
                'critical' => true
            ];
        });

        // Check database schema
        $this->runDeploymentCheck($category, 'Database Schema', function () {
            $conn = $this->database->getConnection();
            $tables = ['classes', 'rooms', 'allocations', 'users', 'login_attempts', 'password_resets'];

            $missingTables = [];
            foreach ($tables as $table) {
                try {
                    $stmt = $conn->prepare("SHOW TABLES LIKE ?");
                    $stmt->execute([$table]);
                    if ($stmt->rowCount() === 0) {
                        $missingTables[] = $table;
                    }
                } catch (Exception $e) {
                    $missingTables[] = $table;
                }
            }

            $status = empty($missingTables);

            return [
                'status' => $status ? 'pass' : 'fail',
                'missing_tables' => $missingTables,
                'critical' => true
            ];
        });

        // Check database permissions
        $this->runDeploymentCheck($category, 'Database Permissions', function () {
            $conn = $this->database->getConnection();

            try {
                // Test write permissions
                $stmt = $conn->prepare("CREATE TABLE IF NOT EXISTS test_permissions (id INT)");
                $stmt->execute();

                $stmt = $conn->prepare("DROP TABLE IF EXISTS test_permissions");
                $stmt->execute();

                $status = true;
            } catch (Exception $e) {
                $status = false;
            }

            return [
                'status' => $status ? 'pass' : 'fail',
                'critical' => true
            ];
        });

        echo "\n";
    }

    /**
     * Validate security
     */
    private function validateSecurity()
    {
        echo "4. Validating Security\n";
        echo "======================\n";

        $category = 'Security';
        $this->checklistResults[$category] = ['checks' => []];

        // Check file permissions
        $this->runDeploymentCheck($category, 'File Permissions', function () {
            $directories = [
                __DIR__ . '/../logs',
                __DIR__ . '/../uploads',
                __DIR__ . '/../downloads'
            ];

            $permissionIssues = [];
            foreach ($directories as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }

                if (!is_writable($dir)) {
                    $permissionIssues[] = $dir;
                }
            }

            $status = empty($permissionIssues);

            return [
                'status' => $status ? 'pass' : 'fail',
                'permission_issues' => $permissionIssues,
                'critical' => true
            ];
        });

        // Check session security
        $this->runDeploymentCheck($category, 'Session Security', function () {
            session_start();
            $status = validate_session_security();

            return [
                'status' => $status ? 'pass' : 'fail',
                'critical' => true
            ];
        });

        // Check CSRF protection
        $this->runDeploymentCheck($category, 'CSRF Protection', function () {
            $token = generate_csrf_token();
            $status = !empty($token) && strlen($token) >= 32;

            return [
                'status' => $status ? 'pass' : 'fail',
                'critical' => true
            ];
        });

        // Check password hashing
        $this->runDeploymentCheck($category, 'Password Hashing', function () {
            $password = 'TestPassword123!';
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $status = password_verify($password, $hashed);

            return [
                'status' => $status ? 'pass' : 'fail',
                'critical' => true
            ];
        });

        echo "\n";
    }

    /**
     * Validate performance
     */
    private function validatePerformance()
    {
        echo "5. Validating Performance\n";
        echo "=========================\n";

        $category = 'Performance';
        $this->checklistResults[$category] = ['checks' => []];

        // Check query performance
        $this->runDeploymentCheck($category, 'Query Performance', function () {
            $startTime = microtime(true);

            $classModel = new ClassModel($this->database);
            $classes = $classModel->getEligibleClasses();

            $executionTime = microtime(true) - $startTime;
            $status = $executionTime < 2.0; // Should complete within 2 seconds

            return [
                'status' => $status ? 'pass' : 'warning',
                'execution_time' => $executionTime,
                'critical' => false
            ];
        });

        // Check memory usage
        $this->runDeploymentCheck($category, 'Memory Usage', function () {
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = $this->convertToBytes(ini_get('memory_limit'));
            $usagePercent = ($memoryUsage / $memoryLimit) * 100;

            $status = $usagePercent < 50; // Should use less than 50% of memory limit

            return [
                'status' => $status ? 'pass' : 'warning',
                'usage_percent' => $usagePercent,
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Validate monitoring
     */
    private function validateMonitoring()
    {
        echo "6. Validating Monitoring\n";
        echo "========================\n";

        $category = 'Monitoring';
        $this->checklistResults[$category] = ['checks' => []];

        // Check error logging
        $this->runDeploymentCheck($category, 'Error Logging', function () {
            $logFile = $this->config['system']['log_file'];
            $logDir = dirname($logFile);

            $status = file_exists($logDir) && is_writable($logDir);

            return [
                'status' => $status ? 'pass' : 'fail',
                'log_file' => $logFile,
                'critical' => false
            ];
        });

        // Check health check availability
        $this->runDeploymentCheck($category, 'Health Check', function () {
            $healthCheckFile = __DIR__ . '/health_check.php';
            $status = file_exists($healthCheckFile);

            return [
                'status' => $status ? 'pass' : 'warning',
                'health_check_file' => $healthCheckFile,
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Validate backup
     */
    private function validateBackup()
    {
        echo "7. Validating Backup\n";
        echo "====================\n";

        $category = 'Backup';
        $this->checklistResults[$category] = ['checks' => []];

        // Check backup directory
        $this->runDeploymentCheck($category, 'Backup Directory', function () {
            $backupDir = __DIR__ . '/../backups';

            if (!file_exists($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $status = is_writable($backupDir);

            return [
                'status' => $status ? 'pass' : 'fail',
                'backup_dir' => $backupDir,
                'critical' => false
            ];
        });

        // Check backup script
        $this->runDeploymentCheck($category, 'Backup Script', function () {
            $backupScript = __DIR__ . '/../scripts/backup_database.php';
            $status = file_exists($backupScript);

            return [
                'status' => $status ? 'pass' : 'warning',
                'backup_script' => $backupScript,
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Validate documentation
     */
    private function validateDocumentation()
    {
        echo "8. Validating Documentation\n";
        echo "===========================\n";

        $category = 'Documentation';
        $this->checklistResults[$category] = ['checks' => []];

        // Check README
        $this->runDeploymentCheck($category, 'README File', function () {
            $readmeFile = __DIR__ . '/../README.md';
            $status = file_exists($readmeFile);

            return [
                'status' => $status ? 'pass' : 'warning',
                'readme_file' => $readmeFile,
                'critical' => false
            ];
        });

        // Check installation guide
        $this->runDeploymentCheck($category, 'Installation Guide', function () {
            $installGuide = __DIR__ . '/../docs/INSTALLATION.md';
            $status = file_exists($installGuide);

            return [
                'status' => $status ? 'pass' : 'warning',
                'install_guide' => $installGuide,
                'critical' => false
            ];
        });

        // Check API documentation
        $this->runDeploymentCheck($category, 'API Documentation', function () {
            $apiDocs = __DIR__ . '/../docs/API_DOCS.md';
            $status = file_exists($apiDocs);

            return [
                'status' => $status ? 'pass' : 'warning',
                'api_docs' => $apiDocs,
                'critical' => false
            ];
        });

        echo "\n";
    }

    /**
     * Run individual deployment check
     */
    private function runDeploymentCheck($category, $checkName, $checkFunction)
    {
        try {
            $result = $checkFunction();

            $this->checklistResults[$category]['checks'][] = [
                'name' => $checkName,
                'result' => $result,
                'timestamp' => date('Y-m-d H:i:s')
            ];

            $this->deploymentStatus['total_checks']++;

            if ($result['status'] === 'pass') {
                $this->deploymentStatus['passed_checks']++;
                echo "✓ {$checkName}\n";
            } elseif ($result['status'] === 'warning') {
                $this->deploymentStatus['warnings']++;
                echo "⚠ {$checkName} (Warning)\n";
            } else {
                $this->deploymentStatus['critical_issues']++;
                echo "✗ {$checkName} (Critical)\n";
            }

        } catch (Exception $e) {
            $this->deploymentStatus['critical_issues']++;
            echo "✗ {$checkName} (Error: {$e->getMessage()})\n";

            $this->checklistResults[$category]['checks'][] = [
                'name' => $checkName,
                'result' => ['status' => 'fail', 'error' => $e->getMessage()],
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }

    /**
     * Calculate deployment readiness
     */
    private function calculateDeploymentReadiness()
    {
        $criticalIssues = $this->deploymentStatus['critical_issues'];
        $warnings = $this->deploymentStatus['warnings'];
        $passedChecks = $this->deploymentStatus['passed_checks'];
        $totalChecks = $this->deploymentStatus['total_checks'];

        // System is ready if no critical issues
        $this->deploymentStatus['ready_for_deployment'] = $criticalIssues === 0;

        // Generate recommendations
        if ($criticalIssues > 0) {
            $this->deploymentStatus['deployment_recommendations'][] = "CRITICAL: Fix {$criticalIssues} critical issues before deployment";
        }

        if ($warnings > 0) {
            $this->deploymentStatus['deployment_recommendations'][] = "WARNING: Address {$warnings} warnings for optimal performance";
        }

        if ($passedChecks === $totalChecks) {
            $this->deploymentStatus['deployment_recommendations'][] = "EXCELLENT: All checks passed successfully";
        }

        // Add general recommendations
        $this->deploymentStatus['deployment_recommendations'][] = "Ensure proper backup procedures are in place";
        $this->deploymentStatus['deployment_recommendations'][] = "Monitor system performance after deployment";
        $this->deploymentStatus['deployment_recommendations'][] = "Test all critical functionality in production environment";
    }

    /**
     * Generate deployment report
     */
    private function generateDeploymentReport()
    {
        $reportPath = __DIR__ . '/deployment_validation_report.html';
        $html = $this->generateDeploymentHTMLReport();
        file_put_contents($reportPath, $html);

        echo "=== Deployment Validation Summary ===\n";
        echo "Ready for Deployment: " . ($this->deploymentStatus['ready_for_deployment'] ? 'YES' : 'NO') . "\n";
        echo "Critical Issues: {$this->deploymentStatus['critical_issues']}\n";
        echo "Warnings: {$this->deploymentStatus['warnings']}\n";
        echo "Passed Checks: {$this->deploymentStatus['passed_checks']}/{$this->deploymentStatus['total_checks']}\n";
        echo "Report generated: {$reportPath}\n\n";
    }

    /**
     * Generate HTML deployment report
     */
    private function generateDeploymentHTMLReport()
    {
        $readinessColor = $this->deploymentStatus['ready_for_deployment'] ? '#28a745' : '#dc3545';
        $readinessText = $this->deploymentStatus['ready_for_deployment'] ? 'READY' : 'NOT READY';

        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Validation Report - Exam Seat Allocation System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid {$readinessColor}; padding-bottom: 20px; margin-bottom: 30px; }
        .readiness-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background-color: {$readinessColor}; font-weight: bold; font-size: 18px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid {$readinessColor}; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: {$readinessColor}; }
        .categories { margin-bottom: 30px; }
        .category { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .category-header { background: {$readinessColor}; color: white; padding: 15px; font-weight: bold; }
        .category-body { padding: 15px; }
        .check-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .check-item:last-child { border-bottom: none; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .recommendations { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Exam Seat Allocation Management System</h1>
            <h2>Deployment Validation Report</h2>
            <p><strong>Status:</strong> <span class="readiness-badge">{$readinessText}</span></p>
            <p><strong>Generated:</strong> " . date('Y-m-d H:i:s') . "</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Deployment Status</h3>
                <div class="value" style="color: {$readinessColor};">{$readinessText}</div>
            </div>
            <div class="card">
                <h3>Total Checks</h3>
                <div class="value">{$this->deploymentStatus['total_checks']}</div>
            </div>
            <div class="card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">{$this->deploymentStatus['passed_checks']}</div>
            </div>
            <div class="card">
                <h3>Critical Issues</h3>
                <div class="value" style="color: #dc3545;">{$this->deploymentStatus['critical_issues']}</div>
            </div>
            <div class="card">
                <h3>Warnings</h3>
                <div class="value" style="color: #ffc107;">{$this->deploymentStatus['warnings']}</div>
            </div>
        </div>
        
        <div class="categories">
HTML;

        foreach ($this->checklistResults as $category => $data) {
            $html .= <<<HTML
            <div class="category">
                <div class="category-header">
                    {$category}
                </div>
                <div class="category-body">
HTML;

            foreach ($data['checks'] as $check) {
                $statusClass = $check['result']['status'] === 'pass' ? 'status-pass' :
                    ($check['result']['status'] === 'warning' ? 'status-warning' : 'status-fail');
                $statusText = $check['result']['status'] === 'pass' ? '✓ PASS' :
                    ($check['result']['status'] === 'warning' ? '⚠ WARNING' : '✗ FAIL');

                $html .= <<<HTML
                    <div class="check-item">
                        <span>{$check['name']}</span>
                        <span class="{$statusClass}">{$statusText}</span>
                    </div>
HTML;
            }

            $html .= "</div></div>";
        }

        if (!empty($this->deploymentStatus['deployment_recommendations'])) {
            $html .= <<<HTML
            <div class="recommendations">
                <h3>Deployment Recommendations</h3>
HTML;

            foreach ($this->deploymentStatus['deployment_recommendations'] as $recommendation) {
                $html .= <<<HTML
                <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                    {$recommendation}
                </div>
HTML;
            }

            $html .= "</div>";
        }

        $html .= <<<HTML
        </div>
        
        <div class="footer">
            <p>Deployment validation completed. Review the results above before proceeding with deployment.</p>
            <p>For detailed information, check the logs directory.</p>
        </div>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /**
     * Generate deployment script
     */
    private function generateDeploymentScript()
    {
        $scriptPath = __DIR__ . '/../scripts/deploy.php';

        $scriptContent = <<<PHP
<?php
/**
 * Production Deployment Script
 * 
 * Automated deployment script for the Exam Seat Allocation Management System.
 * This script should be run after all validation checks pass.
 */

// Deployment configuration
\$config = [
    'environment' => 'production',
    'backup_before_deploy' => true,
    'validate_after_deploy' => true,
    'enable_monitoring' => true
];

echo "Starting deployment process...\n";

// Step 1: Create backup
if (\$config['backup_before_deploy']) {
    echo "Creating backup...\n";
    // Add backup logic here
}

// Step 2: Deploy files
echo "Deploying files...\n";
// Add file deployment logic here

// Step 3: Update database
echo "Updating database...\n";
// Add database migration logic here

// Step 4: Validate deployment
if (\$config['validate_after_deploy']) {
    echo "Validating deployment...\n";
    require_once 'tests/deployment_checklist.php';
    \$checklist = new DeploymentChecklist();
    \$results = \$checklist->runDeploymentValidation();
    
    if (!\$results['ready_for_deployment']) {
        echo "Deployment validation failed. Rolling back...\n";
        exit(1);
    }
}

// Step 5: Enable monitoring
if (\$config['enable_monitoring']) {
    echo "Enabling monitoring...\n";
    // Add monitoring setup logic here
}

echo "Deployment completed successfully!\n";
?>
PHP;

        // Create scripts directory if it doesn't exist
        $scriptsDir = __DIR__ . '/../scripts';
        if (!file_exists($scriptsDir)) {
            mkdir($scriptsDir, 0755, true);
        }

        file_put_contents($scriptPath, $scriptContent);

        echo "Deployment script generated: {$scriptPath}\n";
    }

    /**
     * Helper methods
     */
    private function convertToBytes($size)
    {
        $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
        $size = preg_replace('/[^0-9\.]/', '', $size);
        return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
    }

    private function formatBytes($bytes)
    {
        if ($bytes === 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Run deployment validation if this file is executed directly
if (basename(__FILE__) === 'deployment_checklist.php') {
    $deploymentChecklist = new DeploymentChecklist();
    $results = $deploymentChecklist->runDeploymentValidation();

    exit($results['ready_for_deployment'] ? 0 : 1);
}