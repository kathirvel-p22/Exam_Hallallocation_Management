<?php
/**
 * Room Model
 *
 * Represents an examination room/hall entity with properties and database operations
 * for the Exam Seat Allocation System.
 */

require_once __DIR__ . '/../config/config.php';

class RoomModel {
    private $conn;
    private $table_name = "rooms";

    // Properties (matching the database schema)
    public $room_id;
    public $room_code;
    public $room_name;
    public $capacity;
    public $room_type;
    public $floor_number;
    public $building_name;
    public $has_projector;
    public $has_whiteboard;
    public $has_computers;
    public $computer_count;
    public $is_active;
    public $created_at;
    public $updated_at;

    /**
     * Constructor
     * 
     * @param Database $database Database connection instance
     */
    public function __construct($database) {
        $this->conn = $database->getConnection();
    }

    /**
     * Get all available rooms sorted by capacity (ascending)
     *
     * @return array Array of RoomModel objects
     */
    public function getAvailableRooms() {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE is_active = 1
                     ORDER BY capacity ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $rooms = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $room = new RoomModel(null);
                $room->room_id = $row['room_id'];
                $room->room_code = $row['room_code'];
                $room->room_name = $row['room_name'];
                $room->capacity = $row['capacity'];
                $room->room_type = $row['room_type'];
                $room->floor_number = $row['floor_number'];
                $room->building_name = $row['building_name'];
                $room->has_projector = $row['has_projector'];
                $room->has_whiteboard = $row['has_whiteboard'];
                $room->has_computers = $row['has_computers'];
                $room->computer_count = $row['computer_count'];
                $room->is_active = $row['is_active'];
                $room->created_at = $row['created_at'];
                $room->updated_at = $row['updated_at'];
                
                $rooms[] = $room;
            }

