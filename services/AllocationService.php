<?php
/**
 * Allocation Service
 * 
 * Implements the core allocation algorithm for the Exam Seat Allocation System.
 * Handles the logic for allocating classes to rooms based on various rules and constraints.
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/ClassModel.php';
require_once __DIR__ . '/../models/RoomModel.php';
require_once __DIR__ . '/../models/AllocationModel.php';
require_once __DIR__ . '/../config/database.php';

class AllocationService {
    private $database;
    private $config;
    private $classModel;
    private $roomModel;
    private $allocationModel;
    private $logFile;

    /**
     * Constructor
     */
    public function __construct() {
        $this->config = require_once __DIR__ . '/../config/config.php';
        $this->database = new Database();
        $this->classModel = new ClassModel($this->database);
        $this->roomModel = new RoomModel($this->database);
        $this->allocationModel = new AllocationModel($this->database);
        $this->logFile = $this->config['system']['log_file'];
    }

    /**
     * Perform allocation for a specific exam date and shift
     * 
     * @param string $exam_date Exam date in YYYY-MM-DD format
     * @param string $shift Shift type (morning/afternoon)
     * @return array Allocation results with statistics
     */
    public function allocate($exam_date, $shift) {
        $result = [
            'success' => false,
            'message' => '',
            'statistics' => [
                'total_classes' => 0,
                'allocated_classes' => 0,
                'unallocated_classes' => 0,
                'total_rooms_used' => 0,
                'total_students_allocated' => 0,
                'allocation_details' => []
            ],
            'errors' => []
        ];

        try {
            // Validate inputs
            if (!$this->validateInputs($exam_date, $shift)) {
                $result['message'] = 'Invalid input parameters';
                $this->logError('Invalid input parameters: ' . $exam_date . ' - ' . $shift);
                return $result;
            }

            // Start transaction
            if (!$this->database->beginTransaction()) {
                $result['message'] = 'Failed to start database transaction';
                $this->logError('Failed to start database transaction');
                return $result;
            }

            // Clean previous allocations for this exam date and shift
            if (!$this->allocationModel->deleteByExamDateAndShift($exam_date, $shift)) {
                $this->database->rollbackTransaction();
                $result['message'] = 'Failed to clean previous allocations';
                $this->logError('Failed to clean previous allocations');
                return $result;
            }

            // Reset room allocation status
            if (!$this->resetRoomAllocations()) {
                $this->database->rollbackTransaction();
                $result['message'] = 'Failed to reset room allocations';
                $this->logError('Failed to reset room allocations');
                return $result;
            }

            // Get eligible classes and available rooms
            $classes = $this->classModel->getEligibleClasses();
            $rooms = $this->roomModel->getAvailableRooms();

            if (empty($classes)) {
                $result['message'] = 'No eligible classes found for allocation';
                $this->database->commitTransaction();
                $this->logInfo('No eligible classes found for allocation: ' . $exam_date . ' - ' . $shift);
                return $result;
            }

            if (empty($rooms)) {
                $result['message'] = 'No available rooms found for allocation';
                $this->database->commitTransaction();
                $this->logError('No available rooms found for allocation: ' . $exam_date . ' - ' . $shift);
                return $result;
            }

            // Perform allocation
            $allocation_result = $this->performAllocation($classes, $rooms, $exam_date, $shift);

            if ($allocation_result['success']) {
                // Commit transaction
                if ($this->database->commitTransaction()) {
                    $result['success'] = true;
                    $result['message'] = 'Allocation completed successfully';
                    $result['statistics'] = $allocation_result['statistics'];
                    $this->logInfo('Allocation completed successfully for: ' . $exam_date . ' - ' . $shift);
                } else {
                    $this->database->rollbackTransaction();
                    $result['message'] = 'Failed to commit allocation transaction';
                    $this->logError('Failed to commit allocation transaction');
                }
            } else {
                $this->database->rollbackTransaction();
                $result['message'] = 'Allocation failed';
                $result['errors'] = $allocation_result['errors'];
                $this->logError('Allocation failed for: ' . $exam_date . ' - ' . $shift);
            }

        } catch (Exception $e) {
            $this->database->rollbackTransaction();
            $result['message'] = 'Unexpected error during allocation: ' . $e->getMessage();
            $this->logError('Unexpected error: ' . $e->getMessage());
        }

        return $result;
    }

    /**
     * Perform the core allocation algorithm
     * 
     * @param array $classes Array of ClassModel objects
     * @param array $rooms Array of RoomModel objects
     * @param string $exam_date Exam date
     * @param string $shift Shift type
     * @return array Allocation result
     */
    private function performAllocation($classes, $rooms, $exam_date, $shift) {
        $result = [
            'success' => false,
            'statistics' => [
                'total_classes' => count($classes),
                'allocated_classes' => 0,
                'unallocated_classes' => 0,
                'total_rooms_used' => 0,
                'total_students_allocated' => 0,
                'allocation_details' => []
            ],
            'errors' => []
        ];

        $allocated_classes = [];
        $used_rooms = [];
        $total_students_allocated = 0;

        // Process each class
        foreach ($classes as $class) {
            $allocation_success = false;
            
            // Get rooms that can accommodate this class
            $available_rooms = $this->getAvailableRoomsForClass($class, $rooms);
            
            if (empty($available_rooms)) {
                $result['errors'][] = "No available rooms for class: " . $class->class_name;
                $result['statistics']['unallocated_classes']++;
                continue;
            }

            // Try to find the best room for this class
            $best_room = $this->findBestRoomForClass($class, $available_rooms);
            
            if ($best_room) {
                // Create allocation record
                $allocation = new AllocationModel($this->database);
                $allocation->exam_id = 1; // This would need to be passed or determined
                $allocation->room_id = $best_room->room_id;
                $allocation->allocated_date = $exam_date;
                $allocation->shift = $shift;
                $allocation->total_allocated_seats = $class->total_students;
                $allocation->is_confirmed = 1;
                $allocation->created_by = 1; // This would need to be determined

                if ($allocation->create()) {
                    $allocation_success = true;
                    $result['statistics']['allocated_classes']++;
                    $result['statistics']['total_students_allocated'] += $class->total_students;
                    $allocated_classes[] = $class->class_name;
                    $used_rooms[$best_room->room_id] = $best_room->room_name;
                    
                    // Add allocation detail
                    $result['statistics']['allocation_details'][] = [
                        'class' => $class->class_name,
                        'department_id' => $class->department_id,
                        'academic_level' => $class->academic_level,
                        'strength' => $class->total_students,
                        'room' => $best_room->room_name,
                        'room_capacity' => $best_room->capacity,
                        'students_allocated' => $class->total_students
                    ];
                } else {
                    $result['errors'][] = "Failed to create allocation record for class: " . $class->class_name;
                }
            } else {
                $result['errors'][] = "No suitable room found for class: " . $class->class_name;
                $result['statistics']['unallocated_classes']++;
            }
        }

        // Update statistics
        $result['statistics']['total_rooms_used'] = count($used_rooms);
        $result['success'] = empty($result['errors']);

        return $result;
    }

    /**
     * Get available rooms for a specific class based on allocation rules
     * 
     * @param ClassModel $class Class to allocate
     * @param array $rooms Available rooms
     * @return array Filtered rooms
     */
    private function getAvailableRoomsForClass($class, $rooms) {
        $filtered_rooms = [];

        foreach ($rooms as $room) {
            // Check if room can accommodate the class
            if ($room->capacity >= $class->total_students) {
                $filtered_rooms[] = $room;
            }
        }

        return $filtered_rooms;
    }

    /**
     * Find the best room for a class based on allocation strategy
     * 
     * @param ClassModel $class Class to allocate
     * @param array $rooms Available rooms
     * @return RoomModel|null Best room or null
     */
    private function findBestRoomForClass($class, $rooms) {
        if (empty($rooms)) {
            return null;
        }

        // Sort rooms by capacity (ascending) to use smallest suitable room first
        usort($rooms, function($a, $b) {
            return $a->capacity - $b->capacity;
        });

        // Look for exact match first if prioritized
        if ($this->config['allocation_rules']['prioritize_exact_matches']) {
            foreach ($rooms as $room) {
                if ($room->capacity === $class->total_students) {
                    return $room;
                }
            }
        }

        // Return the smallest room that can accommodate the class
        return $rooms[0];
    }

    /**
     * Reset room allocation status
     * 
     * @return bool True on success, false on failure
     */
    private function resetRoomAllocations() {
        try {
            $query = "UPDATE rooms SET is_allocated = 0, current_allocation = 0";
            $stmt = $this->database->getConnection()->prepare($query);
            return $stmt->execute();
        } catch (PDOException $exception) {
            $this->logError('Error resetting room allocations: ' . $exception->getMessage());
            return false;
        }
    }

    /**
     * Validate input parameters
     * 
     * @param string $exam_date Exam date
     * @param string $shift Shift type
     * @return bool True if valid, false otherwise
     */
    private function validateInputs($exam_date, $shift) {
        // Validate date format
        if (!strtotime($exam_date)) {
            return false;
        }

        // Validate shift
        if (!in_array($shift, $this->config['validation']['valid_shifts'])) {
            return false;
        }

        return true;
    }

    /**
     * Get allocation summary for a specific exam date and shift
     * 
     * @param string $exam_date Exam date
     * @param string $shift Shift type
     * @return array Allocation summary
     */
    public function getAllocationSummary($exam_id, $shift) {
        $summary = [
            'exam_id' => $exam_id,
            'shift' => $shift,
            'statistics' => $this->allocationModel->getAllocationStatistics($exam_id, $shift),
            'allocations' => $this->allocationModel->getByExamAndShift($exam_id, $shift)
        ];

        return $summary;
    }

    /**
     * Log information message
     * 
     * @param string $message Log message
     */
    private function logInfo($message) {
        if ($this->config['system']['enable_logging']) {
            $this->writeLog('INFO', $message);
        }
    }

    /**
     * Log error message
     * 
     * @param string $message Error message
     */
    private function logError($message) {
        if ($this->config['system']['enable_logging']) {
            $this->writeLog('ERROR', $message);
        }
    }

    /**
     * Write log entry to file
     * 
     * @param string $level Log level (INFO, ERROR)
     * @param string $message Log message
     */
    private function writeLog($level, $message) {
        $timestamp = date('Y-m-d H:i:s');
        $log_entry = "[$timestamp] [$level] $message" . PHP_EOL;
        
        // Ensure log directory exists
        $log_dir = dirname($this->logFile);
        if (!file_exists($log_dir)) {
            mkdir($log_dir, 0755, true);
        }

        file_put_contents($this->logFile, $log_entry, FILE_APPEND | LOCK_EX);
    }
}