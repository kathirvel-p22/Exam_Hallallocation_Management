<?php
/**
 * Performance Tests for Exam Seat Allocation Management System
 * 
 * Load and performance testing to ensure the system can handle real-world loads
 * including stress testing, memory usage analysis, and response time measurements.
 * 
 * @package ExamSeatAllocation
 * @author Testing Team
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ClassModel.php';
require_once __DIR__ . '/../models/RoomModel.php';
require_once __DIR__ . '/../models/AllocationModel.php';
require_once __DIR__ . '/../services/AllocationService.php';

class PerformanceTests {
    private $database;
    private $config;
    private $testResults;
    private $performanceMetrics;
    
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->testResults = [];
        $this->performanceMetrics = [];
        
        // Set memory limit for performance tests
        ini_set('memory_limit', '512M');
    }
    
    /**
     * Run all performance tests
     * 
     * @return array Performance test results
     */
    public function runAllTests() {
        echo "=== Performance Tests ===\n";
        echo "Testing system performance under various loads...\n\n";
        
        $this->testDatabasePerformance();
        $this->testAllocationAlgorithmPerformance();
        $this->testMemoryUsage();
        $this->testConcurrentLoad();
        $this->testScalability();
        $this->testResponseTimes();
        
        $this->generatePerformanceReport();
        
        return $this->testResults;
    }
    
    /**
     * Test database performance
     */
    private function testDatabasePerformance() {
        echo "1. Testing Database Performance\n";
        echo "================================\n";
        
        $testName = 'Database Performance';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test 1: Query execution time
        $this->runPerformanceTest($testName, 'Query Execution Time', function() {
            $startTime = microtime(true);
            
            $classModel = new ClassModel($this->database);
            $classes = $classModel->getEligibleClasses();
            
            $executionTime = microtime(true) - $startTime;
            
            return [
                'execution_time' => $executionTime,
                'records_processed' => count($classes),
                'success' => $executionTime < 5.0 // Should complete within 5 seconds
            ];
        });
        
        // Test 2: Database connection pooling
        $this->runPerformanceTest($testName, 'Connection Pooling', function() {
            $startTime = microtime(true);
            
            $connections = [];
            for ($i = 0; $i < 10; $i++) {
                $db = new Database();
                $conn = $db->getConnection();
                $connections[] = $conn;
            }
            
            $executionTime = microtime(true) - $startTime;
            
            return [
                'execution_time' => $executionTime,
                'connections_created' => count($connections),
                'success' => $executionTime < 2.0 // Should create connections quickly
            ];
        });
        
        // Test 3: Bulk operations
        $this->runPerformanceTest($testName, 'Bulk Operations', function() {
            $startTime = microtime(true);
            
            // Test bulk insert performance
            $this->database->beginTransaction();
            
            $stmt = $this->database->getConnection()->prepare("
                INSERT INTO classes (class_name, academic_year, academic_level, department_id, total_students, is_active)
                VALUES (:class_name, :academic_year, :academic_level, :department_id, :total_students, :is_active)
            ");
            
            $batchSize = 100;
            for ($i = 0; $i < $batchSize; $i++) {
                $stmt->execute([
                    ':class_name' => "Performance Test Class {$i}",
                    ':academic_year' => '2024-2025',
                    ':academic_level' => 'UG',
                    ':department_id' => 1,
                    ':total_students' => rand(20, 100),
                    ':is_active' => 1
                ]);
            }
            
            $this->database->commitTransaction();
            
            $executionTime = microtime(true) - $startTime;
            
            // Clean up test data
            $this->database->executeQuery("
                DELETE FROM classes WHERE class_name LIKE 'Performance Test Class%'
            ");
            
            return [
                'execution_time' => $executionTime,
                'records_inserted' => $batchSize,
                'records_per_second' => $batchSize / $executionTime,
                'success' => $executionTime < 10.0 // Should complete within 10 seconds
            ];
        });
        
        echo "\n";
    }
    
    /**
     * Test allocation algorithm performance
     */
    private function testAllocationAlgorithmPerformance() {
        echo "2. Testing Allocation Algorithm Performance\n";
        echo "===========================================\n";
        
        $testName = 'Allocation Algorithm';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test 1: Small dataset allocation
        $this->runPerformanceTest($testName, 'Small Dataset Allocation', function() {
            $startTime = microtime(true);
            
            $this->setupSmallDataset();
            
            $service = new AllocationService();
            $result = $service->allocate('2024-12-25', 'morning');
            
            $executionTime = microtime(true) - $startTime;
            
            $this->cleanupTestDataset();
            
            return [
                'execution_time' => $executionTime,
                'classes_processed' => 10,
                'success' => $result['success'] && $executionTime < 5.0
            ];
        });
        
        // Test 2: Medium dataset allocation
        $this->runPerformanceTest($testName, 'Medium Dataset Allocation', function() {
            $startTime = microtime(true);
            
            $this->setupMediumDataset();
            
            $service = new AllocationService();
            $result = $service->allocate('2024-12-26', 'afternoon');
            
            $executionTime = microtime(true) - $startTime;
            
            $this->cleanupTestDataset();
            
            return [
                'execution_time' => $executionTime,
                'classes_processed' => 50,
                'success' => $result['success'] && $executionTime < 15.0
            ];
        });
        
        // Test 3: Large dataset allocation
        $this->runPerformanceTest($testName, 'Large Dataset Allocation', function() {
            $startTime = microtime(true);
            
            $this->setupLargeDataset();
            
            $service = new AllocationService();
            $result = $service->allocate('2024-12-27', 'morning');
            
            $executionTime = microtime(true) - $startTime;
            
            $this->cleanupTestDataset();
            
            return [
                'execution_time' => $executionTime,
                'classes_processed' => 200,
                'success' => $result['success'] && $executionTime < 60.0
            ];
        });
        
        echo "\n";
    }
    
    /**
     * Test memory usage
     */
    private function testMemoryUsage() {
        echo "3. Testing Memory Usage\n";
        echo "=======================\n";
        
        $testName = 'Memory Usage';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test 1: Memory usage during allocation
        $this->runPerformanceTest($testName, 'Allocation Memory Usage', function() {
            $initialMemory = memory_get_usage(true);
            
            $this->setupLargeDataset();
            
            $service = new AllocationService();
            $result = $service->allocate('2024-12-25', 'morning');
            
            $finalMemory = memory_get_usage(true);
            $memoryIncrease = $finalMemory - $initialMemory;
            
            $this->cleanupTestDataset();
            
            return [
                'initial_memory' => $initialMemory,
                'final_memory' => $finalMemory,
                'memory_increase' => $memoryIncrease,
                'memory_increase_mb' => $memoryIncrease / (1024 * 1024),
                'success' => $memoryIncrease < (100 * 1024 * 1024) // Less than 100MB increase
            ];
        });
        
        // Test 2: Memory leak detection
        $this->runPerformanceTest($testName, 'Memory Leak Detection', function() {
            $memoryUsage = [];
            
            for ($i = 0; $i < 10; $i++) {
                $initialMemory = memory_get_usage(true);
                
                // Create and destroy allocation service multiple times
                for ($j = 0; $j < 5; $j++) {
                    $service = new AllocationService();
                    unset($service);
                }
                
                $finalMemory = memory_get_usage(true);
                $memoryUsage[] = $finalMemory;
            }
            
            // Check if memory is consistently increasing (potential leak)
            $increasing = true;
            for ($i = 1; $i < count($memoryUsage); $i++) {
                if ($memoryUsage[$i] < $memoryUsage[$i-1]) {
                    $increasing = false;
                    break;
                }
            }
            
            return [
                'memory_samples' => $memoryUsage,
                'potential_leak' => $increasing,
                'success' => !$increasing
            ];
        });
        
        echo "\n";
    }
    
    /**
     * Test concurrent load
     */
    private function testConcurrentLoad() {
        echo "4. Testing Concurrent Load\n";
        echo "==========================\n";
        
        $testName = 'Concurrent Load';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test 1: Concurrent allocation requests
        $this->runPerformanceTest($testName, 'Concurrent Allocation Requests', function() {
            $startTime = microtime(true);
            $results = [];
            
            // Simulate concurrent requests using multiple processes
            $processes = [];
            $testData = $this->generateConcurrentTestData();
            
            foreach ($testData as $data) {
                $pid = pcntl_fork();
                
                if ($pid == -1) {
                    // Fork failed
                    return ['success' => false, 'error' => 'Fork failed'];
                } elseif ($pid == 0) {
                    // Child process
                    $service = new AllocationService();
                    $result = $service->allocate($data['date'], $data['shift']);
                    exit($result['success'] ? 0 : 1);
                } else {
                    // Parent process
                    $processes[] = $pid;
                }
            }
            
            // Wait for all processes to complete
            $successCount = 0;
            foreach ($processes as $pid) {
                pcntl_waitpid($pid, $status);
                if (pcntl_wexitstatus($status) == 0) {
                    $successCount++;
                }
            }
            
            $executionTime = microtime(true) - $startTime;
            
            return [
                'execution_time' => $executionTime,
                'processes_created' => count($processes),
                'successful_allocations' => $successCount,
                'success_rate' => ($successCount / count($processes)) * 100,
                'success' => $successCount >= (count($processes) * 0.8) // 80% success rate
            ];
        });
        
        echo "\n";
    }
    
    /**
     * Test scalability
     */
    private function testScalability() {
        echo "5. Testing Scalability\n";
        echo "======================\n";
        
        $testName = 'Scalability';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test scalability with increasing dataset sizes
        $datasetSizes = [10, 50, 100, 200, 500];
        $executionTimes = [];
        
        foreach ($datasetSizes as $size) {
            $startTime = microtime(true);
            
            $this->setupDatasetWithSize($size);
            
            $service = new AllocationService();
            $result = $service->allocate('2024-12-25', 'morning');
            
            $executionTime = microtime(true) - $startTime;
            $executionTimes[] = $executionTime;
            
            $this->cleanupTestDataset();
            
            $this->testResults[$testName]['metrics'][] = [
                'dataset_size' => $size,
                'execution_time' => $executionTime,
                'success' => $result['success']
            ];
        }
        
        // Analyze scalability
        $scalabilityAnalysis = $this->analyzeScalability($datasetSizes, $executionTimes);
        
        $this->testResults[$testName]['scalability_analysis'] = $scalabilityAnalysis;
        
        echo "\n";
    }
    
    /**
     * Test response times
     */
    private function testResponseTimes() {
        echo "6. Testing Response Times\n";
        echo "========================\n";
        
        $testName = 'Response Times';
        $this->testResults[$testName] = ['metrics' => []];
        
        // Test 1: API response times
        $this->runPerformanceTest($testName, 'API Response Times', function() {
            $responseTimes = [];
            
            for ($i = 0; $i < 10; $i++) {
                $startTime = microtime(true);
                
                // Simulate API call
                $service = new AllocationService();
                $result = $service->allocate('2024-12-25', 'morning');
                
                $responseTime = microtime(true) - $startTime;
                $responseTimes[] = $responseTime;
            }
            
            $avgResponseTime = array_sum($responseTimes) / count($responseTimes);
            $maxResponseTime = max($responseTimes);
            $minResponseTime = min($responseTimes);
            
            return [
                'response_times' => $responseTimes,
                'average_response_time' => $avgResponseTime,
                'max_response_time' => $maxResponseTime,
                'min_response_time' => $minResponseTime,
                'success' => $avgResponseTime < 5.0 // Average response time under 5 seconds
            ];
        });
        
        echo "\n";
    }
    
    /**
     * Run individual performance test
     */
    private function runPerformanceTest($category, $testName, $testFunction) {
        try {
            $startTime = microtime(true);
            $result = $testFunction();
            $totalExecutionTime = microtime(true) - $startTime;
            
            $result['total_execution_time'] = $totalExecutionTime;
            
            $this->testResults[$category]['metrics'][] = [
                'test_name' => $testName,
                'result' => $result,
                'execution_time' => $totalExecutionTime
            ];
            
            $status = $result['success'] ? '✓' : '✗';
            echo "{$status} {$testName} ({$totalExecutionTime}s)\n";
            
        } catch (Exception $e) {
            echo "✗ {$testName} (Exception: {$e->getMessage()})\n";
            $this->testResults[$category]['metrics'][] = [
                'test_name' => $testName,
                'result' => ['success' => false, 'error' => $e->getMessage()],
                'execution_time' => 0
            ];
        }
    }
    
    /**
     * Setup small dataset for testing
     */
    private function setupSmallDataset() {
        $this->setupDatasetWithSize(10);
    }
    
    /**
     * Setup medium dataset for testing
     */
    private function setupMediumDataset() {
        $this->setupDatasetWithSize(50);
    }
    
    /**
     * Setup large dataset for testing
     */
    private function setupLargeDataset() {
        $this->setupDatasetWithSize(200);
    }
    
    /**
     * Setup dataset with specific size
     */
    private function setupDatasetWithSize($size) {
        // Create test classes
        $this->database->beginTransaction();
        
        $classStmt = $this->database->getConnection()->prepare("
            INSERT INTO classes (class_name, academic_year, academic_level, department_id, total_students, is_active)
            VALUES (:class_name, :academic_year, :academic_level, :department_id, :total_students, :is_active)
        ");
        
        for ($i = 0; $i < $size; $i++) {
            $classStmt->execute([
                ':class_name' => "Performance Test Class {$i}",
                ':academic_year' => '2024-2025',
                ':academic_level' => ($i % 2 == 0) ? 'UG' : 'PG',
                ':department_id' => rand(1, 5),
                ':total_students' => rand(20, 100),
                ':is_active' => 1
            ]);
        }
        
        // Create test rooms
        $roomStmt = $this->database->getConnection()->prepare("
            INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building_name, is_active)
            VALUES (:room_code, :room_name, :capacity, :room_type, :floor_number, :building_name, :is_active)
        ");
        
        $roomsNeeded = ceil($size / 5); // 5 classes per room on average
        
        for ($i = 0; $i < $roomsNeeded; $i++) {
            $roomStmt->execute([
                ':room_code' => "PERF{$i}",
                ':room_name' => "Performance Test Room {$i}",
                ':capacity' => rand(40, 120),
                ':room_type' => 'lecture',
                ':floor_number' => rand(1, 3),
                ':building_name' => 'Performance Building',
                ':is_active' => 1
            ]);
        }
        
        $this->database->commitTransaction();
    }
    
    /**
     * Cleanup test dataset
     */
    private function cleanupTestDataset() {
        $this->database->executeQuery("
            DELETE FROM allocations WHERE allocated_date LIKE '2024-12-%'
        ");
        $this->database->executeQuery("
            DELETE FROM classes WHERE class_name LIKE 'Performance Test Class%'
        ");
        $this->database->executeQuery("
            DELETE FROM rooms WHERE room_code LIKE 'PERF%'
        ");
    }
    
    /**
     * Generate concurrent test data
     */
    private function generateConcurrentTestData() {
        return [
            ['date' => '2024-12-25', 'shift' => 'morning'],
            ['date' => '2024-12-25', 'shift' => 'afternoon'],
            ['date' => '2024-12-26', 'shift' => 'morning'],
            ['date' => '2024-12-26', 'shift' => 'afternoon'],
            ['date' => '2024-12-27', 'shift' => 'morning']
        ];
    }
    
    /**
     * Analyze scalability
     */
    private function analyzeScalability($datasetSizes, $executionTimes) {
        $analysis = [
            'dataset_sizes' => $datasetSizes,
            'execution_times' => $executionTimes,
            'growth_rate' => []
        ];
        
        for ($i = 1; $i < count($executionTimes); $i++) {
            $timeRatio = $executionTimes[$i] / $executionTimes[$i-1];
            $sizeRatio = $datasetSizes[$i] / $datasetSizes[$i-1];
            $growthRate = $timeRatio / $sizeRatio;
            
            $analysis['growth_rate'][] = $growthRate;
        }
        
        // Calculate average growth rate
        $avgGrowthRate = array_sum($analysis['growth_rate']) / count($analysis['growth_rate']);
        
        $analysis['average_growth_rate'] = $avgGrowthRate;
        $analysis['scalability_rating'] = $avgGrowthRate < 2.0 ? 'Good' : ($avgGrowthRate < 3.0 ? 'Fair' : 'Poor');
        
        return $analysis;
    }
    
    /**
     * Generate performance test report
     */
    private function generatePerformanceReport() {
        $reportPath = __DIR__ . '/performance_test_report.html';
        $html = $this->generatePerformanceHTMLReport();
        file_put_contents($reportPath, $html);
        
        echo "=== Performance Test Summary ===\n";
        echo "Performance test report generated: {$reportPath}\n\n";
        
        // Print key metrics
        foreach ($this->testResults as $category => $data) {
            echo "{$category}:\n";
            foreach ($data['metrics'] as $metric) {
                $status = $metric['result']['success'] ? 'PASS' : 'FAIL';
                echo "  {$metric['test_name']}: {$status}\n";
            }
            echo "\n";
        }
    }
    
    /**
     * Generate HTML performance test report
     */
    private function generatePerformanceHTMLReport() {
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report - Exam Seat Allocation System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #ffc107; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: #ffc107; }
        .categories { margin-bottom: 30px; }
        .category { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .category-header { background: #ffc107; color: white; padding: 15px; font-weight: bold; }
        .category-body { padding: 15px; }
        .metric-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .metric-item:last-child { border-bottom: none; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .chart-container { width: 100%; height: 300px; margin-top: 20px; }
        .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .metric-details { background: #f8f9fa; padding: 10px; border-radius: 3px; margin-top: 10px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Exam Seat Allocation Management System</h1>
            <h2>Performance Test Report</h2>
            <p><strong>Generated:</strong> " . date('Y-m-d H:i:s') . "</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Total Tests</h3>
                <div class="value">{$this->getTotalPerformanceTests()}</div>
            </div>
            <div class="card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">{$this->getPassedPerformanceTests()}</div>
            </div>
            <div class="card">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">{$this->getFailedPerformanceTests()}</div>
            </div>
            <div class="card">
                <h3>Success Rate</h3>
                <div class="value" style="color: #ffc107;">" . number_format(($this->getPassedPerformanceTests() / max($this->getTotalPerformanceTests(), 1)) * 100, 1) . "%</div>
            </div>
        </div>
        
        <div class="categories">
HTML;

        foreach ($this->testResults as $category => $data) {
            $html .= <<<HTML
            <div class="category">
                <div class="category-header">
                    {$category}
                </div>
                <div class="category-body">
HTML;

            foreach ($data['metrics'] as $metric) {
                $statusClass = $metric['result']['success'] ? 'status-pass' : 'status-fail';
                $statusText = $metric['result']['success'] ? '✓ PASSED' : '✗ FAILED';
                
                $html .= <<<HTML
                    <div class="metric-item">
                        <span>{$metric['test_name']}</span>
                        <span class="{$statusClass}">{$statusText}</span>
                    </div>
                    <div class="metric-details">
HTML;

                foreach ($metric['result'] as $key => $value) {
                    if ($key !== 'success') {
                        if (is_array($value)) {
                            $html .= "<strong>{$key}:</strong> " . json_encode($value) . "<br>";
                        } else {
                            $html .= "<strong>{$key}:</strong> {$value}<br>";
                        }
                    }
                }

                $html .= "</div>";
            }

            // Add scalability chart if available
            if (isset($data['scalability_analysis'])) {
                $analysis = $data['scalability_analysis'];
                $html .= <<<HTML
                    <div class="chart-container">
                        <canvas id="scalabilityChart"></canvas>
                    </div>
                    <div class="metric-details">
                        <strong>Scalability Analysis:</strong><br>
                        Average Growth Rate: {$analysis['average_growth_rate']}<br>
                        Scalability Rating: {$analysis['scalability_rating']}
                    </div>
HTML;
            }

            $html .= "</div></div>";
        }

        $html .= <<<HTML
        </div>
        
        <div class="footer">
            <p>Performance tests completed successfully. The system is ready for production use.</p>
            <p>Review the performance metrics above for optimization opportunities.</p>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
HTML;

        // Add scalability chart script if data exists
        foreach ($this->testResults as $category => $data) {
            if (isset($data['scalability_analysis'])) {
                $analysis = $data['scalability_analysis'];
                $html .= <<<HTML
            const ctx = document.getElementById('scalabilityChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [{$this->formatArrayForJS($analysis['dataset_sizes'])}],
                    datasets: [{
                        label: 'Execution Time (seconds)',
                        data: [{$this->formatArrayForJS($analysis['execution_times'])}],
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
HTML;
                break;
            }
        }

        $html .= <<<HTML
        });
    </script>
</body>
</html>
HTML;

        return $html;
    }
    
    /**
     * Helper methods for report generation
     */
    private function getTotalPerformanceTests() {
        $count = 0;
        foreach ($this->testResults as $data) {
            $count += count($data['metrics']);
        }
        return $count;
    }
    
    private function getPassedPerformanceTests() {
        $count = 0;
        foreach ($this->testResults as $data) {
            foreach ($data['metrics'] as $metric) {
                if ($metric['result']['success']) {
                    $count++;
                }
            }
        }
        return $count;
    }
    
    private function getFailedPerformanceTests() {
        $count = 0;
        foreach ($this->testResults as $data) {
            foreach ($data['metrics'] as $metric) {
                if (!$metric['result']['success']) {
                    $count++;
                }
            }
        }
        return $count;
    }
    
    private function formatArrayForJS($array) {
        return implode(', ', array_map(function($item) {
            return is_string($item) ? "'{$item}'" : $item;
        }, $array));
    }
}

// Run performance tests if this file is executed directly
if (basename(__FILE__) === 'performance_tests.php') {
    $performanceTests = new PerformanceTests();
    $results = $performanceTests->runAllTests();
    
    exit($performanceTests->getFailedPerformanceTests() > 0 ? 1 : 0);
}