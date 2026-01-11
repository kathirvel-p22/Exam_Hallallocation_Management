<?php
require_once '../auth/protect_student.php';
require_once '../config/config.php';
require_once '../models/ClassModel.php';
require_once '../models/AllocationModel.php';

// Get student's department
$student_dept = $_SESSION['department'] ?? '';
$student_name = $_SESSION['name'] ?? '';
$student_reg_no = $_SESSION['register_number'] ?? '';

// Get department allocation summary
$allocationModel = new AllocationModel($pdo);
$dept_summary = $allocationModel->getDepartmentAllocationSummary($student_dept);

// Get recent allocations
$recent_allocations = $allocationModel->getRecentDepartmentAllocations($student_dept, 5);
?>

<?php include 'header.php'; ?>

        <div class="dashboard-content">
            <div class="welcome-section">
                <h2>Welcome, <?php echo htmlspecialchars($student_name); ?>!</h2>
                <p class="welcome-subtitle">Department: <?php echo htmlspecialchars($student_dept); ?></p>
                <p class="welcome-subtitle">Register Number: <?php echo htmlspecialchars($student_reg_no); ?></p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Halls Allocated</h3>
                        <p class="stat-number"><?php echo $dept_summary['total_halls'] ?? 0; ?></p>
                        <p class="stat-label">Department Halls</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Students</h3>
                        <p class="stat-number"><?php echo $dept_summary['total_students'] ?? 0; ?></p>
                        <p class="stat-label">Department Students</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chair"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Capacity</h3>
                        <p class="stat-number"><?php echo $dept_summary['total_capacity'] ?? 0; ?></p>
                        <p class="stat-label">Total Seats</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Utilization</h3>
                        <p class="stat-number">
                            <?php 
                            $utilization = 0;
                            if ($dept_summary['total_capacity'] > 0) {
                                $utilization = round(($dept_summary['total_students'] / $dept_summary['total_capacity']) * 100, 1);
                            }
                            echo $utilization . '%';
                            ?>
                        </p>
                        <p class="stat-label">Hall Usage</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Allocations</h3>
                        <a href="allocations.php" class="view-all-link">View All</a>
                    </div>
                    <div class="card-content">
                        <?php if (!empty($recent_allocations)): ?>
                            <div class="allocation-list">
                                <?php foreach ($recent_allocations as $allocation): ?>
                                    <div class="allocation-item">
                                        <div class="allocation-info">
                                            <h4><?php echo htmlspecialchars($allocation['hall_name']); ?></h4>
                                            <p>Hall No: <?php echo htmlspecialchars($allocation['hall_number']); ?></p>
                                            <p>Capacity: <?php echo $allocation['capacity']; ?> seats</p>
                                            <p>Students: <?php echo $allocation['student_count']; ?> allocated</p>
                                        </div>
                                        <div class="allocation-actions">
                                            <a href="allocations.php?hall_id=<?php echo $allocation['hall_id']; ?>" 
                                               class="btn btn-secondary">
                                                <i class="fas fa-eye"></i> View Details
                                            </a>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <div class="empty-state">
                                <i class="fas fa-info-circle"></i>
                                <p>No allocation data available yet.</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div class="card-content">
                        <div class="quick-actions">
                            <a href="allocations.php" class="action-btn">
                                <i class="fas fa-list-alt"></i>
                                <span>View All Allocations</span>
                            </a>
                            <a href="reports.php" class="action-btn">
                                <i class="fas fa-file-alt"></i>
                                <span>Download Reports</span>
                            </a>
                            <a href="profile.php" class="action-btn">
                                <i class="fas fa-user"></i>
                                <span>Update Profile</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-banner">
                <div class="info-content">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <h4>Important Information</h4>
                        <p>Please check your allocation details regularly. Contact admin if you notice any discrepancies in your hall allocation.</p>
                    </div>
                </div>
            </div>
        </div>

<?php include 'footer.php'; ?>