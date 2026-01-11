<?php
/**
 * Allocation Model
 *
 * Represents an allocation record entity with properties and database operations
 * for the Exam Seat Allocation System.
 */

require_once __DIR__ . '/../config/config.php';

class AllocationModel {
    private $conn;
    private $table_name = "allocations";

    // Properties (matching the database schema)
    public $allocation_id;
    public $exam_id;
    public $room_id;
    public $allocated_date;
    public $shift;
    public $total_allocated_seats;
    public $is_confirmed;
    public $created_at;
    public $updated_at;
    public $created_by;

    /**
     * Constructor
     * 
     * @param Database $database Database connection instance
     */
    public function __construct($database) {
        $this->conn = $database->getConnection();
    }

    /**
     * Create a new allocation record
     *
     * @return bool True on success, false on failure
     */
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                     SET exam_id = :exam_id,
                         room_id = :room_id,
                         allocated_date = :allocated_date,
                         shift = :shift,
                         total_allocated_seats = :total_allocated_seats,
                         is_confirmed = :is_confirmed,
                         created_by = :created_by";
            
            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':exam_id', $this->exam_id);
            $stmt->bindParam(':room_id', $this->room_id);
            $stmt->bindParam(':allocated_date', $this->allocated_date);
            $stmt->bindParam(':shift', $this->shift);
            $stmt->bindParam(':total_allocated_seats', $this->total_allocated_seats);
            $stmt->bindParam(':is_confirmed', $this->is_confirmed);
            $stmt->bindParam(':created_by', $this->created_by);

            return $stmt->execute();
        } catch (PDOException $exception) {
            error_log("Error creating allocation: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Get allocation by exam and room
     *
     * @param int $exam_id Exam ID
     * @param int $room_id Room ID
     * @return AllocationModel|null Returns AllocationModel object or null if not found
     */
    public function getByExamAndRoom($exam_id, $room_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE exam_id = :exam_id AND room_id = :room_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':exam_id', $exam_id);
            $stmt->bindParam(':room_id', $room_id);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->allocation_id = $row['allocation_id'];
                $this->exam_id = $row['exam_id'];
                $this->room_id = $row['room_id'];
                $this->allocated_date = $row['allocated_date'];
                $this->shift = $row['shift'];
                $this->total_allocated_seats = $row['total_allocated_seats'];
                $this->is_confirmed = $row['is_confirmed'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                $this->created_by = $row['created_by'];
                
                return $this;
            }
            return null;
        } catch (PDOException $exception) {
            error_log("Error fetching allocation by exam and room: " . $exception->getMessage());
            return null;
        }
    }

    /**
     * Get allocations by exam and shift
     *
     * @param int $exam_id Exam ID
     * @param string $shift Shift type
     * @return array Array of AllocationModel objects
     */
    public function getByExamAndShift($exam_id, $shift) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE exam_id = :exam_id AND shift = :shift
                     ORDER BY created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':exam_id', $exam_id);
            $stmt->bindParam(':shift', $shift);
            $stmt->execute();

            $allocations = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $allocation = new AllocationModel(null);
                $allocation->allocation_id = $row['allocation_id'];
                $allocation->exam_id = $row['exam_id'];
                $allocation->room_id = $row['room_id'];
                $allocation->allocated_date = $row['allocated_date'];
                $allocation->shift = $row['shift'];
                $allocation->total_allocated_seats = $row['total_allocated_seats'];
                $allocation->is_confirmed = $row['is_confirmed'];
                $allocation->created_at = $row['created_at'];
                $allocation->updated_at = $row['updated_at'];
                $allocation->created_by = $row['created_by'];
                
                $allocations[] = $allocation;
            }

            return $allocations;
        } catch (PDOException $exception) {
            error_log("Error fetching allocations by exam and shift: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get allocations by room
     *
     * @param int $room_id Room ID
     * @return array Array of AllocationModel objects
     */
    public function getByRoom($room_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE room_id = :room_id
                     ORDER BY created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':room_id', $room_id);
            $stmt->execute();

            $allocations = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $allocation = new AllocationModel(null);
                $allocation->allocation_id = $row['allocation_id'];
                $allocation->exam_id = $row['exam_id'];
                $allocation->room_id = $row['room_id'];
                $allocation->allocated_date = $row['allocated_date'];
                $allocation->shift = $row['shift'];
                $allocation->total_allocated_seats = $row['total_allocated_seats'];
                $allocation->is_confirmed = $row['is_confirmed'];
                $allocation->created_at = $row['created_at'];
                $allocation->updated_at = $row['updated_at'];
                $allocation->created_by = $row['created_by'];
                
                $allocations[] = $allocation;
            }

            return $allocations;
        } catch (PDOException $exception) {
            error_log("Error fetching allocations by room: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Delete allocation by ID
     *
     * @param int $allocation_id Allocation ID
     * @return bool True on success, false on failure
     */
    public function delete($allocation_id) {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE allocation_id = :allocation_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':allocation_id', $allocation_id);
            
            return $stmt->execute();
        } catch (PDOException $exception) {
            error_log("Error deleting allocation: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Delete all allocations for a specific exam and shift
     *
     * @param int $exam_id Exam ID
     * @param string $shift Shift type
     * @return bool True on success, false on failure
     */
    public function deleteByExamAndShift($exam_id, $shift) {
        try {
            $query = "DELETE FROM " . $this->table_name . "
                     WHERE exam_id = :exam_id AND shift = :shift";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':exam_id', $exam_id);
            $stmt->bindParam(':shift', $shift);
            
            return $stmt->execute();
        } catch (PDOException $exception) {
            error_log("Error deleting allocations by exam and shift: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Get total allocated seats for a specific exam and shift
     *
     * @param int $exam_id Exam ID
     * @param string $shift Shift type
     * @return int Total allocated seats
     */
    public function getTotalAllocatedSeats($exam_id, $shift) {
        try {
            $query = "SELECT SUM(total_allocated_seats) as total_allocated FROM " . $this->table_name . "
                     WHERE exam_id = :exam_id AND shift = :shift";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':exam_id', $exam_id);
            $stmt->bindParam(':shift', $shift);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total_allocated'] ?? 0;
        } catch (PDOException $exception) {
            error_log("Error calculating total allocated seats: " . $exception->getMessage());
            return 0;
        }
    }

    /**
     * Get allocation statistics for a specific exam and shift
     *
     * @param int $exam_id Exam ID
     * @param string $shift Shift type
     * @return array Statistics array
     */
    public function getAllocationStatistics($exam_id, $shift) {
        try {
            $query = "SELECT
                        COUNT(*) as total_allocations,
                        SUM(total_allocated_seats) as total_seats_allocated,
                        COUNT(DISTINCT room_id) as unique_rooms_used,
                        AVG(total_allocated_seats) as avg_seats_per_room
                      FROM " . $this->table_name . "
                      WHERE exam_id = :exam_id AND shift = :shift AND is_confirmed = 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':exam_id', $exam_id);
            $stmt->bindParam(':shift', $shift);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            error_log("Error fetching allocation statistics: " . $exception->getMessage());
            return [
                'total_allocations' => 0,
                'total_seats_allocated' => 0,
                'unique_rooms_used' => 0,
                'avg_seats_per_room' => 0
            ];
        }
    
        /**
         * Get department allocation summary
         *
         * @param string $department Department name
         * @return array Summary statistics
         */
        public function getDepartmentAllocationSummary($department) {
            try {
                $query = "SELECT
                            COUNT(DISTINCT a.room_id) as total_halls,
                            COUNT(DISTINCT s.student_id) as total_students,
                            SUM(r.capacity) as total_capacity
                          FROM allocations a
                          INNER JOIN rooms r ON a.room_id = r.room_id
                          INNER JOIN students s ON s.department = :department
                          WHERE a.is_confirmed = 1
                          AND s.department = :department";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':department', $department);
                $stmt->execute();
    
                return $stmt->fetch(PDO::FETCH_ASSOC) ?: [
                    'total_halls' => 0,
                    'total_students' => 0,
                    'total_capacity' => 0
                ];
            } catch (PDOException $exception) {
                error_log("Error fetching department allocation summary: " . $exception->getMessage());
                return [
                    'total_halls' => 0,
                    'total_students' => 0,
                    'total_capacity' => 0
                ];
            }
        }
    
        /**
         * Get recent department allocations
         *
         * @param string $department Department name
         * @param int $limit Number of records to return
         * @return array Array of allocation records
         */
        public function getRecentDepartmentAllocations($department, $limit = 5) {
            try {
                $query = "SELECT
                            a.allocation_id,
                            r.room_id,
                            r.room_name as hall_name,
                            r.room_number as hall_number,
                            r.capacity,
                            COUNT(s.student_id) as student_count
                          FROM allocations a
                          INNER JOIN rooms r ON a.room_id = r.room_id
                          LEFT JOIN students s ON s.department = :department
                          WHERE a.is_confirmed = 1
                          AND s.department = :department
                          GROUP BY a.allocation_id, r.room_id, r.room_name, r.room_number, r.capacity
                          ORDER BY a.created_at DESC
                          LIMIT :limit";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':department', $department);
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
    
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $exception) {
                error_log("Error fetching recent department allocations: " . $exception->getMessage());
                return [];
            }
        }
    
        /**
         * Get department allocations
         *
         * @param string $department Department name
         * @return array Array of allocation records
         */
        public function getDepartmentAllocations($department) {
            try {
                $query = "SELECT
                            a.allocation_id,
                            r.room_id,
                            r.room_name as hall_name,
                            r.room_number as hall_number,
                            r.capacity,
                            COUNT(s.student_id) as student_count
                          FROM allocations a
                          INNER JOIN rooms r ON a.room_id = r.room_id
                          LEFT JOIN students s ON s.department = :department
                          WHERE a.is_confirmed = 1
                          AND s.department = :department
                          GROUP BY a.allocation_id, r.room_id, r.room_name, r.room_number, r.capacity
                          ORDER BY r.room_number";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':department', $department);
                $stmt->execute();
    
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $exception) {
                error_log("Error fetching department allocations: " . $exception->getMessage());
                return [];
            }
        }
    
        /**
         * Get hall allocation details
         *
         * @param int $hall_id Hall ID
         * @param string $department Department name
         * @return array|null Hall allocation details or null if not found
         */
        public function getHallAllocationDetails($hall_id, $department) {
            try {
                $query = "SELECT
                            a.allocation_id,
                            r.room_id,
                            r.room_name as hall_name,
                            r.room_number as hall_number,
                            r.capacity,
                            COUNT(s.student_id) as student_count
                          FROM allocations a
                          INNER JOIN rooms r ON a.room_id = r.room_id
                          LEFT JOIN students s ON s.department = :department
                          WHERE a.room_id = :hall_id
                          AND a.is_confirmed = 1
                          AND s.department = :department
                          GROUP BY a.allocation_id, r.room_id, r.room_name, r.room_number, r.capacity";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':hall_id', $hall_id, PDO::PARAM_INT);
                $stmt->bindParam(':department', $department);
                $stmt->execute();
    
                return $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (PDOException $exception) {
                error_log("Error fetching hall allocation details: " . $exception->getMessage());
                return null;
            }
        }
    }

    /**
     * Validate allocation data
     *
     * @return bool True if valid, false otherwise
     */
    public function validate() {
        // Check required fields
        if (empty($this->exam_id) || empty($this->room_id) ||
            empty($this->allocated_date) || empty($this->shift) ||
            $this->total_allocated_seats <= 0) {
            return false;
        }

        return true;
    }
}