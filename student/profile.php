<?php
require_once '../auth/protect_student.php';
require_once '../config/config.php';
require_once '../models/ClassModel.php';

// Get student information
$student_name = $_SESSION['name'] ?? '';
$student_reg_no = $_SESSION['register_number'] ?? '';
$student_dept = $_SESSION['department'] ?? '';
$student_email = $_SESSION['email'] ?? '';
$student_phone = $_SESSION['phone'] ?? '';
$student_batch = $_SESSION['batch'] ?? '';
?>

<?php include 'header.php'; ?>

        <div class="page-header">
            <h1>Student Profile</h1>
            <p class="page-subtitle">Manage your personal information</p>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>Personal Information</h3>
            </div>
            <div class="card-content">
                <div class="profile-grid">
                    <div class="profile-section">
                        <h4>Basic Information</h4>
                        <div class="profile-info">
                            <div class="info-item">
                                <label>Name:</label>
                                <span><?php echo htmlspecialchars($student_name); ?></span>
                            </div>
                            <div class="info-item">
                                <label>Register Number:</label>
                                <span><?php echo htmlspecialchars($student_reg_no); ?></span>
                            </div>
                            <div class="info-item">
                                <label>Department:</label>
                                <span><?php echo htmlspecialchars($student_dept); ?></span>
                            </div>
                            <div class="info-item">
                                <label>Batch:</label>
                                <span><?php echo htmlspecialchars($student_batch); ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h4>Contact Information</h4>
                        <div class="profile-info">
                            <div class="info-item">
                                <label>Email:</label>
                                <span><?php echo htmlspecialchars($student_email); ?></span>
                            </div>
                            <div class="info-item">
                                <label>Phone:</label>
                                <span><?php echo htmlspecialchars($student_phone ?: 'Not provided'); ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-actions">
                <a href="dashboard.php" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
                <button class="btn btn-primary" onclick="showNotification('Profile information is read-only for students.', 'info')">
                    <i class="fas fa-info-circle"></i> Information
                </button>
            </div>
        </div>

        <div class="info-banner">
            <div class="info-content">
                <i class="fas fa-info-circle"></i>
                <div>
                    <h4>Profile Information</h4>
                    <p>Your profile information is managed by the administration. If you need to update any details, please contact your department administrator.</p>
                </div>
            </div>
        </div>

<?php include 'footer.php'; ?>