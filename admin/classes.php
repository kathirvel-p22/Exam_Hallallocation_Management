<?php
require_once '../admin/header.php';
require_once '../config/database.php';
require_once '../models/ClassModel.php';

// Get database connection
$db = getDatabaseConnection();

// Initialize model
$classModel = new ClassModel($db);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verify_csrf_token($csrf_token)) {
        $_SESSION['flash_message'] = 'Invalid CSRF token';
        $_SESSION['flash_type'] = 'danger';
        header('Location: classes.php');
        exit;
    }
    
    switch ($action) {
        case 'create_class':
            $class_name = trim($_POST['class_name'] ?? '');
            $student_count = (int)($_POST['student_count'] ?? 0);
            
            if (empty($class_name) || $student_count <= 0) {
                $_SESSION['flash_message'] = 'Class name and student count are required';
                $_SESSION['flash_type'] = 'danger';
            } else {
                try {
                    $stmt = $db->prepare("INSERT INTO classes (class_name, student_count, created_at) VALUES (?, ?, NOW())");
                    $stmt->execute([$class_name, $student_count]);
                    
                    $_SESSION['flash_message'] = 'Class created successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error creating class: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: classes.php');
            exit;
            
        case 'update_class':
            $class_id = $_POST['class_id'] ?? '';
            $class_name = trim($_POST['class_name'] ?? '');
            $student_count = (int)($_POST['student_count'] ?? 0);
            
            if (empty($class_id) || empty($class_name) || $student_count <= 0) {
                $_SESSION['flash_message'] = 'All fields are required';
                $_SESSION['flash_type'] = 'danger';
            } else {
                try {
                    $stmt = $db->prepare("UPDATE classes SET class_name = ?, student_count = ? WHERE id = ?");
                    $stmt->execute([$class_name, $student_count, $class_id]);
                    
                    $_SESSION['flash_message'] = 'Class updated successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error updating class: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: classes.php');
            exit;
            
        case 'delete_class':
            $class_id = $_POST['class_id'] ?? '';
            if ($class_id) {
                try {
                    // Check if class has allocations
                    $stmt = $db->prepare("SELECT COUNT(*) FROM allocations WHERE class_id = ?");
                    $stmt->execute([$class_id]);
                    $allocation_count = $stmt->fetchColumn();
                    
                    if ($allocation_count > 0) {
                        $_SESSION['flash_message'] = 'Cannot delete class with existing allocations';
                        $_SESSION['flash_type'] = 'warning';
                    } else {
                        $stmt = $db->prepare("DELETE FROM classes WHERE id = ?");
                        $stmt->execute([$class_id]);
                        
                        $_SESSION['flash_message'] = 'Class deleted successfully';
                        $_SESSION['flash_type'] = 'success';
                    }
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error deleting class: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: classes.php');
            exit;
    }
}

// Get all classes
$stmt = $db->query("SELECT * FROM classes ORDER BY class_name ASC");
$classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-users me-2"></i>Class Management
            </h1>
        </div>
    </div>

    <!-- Create Class Form -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-plus me-2"></i>Add New Class
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="classes.php">
                        <input type="hidden" name="action" value="create_class">
                        <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="class_name" class="form-label">Class Name</label>
                                <input type="text" class="form-control" id="class_name" name="class_name" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="student_count" class="form-label">Student Count</label>
                                <input type="number" class="form-control" id="student_count" name="student_count" min="1" required>
                            </div>
                            <div class="col-md-3 mb-3 d-flex align-items-end">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Add Class
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Classes List -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-list me-2"></i>Classes List
                    </h5>
                </div>
                <div class="card-body">
                    <?php if (!empty($classes)): ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Class Name</th>
                                        <th>Student Count</th>
                                        <th>Allocations</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($classes as $class): ?>
                                        <?php
                                        // Get allocation count for this class
                                        $stmt = $db->prepare("SELECT COUNT(*) FROM allocations WHERE class_id = ?");
                                        $stmt->execute([$class['id']]);
                                        $allocation_count = $stmt->fetchColumn();
                                        ?>
                                        <tr>
                                            <td>
                                                <strong><?php echo htmlspecialchars($class['class_name']); ?></strong>
                                            </td>
                                            <td>
                                                <span class="badge bg-primary"><?php echo $class['student_count']; ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-info"><?php echo $allocation_count; ?></span>
                                            </td>
                                            <td><?php echo date('M d, Y', strtotime($class['created_at'])); ?></td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <button type="button" class="btn btn-sm btn-outline-primary" 
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#editModal" 
                                                            onclick="setEditData(<?php echo $class['id']; ?>, '<?php echo addslashes($class['class_name']); ?>', <?php echo $class['student_count']; ?>)"
                                                            title="Edit Class">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-outline-danger" 
                                                            onclick="confirmDelete(<?php echo $class['id']; ?>, '<?php echo addslashes($class['class_name']); ?>')" 
                                                            title="Delete Class"
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
                            <i class="fas fa-users fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No classes found</h5>
                            <p class="text-muted">Add your first class to get started.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Class Modal -->
<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editModalLabel">Edit Class</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" action="classes.php">
                <input type="hidden" name="action" value="update_class">
                <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                <input type="hidden" name="class_id" id="editClassId">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="editClassName" class="form-label">Class Name</label>
                        <input type="text" class="form-control" id="editClassName" name="class_name" required>
                    </div>
                    <div class="mb-3">
                        <label for="editStudentCount" class="form-label">Student Count</label>
                        <input type="number" class="form-control" id="editStudentCount" name="student_count" min="1" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Class</button>
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
                <p>Are you sure you want to delete <strong id="deleteClassName"></strong>?</p>
                <p class="text-danger"><strong>This action cannot be undone.</strong></p>
            </div>
            <div class="modal-footer">
                <form method="POST" action="classes.php" id="deleteForm">
                    <input type="hidden" name="action" value="delete_class">
                    <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                    <input type="hidden" name="class_id" id="deleteClassId">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Delete Class</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function setEditData(classId, className, studentCount) {
    document.getElementById('editClassId').value = classId;
    document.getElementById('editClassName').value = className;
    document.getElementById('editStudentCount').value = studentCount;
}

function confirmDelete(classId, className) {
    document.getElementById('deleteClassId').value = classId;
    document.getElementById('deleteClassName').textContent = className;
    var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>

<?php require_once '../admin/footer.php'; ?>