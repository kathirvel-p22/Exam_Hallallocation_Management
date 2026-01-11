<?php
/**
 * Class Model
 *
 * Represents an exam class entity with properties and database operations
 * for the Exam Seat Allocation System.
 */

require_once __DIR__ . '/../config/config.php';

class ClassModel {
    private $conn;
    private $table_name = "classes";

    // Properties (matching the database schema)
    public $class_id;
    public $class_name;
    public $academic_year;
    public $academic_level;
    public $department_id;
    public $total_students;
    public $created_at;
    public $updated_at;
    public $is_active;

    /**
     * Constructor
     * 
     * @param Database $database Database connection instance
     */
    public function __construct($database) {
        $this->conn = $database->getConnection();
    }

    /**
     * Get all eligible classes for allocation
     *
     * @return array Array of ClassModel objects
     */
    public function getEligibleClasses() {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE is_active = 1
                     AND total_students > 0
                     ORDER BY total_students DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $classes = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $class = new ClassModel(null);
                $class->class_id = $row['class_id'];
                $class->class_name = $row['class_name'];
                $class->academic_year = $row['academic_year'];
                $class->academic_level = $row['academic_level'];
                $class->department_id = $row['department_id'];
                $class->total_students = $row['total_students'];
                $class->created_at = $row['created_at'];
                $class->updated_at = $row['updated_at'];
                $class->is_active = $row['is_active'];
                
                $classes[] = $class;
            }

            return $classes;
        } catch (PDOException $exception) {
            error_log("Error fetching eligible classes: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get class by ID
     *
     * @param int $class_id Class ID
     * @return ClassModel|null Returns ClassModel object or null if not found
     */
    public function getById($class_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE class_id = :class_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':class_id', $class_id);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->class_id = $row['class_id'];
                $this->class_name = $row['class_name'];
                $this->academic_year = $row['academic_year'];
                $this->academic_level = $row['academic_level'];
                $this->department_id = $row['department_id'];
                $this->total_students = $row['total_students'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                $this->is_active = $row['is_active'];
                
                return $this;
            }
            return null;
        } catch (PDOException $exception) {
            error_log("Error fetching class by ID: " . $exception->getMessage());
            return null;
        }
    }

    /**
     * Get classes by department
     *
     * @param int $department_id Department ID
     * @return array Array of ClassModel objects
     */
    public function getByDepartment($department_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE department_id = :department_id
                     AND is_active = 1
                     ORDER BY total_students DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':department_id', $department_id);
            $stmt->execute();

            $classes = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $class = new ClassModel(null);
                $class->class_id = $row['class_id'];
                $class->class_name = $row['class_name'];
                $class->academic_year = $row['academic_year'];
                $class->academic_level = $row['academic_level'];
                $class->department_id = $row['department_id'];
                $class->total_students = $row['total_students'];
                $class->created_at = $row['created_at'];
                $class->updated_at = $row['updated_at'];
                $class->is_active = $row['is_active'];
                
                $classes[] = $class;
            }

            return $classes;
        } catch (PDOException $exception) {
            error_log("Error fetching classes by department: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get classes by academic level
     *
     * @param string $academic_level Academic level (UG1, UG2, UG3, UG4, PG1, PG2)
     * @return array Array of ClassModel objects
     */
    public function getByAcademicLevel($academic_level) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE academic_level = :academic_level
                     AND is_active = 1
                     ORDER BY total_students DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':academic_level', $academic_level);
            $stmt->execute();

            $classes = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $class = new ClassModel(null);
                $class->class_id = $row['class_id'];
                $class->class_name = $row['class_name'];
                $class->academic_year = $row['academic_year'];
                $class->academic_level = $row['academic_level'];
                $class->department_id = $row['department_id'];
                $class->total_students = $row['total_students'];
                $class->created_at = $row['created_at'];
                $class->updated_at = $row['updated_at'];
                $class->is_active = $row['is_active'];
                
                $classes[] = $class;
            }

            return $classes;
        } catch (PDOException $exception) {
            error_log("Error fetching classes by academic level: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Validate class data
     *
     * @return bool True if valid, false otherwise
     */
    public function validate() {
        $config = require_once __DIR__ . '/../config/config.php';
        $validation = $config['validation'];

        // Check total_students bounds
        if ($this->total_students < $validation['min_class_strength'] ||
            $this->total_students > $validation['max_class_strength']) {
            return false;
        }

        // Check academic level
        if (!in_array($this->academic_level, $validation['valid_academic_levels'])) {
            return false;
        }

        // Check required fields
        if (empty($this->class_name) || empty($this->department_id)) {
            return false;
        }

        return true;
    }

    /**
     * Get total strength of all eligible classes
     *
     * @return int Total strength
     */
    public function getTotalStrength() {
        try {
            $query = "SELECT SUM(total_students) as total_strength FROM " . $this->table_name . "
                     WHERE is_active = 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total_strength'] ?? 0;
        } catch (PDOException $exception) {
            error_log("Error calculating total strength: " . $exception->getMessage());
            return 0;
        }
    }
}