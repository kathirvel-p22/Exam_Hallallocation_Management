<?php
/**
 * About Page - System Information
 */

// Allow public access
define('ALLOW_PUBLIC_ACCESS', true);

// Set page title
$page_title = 'About Us';

// Include public header
require_once 'header.php';
?>

<!-- Page Header -->
<section class="page-header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 class="display-4">About Our System</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb bg-transparent p-0">
                        <li class="breadcrumb-item"><a href="../index.php">Home</a></li>
                        <li class="breadcrumb-item active">About</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
</section>

<!-- Mission & Vision -->
<section class="about-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-lg-6">
                <div class="about-content">
                    <h2>Our Mission</h2>
                    <p class="lead">To revolutionize exam seat allocation by providing educational institutions with a comprehensive, efficient, and user-friendly solution that ensures fairness, security, and optimal resource utilization.</p>
                    
                    <p>We understand the challenges that educational institutions face during examination periods. Our system is designed to eliminate the manual hassles, reduce errors, and provide a seamless experience for both administrators and students.</p>
                    
                    <div class="mission-points mt-4">
                        <div class="mission-item">
                            <i class="fas fa-check-circle text-primary me-2"></i>
                            <strong>Efficiency:</strong> Streamline the entire seat allocation process
                        </div>
                        <div class="mission-item">
                            <i class="fas fa-check-circle text-primary me-2"></i>
                            <strong>Fairness:</strong> Ensure equitable seat distribution for all students
                        </div>
                        <div class="mission-item">
                            <i class="fas fa-check-circle text-primary me-2"></i>
                            <strong>Security:</strong> Protect sensitive student information
                        </div>
                        <div class="mission-item">
                            <i class="fas fa-check-circle text-primary me-2"></i>
                            <strong>Accessibility:</strong> Provide easy access across all devices
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="about-image">
                    <img src="../assets/images/about-hero.jpg" alt="About Exam Seat Allocation" class="img-fluid rounded">
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Overview -->
<section class="features-overview py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>What Makes Us Different</h2>
                <p class="text-muted">Our system offers advanced features designed specifically for educational institutions</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="feature-card h-100">
                    <div class="feature-icon-large">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h4>Smart Algorithms</h4>
                    <p>Our intelligent allocation system uses advanced algorithms to ensure optimal seat distribution while considering various constraints and preferences.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-card h-100">
                    <div class="feature-icon-large">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h4>Enterprise Security</h4>
                    <p>Multi-layered security protocols ensure that student data and exam information remain protected at all times.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="feature-card h-100">
                    <div class="feature-icon-large">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h4>Mobile First</h4>
                    <p>Designed with responsive technology to work seamlessly across desktops, tablets, and mobile devices.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Technology Stack -->
<section class="tech-stack py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>Our Technology</h2>
                <p class="text-muted">Built with modern technologies for reliability and performance</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="tech-list">
                    <h5>Backend Technologies</h5>
                    <ul class="list-unstyled">
                        <li><i class="fab fa-php me-2"></i>PHP 8.0+</li>
                        <li><i class="fas fa-database me-2"></i>MySQL Database</li>
                        <li><i class="fas fa-server me-2"></i>Apache/Nginx</li>
                        <li><i class="fas fa-lock me-2"></i>SSL/TLS Encryption</li>
                    </ul>
                </div>
            </div>
            <div class="col-md-6">
                <div class="tech-list">
                    <h5>Frontend Technologies</h5>
                    <ul class="list-unstyled">
                        <li><i class="fab fa-bootstrap me-2"></i>Bootstrap 5</li>
                        <li><i class="fab fa-js me-2"></i>JavaScript ES6+</li>
                        <li><i class="fab fa-font-awesome me-2"></i>Font Awesome Icons</li>
                        <li><i class="fas fa-mobile-alt me-2"></i>Responsive Design</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Statistics -->
<section class="stats-section py-5 bg-primary text-white">
    <div class="container">
        <div class="row text-center">
            <div class="col-md-3">
                <div class="stat-item">
                    <div class="stat-number">500+</div>
                    <div class="stat-label">Institutions</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-item">
                    <div class="stat-number">50K+</div>
                    <div class="stat-label">Students</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-item">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-item">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Support</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Team Section -->
<section class="team-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>Our Team</h2>
                <p class="text-muted">Dedicated professionals committed to educational excellence</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="team-member text-center">
                    <div class="member-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <h5>John Smith</h5>
                    <p class="text-muted">CEO & Founder</p>
                    <div class="social-icons">
                        <a href="#" class="text-muted me-2"><i class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="team-member text-center">
                    <div class="member-avatar">
                        <i class="fas fa-code"></i>
                    </div>
                    <h5>Sarah Johnson</h5>
                    <p class="text-muted">Lead Developer</p>
                    <div class="social-icons">
                        <a href="#" class="text-muted me-2"><i class="fab fa-github"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="team-member text-center">
                    <div class="member-avatar">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h5>Mike Davis</h5>
                    <p class="text-muted">Product Manager</p>
                    <div class="social-icons">
                        <a href="#" class="text-muted me-2"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-muted"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php
require_once 'footer.php';
?>