<?php
require_once '../admin/header.php';
require_once '../config/database.php';
require_once '../models/ClassModel.php';
require_once '../models/RoomModel.php';
require_once '../models/AllocationModel.php';

// Get database connection
$db = getDatabaseConnection();

// Initialize models
$classModel = new ClassModel($db);
$roomModel = new RoomModel($db);
$allocationModel = new AllocationModel($db);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verify_csrf_token($csrf_token)) {
        $_SESSION['flash_message'] = 'Invalid CSRF token';
        $_SESSION['flash_type'] = 'danger';
        header('Location: exams.php');
        exit;
    }
    
    switch ($action) {
        case 'create_exam':
            $exam_name = trim($_POST['exam_name'] ?? '');
            $exam_date = $_POST['exam_date'] ?? '';
            $start_time = $_POST['start_time'] ?? '';
            $end_time = $_POST['end_time'] ?? '';
            
            if (empty($exam_name) || empty($exam_date) || empty($start_time) || empty($end_time)) {
                $_SESSION['flash_message'] = 'All fields are required';
                $_SESSION['flash_type'] = 'danger';
            } else {
                try {
                    $stmt = $db->prepare("INSERT INTO exams (exam_name, exam_date, start_time, end_time, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $stmt->execute([$exam_name, $exam_date, $start_time, $end_time]);
                    
                    $_SESSION['flash_message'] = 'Exam created successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error creating exam: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: exams.php');
            exit;
            
        case 'delete_exam':
            $exam_id = $_POST['exam_id'] ?? '';
            if ($exam_id) {
                try {
                    // Delete related allocations first
                    $stmt = $db->prepare("DELETE FROM allocations WHERE exam_id = ?");
                    $stmt->execute([$exam_id]);
                    
                    // Delete the exam
                    $stmt = $db->prepare("DELETE FROM exams WHERE id = ?");
                    $stmt->execute([$exam_id]);
                    
                    $_SESSION['flash_message'] = 'Exam deleted successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error deleting exam: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: exams.php');
            exit;
    }
}

// Get all exams
$stmt = $db->query("SELECT * FROM exams ORDER BY exam_date DESC, start_time DESC");
$exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-calendar-alt me-2"></i>Exam Management
            </h1>
        </div>
    </div>

    <!-- Create Exam Form -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-plus me-2"></i>Create New Exam
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST" action="exams.php">
                        <input type="hidden" name="action" value="create_exam">
                        <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="exam_name" class="form-label">Exam Name</label>
                                <input type="text" class="form-control" id="exam_name" name="exam_name" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="exam_date" class="form-label">Exam Date</label>
                                <input type="date" class="form-control" id="exam_date" name="exam_date" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label for="start_time" class="form-label">Start Time</label>
                                <input type="time" class="form-control" id="start_time" name="start_time" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <label for="end_time" class="form-label">End Time</label>
                                <input type="time" class="form-control" id="end_time" name="end_time" required>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-2"></i>Create Exam
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Exams List -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-list me-2"></i>Exams List
                    </h5>
                </div>
                <div class="card-body">
                    <?php if (!empty($exams)): ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Exam Name</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Classes</th>
                                        <th>Rooms</th>
                                        <th>Students</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($exams as $exam): ?>
                                        <?php
                                        // Get allocation stats for this exam
                                        $allocationStats = $allocationModel->getAllocationStats($exam['id']);
                                        ?>
                                        <tr>
                                            <td>
                                                <strong><?php echo htmlspecialchars($exam['exam_name']); ?></strong>
                                                <br><small class="text-muted">Created: <?php echo date('M d, Y', strtotime($exam['created_at'])); ?></small>
                                            </td>
                                            <td><?php echo date('F j, Y', strtotime($exam['exam_date'])); ?></td>
                                            <td><?php echo date('g:i A', strtotime($exam['start_time'])); ?> - <?php echo date('g:i A', strtotime($exam['end_time'])); ?></td>
                                            <td>
                                                <span class="badge bg-primary"><?php echo $allocationStats['class_count']; ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-info"><?php echo $allocationStats['room_count']; ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-success"><?php echo $allocationStats['student_count']; ?></span>
                                            </td>
                                            <td>
                                                <div class="btn-group" role="group">
                                                    <a href="allocations.php?exam_id=<?php echo $exam['id']; ?>" 
                                                       class="btn btn-sm btn-outline-primary" title="View Allocations">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger" 
                                                            onclick="confirmDelete(<?php echo $exam['id']; ?>)" 
                                                            title="Delete Exam">
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
                            <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No exams found</h5>
                            <p class="text-muted">Create your first exam to get started.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
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
                <p>Are you sure you want to delete this exam? This will also delete all associated allocations.</p>
                <p class="text-danger"><strong>This action cannot be undone.</strong></p>
            </div>
            <div class="modal-footer">
                <form method="POST" action="exams.php" id="deleteForm">
                    <input type="hidden" name="action" value="delete_exam">
                    <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                    <input type="hidden" name="exam_id" id="deleteExamId">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Delete Exam</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function confirmDelete(examId) {
    document.getElementById('deleteExamId').value = examId;
    var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>

<?php require_once '../admin/footer.php'; ?>