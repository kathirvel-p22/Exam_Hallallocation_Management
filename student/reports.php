<?php
require_once '../auth/protect_student.php';
require_once '../config/config.php';
require_once '../models/ClassModel.php';
require_once '../models/AllocationModel.php';

// Get student's department
$student_dept = $_SESSION['department'] ?? '';
$student_name = $_SESSION['name'] ?? '';

// Get department allocations for reports
$allocationModel = new AllocationModel($pdo);
$department_allocations = $allocationModel->getDepartmentAllocations($student_dept);

// Get specific hall if hall_id is provided
$hall_id = $_GET['hall_id'] ?? null;
$specific_hall = null;

if ($hall_id) {
    $specific_hall = $allocationModel->getHallAllocationDetails($hall_id, $student_dept);
}
?>

<?php include 'header.php'; ?>

        <div class="page-header">
            <h1>Department Reports</h1>
            <p class="page-subtitle">Department: <?php echo htmlspecialchars($student_dept); ?></p>
        </div>

        <div class="reports-container">
            <?php if ($specific_hall): ?>
                <!-- Single Hall Report -->
                <div class="card">
                    <div class="card-header">
                        <h3>Report: <?php echo htmlspecialchars($specific_hall['hall_name']); ?></h3>
                        <p>Hall Number: <?php echo htmlspecialchars($specific_hall['hall_number']); ?></p>
                    </div>
                    <div class="card-content">
                        <div class="report-details">
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Hall Name:</label>
                                    <span><?php echo htmlspecialchars($specific_hall['hall_name']); ?></span>
                                </div>
                                <div class="detail-item">
                                    <label>Hall Number:</label>
                                    <span><?php echo htmlspecialchars($specific_hall['hall_number']); ?></span>
                                </div>
                                <div class="detail-item">
                                    <label>Capacity:</label>
                                    <span><?php echo $specific_hall['capacity']; ?> seats</span>
                                </div>
                                <div class="detail-item">
                                    <label>Allocated Students:</label>
                                    <span><?php echo $specific_hall['student_count']; ?> students</span>
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
                                        if ($specific_hall['capacity'] > 0) {
                                            $utilization = round(($specific_hall['student_count'] / $specific_hall['capacity']) * 100, 1);
                                        }
                                        echo $utilization . '%';
                                        ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <a href="reports.php" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back to All Reports
                        </a>
                        <button class="btn btn-primary" onclick="downloadReport('department', 'csv')">
                            <i class="fas fa-file-csv"></i> Download CSV
                        </button>
                        <button class="btn btn-primary" onclick="downloadReport('department', 'pdf')">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                        <a href="../downloads/reports.php" class="btn btn-info">
                            <i class="fas fa-file-alt"></i> Advanced Reports
                        </a>
                    </div>
                </div>

            <?php else: ?>
                <!-- Department Summary Report -->
                <?php if (!empty($department_allocations)): ?>
                    <div class="summary-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total Halls</h3>
                                <p class="stat-number"><?php echo count($department_allocations); ?></p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total Students</h3>
                                <p class="stat-number">
                                    <?php 
                                    $total_students = array_sum(array_column($department_allocations, 'student_count'));
                                    echo $total_students;
                                    ?>
                                </p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-chair"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Total Capacity</h3>
                                <p class="stat-number">
                                    <?php 
                                    $total_capacity = array_sum(array_column($department_allocations, 'capacity'));
                                    echo $total_capacity;
                                    ?>
                                </p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <div class="stat-info">
                                <h3>Avg Utilization</h3>
                                <p class="stat-number">
                                    <?php 
                                    $avg_utilization = 0;
                                    if ($total_capacity > 0) {
                                        $avg_utilization = round(($total_students / $total_capacity) * 100, 1);
                                    }
                                    echo $avg_utilization . '%';
                                    ?>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="reports-actions">
                        <h3>Download Options</h3>
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="downloadReport('department', 'csv')">
                                <i class="fas fa-file-csv"></i> Department CSV Report
                            </button>
                            <button class="btn btn-primary" onclick="downloadReport('department', 'pdf')">
                                <i class="fas fa-file-pdf"></i> Department PDF Report
                            </button>
                            <a href="../downloads/reports.php" class="btn btn-info">
                                <i class="fas fa-file-alt"></i> Advanced Reports
                            </a>
                        </div>
                    </div>

                    <div class="reports-list">
                        <h3>Individual Hall Reports</h3>
                        <div class="hall-reports-grid">
                            <?php foreach ($department_allocations as $allocation): ?>
                                <div class="hall-report-card">
                                    <div class="report-header">
                                        <h4><?php echo htmlspecialchars($allocation['hall_name']); ?></h4>
                                        <p>Hall No: <?php echo htmlspecialchars($allocation['hall_number']); ?></p>
                                    </div>
                                    <div class="report-stats">
                                        <div class="stat">
                                            <span class="stat-label">Capacity</span>
                                            <span class="stat-value"><?php echo $allocation['capacity']; ?></span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-label">Students</span>
                                            <span class="stat-value"><?php echo $allocation['student_count']; ?></span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-label">Utilization</span>
                                            <span class="stat-value">
                                                <?php 
                                                $utilization = 0;
                                                if ($allocation['capacity'] > 0) {
                                                    $utilization = round(($allocation['student_count'] / $allocation['capacity']) * 100, 1);
                                                }
                                                echo $utilization . '%';
                                                ?>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="report-actions">
                                        <a href="reports.php?hall_id=<?php echo $allocation['hall_id']; ?>" 
                                           class="btn btn-secondary">
                                            <i class="fas fa-eye"></i> View Report
                                        </a>
                                        <button class="btn btn-primary"
                                                onclick="downloadReport('hall', 'csv', <?php echo $allocation['hall_id']; ?>)">
                                            <i class="fas fa-file-csv"></i> CSV
                                        </button>
                                        <button class="btn btn-primary"
                                                onclick="downloadReport('hall', 'pdf', <?php echo $allocation['hall_id']; ?>)">
                                            <i class="fas fa-file-pdf"></i> PDF
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <h3>No Reports Available</h3>
                        <p>No allocation data is available for your department yet.</p>
                        <a href="dashboard.php" class="btn btn-primary">Back to Dashboard</a>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>

<?php include 'footer.php'; ?>

<script>
function downloadReport(reportType, format, hallId = null) {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const department = '<?php echo $_SESSION['department'] ?? ''; ?>';
    
    const params = new URLSearchParams({
        'format': format,
        'report_type': reportType,
        'department': department,
        'token': token
    });
    
    if (hallId) {
        params.append('hall_id', hallId);
    }
    
    window.open('../downloads/download_handler.php?' + params.toString(), '_blank');
}
</script>