            return $rooms;
        } catch (PDOException $exception) {
            error_log("Error fetching available rooms: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get rooms by building name
     *
     * @param string $building_name Building name
     * @return array Array of RoomModel objects
     */
    public function getByBuilding($building_name) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE building_name = :building_name
                     AND is_active = 1
                     ORDER BY capacity ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':building_name', $building_name);
            $stmt->execute();

            $rooms = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $room = new RoomModel(null);
                $room->room_id = $row['room_id'];
                $room->room_code = $row['room_code'];
                $room->room_name = $row['room_name'];
                $room->capacity = $row['capacity'];
                $room->room_type = $row['room_type'];
                $room->floor_number = $row['floor_number'];
                $room->building_name = $row['building_name'];
                $room->has_projector = $row['has_projector'];
                $room->has_whiteboard = $row['has_whiteboard'];
                $room->has_computers = $row['has_computers'];
                $room->computer_count = $row['computer_count'];
                $room->is_active = $row['is_active'];
                $room->created_at = $row['created_at'];
                $room->updated_at = $row['updated_at'];
                
                $rooms[] = $room;
            }

            return $rooms;
        } catch (PDOException $exception) {
            error_log("Error fetching rooms by building: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get rooms by capacity range
     *
     * @param int $min_capacity Minimum capacity
     * @param int $max_capacity Maximum capacity
     * @return array Array of RoomModel objects
     */
    public function getByCapacityRange($min_capacity, $max_capacity) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE capacity >= :min_capacity
                     AND capacity <= :max_capacity
                     AND is_active = 1
                     ORDER BY capacity ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':min_capacity', $min_capacity);
            $stmt->bindParam(':max_capacity', $max_capacity);
            $stmt->execute();

            $rooms = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $room = new RoomModel(null);
                $room->room_id = $row['room_id'];
                $room->room_code = $row['room_code'];
                $room->room_name = $row['room_name'];
                $room->capacity = $row['capacity'];
                $room->room_type = $row['room_type'];
                $room->floor_number = $row['floor_number'];
                $room->building_name = $row['building_name'];
                $room->has_projector = $row['has_projector'];
                $room->has_whiteboard = $row['has_whiteboard'];
                $room->has_computers = $row['has_computers'];
                $room->computer_count = $row['computer_count'];
                $room->is_active = $row['is_active'];
                $room->created_at = $row['created_at'];
                $room->updated_at = $row['updated_at'];
                
                $rooms[] = $room;
            }

            return $rooms;
        } catch (PDOException $exception) {
            error_log("Error fetching rooms by capacity range: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get room by ID
     *
     * @param int $room_id Room ID
     * @return RoomModel|null Returns RoomModel object or null if not found
     */
    public function getById($room_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE room_id = :room_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':room_id', $room_id);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $this->room_id = $row['room_id'];
                $this->room_code = $row['room_code'];
                $this->room_name = $row['room_name'];
                $this->capacity = $row['capacity'];
                $this->room_type = $row['room_type'];
                $this->floor_number = $row['floor_number'];
                $this->building_name = $row['building_name'];
                $this->has_projector = $row['has_projector'];
                $this->has_whiteboard = $row['has_whiteboard'];
                $this->has_computers = $row['has_computers'];
                $this->computer_count = $row['computer_count'];
                $this->is_active = $row['is_active'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                
                return $this;
            }
            return null;
        } catch (PDOException $exception) {
            error_log("Error fetching room by ID: " . $exception->getMessage());
            return null;
        }
    }

    /**
     * Update room status (active/inactive)
     *
     * @param int $room_id Room ID
     * @param bool $is_active Active status
     * @return bool True on success, false on failure
     */
    public function updateRoomStatus($room_id, $is_active) {
        try {
            $query = "UPDATE " . $this->table_name . "
                     SET is_active = :is_active,
                         updated_at = NOW()
                     WHERE room_id = :room_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':is_active', $is_active);
            $stmt->bindParam(':room_id', $room_id);
            
            return $stmt->execute();
        } catch (PDOException $exception) {
            error_log("Error updating room status: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Mark room as active
     *
     * @param int $room_id Room ID
     * @return bool True on success, false on failure
     */
    public function markAsActive($room_id) {
        return $this->updateRoomStatus($room_id, 1);
    }

    /**
     * Mark room as inactive
     *
     * @param int $room_id Room ID
     * @return bool True on success, false on failure
     */
    public function markAsInactive($room_id) {
        return $this->updateRoomStatus($room_id, 0);
    }

    /**
     * Validate room data
     *
     * @return bool True if valid, false otherwise
     */
    public function validate() {
        $config = require_once __DIR__ . '/../config/config.php';
        $validation = $config['validation'];

        // Check capacity bounds
        if ($this->capacity < $validation['min_room_capacity'] ||
            $this->capacity > $validation['max_room_capacity']) {
            return false;
        }

        // Check required fields
        if (empty($this->room_name) || empty($this->room_code)) {
            return false;
        }

        return true;
    }

    /**
     * Get total capacity of all available rooms
     *
     * @return int Total capacity
     */
    public function getTotalCapacity() {
        try {
            $query = "SELECT SUM(capacity) as total_capacity FROM " . $this->table_name . "
                     WHERE is_active = 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total_capacity'] ?? 0;
        } catch (PDOException $exception) {
            error_log("Error calculating total capacity: " . $exception->getMessage());
            return 0;
        }
    }

    /**
     * Get rooms that can accommodate a specific class strength
     *
     * @param int $class_strength Class strength to accommodate
     * @return array Array of RoomModel objects that can accommodate the class
     */
    public function getRoomsForClass($class_strength) {
        try {
            $query = "SELECT * FROM " . $this->table_name . "
                     WHERE capacity >= :class_strength
                     AND is_active = 1
                     ORDER BY capacity ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':class_strength', $class_strength);
            $stmt->execute();

            $rooms = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $room = new RoomModel(null);
                $room->room_id = $row['room_id'];
                $room->room_code = $row['room_code'];
                $room->room_name = $row['room_name'];
                $room->capacity = $row['capacity'];
                $room->room_type = $row['room_type'];
                $room->floor_number = $row['floor_number'];
                $room->building_name = $row['building_name'];
                $room->has_projector = $row['has_projector'];
                $room->has_whiteboard = $row['has_whiteboard'];
                $room->has_computers = $row['has_computers'];
                $room->computer_count = $row['computer_count'];
                $room->is_active = $row['is_active'];
                $room->created_at = $row['created_at'];
                $room->updated_at = $row['updated_at'];
                
                $rooms[] = $room;
            }

            return $rooms;
        } catch (PDOException $exception) {
            error_log("Error fetching rooms for class: " . $exception->getMessage());
            return [];
        }
    }
}