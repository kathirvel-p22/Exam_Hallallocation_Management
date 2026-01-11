<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Portal - Exam Seat Allocation</title>
    <link rel="stylesheet" href="../css/student.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="student-header">
        <div class="header-container">
            <div class="logo-section">
                <i class="fas fa-graduation-cap"></i>
                <h1>Exam Seat Allocation</h1>
            </div>
            <nav class="main-nav">
                <ul>
                    <li><a href="dashboard.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?>">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a></li>
                    <li><a href="allocations.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'allocations.php' ? 'active' : ''; ?>">
                        <i class="fas fa-list-alt"></i> Allocations
                    </a></li>
                    <li><a href="reports.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'reports.php' ? 'active' : ''; ?>">
                        <i class="fas fa-file-alt"></i> Reports
                    </a></li>
                </ul>
            </nav>
            <div class="user-section">
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($_SESSION['name'] ?? ''); ?></span>
                    <span class="user-role">Student</span>
                </div>
                <div class="dropdown">
                    <button class="dropdown-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-content">
                        <a href="profile.php"><i class="fas fa-user"></i> Profile</a>
                        <a href="../auth/logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="container">