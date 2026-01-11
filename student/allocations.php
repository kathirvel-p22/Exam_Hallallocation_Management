<?php
require_once '../auth/protect_student.php';
require_once '../config/config.php';
require_once '../models/ClassModel.php';
require_once '../models/AllocationModel.php';

// Get student's department
$student_dept = $_SESSION['department'] ?? '';
$student_name = $_SESSION['name'] ?? '';

// Get all department allocations
$allocationModel = new AllocationModel($pdo);
$department_allocations = $allocationModel->getDepartmentAllocations($student_dept);

// Get specific hall allocation if hall_id is provided
$hall_id = $_GET['hall_id'] ?? null;
$specific_allocation = null;

if ($hall_id) {
    $specific_allocation = $allocationModel->getHallAllocationDetails($hall_id, $student_dept);
}
?>

<?php include 'header.php'; ?>

        <div class="page-header">
            <h1>Department Allocations</h1>
            <p class="page-subtitle">Department: <?php echo htmlspecialchars($student_dept); ?></p>
        </div>

        <?php if ($specific_allocation): ?>
            <!-- Single Hall View -->
            <div class="card">
                <div class="card-header">
                    <h3><?php echo htmlspecialchars($specific_allocation['hall_name']); ?></h3>
                    <p>Hall Number: <?php echo htmlspecialchars($specific_allocation['hall_number']); ?></p>
                </div>
                <div class="card-content">
                    <div class="allocation-details">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Hall Name:</label>
                                <span><?php echo htmlspecialchars($specific_allocation['hall_name']); ?></span>
                            </div>
                            <div class="detail-item">
                                <label>Hall Number:</label>
                                <span><?php echo htmlspecialchars($specific_allocation['hall_number']); ?></span>
                            </div>
                            <div class="detail-item">
                                <label>Capacity:</label>
                                <span><?php echo $specific_allocation['capacity']; ?> seats</span>
                            </div>
                            <div class="detail-item">
                                <label>Allocated Students:</label>
                                <span><?php echo $specific_allocation['student_count']; ?> students</span>
                            </div>
                            <div class="detail-item">
                                <label>Department:</label>
                                <span><?php echo htmlspecialchars($student_dept); ?></span>
                            </div>
                            <div class="detail-item">
                                <label>Utilization:</label>
                                <span class="utilization-badge">
                                    <?php 
                                    $utilization = 0;
                                    if ($specific_allocation['capacity'] > 0) {
                                        $utilization = round(($specific_allocation['student_count'] / $specific_allocation['capacity']) * 100, 1);
                                    }
                                    echo $utilization . '%';
                                    ?>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <a href="allocations.php" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Back to All Halls
                    </a>
                    <a href="reports.php?hall_id=<?php echo $hall_id; ?>" class="btn btn-primary">
                        <i class="fas fa-download"></i> Download Report
                    </a>
                </div>
            </div>

        <?php else: ?>
            <!-- All Halls View -->
            <?php if (!empty($department_allocations)): ?>
                <div class="filters-section">
                    <div class="filter-group">
                        <label for="search">Search Halls:</label>
                        <input type="text" id="search" placeholder="Search by hall name or number...">
                    </div>
                    <div class="filter-actions">
                        <span class="results-count">
                            Showing <?php echo count($department_allocations); ?> halls
                        </span>
                        <button class="btn btn-secondary" onclick="exportToCSV()">
                            <i class="fas fa-file-csv"></i> Export CSV
                        </button>
                    </div>
                </div>

                <div class="allocations-grid" id="allocations-grid">
                    <?php foreach ($department_allocations as $allocation): ?>
                        <div class="allocation-card" data-hall-name="<?php echo strtolower($allocation['hall_name']); ?>" 
                             data-hall-number="<?php echo strtolower($allocation['hall_number']); ?>">
                            <div class="card-header">
                                <h3><?php echo htmlspecialchars($allocation['hall_name']); ?></h3>
                                <p>Hall No: <?php echo htmlspecialchars($allocation['hall_number']); ?></p>
                            </div>
                            <div class="card-content">
                                <div class="allocation-stats">
                                    <div class="stat">
                                        <span class="stat-label">Capacity</span>
                                        <span class="stat-value"><?php echo $allocation['capacity']; ?></span>
                                        <span class="stat-unit">seats</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Allocated</span>
                                        <span class="stat-value"><?php echo $allocation['student_count']; ?></span>
                                        <span class="stat-unit">students</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Utilization</span>
                                        <span class="stat-value utilization-value">
                                            <?php 
                                            $utilization = 0;
                                            if ($allocation['capacity'] > 0) {
                                                $utilization = round(($allocation['student_count'] / $allocation['capacity']) * 100, 1);
                                            }
                                            echo $utilization;
                                            ?>
                                        </span>
                                        <span class="stat-unit">%</span>
                                    </div>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: <?php echo $utilization; ?>%"></div>
                                </div>
                            </div>
                            <div class="card-actions">
                                <a href="allocations.php?hall_id=<?php echo $allocation['hall_id']; ?>" 
                                   class="btn btn-primary">
                                    <i class="fas fa-eye"></i> View Details
                                </a>
                                <a href="reports.php?hall_id=<?php echo $allocation['hall_id']; ?>" 
                                   class="btn btn-secondary">
                                    <i class="fas fa-download"></i> Download Report
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>No Allocations Found</h3>
                    <p>No allocation data is available for your department yet.</p>
                    <a href="dashboard.php" class="btn btn-primary">Back to Dashboard</a>
                </div>
            <?php endif; ?>
        <?php endif; ?>

<?php include 'footer.php'; ?>