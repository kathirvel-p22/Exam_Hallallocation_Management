<?php
/**
 * Password Reset Functionality
 * 
 * Handles password reset requests and processing
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/csrf.php';

$errors = [];
$success = false;
$step = 'request'; // 'request' or 'reset'

// Process password reset request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    // Check CSRF token
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $errors[] = 'Invalid request. Please try again.';
    } else {
        $email = trim($_POST['email']);
        
        if (empty($email)) {
            $errors[] = 'Please enter your email address.';
        } else {
            // Generate reset token
            $reset_result = generate_password_reset_token($email);
            
            if ($reset_result['success']) {
                $success = true;
                $step = 'request';
                set_flash_message('success', 'Password reset instructions have been sent to your email address.');
            } else {
                $errors = $reset_result['errors'];
            }
        }
    }
}

// Process password reset form
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['token']) && isset($_POST['new_password'])) {
    // Check CSRF token
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $errors[] = 'Invalid request. Please try again.';
    } else {
        $token = $_POST['token'];
        $new_password = $_POST['new_password'];
        $confirm_password = $_POST['confirm_password'];
        
        // Validate token
        $token_result = validate_password_reset_token($token);
        
        if (!$token_result['valid']) {
            $errors[] = $token_result['error'];
        } elseif ($new_password !== $confirm_password) {
            $errors[] = 'Passwords do not match.';
        } else {
            // Update password
            $update_result = update_user_password($token_result['user_id'], $new_password);
            
            if ($update_result['success']) {
                // Mark token as used
                mark_reset_token_used($token);
                
                $success = true;
                $step = 'completed';
                set_flash_message('success', 'Your password has been successfully updated. You can now login with your new password.');
            } else {
                $errors = $update_result['errors'];
            }
        }
    }
}

// Check if reset token is provided in URL
if (isset($_GET['token'])) {
    $token = $_GET['token'];
    $token_result = validate_password_reset_token($token);
    
    if ($token_result['valid']) {
        $step = 'reset';
        $reset_token = $token;
    } else {
        $errors[] = $token_result['error'];
        $step = 'request';
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
    <title>Password Reset - Exam Seat Management</title>
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

        .container {
            background: var(--card-bg);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 24px;
        }

        .header p {
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

        .completed-icon {
            font-size: 48px;
            color: var(--success-color);
            margin-bottom: 20px;
            text-align: center;
        }

        .password-requirements {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            line-height: 1.4;
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Password Reset Request Form -->
        <div id="request-form" class="<?php echo $step === 'request' ? '' : 'hidden'; ?>">
            <div class="header">
                <h1>Password Reset</h1>
                <p>Enter your email address to reset your password</p>
            </div>

            <!-- Flash Messages -->
            <?php foreach ($flash_messages as $message): ?>
                <div class="alert alert-<?php echo $message['type']; ?>">
                    <?php echo htmlspecialchars($message['message']); ?>
                </div>
            <?php endforeach; ?>

            <!-- Display errors -->
            <?php if (!empty($errors)): ?>
                <div class="alert alert-error">
                    <?php foreach ($errors as $error): ?>
                        <div><?php echo htmlspecialchars($error); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <?php echo csrf_token_field(); ?>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <button type="submit" class="btn">Send Reset Link</button>
            </form>

            <div class="form-footer">
                <p><a href="login.php">← Back to Login</a></p>
            </div>
        </div>

        <!-- Password Reset Form -->
        <div id="reset-form" class="<?php echo $step === 'reset' ? '' : 'hidden'; ?>">
            <div class="header">
                <h1>Reset Password</h1>
                <p>Enter your new password</p>
            </div>

            <!-- Display errors -->
            <?php if (!empty($errors)): ?>
                <div class="alert alert-error">
                    <?php foreach ($errors as $error): ?>
                        <div><?php echo htmlspecialchars($error); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <?php echo csrf_token_field(); ?>
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($reset_token ?? ''); ?>">

                <div class="form-group">
                    <label for="new_password">New Password</label>
                    <input type="password" id="new_password" name="new_password" required>
                    <div class="password-requirements">
                        Password must be at least <?php echo PASSWORD_MIN_LENGTH; ?> characters long
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm New Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required>
                </div>

                <button type="submit" class="btn">Update Password</button>
            </form>

            <div class="form-footer">
                <p><a href="login.php">← Back to Login</a></p>
            </div>
        </div>

        <!-- Password Reset Completed -->
        <div id="completed-form" class="<?php echo $step === 'completed' ? '' : 'hidden'; ?>">
            <div class="completed-icon">✓</div>
            <div class="header">
                <h1>Password Updated</h1>
                <p>Your password has been successfully updated</p>
            </div>

            <!-- Flash Messages -->
            <?php foreach ($flash_messages as $message): ?>
                <div class="alert alert-<?php echo $message['type']; ?>">
                    <?php echo htmlspecialchars($message['message']); ?>
                </div>
            <?php endforeach; ?>

            <div class="form-footer">
                <a href="login.php" class="btn">Login with New Password</a>
                <p style="margin-top: 20px;"><a href="index.php">← Back to Home</a></p>
            </div>
        </div>
    </div>

    <script>
        // Password confirmation validation
        document.getElementById('confirm_password')?.addEventListener('input', function() {
            const password = document.getElementById('new_password').value;
            const confirmPassword = this.value;
            
            if (password && confirmPassword && password !== confirmPassword) {
                this.style.borderColor = '#dc3545';
                this.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.25)';
            } else {
                this.style.borderColor = '#dee2e6';
                this.style.boxShadow = 'none';
            }
        });

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