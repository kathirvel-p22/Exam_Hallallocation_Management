<?php
require_once '../admin/header.php';
require_once '../config/database.php';
require_once '../models/AllocationModel.php';
require_once '../models/ClassModel.php';
require_once '../models/RoomModel.php';
require_once '../services/AllocationService.php';

// Get database connection
$db = getDatabaseConnection();

// Initialize models and service
$allocationModel = new AllocationModel($db);
$classModel = new ClassModel($db);
$roomModel = new RoomModel($db);
$allocationService = new AllocationService($db);

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Verify CSRF token
    if (!verify_csrf_token($csrf_token)) {
        $_SESSION['flash_message'] = 'Invalid CSRF token';
        $_SESSION['flash_type'] = 'danger';
        header('Location: allocations.php');
        exit;
    }
    
    switch ($action) {
        case 'run_allocation':
            $exam_id = $_POST['exam_id'] ?? '';
            if ($exam_id) {
                try {
                    // Run allocation algorithm
                    $result = $allocationService->allocateSeats($exam_id);
                    
                    if ($result['success']) {
                        $_SESSION['flash_message'] = 'Allocation completed successfully. ' . $result['message'];
                        $_SESSION['flash_type'] = 'success';
                    } else {
                        $_SESSION['flash_message'] = 'Allocation failed: ' . $result['message'];
                        $_SESSION['flash_type'] = 'danger';
                    }
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error running allocation: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: allocations.php');
            exit;
            
        case 'delete_allocation':
            $allocation_id = $_POST['allocation_id'] ?? '';
            if ($allocation_id) {
                try {
                    $stmt = $db->prepare("DELETE FROM allocations WHERE id = ?");
                    $stmt->execute([$allocation_id]);
                    
                    $_SESSION['flash_message'] = 'Allocation deleted successfully';
                    $_SESSION['flash_type'] = 'success';
                } catch (Exception $e) {
                    $_SESSION['flash_message'] = 'Error deleting allocation: ' . $e->getMessage();
                    $_SESSION['flash_type'] = 'danger';
                }
            }
            header('Location: allocations.php');
            exit;
    }
}

// Get exam filter
$exam_id = $_GET['exam_id'] ?? null;

// Get exams for dropdown
$stmt = $db->query("SELECT * FROM exams ORDER BY exam_date DESC, start_time DESC");
$exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get allocations
$allocations = $allocationModel->getAllocations($exam_id);
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-sitemap me-2"></i>Allocation Management
            </h1>
        </div>
    </div>

    <!-- Allocation Controls -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-cog me-2"></i>Allocation Controls
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="exam_select" class="form-label">Select Exam</label>
                            <select class="form-select" id="exam_select" onchange="filterAllocations()">
                                <option value="">All Exams</option>
                                <?php foreach ($exams as $exam): ?>
                                    <option value="<?php echo $exam['id']; ?>" <?php echo $exam_id == $exam['id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($exam['exam_name']); ?> - <?php echo date('M d, Y', strtotime($exam['exam_date'])); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Quick Actions</label>
                            <div class="d-grid gap-2">
                                <button type="button" class="btn btn-success" onclick="runAllocation()">
                                    <i class="fas fa-play me-2"></i>Run Allocation
                                </button>
                                <a href="reports.php" class="btn btn-info">
                                    <i class="fas fa-download me-2"></i>Download Reports
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Allocation Summary</label>
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="card bg-primary text-white">
                                        <div class="card-body">
                                            <h5 class="card-title"><?php echo count($allocations); ?></h5>
                                            <p class="card-text">Total Allocations</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="card bg-info text-white">
                                        <div class="card-body">
                                            <h5 class="card-title"><?php echo array_sum(array_column($allocations, 'student_count')); ?></h5>
                                            <p class="card-text">Students Allocated</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="card bg-warning text-white">
                                        <div class="card-body">
                                            <h5 class="card-title"><?php echo count(array_unique(array_column($allocations, 'room_id'))); ?></h5>
                                            <p class="card-text">Rooms Used</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Allocations List -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-list me-2"></i>Allocations List
                    </h5>
                </div>
                <div class="card-body">
                    <?php if (!empty($allocations)): ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Class</th>
                                        <th>Room</th>
                                        <th>Students</th>
                                        <th>Capacity</th>
                                        <th>Utilization</th>
                                        <th>Allocated At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($allocations as $allocation): ?>
                                        <?php
                                        $utilization = $allocation['capacity'] > 0 ? round(($allocation['student_count'] / $allocation['capacity']) * 100, 1) : 0;
                                        $utilization_class = $utilization >= 80 ? 'bg-success' : ($utilization >= 60 ? 'bg-warning' : 'bg-info');
                                        ?>
                                        <tr>
                                            <td>
                                                <strong><?php echo htmlspecialchars($allocation['exam_name']); ?></strong>
                                                <br><small class="text-muted"><?php echo date('M d, Y', strtotime($allocation['exam_date'])); ?></small>
                                            </td>
                                            <td>
                                                <strong><?php echo htmlspecialchars($allocation['class_name']); ?></strong>
                                                <br><small class="text-muted"><?php echo $allocation['student_count']; ?> students</small>
                                            </td>
                                            <td>
                                                <strong><?php echo htmlspecialchars($allocation['room_name']); ?></strong>
                                                <br><small class="text-muted"><?php echo htmlspecialchars($allocation['location']); ?></small>
                                            </td>
                                            <td>
                                                <span class="badge bg-primary"><?php echo $allocation['student_count']; ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-secondary"><?php echo $allocation['capacity']; ?></span>
                                            </td>
                                            <td>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar <?php echo $utilization_class; ?>" 
                                                         style="width: <?php echo $utilization; ?>%">
                                                        <?php echo $utilization; ?>%
                                                    </div>
                                                </div>
                                            </td>
                                            <td><?php echo date('M d, Y H:i', strtotime($allocation['created_at'])); ?></td>
                                            <td>
                                                <button type="button" class="btn btn-sm btn-outline-danger" 
                                                        onclick="confirmDelete(<?php echo $allocation['id']; ?>)" 
                                                        title="Delete Allocation">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <div class="text-center py-4">
                            <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No allocations found</h5>
                            <p class="text-muted">
                                <?php echo $exam_id ? 'No allocations for this exam.' : 'No allocations found. Create an exam and run allocation to get started.'; ?>
                            </p>
                            <?php if (!$exam_id): ?>
                                <a href="exams.php" class="btn btn-primary">Create Exam</a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Run Allocation Modal -->
<div class="modal fade" id="allocationModal" tabindex="-1" aria-labelledby="allocationModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="allocationModalLabel">Run Allocation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" action="allocations.php">
                <input type="hidden" name="action" value="run_allocation">
                <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                <input type="hidden" name="exam_id" id="modalExamId">
                <div class="modal-body">
                    <p>Are you sure you want to run the allocation algorithm for this exam?</p>
                    <p class="text-warning"><strong>Note:</strong> This will overwrite any existing allocations for this exam.</p>
                    <div class="alert alert-info">
                        <h6>Allocation Algorithm:</h6>
                        <ul class="mb-0">
                            <li>Classes are allocated to rooms based on capacity</li>
                            <li>Rooms are filled to maximum capacity</li>
                            <li>Remaining students are allocated to additional rooms</li>
                            <li>Each class is kept together in the same room when possible</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success">Run Allocation</button>
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
                <p>Are you sure you want to delete this allocation?</p>
                <p class="text-danger"><strong>This action cannot be undone.</strong></p>
            </div>
            <div class="modal-footer">
                <form method="POST" action="allocations.php" id="deleteForm">
                    <input type="hidden" name="action" value="delete_allocation">
                    <input type="hidden" name="csrf_token" value="<?php echo generate_csrf_token(); ?>">
                    <input type="hidden" name="allocation_id" id="deleteAllocationId">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Delete Allocation</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function filterAllocations() {
    const examId = document.getElementById('exam_select').value;
    if (examId) {
        window.location.href = 'allocations.php?exam_id=' + examId;
    } else {
        window.location.href = 'allocations.php';
    }
}

function runAllocation() {
    const examId = document.getElementById('exam_select').value;
    if (!examId) {
        alert('Please select an exam first.');
        return;
    }
    
    document.getElementById('modalExamId').value = examId;
    var modal = new bootstrap.Modal(document.getElementById('allocationModal'));
    modal.show();
}

function confirmDelete(allocationId) {
    document.getElementById('deleteAllocationId').value = allocationId;
    var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>

<?php require_once '../admin/footer.php'; ?>