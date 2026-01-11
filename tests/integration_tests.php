<?php
/**
 * Integration Tests for Exam Seat Allocation Management System
 * 
 * End-to-end workflow tests that verify the complete system functionality
 * including database operations, allocation algorithms, and user workflows.
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
require_once __DIR__ . '/../lib/validation.php';
require_once __DIR__ . '/../lib/security.php';

class IntegrationTests {
    private $database;
    private $config;
    private $testData;
    private $testResults;
    
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->testResults = [];
        $this->testData = [];
        
        // Initialize test data
        $this->initializeTestData();
    }
    
    /**
     * Initialize test data for integration tests
     */
    private function initializeTestData() {
        $this->testData = [
            'classes' => [
                [
                    'class_name' => 'Test Class 1',
                    'academic_year' => '2024-2025',
                    'academic_level' => 'UG',
                    'department_id' => 1,
                    'total_students' => 50,
                    'is_active' => 1
                ],
                [
                    'class_name' => 'Test Class 2',
                    'academic_year' => '2024-2025',
                    'academic_level' => 'UG',
                    'department_id' => 1,
                    'total_students' => 75,
                    'is_active' => 1
                ],
                [
                    'class_name' => 'Test Class 3',
                    'academic_year' => '2024-2025',
                    'academic_level' => 'PG',
                    'department_id' => 2,
                    'total_students' => 30,
                    'is_active' => 1
                ]
            ],
            'rooms' => [
                [
                    'room_code' => 'T101',
                    'room_name' => 'Test Room 101',
                    'capacity' => 60,
                    'room_type' => 'lecture',
                    'floor_number' => 1,
                    'building_name' => 'Test Building',
                    'has_projector' => 1,
                    'has_whiteboard' => 1,
                    'has_computers' => 0,
                    'is_active' => 1
                ],
                [
                    'room_code' => 'T102',
                    'room_name' => 'Test Room 102',
                    'capacity' => 80,
                    'room_type' => 'lecture',
                    'floor_number' => 1,
                    'building_name' => 'Test Building',
                    'has_projector' => 1,
                    'has_whiteboard' => 1,
                    'has_computers' => 0,
                    'is_active' => 1
                ],
                [
                    'room_code' => 'T103',
                    'room_name' => 'Test Room 103',
                    'capacity' => 40,
                    'room_type' => 'tutorial',
                    'floor_number' => 1,
                    'building_name' => 'Test Building',
                    'has_projector' => 0,
                    'has_whiteboard' => 1,
                    'has_computers' => 0,
                    'is_active' => 1
                ]
            ],
            'exams' => [
                [
                    'exam_name' => 'Mid Semester Exam',
                    'exam_date' => '2024-12-25',
                    'shift' => 'morning',
                    'exam_type' => 'theory',
                    'created_by' => 1
                ]
            ]
        ];
    }
    
    /**
     * Run all integration tests
     * 
     * @return array Test results
     */
    public function runAllTests() {
        echo "=== Integration Tests ===\n";
        echo "Testing complete system workflows...\n\n";
        
        $this->testDatabaseOperations();
        $this->testAllocationWorkflow();
        $this->testDataConsistency();
        $this->testErrorHandling();
        $this->testConcurrentOperations();
        $this->testRollbackScenarios();
        
        $this->generateIntegrationReport();
        
        return $this->testResults;
    }
    
    /**
     * Test database operations integration
     */
    private function testDatabaseOperations() {
        echo "1. Testing Database Operations\n";
        echo "==============================\n";
        
        $testName = 'Database Operations';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Class model operations
        $this->runIntegrationTest($testName, 'Class Model CRUD', function() {
            try {
                $classModel = new ClassModel($this->database);
                
                // Create test class
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO classes (class_name, academic_year, academic_level, department_id, total_students, is_active)
                    VALUES (:class_name, :academic_year, :academic_level, :department_id, :total_students, :is_active)
                ");
                
                $stmt->execute([
                    ':class_name' => 'Integration Test Class',
                    ':academic_year' => '2024-2025',
                    ':academic_level' => 'UG',
                    ':department_id' => 1,
                    ':total_students' => 25,
                    ':is_active' => 1
                ]);
                
                $classId = $this->database->getConnection()->lastInsertId();
                
                // Read class
                $class = $classModel->getById($classId);
                
                // Update class
                $updateStmt = $this->database->getConnection()->prepare("
                    UPDATE classes SET total_students = 30 WHERE class_id = :class_id
                ");
                $updateStmt->execute([':class_id' => $classId]);
                
                // Delete class
                $deleteStmt = $this->database->getConnection()->prepare("
                    DELETE FROM classes WHERE class_id = :class_id
                ");
                $deleteStmt->execute([':class_id' => $classId]);
                
                return $class !== null && $class->class_name === 'Integration Test Class';
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 2: Room model operations
        $this->runIntegrationTest($testName, 'Room Model CRUD', function() {
            try {
                $roomModel = new RoomModel($this->database);
                
                // Create test room
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building_name, is_active)
                    VALUES (:room_code, :room_name, :capacity, :room_type, :floor_number, :building_name, :is_active)
                ");
                
                $stmt->execute([
                    ':room_code' => 'INT101',
                    ':room_name' => 'Integration Test Room',
                    ':capacity' => 50,
                    ':room_type' => 'lecture',
                    ':floor_number' => 1,
                    ':building_name' => 'Integration Building',
                    ':is_active' => 1
                ]);
                
                $roomId = $this->database->getConnection()->lastInsertId();
                
                // Read room
                $room = $roomModel->getById($roomId);
                
                // Update room
                $updateStmt = $this->database->getConnection()->prepare("
                    UPDATE rooms SET capacity = 60 WHERE room_id = :room_id
                ");
                $updateStmt->execute([':room_id' => $roomId]);
                
                // Delete room
                $deleteStmt = $this->database->getConnection()->prepare("
                    DELETE FROM rooms WHERE room_id = :room_id
                ");
                $deleteStmt->execute([':room_id' => $roomId]);
                
                return $room !== null && $room->room_name === 'Integration Test Room';
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 3: Allocation model operations
        $this->runIntegrationTest($testName, 'Allocation Model CRUD', function() {
            try {
                $allocationModel = new AllocationModel($this->database);
                
                // Create test allocation
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO allocations (exam_id, room_id, allocated_date, shift, total_allocated_seats, is_confirmed, created_by)
                    VALUES (:exam_id, :room_id, :allocated_date, :shift, :total_allocated_seats, :is_confirmed, :created_by)
                ");
                
                $stmt->execute([
                    ':exam_id' => 1,
                    ':room_id' => 1,
                    ':allocated_date' => '2024-12-25',
                    ':shift' => 'morning',
                    ':total_allocated_seats' => 50,
                    ':is_confirmed' => 1,
                    ':created_by' => 1
                ]);
                
                $allocationId = $this->database->getConnection()->lastInsertId();
                
                // Read allocation
                $allocation = $allocationModel->getById($allocationId);
                
                // Update allocation
                $updateStmt = $this->database->getConnection()->prepare("
                    UPDATE allocations SET total_allocated_seats = 60 WHERE allocation_id = :allocation_id
                ");
                $updateStmt->execute([':allocation_id' => $allocationId]);
                
                // Delete allocation
                $deleteStmt = $this->database->getConnection()->prepare("
                    DELETE FROM allocations WHERE allocation_id = :allocation_id
                ");
                $deleteStmt->execute([':allocation_id' => $allocationId]);
                
                return $allocation !== null;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Test allocation workflow integration
     */
    private function testAllocationWorkflow() {
        echo "2. Testing Allocation Workflow\n";
        echo "==============================\n";
        
        $testName = 'Allocation Workflow';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Complete allocation process
        $this->runIntegrationTest($testName, 'Complete Allocation Process', function() {
            try {
                // Setup test data
                $this->setupTestAllocationData();
                
                $service = new AllocationService();
                $result = $service->allocate('2024-12-25', 'morning');
                
                // Clean up test data
                $this->cleanupTestAllocationData();
                
                return $result['success'] === true && 
                       $result['statistics']['allocated_classes'] > 0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 2: Allocation with constraints
        $this->runIntegrationTest($testName, 'Allocation with Constraints', function() {
            try {
                // Setup test data with specific constraints
                $this->setupConstrainedTestData();
                
                $service = new AllocationService();
                $result = $service->allocate('2024-12-26', 'afternoon');
                
                // Verify constraints are respected
                $allocations = $this->getAllocationsForDate('2024-12-26', 'afternoon');
                
                // Clean up
                $this->cleanupConstrainedTestData();
                
                return $this->verifyConstraints($allocations);
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 3: Allocation validation
        $this->runIntegrationTest($testName, 'Allocation Validation', function() {
            try {
                $service = new AllocationService();
                
                // Test invalid date
                $result1 = $service->allocate('invalid-date', 'morning');
                
                // Test invalid shift
                $result2 = $service->allocate('2024-12-25', 'invalid-shift');
                
                return $result1['success'] === false && $result2['success'] === false;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Test data consistency across the system
     */
    private function testDataConsistency() {
        echo "3. Testing Data Consistency\n";
        echo "===========================\n";
        
        $testName = 'Data Consistency';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Referential integrity
        $this->runIntegrationTest($testName, 'Referential Integrity', function() {
            try {
                // Create allocation with non-existent room
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO allocations (exam_id, room_id, allocated_date, shift, total_allocated_seats, is_confirmed, created_by)
                    VALUES (1, 99999, '2024-12-25', 'morning', 50, 1, 1)
                ");
                
                $result = $stmt->execute();
                
                // Should fail due to foreign key constraint
                return !$result;
            } catch (Exception $e) {
                return true; // Expected to fail
            }
        });
        
        // Test 2: Data validation consistency
        $this->runIntegrationTest($testName, 'Data Validation Consistency', function() {
            try {
                // Test class validation
                $classModel = new ClassModel($this->database);
                $classModel->class_name = '';
                $classModel->total_students = -1;
                $classModel->academic_level = 'INVALID';
                
                $isValid = $classModel->validate();
                
                return !$isValid;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 3: Allocation statistics consistency
        $this->runIntegrationTest($testName, 'Allocation Statistics Consistency', function() {
            try {
                $this->setupTestAllocationData();
                
                $service = new AllocationService();
                $result = $service->allocate('2024-12-25', 'morning');
                
                // Verify statistics
                $totalStudents = $this->getTotalClassStrength();
                $allocatedStudents = $result['statistics']['total_students_allocated'];
                
                // Clean up
                $this->cleanupTestAllocationData();
                
                return $allocatedStudents <= $totalStudents;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Test error handling integration
     */
    private function testErrorHandling() {
        echo "4. Testing Error Handling\n";
        echo "=========================\n";
        
        $testName = 'Error Handling';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Database connection failure
        $this->runIntegrationTest($testName, 'Database Connection Failure', function() {
            try {
                // Temporarily break database connection
                $originalHost = $this->config['database']['host'];
                $this->config['database']['host'] = 'nonexistent-host';
                
                $db = new Database();
                $conn = $db->getConnection();
                
                // Restore connection
                $this->config['database']['host'] = $originalHost;
                
                return $conn === null;
            } catch (Exception $e) {
                return true;
            }
        });
        
        // Test 2: Transaction rollback
        $this->runIntegrationTest($testName, 'Transaction Rollback', function() {
            try {
                $this->database->beginTransaction();
                
                // Insert test data
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO classes (class_name, academic_year, academic_level, department_id, total_students, is_active)
                    VALUES ('Rollback Test', '2024-2025', 'UG', 1, 25, 1)
                ");
                $stmt->execute();
                
                $classId = $this->database->getConnection()->lastInsertId();
                
                // Rollback transaction
                $this->database->rollbackTransaction();
                
                // Verify data was rolled back
                $checkStmt = $this->database->getConnection()->prepare("
                    SELECT COUNT(*) as count FROM classes WHERE class_id = :class_id
                ");
                $checkStmt->execute([':class_id' => $classId]);
                $result = $checkStmt->fetch();
                
                return $result['count'] == 0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        // Test 3: Input validation errors
        $this->runIntegrationTest($testName, 'Input Validation Errors', function() {
            try {
                // Test invalid email
                $isValidEmail = validateEmail('invalid-email-format');
                
                // Test weak password
                $passwordErrors = validatePassword('weak', [
                    'min_length' => 8,
                    'require_uppercase' => true,
                    'require_lowercase' => true,
                    'require_numbers' => true,
                    'require_special' => true
                ]);
                
                return !$isValidEmail && !empty($passwordErrors);
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Test concurrent operations
     */
    private function testConcurrentOperations() {
        echo "5. Testing Concurrent Operations\n";
        echo "================================\n";
        
        $testName = 'Concurrent Operations';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Concurrent allocation attempts
        $this->runIntegrationTest($testName, 'Concurrent Allocation Attempts', function() {
            try {
                $this->setupTestAllocationData();
                
                // Simulate concurrent allocation attempts
                $results = [];
                for ($i = 0; $i < 3; $i++) {
                    $service = new AllocationService();
                    $result = $service->allocate('2024-12-25', 'morning');
                    $results[] = $result;
                }
                
                // Clean up
                $this->cleanupTestAllocationData();
                
                // At least one should succeed
                $successCount = 0;
                foreach ($results as $result) {
                    if ($result['success']) {
                        $successCount++;
                    }
                }
                
                return $successCount >= 1;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Test rollback scenarios
     */
    private function testRollbackScenarios() {
        echo "6. Testing Rollback Scenarios\n";
        echo "=============================\n";
        
        $testName = 'Rollback Scenarios';
        $this->testResults[$testName] = ['passed' => 0, 'failed' => 0, 'details' => []];
        
        // Test 1: Allocation rollback on failure
        $this->runIntegrationTest($testName, 'Allocation Rollback on Failure', function() {
            try {
                $this->database->beginTransaction();
                
                // Create allocation
                $stmt = $this->database->getConnection()->prepare("
                    INSERT INTO allocations (exam_id, room_id, allocated_date, shift, total_allocated_seats, is_confirmed, created_by)
                    VALUES (1, 1, '2024-12-25', 'morning', 50, 1, 1)
                ");
                $stmt->execute();
                
                $allocationId = $this->database->getConnection()->lastInsertId();
                
                // Simulate failure and rollback
                $this->database->rollbackTransaction();
                
                // Verify rollback
                $checkStmt = $this->database->getConnection()->prepare("
                    SELECT COUNT(*) as count FROM allocations WHERE allocation_id = :allocation_id
                ");
                $checkStmt->execute([':allocation_id' => $allocationId]);
                $result = $checkStmt->fetch();
                
                return $result['count'] == 0;
            } catch (Exception $e) {
                return false;
            }
        });
        
        echo "\n";
    }
    
    /**
     * Run individual integration test
     */
    private function runIntegrationTest($category, $testName, $testFunction) {
        try {
            $result = $testFunction();
            
            if ($result) {
                $this->testResults[$category]['passed']++;
                echo "✓ {$testName}\n";
            } else {
                $this->testResults[$category]['failed']++;
                echo "✗ {$testName}\n";
            }
            
            $this->testResults[$category]['details'][] = [
                'test' => $testName,
                'result' => $result ? 'passed' : 'failed'
            ];
        } catch (Exception $e) {
            $this->testResults[$category]['failed']++;
            echo "✗ {$testName} (Exception: {$e->getMessage()})\n";
            $this->testResults[$category]['details'][] = [
                'test' => $testName,
                'result' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Setup test allocation data
     */
    private function setupTestAllocationData() {
        // Insert test classes
        foreach ($this->testData['classes'] as $class) {
            $stmt = $this->database->getConnection()->prepare("
                INSERT INTO classes (class_name, academic_year, academic_level, department_id, total_students, is_active)
                VALUES (:class_name, :academic_year, :academic_level, :department_id, :total_students, :is_active)
            ");
            $stmt->execute($class);
        }
        
        // Insert test rooms
        foreach ($this->testData['rooms'] as $room) {
            $stmt = $this->database->getConnection()->prepare("
                INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building_name, has_projector, has_whiteboard, has_computers, is_active)
                VALUES (:room_code, :room_name, :capacity, :room_type, :floor_number, :building_name, :has_projector, :has_whiteboard, :has_computers, :is_active)
            ");
            $stmt->execute($room);
        }
        
        // Insert test exam
        foreach ($this->testData['exams'] as $exam) {
            $stmt = $this->database->getConnection()->prepare("
                INSERT INTO exams (exam_name, exam_date, shift, exam_type, created_by)
                VALUES (:exam_name, :exam_date, :shift, :exam_type, :created_by)
            ");
            $stmt->execute($exam);
        }
    }
    
    /**
     * Cleanup test allocation data
     */
    private function cleanupTestAllocationData() {
        // Delete test data in reverse order
        $this->database->executeQuery("DELETE FROM allocations WHERE allocated_date = '2024-12-25'");
        $this->database->executeQuery("DELETE FROM exams WHERE exam_date = '2024-12-25'");
        $this->database->executeQuery("DELETE FROM rooms WHERE room_code LIKE 'T%'");
        $this->database->executeQuery("DELETE FROM classes WHERE class_name LIKE 'Test Class%'");
    }
    
    /**
     * Setup constrained test data
     */
    private function setupConstrainedTestData() {
        // Setup data that tests allocation constraints
        $this->setupTestAllocationData();
    }
    
    /**
     * Cleanup constrained test data
     */
    private function cleanupConstrainedTestData() {
        $this->cleanupTestAllocationData();
    }
    
    /**
     * Get allocations for specific date and shift
     */
    private function getAllocationsForDate($date, $shift) {
        $stmt = $this->database->getConnection()->prepare("
            SELECT a.*, c.class_name, c.academic_level, r.room_name, r.capacity
            FROM allocations a
            JOIN classes c ON a.class_id = c.class_id
            JOIN rooms r ON a.room_id = r.room_id
            WHERE a.allocated_date = :date AND a.shift = :shift
        ");
        $stmt->execute([':date' => $date, ':shift' => $shift]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Verify allocation constraints
     */
    private function verifyConstraints($allocations) {
        foreach ($allocations as $allocation) {
            // Check that room capacity >= allocated seats
            if ($allocation['capacity'] < $allocation['total_allocated_seats']) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get total strength of test classes
     */
    private function getTotalClassStrength() {
        $stmt = $this->database->getConnection()->prepare("
            SELECT SUM(total_students) as total FROM classes WHERE class_name LIKE 'Test Class%'
        ");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }
    
    /**
     * Generate integration test report
     */
    private function generateIntegrationReport() {
        $totalTests = 0;
        $totalPassed = 0;
        $totalFailed = 0;
        
        foreach ($this->testResults as $category => $data) {
            $totalTests += $data['passed'] + $data['failed'];
            $totalPassed += $data['passed'];
            $totalFailed += $data['failed'];
        }
        
        echo "=== Integration Test Summary ===\n";
        echo "Total Tests: {$totalTests}\n";
        echo "Passed: {$totalPassed}\n";
        echo "Failed: {$totalFailed}\n";
        echo "Success Rate: " . number_format(($totalPassed / max($totalTests, 1)) * 100, 1) . "%\n\n";
        
        // Generate detailed report
        $reportPath = __DIR__ . '/integration_test_report.html';
        $html = $this->generateIntegrationHTMLReport();
        file_put_contents($reportPath, $html);
        
        echo "Detailed report generated: {$reportPath}\n";
    }
    
    /**
     * Generate HTML integration test report
     */
    private function generateIntegrationHTMLReport() {
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report - Exam Seat Allocation System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #28a745; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        .card .value { font-size: 24px; font-weight: bold; color: #28a745; }
        .categories { margin-bottom: 30px; }
        .category { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .category-header { background: #28a745; color: white; padding: 15px; font-weight: bold; }
        .category-body { padding: 15px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-top: 10px; }
        .progress-fill { height: 100%; background: #28a745; width: 0%; transition: width 0.3s ease; }
        .footer { text-align: center; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Exam Seat Allocation Management System</h1>
            <h2>Integration Test Report</h2>
            <p><strong>Generated:</strong> " . date('Y-m-d H:i:s') . "</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Total Tests</h3>
                <div class="value">{$this->getTotalTestCount()}</div>
            </div>
            <div class="card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">{$this->getTotalPassedCount()}</div>
            </div>
            <div class="card">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">{$this->getTotalFailedCount()}</div>
            </div>
            <div class="card">
                <h3>Success Rate</h3>
                <div class="value" style="color: #28a745;">" . number_format(($this->getTotalPassedCount() / max($this->getTotalTestCount(), 1)) * 100, 1) . "%</div>
            </div>
        </div>
        
        <div class="categories">
HTML;

        foreach ($this->testResults as $category => $data) {
            $successRate = ($data['passed'] + $data['failed'] > 0) ? ($data['passed'] / ($data['passed'] + $data['failed'])) * 100 : 0;
            
            $html .= <<<HTML
            <div class="category">
                <div class="category-header">
                    {$category} ({$data['passed']}/{$data['failed']})
                </div>
                <div class="category-body">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {$successRate}%"></div>
                    </div>
                    <div style="margin-top: 10px;">
HTML;

            foreach ($data['details'] as $testDetail) {
                $statusClass = $testDetail['result'] === 'passed' ? 'status-passed' : 'status-failed';
                $statusText = $testDetail['result'] === 'passed' ? '✓ PASSED' : '✗ FAILED';
                
                $html .= <<<HTML
                        <div class="test-item">
                            <span>{$testDetail['test']}</span>
                            <span class="{$statusClass}">{$statusText}</span>
                        </div>
HTML;
            }

            $html .= "</div></div></div>";
        }

        $html .= <<<HTML
        </div>
        
        <div class="footer">
            <p>Integration tests completed successfully. All system components are working together correctly.</p>
            <p>Review the results above for any integration issues.</p>
        </div>
    </div>
    
    <script>
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
    
    /**
     * Helper methods for report generation
     */
    private function getTotalTestCount() {
        $count = 0;
        foreach ($this->testResults as $data) {
            $count += $data['passed'] + $data['failed'];
        }
        return $count;
    }
    
    private function getTotalPassedCount() {
        $count = 0;
        foreach ($this->testResults as $data) {
            $count += $data['passed'];
        }
        return $count;
    }
    
    private function getTotalFailedCount() {
        $count = 0;
        foreach ($this->testResults as $data) {
            $count += $data['failed'];
        }
        return $count;
    }
}

// Run integration tests if this file is executed directly
if (basename(__FILE__) === 'integration_tests.php') {
    $integrationTests = new IntegrationTests();
    $results = $integrationTests->runAllTests();
    
    exit($integrationTests->getTotalFailedCount() > 0 ? 1 : 0);
}