<?php
/**
 * Public Footer
 * Shared footer for all public pages
 */

// Prevent direct access
if (!defined('ALLOW_PUBLIC_ACCESS')) {
    header('Location: ../');
    exit;
}
?>

    </main>

    <!-- Footer -->
    <footer class="footer bg-dark text-light py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5><i class="fas fa-university me-2"></i>Exam Seat Allocation System</h5>
                    <p class="text-muted">Streamlining exam seating management for educational institutions with advanced technology and user-friendly interfaces.</p>
                    <div class="social-links mt-3">
                        <a href="#" class="text-light me-2"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="text-light me-2"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-light me-2"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#" class="text-light me-2"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                
                <div class="col-md-2">
                    <h6>Quick Links</h6>
                    <ul class="list-unstyled">
                        <li><a href="../index.php" class="text-muted">Home</a></li>
                        <li><a href="about.php" class="text-muted">About Us</a></li>
                        <li><a href="status.php" class="text-muted">System Status</a></li>
                        <li><a href="contact.php" class="text-muted">Contact</a></li>
                    </ul>
                </div>
                
                <div class="col-md-2">
                    <h6>User Areas</h6>
                    <ul class="list-unstyled">
                        <li><a href="../auth/login.php?role=admin" class="text-muted">Admin Login</a></li>
                        <li><a href="../auth/login.php?role=student" class="text-muted">Student Login</a></li>
                        <li><a href="../auth/register.php" class="text-muted">Register</a></li>
                        <li><a href="../auth/password_reset.php" class="text-muted">Password Reset</a></li>
                    </ul>
                </div>
                
                <div class="col-md-4">
                    <h6>Contact Information</h6>
                    <address class="text-muted">
                        <p><i class="fas fa-map-marker-alt me-2"></i>123 Education Lane<br>Academic City, AC 12345</p>
                        <p><i class="fas fa-phone me-2"></i>+1 (555) 123-4567</p>
                        <p><i class="fas fa-envelope me-2"></i>support@examseatallocation.com</p>
                    </address>
                </div>
            </div>
            
            <hr class="border-secondary my-4">
            
            <div class="row">
                <div class="col-md-6">
                    <p class="text-muted mb-0">© <?php echo date('Y'); ?> Exam Seat Allocation System. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <div class="footer-links">
                        <a href="#" class="text-muted me-3">Privacy Policy</a>
                        <a href="#" class="text-muted me-3">Terms of Service</a>
                        <a href="#" class="text-muted">Help Center</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    <script src="../js/main.js"></script>
</body>
</html>