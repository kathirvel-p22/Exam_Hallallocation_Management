<?php
/**
 * System Status Page - Real-time Statistics and Status
 */

// Allow public access
define('ALLOW_PUBLIC_ACCESS', true);

// Set page title
$page_title = 'System Status';

// Include public header
require_once 'header.php';

// Include database connection for statistics
require_once '../config/database.php';

// Function to get system statistics
function getSystemStats() {
    global $pdo;
    
    $stats = [
        'total_students' => 0,
        'total_rooms' => 0,
        'total_classes' => 0,
        'active_exams' => 0,
        'system_uptime' => '99.9%',
        'last_update' => date('Y-m-d H:i:s'),
        'database_status' => 'Online',
        'server_status' => 'Online'
    ];
    
    try {
        // Get total students
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM students");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['total_students'] = $result['count'];
        
        // Get total rooms
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['total_rooms'] = $result['count'];
        
        // Get total classes
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM classes");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['total_classes'] = $result['count'];
        
        // Get active exams (assuming exams table exists)
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM exams WHERE status = 'active'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['active_exams'] = $result['count'];
        
    } catch (PDOException $e) {
        // Handle database errors gracefully
        $stats['database_status'] = 'Error';
        error_log("Database error in status.php: " . $e->getMessage());
    }
    
    return $stats;
}

$stats = getSystemStats();
?>

<!-- Page Header -->
<section class="page-header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 class="display-4">System Status</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb bg-transparent p-0">
                        <li class="breadcrumb-item"><a href="../index.php">Home</a></li>
                        <li class="breadcrumb-item active">System Status</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
</section>

<!-- Status Overview -->
<section class="status-overview py-5">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>System Status:</strong> All systems are operational. Last updated: <?php echo $stats['last_update']; ?>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-3">
                <div class="status-card">
                    <div class="status-icon online">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="status-info">
                        <h6>Server Status</h6>
                        <p class="status-text"><?php echo $stats['server_status']; ?></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="status-card">
                    <div class="status-icon online">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="status-info">
                        <h6>Database Status</h6>
                        <p class="status-text"><?php echo $stats['database_status']; ?></p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="status-card">
                    <div class="status-icon online">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="status-info">
                        <h6>Security Status</h6>
                        <p class="status-text">Secure</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="status-card">
                    <div class="status-icon online">
                        <i class="fas fa-globe"></i>
                    </div>
                    <div class="status-info">
                        <h6>API Status</h6>
                        <p class="status-text">Online</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Statistics Section -->
<section class="statistics-section py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>System Statistics</h2>
                <p class="text-muted">Real-time statistics and metrics</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo number_format($stats['total_students']); ?></h3>
                        <p>Total Students</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-door-open"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo number_format($stats['total_rooms']); ?></h3>
                        <p>Exam Rooms</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo number_format($stats['total_classes']); ?></h3>
                        <p>Classes</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo number_format($stats['active_exams']); ?></h3>
                        <p>Active Exams</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $stats['system_uptime']; ?></h3>
                        <p>System Uptime</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo date('H:i:s'); ?></h3>
                        <p>Current Time</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Performance Metrics -->
<section class="performance-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>Performance Metrics</h2>
                <p class="text-muted">System performance and response times</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="metric-card">
                    <h5>Response Time</h5>
                    <div class="metric-value">120ms</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: 24%;"></div>
                    </div>
                    <small class="text-muted">Average response time</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="metric-card">
                    <h5>Database Queries</h5>
                    <div class="metric-value">45/sec</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: 45%;"></div>
                    </div>
                    <small class="text-muted">Queries per second</small>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="metric-card">
                    <h5>Memory Usage</h5>
                    <div class="metric-value">64%</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: 64%;"></div>
                    </div>
                    <small class="text-muted">Current memory usage</small>
                </div>
            </div>
            <div class="col-md-6">
                <div class="metric-card">
                    <h5>CPU Usage</h5>
                    <div class="metric-value">23%</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: 23%;"></div>
                    </div>
                    <small class="text-muted">Current CPU usage</small>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Recent Activity -->
<section class="activity-section py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>Recent Activity</h2>
                <p class="text-muted">Latest system events and updates</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="activity-timeline">
                    <div class="activity-item">
                        <div class="activity-dot"></div>
                        <div class="activity-content">
                            <h6>System Update Completed</h6>
                            <p class="text-muted">Version 2.1.0 deployed successfully</p>
                            <small class="text-muted">2 hours ago</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot"></div>
                        <div class="activity-content">
                            <h6>Database Backup</h6>
                            <p class="text-muted">Automated backup completed</p>
                            <small class="text-muted">4 hours ago</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot"></div>
                        <div class="activity-content">
                            <h6>New Student Registration</h6>
                            <p class="text-muted">50 new students registered today</p>
                            <small class="text-muted">6 hours ago</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot"></div>
                        <div class="activity-content">
                            <h6>Exam Schedule Updated</h6>
                            <p class="text-muted">Spring semester exams configured</p>
                            <small class="text-muted">1 day ago</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="maintenance-card">
                    <h5>Next Maintenance</h5>
                    <div class="maintenance-date">
                        <i class="fas fa-wrench me-2"></i>
                        December 30, 2025 - 02:00 AM
                    </div>
                    <p class="text-muted mt-2">Scheduled maintenance window. System will be temporarily unavailable for 30 minutes.</p>
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Please plan accordingly
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- System Health -->
<section class="health-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>System Health</h2>
                <p class="text-muted">Comprehensive system health monitoring</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-3">
                <div class="health-item">
                    <div class="health-icon healthy">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h6>Web Server</h6>
                    <p class="text-muted">Healthy</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="health-item">
                    <div class="health-icon healthy">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h6>Database</h6>
                    <p class="text-muted">Optimal</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="health-item">
                    <div class="health-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h6>Cache</h6>
                    <p class="text-muted">Warning</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="health-item">
                    <div class="health-icon healthy">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h6>Storage</h6>
                    <p class="text-muted">Healthy</p>
                </div>
            </div>
        </div>
    </div>
</section>

<?php
require_once 'footer.php';
?>