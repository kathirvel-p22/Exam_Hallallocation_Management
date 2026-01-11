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

// Handle download requests
if (isset($_GET['download'])) {
    $report_type = $_GET['download'];
    $exam_id = $_GET['exam_id'] ?? null;
    
    // Verify CSRF token for downloads
    if (!verify_csrf_token($_GET['token'] ?? '')) {
        $_SESSION['flash_message'] = 'Invalid request';
        $_SESSION['flash_type'] = 'danger';
        header('Location: reports.php');
        exit;
    }
    
    switch ($report_type) {
        case 'csv':
            downloadCSVReport($db, $exam_id);
            exit;
        case 'pdf':
            downloadPDFReport($db, $exam_id);
            exit;
    }
}

// Get statistics for dashboard
$totalAllocatedStudents = $allocationModel->getTotalAllocatedStudents();
$totalRoomsUsed = $allocationModel->getTotalRoomsUsed();
$totalRooms = $roomModel->getTotalRooms();
$freeRooms = $totalRooms - $totalRoomsUsed;
$capacityUtilization = $totalRooms > 0 ? round(($totalRoomsUsed / $totalRooms) * 100, 1) : 0;

// Get exams for dropdown
$stmt = $db->query("SELECT * FROM exams ORDER BY exam_date DESC, start_time DESC");
$exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get allocation stats
$allocationStats = $allocationModel->getAllocationStats();
?>

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <h1 class="h2 mb-4">
                <i class="fas fa-chart-bar me-2"></i>Reports & Analytics
            </h1>
        </div>
    </div>

    <!-- Statistics Overview -->
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
                            <div class="small text-muted">Total Students</div>
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
                            <div class="small text-muted">Utilization</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Download Reports -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-download me-2"></i>Download Reports
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="exam_select" class="form-label">Select Exam (Optional)</label>
                            <select class="form-select" id="exam_select">
                                <option value="">All Exams</option>
                                <?php foreach ($exams as $exam): ?>
                                    <option value="<?php echo $exam['id']; ?>">
                                        <?php echo htmlspecialchars($exam['exam_name']); ?> - <?php echo date('M d, Y', strtotime($exam['exam_date'])); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body text-center">
                                            <i class="fas fa-file-csv fa-3x text-success mb-3"></i>
                                            <h5>CSV Report</h5>
                                            <p class="text-muted">Download detailed allocation data in CSV format</p>
                                            <button type="button" class="btn btn-success" onclick="downloadReport('csv')">
                                                <i class="fas fa-download me-2"></i>Download CSV
                                            </button>
                                            <a href="../downloads/reports.php" class="btn btn-primary">
                                                <i class="fas fa-file-alt me-2"></i>Advanced Reports
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body text-center">
                                            <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
                                            <h5>PDF Report</h5>
                                            <p class="text-muted">Download formatted report in PDF format</p>
                                            <button type="button" class="btn btn-danger" onclick="downloadReport('pdf')">
                                                <i class="fas fa-download me-2"></i>Download PDF
                                            </button>
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

    <!-- Allocation Details -->
    <div class="row">
        <div class="col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-list me-2"></i>Allocation Summary
                    </h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Classes</th>
                                    <th>Rooms</th>
                                    <th>Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($exams as $exam): ?>
                                    <?php
                                    $stats = $allocationModel->getAllocationStats($exam['id']);
                                    ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($exam['exam_name']); ?></td>
                                        <td><span class="badge bg-primary"><?php echo $stats['class_count']; ?></span></td>
                                        <td><span class="badge bg-info"><?php echo $stats['room_count']; ?></span></td>
                                        <td><span class="badge bg-success"><?php echo $stats['student_count']; ?></span></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-6 mb-4">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-chart-pie me-2"></i>Room Utilization
                    </h6>
                </div>
                <div class="card-body">
                    <?php
                    $rooms = $roomModel->getRooms();
                    foreach ($rooms as $room):
                        $utilization = $room['capacity'] > 0 ? round(($room['allocated_students'] / $room['capacity']) * 100, 1) : 0;
                    ?>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span><?php echo htmlspecialchars($room['room_name']); ?></span>
                                <span class="text-muted"><?php echo $room['allocated_students']; ?> / <?php echo $room['capacity']; ?></span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar <?php echo $utilization >= 80 ? 'bg-success' : ($utilization >= 60 ? 'bg-warning' : 'bg-info'); ?>" 
                                     style="width: <?php echo $utilization; ?>%"></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function downloadReport(format) {
    const examId = document.getElementById('exam_select').value;
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    let url = 'reports.php?download=' + format + '&token=' + token;
    if (examId) {
        url += '&exam_id=' + examId;
    }
    
    window.open(url, '_blank');
}
</script>

