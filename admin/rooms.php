<?php
require_once '../admin/header.php';
require_once '../config/database.php';
require_once '../models/RoomModel.php';

// Get database connection
$db = getDatabaseConnection();

// Initialize model
$roomModel = new RoomModel($db);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verify_csrf_token($csrf_token)) {
        $_SESSION['flash_message'] = 'Invalid CSRF token';
        $_SESSION['flash_type'] = 'danger';
        header('Location: rooms.php');
        exit;
    }
    
    switch ($action) {
        case 'create_room':
            $room_name = trim($_POST['room_name'] ?? '');
            $capacity = (int)($_POST['capacity'] ?? 0);
            $location = trim($_POST['location'] ?? '');
            $room_type = $_POST['room_type'] ?? 'Regular';
            
            if (empty($room_name) || $capacity <= 0 || empty($location)) {
                $_SESSION['flash_message'] = 'Room name, capacity, and location are required';
                $_SESSION['flash_type'] = 'danger';
            } else {
                try {
                    $stmt = $db->prepare("INSERT INTO rooms (room_name, capacity, location, room_type, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $stmt->execute([$room_name, $capacity, $location, $room_type]);
                    
                    $_SESSION['flash_message'] = 'Room created successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error creating room: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: rooms.php');
            exit;
            
        case 'update_room':
            $room_id = $_POST['room_id'] ?? '';
            $room_name = trim($_POST['room_name'] ?? '');
            $capacity = (int)($_POST['capacity'] ?? 0);
            $location = trim($_POST['location'] ?? '');
            $room_type = $_POST['room_type'] ?? 'Regular';
            
            if (empty($room_id) || empty($room_name) || $capacity <= 0 || empty($location)) {
                $_SESSION['flash_message'] = 'All fields are required';
                $_SESSION['flash_type'] = 'danger';
            } else {
                try {
                    $stmt = $db->prepare("UPDATE rooms SET room_name = ?, capacity = ?, location = ?, room_type = ? WHERE id = ?");
                    $stmt->execute([$room_name, $capacity, $location, $room_type, $room_id]);
                    
                    $_SESSION['flash_message'] = 'Room updated successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error updating room: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: rooms.php');
            exit;
            
        case 'delete_room':
            $room_id = $_POST['room_id'] ?? '';
            if ($room_id) {
                try {
                    // Check if room has allocations
                    $stmt = $db->prepare("SELECT COUNT(*) FROM allocations WHERE room_id = ?");
                    $stmt->execute([$room_id]);
                    $allocation_count = $stmt->fetchColumn();
                    
                    if ($allocation_count > 0) {
                        $_SESSION['flash_message'] = 'Cannot delete room with existing allocations';
                        $_SESSION['flash_type'] = 'warning';
                    } else {
                        $stmt = $db->prepare("DELETE FROM rooms WHERE id = ?");
                        $stmt->execute([$room_id]);
                        
                        $_SESSION['flash_message'] = 'Room deleted successfully';
                        $_SESSION['flash_type'] = 'success';
                    }
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error deleting room: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: rooms.php');
            exit;
    }
}

// Get all rooms
$stmt = $db->query("SELECT * FROM rooms ORDER BY room_name ASC");
$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-building me-2"></i>Room Management
            </h1>
        </div>
    </div>

    <!-- Create Room Form -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-plus me-2"></i>Add New Room
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="rooms.php">
                        <input type="hidden" name="action" value="create_room">
                        <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                        
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <label for="room_name" class="form-label">Room Name</label>
                                <input type="text" class="form-control" id="room_name" name="room_name" required>
                            </div>
                            <div class="col-md-2 mb-3">
                                <label for="capacity" class="form-label">Capacity</label>
                                <input type="number" class="form-control" id="capacity" name="capacity" min="1" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="location" class="form-label">Location</label>
                                <input type="text" class="form-control" id="location" name="location" required>
                            </div>
                            <div class="col-md-2 mb-3">
                                <label for="room_type" class="form-label">Room Type</label>
                                <select class="form-select" id="room_type" name="room_type">
                                    <option value="Regular">Regular</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Auditorium">Auditorium</option>
                                    <option value="Seminar">Seminar</option>
                                </select>
                            </div>
                            <div class="col-md-2 mb-3 d-flex align-items-end">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-save me-2"></i>Add Room
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Rooms List -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-list me-2"></i>Rooms List
                    </h5>
                </div>
                <div class="card-body">
                    <?php if (!empty($rooms)): ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Room Name</th>
                                        <th>Capacity</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Allocations</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($rooms as $room): ?>
                                        <?php
                                        // Get allocation count for this room
                                        $stmt = $db->prepare("SELECT COUNT(*) FROM allocations WHERE room_id = ?");
                                        $stmt->execute([$room['id']]);
                                        $allocation_count = $stmt->fetchColumn();
                                        
                                        // Determine status
                                        $status_class = $allocation_count > 0 ? 'bg-warning' : 'bg-success';
                                        $status_text = $allocation_count > 0 ? 'Allocated' : 'Available';
                                        ?>
                                        <tr>
                                            <td>
                                                <strong><?php echo htmlspecialchars($room['room_name']); ?></strong>
                                            </td>
                                            <td>
                                                <span class="badge bg-primary"><?php echo $room['capacity']; ?></span>
                                            </td>
                                            <td><?php echo htmlspecialchars($room['location']); ?></td>
                                            <td>
                                                <span class="badge bg-secondary"><?php echo htmlspecialchars($room['room_type']); ?></span>
                                            </td>
                                            <td>
                                                <span class="badge <?php echo $status_class; ?>"><?php echo $status_text; ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-info"><?php echo $allocation_count; ?></span>
                                            </td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <button type="button" class="btn btn-sm btn-outline-primary" 
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#editModal" 
                                                            onclick="setEditData(<?php echo $room['id']; ?>, '<?php echo addslashes($room['room_name']); ?>', <?php echo $room['capacity']; ?>, '<?php echo addslashes($room['location']); ?>', '<?php echo addslashes($room['room_type']); ?>')"
                                                            title="Edit Room">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-outline-danger" 
                                                            onclick="confirmDelete(<?php echo $room['id']; ?>, '<?php echo addslashes($room['room_name']); ?>')" 
                                                            title="Delete Room"
                                                            <?php echo $allocation_count > 0 ? 'disabled' : ''; ?>>
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <div class="text-center py-4">
                            <i class="fas fa-building fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No rooms found</h5>
                            <p class="text-muted">Add your first room to get started.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Room Modal -->
<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editModalLabel">Edit Room</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" action="rooms.php">
                <input type="hidden" name="action" value="update_room">
                <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                <input type="hidden" name="room_id" id="editRoomId">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="editRoomName" class="form-label">Room Name</label>
                            <input type="text" class="form-control" id="editRoomName" name="room_name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editCapacity" class="form-label">Capacity</label>
                            <input type="number" class="form-control" id="editCapacity" name="capacity" min="1" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="editLocation" class="form-label">Location</label>
                            <input type="text" class="form-control" id="editLocation" name="location" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="editRoomType" class="form-label">Room Type</label>
                            <select class="form-select" id="editRoomType" name="room_type">
                                <option value="Regular">Regular</option>
                                <option value="Lab">Lab</option>
                                <option value="Auditorium">Auditorium</option>
                                <option value="Seminar">Seminar</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Room</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete <strong id="deleteRoomName"></strong>?</p>
                <p class="text-danger"><strong>This action cannot be undone.</strong></p>
            </div>
            <div class="modal-footer">
                <form method="POST" action="rooms.php" id="deleteForm">
                    <input type="hidden" name="action" value="delete_room">
                    <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                    <input type="hidden" name="room_id" id="deleteRoomId">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Delete Room</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function setEditData(roomId, roomName, capacity, location, roomType) {
    document.getElementById('editRoomId').value = roomId;
    document.getElementById('editRoomName').value = roomName;
    document.getElementById('editCapacity').value = capacity;
    document.getElementById('editLocation').value = location;
    document.getElementById('editRoomType').value = roomType;
}

function confirmDelete(roomId, roomName) {
    document.getElementById('deleteRoomId').value = roomId;
    document.getElementById('deleteRoomName').textContent = roomName;
    var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>

<?php require_once '../admin/footer.php'; ?>