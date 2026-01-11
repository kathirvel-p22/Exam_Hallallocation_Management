<!-- Footer -->
    <footer class="bg-dark text-light mt-5 py-4">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5>Exam Seat Allocation System</h5>
                    <p class="text-muted">Admin Dashboard © <?php echo date('Y'); ?></p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="text-muted">Last updated: <?php echo date('F j, Y, g:i a'); ?></p>
                    <div class="btn-group" role="group">
                        <a href="../index.php" class="btn btn-outline-light btn-sm">
                            <i class="fas fa-home"></i> Student Portal
                        </a>
                        <a href="dashboard.php" class="btn btn-outline-light btn-sm">
                            <i class="fas fa-tachometer-alt"></i> Admin Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Admin JavaScript -->
    <script src="../js/admin.js"></script>
    
    <!-- Custom Admin Scripts -->
    <script>
        // Admin-specific JavaScript can go here
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize tooltips
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        });
    </script>
</body>
</html>