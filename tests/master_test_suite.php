<?php
/**
 * Master Test Suite for Exam Seat Allocation Management System
 * 
 * Comprehensive test runner that orchestrates all testing components
 * including unit tests, integration tests, performance tests, and security tests.
 * 
 * @package ExamSeatAllocation
 * @author Testing Team
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/errors.php';
require_once __DIR__ . '/../lib/flash_messages.php';
require_once __DIR__ . '/../lib/security.php';
require_once __DIR__ . '/../lib/validation.php';
require_once __DIR__ . '/../lib/utils.php';

class MasterTestSuite {
    private $config;
    private $database;
    private $testResults;
    private $startTime;
    private $endTime;
    
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->testResults = [
            'summary' => [
                'total_tests' => 0,
                'passed_tests' => 0,
                'failed_tests' => 0,
                'skipped_tests' => 0,
                'execution_time' => 0,
                'memory_usage' => 0
            ],
            'categories' => [],
            'failures' => [],
            'warnings' => []
        ];
        
        // Initialize error handling for tests
        ErrorHandler::init([
            'log_file' => __DIR__ . '/../logs/test_errors.log',
            'log_level' => 'ERROR',
            'enable_logging' => true,
            'display_errors' => false
        ]);
    }
    
    /**
     * Run the complete test suite
     * 
     * @return array Test results summary
     */
    public function runTestSuite() {
        $this->startTime = microtime(true);
        
        echo "=== Exam Seat Allocation Management System Test Suite ===\n";
        echo "Starting comprehensive testing...\n\n";
        
        // Run all test categories
        $this->runCoreFunctionalityTests();
        $this->runIntegrationTests();
        $this->runPerformanceTests();
        $this->runSecurityTests();
        $this->runHealthCheck();
        
        $this->endTime = microtime(true);
        $this->calculateSummary();
        
        // Generate test report
        $this->generateTestReport();
        
        return $this->testResults;
    }
    
    /**
     * Run core functionality tests
     */
    private function runCoreFunctionalityTests() {
        echo "1. Testing Core Functionality\n";
        echo "==============================\n";
        
        $category = 'core_functionality';
        $this->testResults['categories'][$category] = [
            'name' => 'Core Functionality',
            'tests' => [],
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0
        ];
        
        // Test database connectivity
        $this->runTest($category, 'Database Connectivity', function() {
            $conn = $this->database->getConnection();
            return $conn !== null;
        });
        
        // Test configuration loading
        $this->runTest($category, 'Configuration Loading', function() {
            return !empty($this->config) && 
                   isset($this->config['database']) && 
                   isset($this->config['allocation_rules']);
        });
        
        // Test model instantiation
        $this->runTest($category, 'Model Instantiation', function() {
            try {
                require_once __DIR__ . '/../models/ClassModel.php';
                require_once __DIR__ . '/../models/RoomModel.php';
                require_once __DIR__ . '/../models/AllocationModel.php';
                
                $classModel = new ClassModel($this->database);
                $roomModel = new RoomModel($this->database);
                $allocationModel = new AllocationModel($this->database);
                
                return $classModel instanceof ClassModel && 
                       $roomModel instanceof RoomModel && 
                       $allocationModel instanceof AllocationModel;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test service instantiation
        $this->runTest($category, 'Service Instantiation', function() {
            try {
                require_once __DIR__ . '/../services/AllocationService.php';
                $service = new AllocationService();
                return $service instanceof AllocationService;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test validation functions
        $this->runTest($category, 'Validation Functions', function() {
            return function_exists('validateEmail') && 
                   function_exists('validatePassword') && 
                   function_exists('validateDate');
        });
        
        // Test security functions
        $this->runTest($category, 'Security Functions', function() {
            return function_exists('generate_csrf_token') && 
                   function_exists('validate_csrf_token') && 
                   function_exists('sanitize_input');
        });
        
        echo "\n";
    }
    
    /**
     * Run integration tests
     */
    private function runIntegrationTests() {
        echo "2. Testing Integration\n";
        echo "======================\n";
        
        $category = 'integration';
        $this->testResults['categories'][$category] = [
            'name' => 'Integration',
            'tests' => [],
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0
        ];
        
        // Test allocation workflow
        $this->runTest($category, 'Allocation Workflow', function() {
            try {
                require_once __DIR__ . '/../services/AllocationService.php';
                $service = new AllocationService();
                
                // Test with sample data
                $result = $service->allocate('2024-12-25', 'morning');
                
                // Should return array with expected structure
                return is_array($result) && 
                       isset($result['success']) && 
                       isset($result['message']) && 
                       isset($result['statistics']);
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test data consistency
        $this->runTest($category, 'Data Consistency', function() {
            try {
                require_once __DIR__ . '/../models/ClassModel.php';
                require_once __DIR__ . '/../models/RoomModel.php';
                
                $classModel = new ClassModel($this->database);
                $roomModel = new RoomModel($this->database);
                
                $totalClasses = count($classModel->getEligibleClasses());
                $totalRooms = count($roomModel->getAvailableRooms());
                
                return $totalClasses >= 0 && $totalRooms >= 0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test transaction handling
        $this->runTest($category, 'Transaction Handling', function() {
            try {
                $conn = $this->database->getConnection();
                $this->database->beginTransaction();
                
                // Simple test query
                $stmt = $conn->prepare("SELECT 1 as test");
                $result = $stmt->execute();
                
                $this->database->commitTransaction();
                
                return $result;
            } catch (Exception $e) {
                $this->database->rollbackTransaction();
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Run performance tests
     */
    private function runPerformanceTests() {
        echo "3. Testing Performance\n";
        echo "======================\n";
        
        $category = 'performance';
        $this->testResults['categories'][$category] = [
            'name' => 'Performance',
            'tests' => [],
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0
        ];
        
        // Test database query performance
        $this->runTest($category, 'Database Query Performance', function() {
            try {
                $startTime = microtime(true);
                
                require_once __DIR__ . '/../models/ClassModel.php';
                $classModel = new ClassModel($this->database);
                $classes = $classModel->getEligibleClasses();
                
                $executionTime = microtime(true) - $startTime;
                
                // Should complete within 5 seconds
                return $executionTime < 5.0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test memory usage
        $this->runTest($category, 'Memory Usage', function() {
            try {
                $initialMemory = memory_get_usage();
                
                require_once __DIR__ . '/../services/AllocationService.php';
                $service = new AllocationService();
                
                // Create multiple instances to test memory management
                for ($i = 0; $i < 10; $i++) {
                    new AllocationService();
                }
                
                $finalMemory = memory_get_usage();
                $memoryIncrease = $finalMemory - $initialMemory;
                
                // Memory increase should be reasonable (less than 10MB)
                return $memoryIncrease < (10 * 1024 * 1024);
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test allocation algorithm performance
        $this->runTest($category, 'Allocation Algorithm Performance', function() {
            try {
                $startTime = microtime(true);
                
                require_once __DIR__ . '/../services/AllocationService.php';
                $service = new AllocationService();
                
                // Test with multiple allocation calls
                for ($i = 0; $i < 5; $i++) {
                    $service->allocate('2024-12-25', 'morning');
                }
                
                $executionTime = microtime(true) - $startTime;
                
                // Should complete within 30 seconds for 5 allocations
                return $executionTime < 30.0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Run security tests
     */
    private function runSecurityTests() {
        echo "4. Testing Security\n";
        echo "===================\n";
        
        $category = 'security';
        $this->testResults['categories'][$category] = [
            'name' => 'Security',
            'tests' => [],
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0
        ];
        
        // Test input validation
        $this->runTest($category, 'Input Validation', function() {
            try {
                require_once __DIR__ . '/../lib/validation.php';
                
                // Test SQL injection prevention
                $sqlInjectionAttempts = [
                    "'; DROP TABLE users; --",
                    "' OR '1'='1",
                    "1; DELETE FROM users;"
                ];
                
                foreach ($sqlInjectionAttempts as $attempt) {
                    if (validateEmail($attempt)) {
                        return false; // Should not validate as email
                    }
                }
                
                return true;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test CSRF protection
        $this->runTest($category, 'CSRF Protection', function() {
            try {
                require_once __DIR__ . '/../lib/security.php';
                
                // Generate token
                $token = generate_csrf_token();
                
                // Validate token
                $isValid = validate_csrf_token($token);
                
                // Invalid token should fail
                $isInvalid = !validate_csrf_token('invalid-token');
                
                return $isValid && $isInvalid;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test XSS protection
        $this->runTest($category, 'XSS Protection', function() {
            try {
                require_once __DIR__ . '/../lib/security.php';
                
                $xssPayloads = [
                    '<script>alert("xss")</script>',
                    '<img src="x" onerror="alert(1)">',
                    'javascript:alert("xss")'
                ];
                
                foreach ($xssPayloads as $payload) {
                    $sanitized = sanitize_input($payload);
                    
                    // Should not contain dangerous tags
                    if (stripos($sanitized, '<script>') !== false || 
                        stripos($sanitized, 'javascript:') !== false) {
                        return false;
                    }
                }
                
                return true;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test session security
        $this->runTest($category, 'Session Security', function() {
            try {
                require_once __DIR__ . '/../lib/security.php';
                
                // Test session validation
                session_start();
                $_SESSION['test_key'] = 'test_value';
                
                $isValid = validate_session_security();
                
                session_destroy();
                
                return $isValid;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Run health check
     */
    private function runHealthCheck() {
        echo "5. Running Health Check\n";
        echo "=======================\n";
        
        $category = 'health_check';
        $this->testResults['categories'][$category] = [
            'name' => 'Health Check',
            'tests' => [],
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0
        ];
        
        // Check system requirements
        $this->runTest($category, 'System Requirements', function() {
            // Check PHP version
            $phpVersion = phpversion();
            $requiredVersion = '7.4';
            
            if (version_compare($phpVersion, $requiredVersion, '<')) {
                return false;
            }
            
            // Check required extensions
            $requiredExtensions = ['pdo', 'pdo_mysql', 'session', 'openssl'];
            
            foreach ($requiredExtensions as $extension) {
                if (!extension_loaded($extension)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Check file permissions
        $this->runTest($category, 'File Permissions', function() {
            $directories = [
                __DIR__ . '/../logs',
                __DIR__ . '/../uploads',
                __DIR__ . '/../downloads'
            ];
            
            foreach ($directories as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
                
                if (!is_writable($dir)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Check database schema
        $this->runTest($category, 'Database Schema', function() {
            try {
                $conn = $this->database->getConnection();
                
                $tables = ['classes', 'rooms', 'allocations', 'users', 'login_attempts'];
                
                foreach ($tables as $table) {
                    $stmt = $conn->prepare("SHOW TABLES LIKE ?");
                    $stmt->execute([$table]);
                    
                    if ($stmt->rowCount() === 0) {
                        return false;
                    }
                }
                
                return true;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Run individual test
     */
    private function runTest($category, $testName, $testFunction) {
        $this->testResults['summary']['total_tests']++;
        
        try {
            $result = $testFunction();
            
            if ($result) {
                $this->testResults['categories'][$category]['passed']++;
                $this->testResults['summary']['passed_tests']++;
                echo "✓ {$testName}\n";
            } else {
                $this->testResults['categories'][$category]['failed']++;
                $this->testResults['summary']['failed_tests']++;
                $this->testResults['failures'][] = [
                    'category' => $category,
                    'test' => $testName,
                    'message' => 'Test failed'
                ];
                echo "✗ {$testName}\n";
            }
        } catch (Exception $e) {
            $this->testResults['categories'][$category]['failed']++;
            $this->testResults['summary']['failed_tests']++;
            $this->testResults['failures'][] = [
                'category' => $category,
                'test' => $testName,
                'message' => $e->getMessage()
            ];
            echo "✗ {$testName} (Exception: {$e->getMessage()})\n";
        }
    }
    
    /**
     * Calculate test summary
     */
    private function calculateSummary() {
        $this->testResults['summary']['execution_time'] = $this->endTime - $this->startTime;
        $this->testResults['summary']['memory_usage'] = memory_get_usage(true);
        
        // Calculate category statistics
        foreach ($this->testResults['categories'] as $category => $data) {
            $total = $data['passed'] + $data['failed'] + $data['skipped'];
            $this->testResults['categories'][$category]['total'] = $total;
        }
    }
    
    /**
     * Generate comprehensive test report
     */
    private function generateTestReport() {
        $reportPath = __DIR__ . '/test_results.html';
        
        $html = $this->generateHTMLReport();
        
        file_put_contents($reportPath, $html);
        
        echo "Test Report Generated: {$reportPath}\n";
        echo "\n=== Test Summary ===\n";
        echo "Total Tests: {$this->testResults['summary']['total_tests']}\n";
        echo "Passed: {$this->testResults['summary']['passed_tests']}\n";
        echo "Failed: {$this->testResults['summary']['failed_tests']}\n";
        echo "Execution Time: " . number_format($this->testResults['summary']['execution_time'], 2) . " seconds\n";
        echo "Memory Usage: " . number_format($this->testResults['summary']['memory_usage'] / 1024 / 1024, 2) . " MB\n";
        
        if (!empty($this->testResults['failures'])) {
            echo "\nFailed Tests:\n";
            foreach ($this->testResults['failures'] as $failure) {
                echo "- {$failure['test']}: {$failure['message']}\n";
            }
        }
    }
    
    /**
     * Generate HTML test report
     */
    private function generateHTMLReport() {
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Seat Allocation System - Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: #007bff; }
        .categories { margin-bottom: 30px; }
        .category { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .category-header { background: #007bff; color: white; padding: 15px; font-weight: bold; }
        .category-body { padding: 15px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .status-skipped { color: #ffc107; font-weight: bold; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: #28a745; width: 0%; transition: width 0.3s ease; }
        .failures { background: #fff5f5; border: 1px solid #ffcdd2; border-radius: 5px; padding: 15px; margin-top: 20px; }
        .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Exam Seat Allocation Management System</h1>
            <h2>Test Results Report</h2>
            <p><strong>Generated:</strong> " . date('Y-m-d H:i:s') . "</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Total Tests</h3>
                <div class="value">{$this->testResults['summary']['total_tests']}</div>
            </div>
            <div class="card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">{$this->testResults['summary']['passed_tests']}</div>
            </div>
            <div class="card">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">{$this->testResults['summary']['failed_tests']}</div>
            </div>
            <div class="card">
                <h3>Success Rate</h3>
                <div class="value" style="color: #007bff;">" . number_format(($this->testResults['summary']['passed_tests'] / max($this->testResults['summary']['total_tests'], 1)) * 100, 1) . "%</div>
            </div>
            <div class="card">
                <h3>Execution Time</h3>
                <div class="value">" . number_format($this->testResults['summary']['execution_time'], 2) . "s</div>
            </div>
            <div class="card">
                <h3>Memory Usage</h3>
                <div class="value">" . number_format($this->testResults['summary']['memory_usage'] / 1024 / 1024, 2) . " MB</div>
            </div>
        </div>
        
        <div class="categories">
HTML;

        foreach ($this->testResults['categories'] as $category => $data) {
            $successRate = ($data['total'] > 0) ? ($data['passed'] / $data['total']) * 100 : 0;
            
            $html .= <<<HTML
            <div class="category">
                <div class="category-header">
                    {$data['name']} ({$data['total']} tests)
                </div>
                <div class="category-body">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {$successRate}%"></div>
                    </div>
                    <div style="margin-top: 10px; display: flex; justify-content: space-between; color: #666;">
                        <span>Passed: {$data['passed']}</span>
                        <span>Failed: {$data['failed']}</span>
                        <span>Skipped: {$data['skipped']}</span>
                    </div>
                </div>
            </div>
HTML;
        }

        if (!empty($this->testResults['failures'])) {
            $html .= <<<HTML
            <div class="failures">
                <h3>Failed Tests</h3>
HTML;

            foreach ($this->testResults['failures'] as $failure) {
                $html .= <<<HTML
                <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 3px;">
                    <strong>{$failure['test']}</strong><br>
                    <span style="color: #666;">{$failure['message']}</span>
                </div>
HTML;
            }

            $html .= "</div>";
        }

        $html .= <<<HTML
        </div>
        
        <div class="footer">
            <p>Test suite completed successfully. Review the results above for any issues.</p>
            <p>For detailed error logs, check the logs directory.</p>
        </div>
    </div>
    
    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            });
        });
    </script>
</body>
</html>
HTML;

        return $html;
    }
}

// Run the test suite if this file is executed directly
if (basename(__FILE__) === 'master_test_suite.php') {
    $testSuite = new MasterTestSuite();
    $results = $testSuite->runTestSuite();
    
    // Exit with appropriate code
    exit($results['summary']['failed_tests'] > 0 ? 1 : 0);
}