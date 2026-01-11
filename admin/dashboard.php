<?php
require_once '../admin/header.php';
require_once '../config/database.php';
require_once '../models/AllocationModel.php';
require_once '../models/ClassModel.php';
require_once '../models/RoomModel.php';

// Get database connection
$db = getDatabaseConnection();

// Initialize models
$allocationModel = new AllocationModel($db);
$classModel = new ClassModel($db);
$roomModel = new RoomModel($db);

// Get statistics
$totalAllocatedStudents = $allocationModel->getTotalAllocatedStudents();
$totalRoomsUsed = $allocationModel->getTotalRoomsUsed();
$totalRooms = $roomModel->getTotalRooms();
$freeRooms = $totalRooms - $totalRoomsUsed;
$capacityUtilization = $totalRooms > 0 ? round(($totalRoomsUsed / $totalRooms) * 100, 1) : 0;

// Get recent allocations
$recentAllocations = $allocationModel->getRecentAllocations(5);

// Get free halls
$freeHalls = $roomModel->getFreeHalls();
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard
            </h1>
        </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-primary">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <i class="fas fa-users fa-2x text-primary"></i>
                        </div>
                        <div class="col-9 text-end">
                            <div class="h4 mb-0 font-weight-bold text-gray-800"><?php echo number_format($totalAllocatedStudents); ?></div>
                            <div class="small text-muted">Total Allocated Students</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-info">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <i class="fas fa-building fa-2x text-info"></i>
                        </div>
                        <div class="col-9 text-end">
                            <div class="h4 mb-0 font-weight-bold text-gray-800"><?php echo $totalRoomsUsed; ?></div>
                            <div class="small text-muted">Rooms Used</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-warning">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <i class="fas fa-door-open fa-2x text-warning"></i>
                        </div>
                        <div class="col-9 text-end">
                            <div class="h4 mb-0 font-weight-bold text-gray-800"><?php echo $freeRooms; ?></div>
                            <div class="small text-muted">Free Rooms</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-3">
            <div class="card border-success">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <i class="fas fa-chart-pie fa-2x text-success"></i>
                        </div>
                        <div class="col-9 text-end">
                            <div class="h4 mb-0 font-weight-bold text-gray-800"><?php echo $capacityUtilization; ?>%</div>
                            <div class="small text-muted">Capacity Utilization</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-bolt me-2"></i>Quick Actions
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 mb-2">
                            <a href="exams.php" class="btn btn-primary w-100">
                                <i class="fas fa-calendar-alt me-2"></i>Manage Exams
                            </a>
                        </div>
                        <div class="col-md-3 mb-2">
                            <a href="classes.php" class="btn btn-info w-100">
                                <i class="fas fa-users me-2"></i>Manage Classes
                            </a>
                        </div>
                        <div class="col-md-3 mb-2">
                            <a href="rooms.php" class="btn btn-warning w-100">
                                <i class="fas fa-building me-2"></i>Manage Rooms
                            </a>
                        </div>
                        <div class="col-md-3 mb-2">
                            <a href="allocations.php" class="btn btn-success w-100">
                                <i class="fas fa-sitemap me-2"></i>Manage Allocations
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Allocations and Free Halls -->
    <div class="row">
        <!-- Recent Allocations -->
        <div class="col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-history me-2"></i>Recent Allocations
                    </h6>
                </div>
                <div class="card-body">
                    <?php if (!empty($recentAllocations)): ?>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Class</th>
                                        <th>Room</th>
                                        <th>Students</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentAllocations as $allocation): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($allocation['exam_name']); ?></td>
                                            <td><?php echo htmlspecialchars($allocation['class_name']); ?></td>
                                            <td><?php echo htmlspecialchars($allocation['room_name']); ?></td>
                                            <td><?php echo $allocation['student_count']; ?></td>
                                            <td><?php echo date('M d, Y', strtotime($allocation['created_at'])); ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <p class="text-muted text-center">No recent allocations found.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Free Halls -->
        <div class="col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-door-open me-2"></i>Free Halls
                    </h6>
                </div>
                <div class="card-body">
                    <?php if (!empty($freeHalls)): ?>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Room Name</th>
                                        <th>Capacity</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($freeHalls as $hall): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($hall['room_name']); ?></td>
                                            <td><?php echo $hall['capacity']; ?></td>
                                            <td><?php echo htmlspecialchars($hall['location']); ?></td>
                                            <td><span class="badge bg-secondary"><?php echo htmlspecialchars($hall['room_type']); ?></span></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <p class="text-muted text-center">No free halls available.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- System Status -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>System Status
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="fas fa-database fa-2x text-success"></i>
                                <p class="mt-2 mb-0">Database</p>
                                <small class="text-muted">Connected</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="fas fa-shield-alt fa-2x text-info"></i>
                                <p class="mt-2 mb-0">Security</p>
                                <small class="text-muted">Protected</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="fas fa-users fa-2x text-warning"></i>
                                <p class="mt-2 mb-0">Users</p>
                                <small class="text-muted">Active</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="text-center">
                                <i class="fas fa-chart-line fa-2x text-primary"></i>
                                <p class="mt-2 mb-0">Performance</p>
                                <small class="text-muted">Optimal</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once '../admin/footer.php'; ?>