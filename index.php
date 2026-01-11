<?php
/**
 * Main Landing Page - Exam Seat Allocation Management System
 * Entry point for the system with navigation to login areas
 */

// Allow public access
define('ALLOW_PUBLIC_ACCESS', true);

// Set page title
$page_title = 'Exam Seat Allocation Management System';

// Include public header
require_once 'public/header.php';
?>

<!-- Hero Section -->
<section class="hero-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <div class="hero-content">
                    <h1 class="display-4 fw-bold text-white mb-4">
                        Streamline Your Exam Seating
                    </h1>
                    <p class="lead text-white-50 mb-4">
                        Efficient, secure, and automated seat allocation management for educational institutions.
                        Ensure fair distribution and optimal space utilization.
                    </p>
                    <div class="hero-buttons">
                        <a href="auth/login.php?role=admin" class="btn btn-primary btn-lg me-3">
                            <i class="fas fa-chalkboard-teacher me-2"></i>Admin Login
                        </a>
                        <a href="auth/login.php?role=student" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-user-graduate me-2"></i>Student Login
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="hero-features">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h5>Secure & Reliable</h5>
                        <p>Advanced security measures to protect student data and ensure system integrity.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <h5>Smart Allocation</h5>
                        <p>Intelligent algorithms for optimal seat distribution and space utilization.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h5>Mobile Friendly</h5>
                        <p>Responsive design that works seamlessly across all devices.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-file-download"></i>
                        </div>
                        <h5>Easy Reporting</h5>
                        <p>Generate comprehensive reports and export data in multiple formats.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Quick Stats Section -->
<section class="quick-stats py-5">
    <div class="container">
        <div class="row text-center">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">1500+</div>
                    <div class="stat-label">Students</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">25</div>
                    <div class="stat-label">Exam Rooms</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">System Uptime</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Support</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2 class="section-title">Key Features</h2>
                <p class="section-subtitle">Everything you need for efficient exam seat management</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h4>Student Management</h4>
                    <p>Efficiently manage student records, classes, and enrollment information with easy-to-use tools.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-door-open"></i>
                    </div>
                    <h4>Room Configuration</h4>
                    <p>Configure exam rooms with custom layouts, capacity settings, and special requirements.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-random"></i>
                    </div>
                    <h4>Smart Allocation</h4>
                    <p>Automatically assign seats using intelligent algorithms to ensure fairness and optimal space use.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h4>Real-time Reports</h4>
                    <p>Generate comprehensive reports on seat allocation, room utilization, and system statistics.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <h4>Notifications</h4>
                    <p>Send automated notifications to students about their seat assignments and exam details.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-box">
                    <div class="feature-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <h4>Export Options</h4>
                    <p>Export seat allocation data in multiple formats including PDF, CSV, and Excel.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Call to Action -->
<section class="cta-section py-5">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <h3 class="text-white mb-3">Ready to streamline your exam seating?</h3>
                <p class="text-white-50 mb-0">Join hundreds of institutions already using our system for efficient seat management.</p>
            </div>
            <div class="col-lg-4 text-lg-end">
                <a href="auth/register.php" class="btn btn-light btn-lg">Get Started</a>
                <a href="public/about.php" class="btn btn-outline-light btn-lg ms-3">Learn More</a>
            </div>
        </div>
    </div>
</section>

<?php
require_once 'public/footer.php';
?>