<?php require_once '../admin/footer.php'; ?>

<?php
// Helper functions for downloading reports
function downloadCSVReport($db, $exam_id = null) {
    $filename = 'allocation_report_' . date('Y-m-d_H-i-s') . '.csv';
    
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $output = fopen('php://output', 'w');
    
    // CSV headers
    fputcsv($output, ['Exam Name', 'Exam Date', 'Class Name', 'Room Name', 'Location', 'Students', 'Capacity', 'Allocated At']);
    
    // Get data
    $sql = "SELECT e.exam_name, e.exam_date, c.class_name, r.room_name, r.location, a.student_count, r.capacity, a.created_at 
            FROM allocations a 
            JOIN exams e ON a.exam_id = e.id 
            JOIN classes c ON a.class_id = c.id 
            JOIN rooms r ON a.room_id = r.id";
    
    if ($exam_id) {
        $sql .= " WHERE e.id = :exam_id";
        $stmt = $db->prepare($sql);
        $stmt->execute(['exam_id' => $exam_id]);
    } else {
        $stmt = $db->query($sql);
    }
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit;
}

function downloadPDFReport($db, $exam_id = null) {
    // For now, we'll create a simple HTML page that can be printed as PDF
    // In a real application, you might use a library like TCPDF or DomPDF
    
    $title = $exam_id ? 'Allocation Report' : 'Allocation Report - All Exams';
    $date = date('F j, Y');
    
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>$title</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <div class='title'>$title</div>
            <div class='subtitle'>Generated on $date</div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Exam Name</th>
                    <th>Exam Date</th>
                    <th>Class Name</th>
                    <th>Room Name</th>
                    <th>Location</th>
                    <th>Students</th>
                    <th>Capacity</th>
                    <th>Allocated At</th>
                </tr>
            </thead>
            <tbody>";
    
    // Get data
    $sql = "SELECT e.exam_name, e.exam_date, c.class_name, r.room_name, r.location, a.student_count, r.capacity, a.created_at 
            FROM allocations a 
            JOIN exams e ON a.exam_id = e.id 
            JOIN classes c ON a.class_id = c.id 
            JOIN rooms r ON a.room_id = r.id";
    
    if ($exam_id) {
        $sql .= " WHERE e.id = :exam_id";
        $stmt = $db->prepare($sql);
        $stmt->execute(['exam_id' => $exam_id]);
    } else {
        $stmt = $db->query($sql);
    }
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>
                <td>" . htmlspecialchars($row['exam_name']) . "</td>
                <td>" . date('F j, Y', strtotime($row['exam_date'])) . "</td>
                <td>" . htmlspecialchars($row['class_name']) . "</td>
                <td>" . htmlspecialchars($row['room_name']) . "</td>
                <td>" . htmlspecialchars($row['location']) . "</td>
                <td>" . $row['student_count'] . "</td>
                <td>" . $row['capacity'] . "</td>
                <td>" . date('F j, Y H:i', strtotime($row['created_at'])) . "</td>
              </tr>";
    }
    
    echo "</tbody>
        </table>
        
        <div class='footer'>
            Exam Seat Allocation Management System - Generated on $date
        </div>
    </body>
    </html>";
    
    exit;
}
?>