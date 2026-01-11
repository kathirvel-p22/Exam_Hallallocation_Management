<?php
/**
 * Contact Page - Support and Contact Information
 */

// Allow public access
define('ALLOW_PUBLIC_ACCESS', true);

// Set page title
$page_title = 'Contact Us';

// Include public header
require_once 'header.php';
?>

<!-- Page Header -->
<section class="page-header">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 class="display-4">Get In Touch</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb bg-transparent p-0">
                        <li class="breadcrumb-item"><a href="../index.php">Home</a></li>
                        <li class="breadcrumb-item active">Contact</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section class="contact-section py-5">
    <div class="container">
        <div class="row">
            <div class="col-lg-6">
                <div class="contact-info">
                    <h2>Contact Information</h2>
                    <p class="text-muted mb-4">We're here to help you with any questions or concerns about our system.</p>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="contact-details">
                            <h5>Address</h5>
                            <p>123 Education Lane<br>Academic City, AC 12345<br>United States</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="contact-details">
                            <h5>Phone</h5>
                            <p>+1 (555) 123-4567<br>+1 (555) 987-6543</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="contact-details">
                            <h5>Email</h5>
                            <p>support@examseatallocation.com<br>sales@examseatallocation.com<br>info@examseatallocation.com</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="contact-details">
                            <h5>Business Hours</h5>
                            <p>Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 2:00 PM<br>Sunday: Closed</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6">
                <div class="contact-form">
                    <h2>Send Us a Message</h2>
                    <p class="text-muted mb-4">Fill out the form below and we'll get back to you as soon as possible.</p>
                    
                    <!-- Contact Form -->
                    <form id="contactForm" action="../auth/contact_handler.php" method="POST">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="name" name="name" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="subject" class="form-label">Subject</label>
                            <input type="text" class="form-control" id="subject" name="subject" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="message" class="form-label">Message</label>
                            <textarea class="form-control" id="message" name="message" rows="5" required></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-paper-plane me-2"></i>Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Support Section -->
<section class="support-section py-5 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>Support & Help</h2>
                <p class="text-muted">Find answers to common questions and get help with our system</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="support-card">
                    <div class="support-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h5>FAQ</h5>
                    <p>Find answers to frequently asked questions about our system, features, and usage.</p>
                    <a href="#" class="btn btn-outline-primary">View FAQ</a>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="support-card">
                    <div class="support-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <h5>Documentation</h5>
                    <p>Comprehensive guides and documentation for administrators and students.</p>
                    <a href="#" class="btn btn-outline-primary">Read Docs</a>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="support-card">
                    <div class="support-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h5>Live Chat</h5>
                    <p>Connect with our support team in real-time for immediate assistance.</p>
                    <a href="#" class="btn btn-outline-primary">Start Chat</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Help Categories -->
<section class="help-categories py-5">
    <div class="container">
        <div class="row">
            <div class="col-12 text-center mb-5">
                <h2>How Can We Help You?</h2>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="help-category">
                    <div class="category-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <h6>For Students</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">How to check seat allocation</a></li>
                        <li><a href="#">Understanding your seat number</a></li>
                        <li><a href="#">Exam day guidelines</a></li>
                        <li><a href="#">Technical support</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-3">
                <div class="help-category">
                    <div class="category-icon">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <h6>For Administrators</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">Managing student records</a></li>
                        <li><a href="#">Configuring exam rooms</a></li>
                        <li><a href="#">Generating reports</a></li>
                        <li><a href="#">System administration</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-3">
                <div class="help-category">
                    <div class="category-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h6>For Institutions</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">System integration</a></li>
                        <li><a href="#">Customization options</a></li>
                        <li><a href="#">Training and onboarding</a></li>
                        <li><a href="#">Pricing and plans</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="col-md-6 col-lg-3">
                <div class="help-category">
                    <div class="category-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h6>Security & Privacy</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">Data protection</a></li>
                        <li><a href="#">Privacy policy</a></li>
                        <li><a href="#">Security measures</a></li>
                        <li><a href="#">Compliance standards</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<?php
require_once 'footer.php';
?>