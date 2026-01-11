<?php
/**
 * System Health Check and Monitoring Dashboard
 * 
 * Comprehensive health monitoring system that checks all components
 * of the Exam Seat Allocation Management System and provides real-time
 * monitoring capabilities.
 * 
 * @package ExamSeatAllocation
 * @author Monitoring Team
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/errors.php';
require_once __DIR__ . '/../lib/security.php';
require_once __DIR__ . '/../models/ClassModel.php';
require_once __DIR__ . '/../models/RoomModel.php';
require_once __DIR__ . '/../models/AllocationModel.php';

class HealthCheck {
    private $database;
    private $config;
    private $healthMetrics;
    private $systemStatus;
    
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->healthMetrics = [];
        $this->systemStatus = [
            'overall_status' => 'unknown',
            'last_check' => date('Y-m-d H:i:s'),
            'components' => [],
            'alerts' => [],
            'recommendations' => []
        ];
        
        // Initialize error handling for health checks
        ErrorHandler::init([
            'log_file' => __DIR__ . '/../logs/health_check.log',
            'log_level' => 'INFO',
            'enable_logging' => true,
            'display_errors' => false
        ]);
    }
    
    /**
     * Run comprehensive health check
     * 
     * @return array Health check results
     */
    public function runHealthCheck() {
        echo "=== System Health Check ===\n";
        echo "Checking system components...\n\n";
        
        $this->checkSystemRequirements();
        $this->checkDatabaseHealth();
        $this->checkApplicationHealth();
        $this->checkSecurityHealth();
        $this->checkPerformanceHealth();
        $this->checkDataIntegrity();
        $this->checkFileSystemHealth();
        $this->checkNetworkHealth();
        
        $this->calculateOverallStatus();
        $this->generateHealthReport();
        $this->generateMonitoringDashboard();
        
        return $this->systemStatus;
    }
    
    /**
     * Check system requirements
     */
    private function checkSystemRequirements() {
        echo "1. Checking System Requirements\n";
        echo "================================\n";
        
        $component = 'System Requirements';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check PHP version
        $phpVersion = phpversion();
        $requiredVersion = '7.4';
        $phpStatus = version_compare($phpVersion, $requiredVersion, '>=');
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'PHP Version',
            'status' => $phpStatus ? 'pass' : 'fail',
            'value' => $phpVersion,
            'required' => $requiredVersion
        ];
        
        if (!$phpStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "PHP version {$phpVersion} is below recommended version {$requiredVersion}"
            ];
        }
        
        // Check required extensions
        $requiredExtensions = ['pdo', 'pdo_mysql', 'session', 'openssl', 'json', 'mbstring'];
        $missingExtensions = [];
        
        foreach ($requiredExtensions as $extension) {
            if (!extension_loaded($extension)) {
                $missingExtensions[] = $extension;
            }
        }
        
        $extensionsStatus = empty($missingExtensions);
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Required Extensions',
            'status' => $extensionsStatus ? 'pass' : 'fail',
            'value' => count($requiredExtensions) - count($missingExtensions),
            'required' => count($requiredExtensions)
        ];
        
        if (!$extensionsStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => "Missing required extensions: " . implode(', ', $missingExtensions)
            ];
        }
        
        // Check memory limit
        $memoryLimit = ini_get('memory_limit');
        $memoryBytes = $this->convertToBytes($memoryLimit);
        $minMemory = 128 * 1024 * 1024; // 128MB
        
        $memoryStatus = $memoryBytes >= $minMemory;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Memory Limit',
            'status' => $memoryStatus ? 'pass' : 'warning',
            'value' => $memoryLimit,
            'required' => '128M'
        ];
        
        if (!$memoryStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "Memory limit {$memoryLimit} is below recommended 128M"
            ];
        }
        
        echo "System requirements check completed.\n\n";
    }
    
    /**
     * Check database health
     */
    private function checkDatabaseHealth() {
        echo "2. Checking Database Health\n";
        echo "===========================\n";
        
        $component = 'Database';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check database connection
        $conn = $this->database->getConnection();
        $dbStatus = $conn !== null;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Database Connection',
            'status' => $dbStatus ? 'pass' : 'critical',
            'value' => $dbStatus ? 'Connected' : 'Failed'
        ];
        
        if (!$dbStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Database connection failed'
            ];
            return;
        }
        
        // Check table integrity
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
        
        $tablesStatus = empty($missingTables);
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Table Integrity',
            'status' => $tablesStatus ? 'pass' : 'critical',
            'value' => count($tables) - count($missingTables),
            'required' => count($tables)
        ];
        
        if (!$tablesStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => "Missing tables: " . implode(', ', $missingTables)
            ];
        }
        
        // Check data consistency
        try {
            $classCount = $conn->query("SELECT COUNT(*) FROM classes WHERE is_active = 1")->fetchColumn();
            $roomCount = $conn->query("SELECT COUNT(*) FROM rooms WHERE is_active = 1")->fetchColumn();
            $allocationCount = $conn->query("SELECT COUNT(*) FROM allocations")->fetchColumn();
            
            $this->systemStatus['components'][$component]['details'] = [
                'total_classes' => $classCount,
                'total_rooms' => $roomCount,
                'total_allocations' => $allocationCount
            ];
            
            $dataStatus = $classCount > 0 && $roomCount > 0;
            
            $this->systemStatus['components'][$component]['checks'][] = [
                'name' => 'Data Consistency',
                'status' => $dataStatus ? 'pass' : 'warning',
                'value' => "Classes: {$classCount}, Rooms: {$roomCount}"
            ];
            
            if (!$dataStatus) {
                $this->systemStatus['components'][$component]['status'] = 'warning';
                $this->systemStatus['alerts'][] = [
                    'type' => 'warning',
                    'component' => $component,
                    'message' => 'No active classes or rooms found'
                ];
            }
        } catch (Exception $e) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Database query failed: ' . $e->getMessage()
            ];
        }
        
        echo "Database health check completed.\n\n";
    }
    
    /**
     * Check application health
     */
    private function checkApplicationHealth() {
        echo "3. Checking Application Health\n";
        echo "==============================\n";
        
        $component = 'Application';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check model instantiation
        try {
            $classModel = new ClassModel($this->database);
            $roomModel = new RoomModel($this->database);
            $allocationModel = new AllocationModel($this->database);
            
            $modelsStatus = true;
        } catch (Exception $e) {
            $modelsStatus = false;
        }
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Model Instantiation',
            'status' => $modelsStatus ? 'pass' : 'critical',
            'value' => $modelsStatus ? 'All models loaded' : 'Model loading failed'
        ];
        
        if (!$modelsStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Failed to instantiate models'
            ];
        }
        
        // Check service instantiation
        try {
            require_once __DIR__ . '/../services/AllocationService.php';
            $service = new AllocationService();
            
            $serviceStatus = true;
        } catch (Exception $e) {
            $serviceStatus = false;
        }
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Service Instantiation',
            'status' => $serviceStatus ? 'pass' : 'critical',
            'value' => $serviceStatus ? 'Service loaded' : 'Service loading failed'
        ];
        
        if (!$serviceStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Failed to instantiate allocation service'
            ];
        }
        
        // Check configuration
        $configStatus = !empty($this->config) && 
                       isset($this->config['database']) && 
                       isset($this->config['allocation_rules']);
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Configuration',
            'status' => $configStatus ? 'pass' : 'critical',
            'value' => $configStatus ? 'Configuration loaded' : 'Configuration missing'
        ];
        
        if (!$configStatus) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Configuration file is missing or invalid'
            ];
        }
        
        echo "Application health check completed.\n\n";
    }
    
    /**
     * Check security health
     */
    private function checkSecurityHealth() {
        echo "4. Checking Security Health\n";
        echo "===========================\n";
        
        $component = 'Security';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check session security
        session_start();
        $sessionStatus = validate_session_security();
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Session Security',
            'status' => $sessionStatus ? 'pass' : 'warning',
            'value' => $sessionStatus ? 'Secure' : 'Insecure'
        ];
        
        if (!$sessionStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => 'Session security validation failed'
            ];
        }
        
        // Check CSRF protection
        $csrfToken = generate_csrf_token();
        $csrfStatus = !empty($csrfToken) && strlen($csrfToken) >= 32;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'CSRF Protection',
            'status' => $csrfStatus ? 'pass' : 'warning',
            'value' => $csrfStatus ? 'Active' : 'Inactive'
        ];
        
        if (!$csrfStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => 'CSRF protection is not working properly'
            ];
        }
        
        // Check file permissions
        $directories = [
            __DIR__ . '/../logs',
            __DIR__ . '/../uploads',
            __DIR__ . '/../downloads'
        ];
        
        $permissionsStatus = true;
        $permissionIssues = [];
        
        foreach ($directories as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
            
            if (!is_writable($dir)) {
                $permissionsStatus = false;
                $permissionIssues[] = $dir;
            }
        }
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'File Permissions',
            'status' => $permissionsStatus ? 'pass' : 'warning',
            'value' => $permissionsStatus ? 'Correct' : 'Incorrect'
        ];
        
        if (!$permissionsStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "Incorrect permissions on: " . implode(', ', $permissionIssues)
            ];
        }
        
        echo "Security health check completed.\n\n";
    }
    
    /**
     * Check performance health
     */
    private function checkPerformanceHealth() {
        echo "5. Checking Performance Health\n";
        echo "==============================\n";
        
        $component = 'Performance';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check memory usage
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = $this->convertToBytes(ini_get('memory_limit'));
        $memoryUsagePercent = ($memoryUsage / $memoryLimit) * 100;
        
        $memoryStatus = $memoryUsagePercent < 80;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Memory Usage',
            'status' => $memoryStatus ? 'pass' : 'warning',
            'value' => number_format($memoryUsagePercent, 1) . '%',
            'required' => '< 80%'
        ];
        
        if (!$memoryStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "High memory usage: {$memoryUsagePercent}%"
            ];
        }
        
        // Check execution time
        $startTime = microtime(true);
        
        // Simulate a simple operation
        $classModel = new ClassModel($this->database);
        $classes = $classModel->getEligibleClasses();
        
        $executionTime = microtime(true) - $startTime;
        
        $timeStatus = $executionTime < 5.0;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Execution Time',
            'status' => $timeStatus ? 'pass' : 'warning',
            'value' => number_format($executionTime, 3) . 's',
            'required' => '< 5s'
        ];
        
        if (!$timeStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "Slow execution time: {$executionTime}s"
            ];
        }
        
        // Check database query performance
        $queryStartTime = microtime(true);
        
        try {
            $stmt = $this->database->getConnection()->query("SELECT COUNT(*) FROM classes");
            $stmt->fetch();
            
            $queryTime = microtime(true) - $queryStartTime;
            $queryStatus = $queryTime < 1.0;
        } catch (Exception $e) {
            $queryStatus = false;
        }
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Database Query Performance',
            'status' => $queryStatus ? 'pass' : 'warning',
            'value' => isset($queryTime) ? number_format($queryTime, 3) . 's' : 'Failed',
            'required' => '< 1s'
        ];
        
        if (!$queryStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => 'Database query performance is slow'
            ];
        }
        
        echo "Performance health check completed.\n\n";
    }
    
    /**
     * Check data integrity
     */
    private function checkDataIntegrity() {
        echo "6. Checking Data Integrity\n";
        echo "==========================\n";
        
        $component = 'Data Integrity';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        try {
            $conn = $this->database->getConnection();
            
            // Check for orphaned records
            $orphanedAllocations = $conn->query("
                SELECT COUNT(*) FROM allocations a 
                LEFT JOIN classes c ON a.class_id = c.class_id 
                WHERE c.class_id IS NULL
            ")->fetchColumn();
            
            $orphanedStatus = $orphanedAllocations == 0;
            
            $this->systemStatus['components'][$component]['checks'][] = [
                'name' => 'Orphaned Records',
                'status' => $orphanedStatus ? 'pass' : 'warning',
                'value' => $orphanedAllocations,
                'required' => '0'
            ];
            
            if (!$orphanedStatus) {
                $this->systemStatus['components'][$component]['status'] = 'warning';
                $this->systemStatus['alerts'][] = [
                    'type' => 'warning',
                    'component' => $component,
                    'message' => "Found {$orphanedAllocations} orphaned allocation records"
                ];
            }
            
            // Check data consistency
            $inconsistentData = 0;
            
            // Check for classes with negative strength
            $negativeStrength = $conn->query("SELECT COUNT(*) FROM classes WHERE total_students < 0")->fetchColumn();
            if ($negativeStrength > 0) {
                $inconsistentData += $negativeStrength;
            }
            
            // Check for rooms with negative capacity
            $negativeCapacity = $conn->query("SELECT COUNT(*) FROM rooms WHERE capacity < 0")->fetchColumn();
            if ($negativeCapacity > 0) {
                $inconsistentData += $negativeCapacity;
            }
            
            $consistencyStatus = $inconsistentData == 0;
            
            $this->systemStatus['components'][$component]['checks'][] = [
                'name' => 'Data Consistency',
                'status' => $consistencyStatus ? 'pass' : 'warning',
                'value' => $inconsistentData,
                'required' => '0'
            ];
            
            if (!$consistencyStatus) {
                $this->systemStatus['components'][$component]['status'] = 'warning';
                $this->systemStatus['alerts'][] = [
                    'type' => 'warning',
                    'component' => $component,
                    'message' => "Found {$inconsistentData} inconsistent data records"
                ];
            }
        } catch (Exception $e) {
            $this->systemStatus['components'][$component]['status'] = 'critical';
            $this->systemStatus['alerts'][] = [
                'type' => 'critical',
                'component' => $component,
                'message' => 'Data integrity check failed: ' . $e->getMessage()
            ];
        }
        
        echo "Data integrity check completed.\n\n";
    }
    
    /**
     * Check file system health
     */
    private function checkFileSystemHealth() {
        echo "7. Checking File System Health\n";
        echo "==============================\n";
        
        $component = 'File System';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check disk space
        $diskFree = disk_free_space(__DIR__);
        $diskTotal = disk_total_space(__DIR__);
        $diskUsagePercent = (($diskTotal - $diskFree) / $diskTotal) * 100;
        
        $diskStatus = $diskUsagePercent < 90;
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Disk Space',
            'status' => $diskStatus ? 'pass' : 'warning',
            'value' => number_format($diskUsagePercent, 1) . '%',
            'required' => '< 90%'
        ];
        
        if (!$diskStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => "Disk usage is high: {$diskUsagePercent}%"
            ];
        }
        
        // Check log file size
        $logFile = __DIR__ . '/../logs/health_check.log';
        if (file_exists($logFile)) {
            $logSize = filesize($logFile);
            $logSizeMB = $logSize / (1024 * 1024);
            
            $logStatus = $logSizeMB < 100; // 100MB limit
            
            $this->systemStatus['components'][$component]['checks'][] = [
                'name' => 'Log File Size',
                'status' => $logStatus ? 'pass' : 'warning',
                'value' => number_format($logSizeMB, 2) . 'MB',
                'required' => '< 100MB'
            ];
            
            if (!$logStatus) {
                $this->systemStatus['components'][$component]['status'] = 'warning';
                $this->systemStatus['alerts'][] = [
                    'type' => 'warning',
                    'component' => $component,
                    'message' => "Log file is large: {$logSizeMB}MB"
                ];
            }
        }
        
        echo "File system health check completed.\n\n";
    }
    
    /**
     * Check network health
     */
    private function checkNetworkHealth() {
        echo "8. Checking Network Health\n";
        echo "==========================\n";
        
        $component = 'Network';
        $this->systemStatus['components'][$component] = [
            'status' => 'healthy',
            'checks' => [],
            'details' => []
        ];
        
        // Check if external connections are possible (basic check)
        $networkStatus = true;
        $networkError = '';
        
        try {
            // Try to connect to a common DNS server
            $connection = @fsockopen('8.8.8.8', 53, $errno, $errstr, 5);
            if ($connection) {
                fclose($connection);
            } else {
                $networkStatus = false;
                $networkError = "Cannot connect to external network";
            }
        } catch (Exception $e) {
            $networkStatus = false;
            $networkError = $e->getMessage();
        }
        
        $this->systemStatus['components'][$component]['checks'][] = [
            'name' => 'Network Connectivity',
            'status' => $networkStatus ? 'pass' : 'warning',
            'value' => $networkStatus ? 'Connected' : 'Failed'
        ];
        
        if (!$networkStatus) {
            $this->systemStatus['components'][$component]['status'] = 'warning';
            $this->systemStatus['alerts'][] = [
                'type' => 'warning',
                'component' => $component,
                'message' => $networkError
            ];
        }
        
        echo "Network health check completed.\n\n";
    }
    
    /**
     * Calculate overall system status
     */
    private function calculateOverallStatus() {
        $criticalComponents = 0;
        $warningComponents = 0;
        $healthyComponents = 0;
        
        foreach ($this->systemStatus['components'] as $component) {
            if ($component['status'] === 'critical') {
                $criticalComponents++;
            } elseif ($component['status'] === 'warning') {
                $warningComponents++;
            } else {
                $healthyComponents++;
            }
        }
        
        if ($criticalComponents > 0) {
            $this->systemStatus['overall_status'] = 'critical';
        } elseif ($warningComponents > 0) {
            $this->systemStatus['overall_status'] = 'warning';
        } else {
            $this->systemStatus['overall_status'] = 'healthy';
        }
        
        // Generate recommendations
        $this->generateRecommendations();
    }
    
    /**
     * Generate system recommendations
     */
    private function generateRecommendations() {
        foreach ($this->systemStatus['alerts'] as $alert) {
            if ($alert['type'] === 'critical') {
                $this->systemStatus['recommendations'][] = "URGENT: " . $alert['message'];
            } elseif ($alert['type'] === 'warning') {
                $this->systemStatus['recommendations'][] = "RECOMMENDED: " . $alert['message'];
            }
        }
        
        if (empty($this->systemStatus['recommendations'])) {
            $this->systemStatus['recommendations'][] = "System is healthy. Continue monitoring.";
        }
    }
    
    /**
     * Generate health check report
     */
    private function generateHealthReport() {
        $reportPath = __DIR__ . '/health_check_report.html';
        $html = $this->generateHealthHTMLReport();
        file_put_contents($reportPath, $html);
        
        echo "=== Health Check Summary ===\n";
        echo "Overall Status: {$this->systemStatus['overall_status']}\n";
        echo "Last Check: {$this->systemStatus['last_check']}\n";
        echo "Alerts: " . count($this->systemStatus['alerts']) . "\n";
        echo "Recommendations: " . count($this->systemStatus['recommendations']) . "\n";
        echo "Report generated: {$reportPath}\n\n";
    }
    
    /**
     * Generate HTML health check report
     */
    private function generateHealthHTMLReport() {
        $statusColor = $this->systemStatus['overall_status'] === 'healthy' ? '#28a745' : 
                      ($this->systemStatus['overall_status'] === 'warning' ? '#ffc107' : '#dc3545');
        
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Health Check Report - Exam Seat Allocation System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid {$statusColor}; padding-bottom: 20px; margin-bottom: 30px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background-color: {$statusColor}; font-weight: bold; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid {$statusColor}; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: {$statusColor}; }
        .components { margin-bottom: 30px; }
        .component { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .component-header { padding: 15px; font-weight: bold; }
        .component-header.healthy { background: #d4edda; color: #155724; }
        .component-header.warning { background: #fff3cd; color: #856404; }
        .component-header.critical { background: #f8d7da; color: #721c24; }
        .component-body { padding: 15px; }
        .check-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .check-item:last-child { border-bottom: none; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .alerts { background: #fff5f5; border: 1px solid #ffcdd2; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .recommendations { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Exam Seat Allocation Management System</h1>
            <h2>System Health Check Report</h2>
            <p><strong>Status:</strong> <span class="status-badge">{$this->systemStatus['overall_status']}</span></p>
            <p><strong>Generated:</strong> {$this->systemStatus['last_check']}</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Overall Status</h3>
                <div class="value" style="color: {$statusColor}; text-transform: uppercase;">{$this->systemStatus['overall_status']}</div>
            </div>
            <div class="card">
                <h3>Components Checked</h3>
                <div class="value">" . count($this->systemStatus['components']) . "</div>
            </div>
            <div class="card">
                <h3>Alerts</h3>
                <div class="value" style="color: #dc3545;">" . count($this->systemStatus['alerts']) . "</div>
            </div>
            <div class="card">
                <h3>Recommendations</h3>
                <div class="value" style="color: #ffc107;">" . count($this->systemStatus['recommendations']) . "</div>
            </div>
        </div>
        
        <div class="components">
HTML;

        foreach ($this->systemStatus['components'] as $name => $component) {
            $headerClass = $component['status'];
            
            $html .= <<<HTML
            <div class="component">
                <div class="component-header {$headerClass}">
                    {$name} ({$component['status']})
                </div>
                <div class="component-body">
HTML;

            foreach ($component['checks'] as $check) {
                $statusClass = $check['status'] === 'pass' ? 'status-pass' : 
                              ($check['status'] === 'warning' ? 'status-warning' : 'status-fail');
                $statusText = $check['status'] === 'pass' ? '✓ PASS' : 
                             ($check['status'] === 'warning' ? '⚠ WARNING' : '✗ FAIL');
                
                $html .= <<<HTML
                    <div class="check-item">
                        <span>{$check['name']}</span>
                        <span class="{$statusClass}">{$statusText}</span>
                    </div>
HTML;
            }

            $html .= "</div></div>";
        }

        if (!empty($this->systemStatus['alerts'])) {
            $html .= <<<HTML
            <div class="alerts">
                <h3>System Alerts</h3>
HTML;

            foreach ($this->systemStatus['alerts'] as $alert) {
                $html .= <<<HTML
                <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                    <strong>{$alert['type']}:</strong> {$alert['message']}
                </div>
HTML;
            }

            $html .= "</div>";
        }

        if (!empty($this->systemStatus['recommendations'])) {
            $html .= <<<HTML
            <div class="recommendations">
                <h3>Recommendations</h3>
HTML;

            foreach ($this->systemStatus['recommendations'] as $recommendation) {
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
            <p>System health check completed successfully. Monitor the system regularly for optimal performance.</p>
            <p>For detailed logs, check the logs directory.</p>
        </div>
    </div>
</body>
</html>
HTML;

        return $html;
    }
    
    /**
     * Generate monitoring dashboard
     */
    private function generateMonitoringDashboard() {
        $dashboardPath = __DIR__ . '/monitoring_dashboard.html';
        $html = $this->generateMonitoringHTML();
        file_put_contents($dashboardPath, $html);
        
        echo "Monitoring dashboard generated: {$dashboardPath}\n";
    }
    
    /**
     * Generate HTML monitoring dashboard
     */
    private function generateMonitoringHTML() {
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Monitoring Dashboard - Exam Seat Allocation System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .dashboard-header { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 10px; }
        .status-healthy { background-color: #28a745; }
        .status-warning { background-color: #ffc107; }
        .status-critical { background-color: #dc3545; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
        .metric:last-child { border-bottom: none; }
        .value { font-weight: bold; font-size: 18px; }
        .chart-container { width: 100%; height: 300px; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard-header">
        <h1>System Monitoring Dashboard</h1>
        <p>Real-time monitoring of Exam Seat Allocation Management System</p>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span class="status-indicator status-{$this->systemStatus['overall_status']}"></span>
            <span>System Status: <strong>{$this->systemStatus['overall_status']}</strong></span>
            <span style="margin-left: 20px; color: #666;">Last Updated: {$this->systemStatus['last_check']}</span>
            <button class="refresh-btn" onclick="location.reload()">Refresh</button>
        </div>
    </div>
    
    <div class="grid">
        <div class="card">
            <h3>System Overview</h3>
            <div class="metric">
                <span>Overall Status</span>
                <span class="value" style="color: {$this->getStatusColor($this->systemStatus['overall_status'])};">{$this->systemStatus['overall_status']}</span>
            </div>
            <div class="metric">
                <span>Components</span>
                <span class="value">" . count($this->systemStatus['components']) . "</span>
            </div>
            <div class="metric">
                <span>Alerts</span>
                <span class="value" style="color: #dc3545;">" . count($this->systemStatus['alerts']) . "</span>
            </div>
            <div class="metric">
                <span>Recommendations</span>
                <span class="value" style="color: #ffc107;">" . count($this->systemStatus['recommendations']) . "</span>
            </div>
        </div>
        
        <div class="card">
            <h3>Component Status</h3>
HTML;

        foreach ($this->systemStatus['components'] as $name => $component) {
            $statusColor = $this->getStatusColor($component['status']);
            $html .= <<<HTML
            <div class="metric">
                <span>{$name}</span>
                <span class="value" style="color: {$statusColor};">{$component['status']}</span>
            </div>
HTML;
        }

        $html .= <<<HTML
        </div>
        
        <div class="card">
            <h3>System Alerts</h3>
HTML;

        if (!empty($this->systemStatus['alerts'])) {
            foreach ($this->systemStatus['alerts'] as $alert) {
                $alertColor = $alert['type'] === 'critical' ? '#dc3545' : '#ffc107';
                $html .= <<<HTML
                <div style="margin-bottom: 10px; padding: 10px; background: #fff5f5; border-left: 4px solid {$alertColor}; border-radius: 3px;">
                    <strong style="color: {$alertColor};">{$alert['type']}:</strong> {$alert['message']}
                </div>
HTML;
            }
        } else {
            $html .= '<p style="color: #28a745;">No alerts - System is healthy!</p>';
        }

        $html .= <<<HTML
        </div>
        
        <div class="card">
            <h3>Recommendations</h3>
HTML;

        foreach ($this->systemStatus['recommendations'] as $recommendation) {
            $html .= <<<HTML
            <div style="margin-bottom: 10px; padding: 10px; background: #e7f3ff; border-left: 4px solid #007bff; border-radius: 3px;">
                {$recommendation}
            </div>
HTML;
        }

        $html .= <<<HTML
        </div>
    </div>
    
    <div style="margin-top: 20px;">
        <div class="card">
            <h3>System Metrics</h3>
            <div class="chart-container">
                <canvas id="systemChart"></canvas>
            </div>
        </div>
    </div>
    
    <script>
        // Create system status chart
        const ctx = document.getElementById('systemChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Healthy', 'Warning', 'Critical'],
                datasets: [{
                    data: [{$this->getHealthyCount()}, {$this->getWarningCount()}, {$this->getCriticalCount()}],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Auto-refresh every 30 seconds
        setTimeout(function() {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
HTML;

        return $html;
    }
    
    /**
     * Helper methods
     */
    private function convertToBytes($size) {
        $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
        $size = preg_replace('/[^0-9\.]/', '', $size);
        return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
    }
    
    private function getStatusColor($status) {
        return $status === 'healthy' ? '#28a745' : 
               ($status === 'warning' ? '#ffc107' : '#dc3545');
    }
    
    private function getHealthyCount() {
        $count = 0;
        foreach ($this->systemStatus['components'] as $component) {
            if ($component['status'] === 'healthy') {
                $count++;
            }
        }
        return $count;
    }
    
    private function getWarningCount() {
        $count = 0;
        foreach ($this->systemStatus['components'] as $component) {
            if ($component['status'] === 'warning') {
                $count++;
            }
        }
        return $count;
    }
    
    private function getCriticalCount() {
        $count = 0;
        foreach ($this->systemStatus['components'] as $component) {
            if ($component['status'] === 'critical') {
                $count++;
            }
        }
        return $count;
    }
}

// Run health check if this file is executed directly
if (basename(__FILE__) === 'health_check.php') {
    $healthCheck = new HealthCheck();
    $results = $healthCheck->runHealthCheck();
    
    exit($results['overall_status'] === 'critical' ? 1 : 0);
}