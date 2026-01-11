<?php
/**
 * Logout Functionality
 * 
 * Handles user logout and session cleanup
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/csrf.php';

// Check if user is logged in
if (!is_logged_in()) {
    header('Location: ' . LOGIN_URL);
    exit();
}

// Process logout
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verify CSRF token
    if (validate_csrf_token($_POST['csrf_token'] ?? '')) {
        // Logout user
        logout_user();
        
        // Set success message
        set_flash_message('success', 'You have been logged out successfully.');
        
        // Redirect to login page
        header('Location: ' . LOGIN_URL);
        exit();
    } else {
        set_flash_message('error', 'Invalid request. Please try again.');
    }
}

// If GET request, show logout confirmation
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logout - Exam Seat Management</title>
    <style>
        :root {
            --primary-color: #007bff;
            --primary-hover: #0056b3;
            --text-color: #333;
            --bg-color: #f8f9fa;
            --card-bg: #fff;
            --border-color: #dee2e6;
            --success-color: #28a745;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .logout-container {
            background: var(--card-bg);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        .logout-icon {
            font-size: 48px;
            color: var(--primary-color);
            margin-bottom: 20px;
        }

        .logout-header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 24px;
        }

        .logout-header p {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }

        .btn-group {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #545b62;
        }

        .btn-danger {
            background-color: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background-color: #c82333;
        }

        .messages {
            margin-bottom: 20px;
        }

        .alert {
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .alert-success {
            background-color: #d4edda;
            color: var(--success-color);
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="logout-container">
        <div class="logout-icon">🔒</div>
        
        <div class="logout-header">
            <h1>Logout</h1>
            <p>Are you sure you want to logout?</p>
        </div>

        <!-- Flash Messages -->
        <?php
        $flash_messages = get_flash_messages();
        foreach ($flash_messages as $message): ?>
            <div class="alert alert-<?php echo $message['type']; ?>">
                <?php echo htmlspecialchars($message['message']); ?>
            </div>
        <?php endforeach; ?>

        <form method="POST" action="">
            <?php echo csrf_token_field(); ?>
            
            <div class="btn-group">
                <button type="submit" class="btn btn-danger">Yes, Logout</button>
                <a href="<?php echo is_admin() ? ADMIN_DASHBOARD_URL : STUDENT_DASHBOARD_URL; ?>" class="btn btn-secondary">Cancel</a>
            </div>
        </form>

        <p style="font-size: 12px; color: #666; margin-top: 20px;">
            For security, always logout when using a public or shared computer.
        </p>
    </div>

    <script>
        // Auto-redirect after 5 seconds if user is already logged out
        setTimeout(function() {
            var successAlert = document.querySelector('.alert-success');
            if (successAlert) {
                window.location.href = '<?php echo LOGIN_URL; ?>';
            }
        }, 3000);
    </script>
</body>
</html>