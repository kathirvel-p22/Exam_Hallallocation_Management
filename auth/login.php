<?php
/**
 * Login Form and Processing
 * 
 * Handles user login with form display and validation
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/csrf.php';

// If user is already logged in, redirect based on role
if (is_logged_in()) {
    if (is_admin()) {
        header('Location: ' . ADMIN_DASHBOARD_URL);
        exit();
    } else {
        header('Location: ' . STUDENT_DASHBOARD_URL);
        exit();
    }
}

$errors = [];
$success = false;

// Process login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check CSRF token
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $errors[] = 'Invalid request. Please try again.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        
        // Validate input
        if (empty($username) || empty($password)) {
            $errors[] = 'Please enter both username and password.';
        } else {
            // Attempt login
            $login_result = login_user($username, $password);
            
            if ($login_result['success']) {
                $success = true;
                
                // Redirect based on user role
                if (is_admin()) {
                    header('Location: ' . ADMIN_DASHBOARD_URL);
                    exit();
                } else {
                    header('Location: ' . STUDENT_DASHBOARD_URL);
                    exit();
                }
            } else {
                $errors = $login_result['errors'];
            }
        }
    }
}

// Get any flash messages
$flash_messages = get_flash_messages();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Exam Seat Management</title>
    <style>
        :root {
            --primary-color: #007bff;
            --primary-hover: #0056b3;
            --text-color: #333;
            --bg-color: #f8f9fa;
            --card-bg: #fff;
            --border-color: #dee2e6;
            --error-color: #dc3545;
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

        .login-container {
            background: var(--card-bg);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .login-header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 24px;
        }

        .login-header p {
            color: #666;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            font-size: 14px;
        }

        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .btn {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: var(--primary-hover);
        }

        .btn:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
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

        .alert-error {
            background-color: #f8d7da;
            color: var(--error-color);
            border: 1px solid #f5c6cb;
        }

        .alert-success {
            background-color: #d4edda;
            color: var(--success-color);
            border: 1px solid #c3e6cb;
        }

        .form-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }

        .form-footer a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
        }

        .form-footer a:hover {
            text-decoration: underline;
        }

        .lockout-notice {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>Exam Seat Management</h1>
            <p>Please sign in to continue</p>
        </div>

        <!-- Flash Messages -->
        <?php foreach ($flash_messages as $message): ?>
            <div class="alert alert-<?php echo $message['type']; ?>">
                <?php echo htmlspecialchars($message['message']); ?>
            </div>
        <?php endforeach; ?>

        <!-- Login Form -->
        <form method="POST" action="">
            <?php echo csrf_token_field(); ?>

            <!-- Display errors -->
            <?php if (!empty($errors)): ?>
                <div class="alert alert-error">
                    <?php foreach ($errors as $error): ?>
                        <div><?php echo htmlspecialchars($error); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" 
                       value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>" 
                       required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="btn">Sign In</button>
        </form>

        <div class="form-footer">
            <p>Don't have an account? <a href="register.php">Register here</a></p>
            <p><a href="password_reset.php">Forgot your password?</a></p>
        </div>
    </div>

    <script>
        // Auto-hide success messages after 3 seconds
        setTimeout(function() {
            var successAlerts = document.querySelectorAll('.alert-success');
            successAlerts.forEach(function(alert) {
                alert.style.display = 'none';
            });
        }, 3000);
    </script>
</body>
</html>