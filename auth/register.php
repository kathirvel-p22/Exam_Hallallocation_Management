<?php
/**
 * User Registration (Admin Only)
 * 
 * Admin-only registration form for creating new users
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/protect_admin.php';
require_once __DIR__ . '/csrf.php';

$errors = [];
$success = false;

// Process registration form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check CSRF token
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        $errors[] = 'Invalid request. Please try again.';
    } else {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';
        $role = $_POST['role'] ?? ROLE_STUDENT;
        
        // Validate input
        if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
            $errors[] = 'Please fill in all required fields.';
        } elseif ($password !== $confirm_password) {
            $errors[] = 'Passwords do not match.';
        } else {
            // Attempt registration
            $registration_result = register_user($username, $email, $password, $role);
            
            if ($registration_result['success']) {
                $success = true;
                set_flash_message('success', 'User registered successfully.');
            } else {
                $errors = $registration_result['errors'];
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
    <title>Register User - Exam Seat Management</title>
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
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--card-bg);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 20px;
        }

        .header h1 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 28px;
        }

        .header p {
            color: #666;
            font-size: 16px;
        }

        .breadcrumb {
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;
        }

        .breadcrumb a {
            color: var(--primary-color);
            text-decoration: none;
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

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .btn-group {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 30px;
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

        .password-requirements {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            line-height: 1.4;
        }

        .required {
            color: var(--error-color);
        }

        .role-info {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Register New User</h1>
            <p>Admin panel - Create new user accounts</p>
        </div>

        <div class="breadcrumb">
            <a href="<?php echo ADMIN_DASHBOARD_URL; ?>">← Back to Dashboard</a>
        </div>

        <!-- Flash Messages -->
        <?php foreach ($flash_messages as $message): ?>
            <div class="alert alert-<?php echo $message['type']; ?>">
                <?php echo htmlspecialchars($message['message']); ?>
            </div>
        <?php endforeach; ?>

        <!-- Registration Form -->
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

            <?php if ($success): ?>
                <div class="alert alert-success">
                    User registered successfully! Username: <?php echo htmlspecialchars($username); ?>
                </div>
            <?php endif; ?>

            <div class="form-group">
                <label for="username">Username <span class="required">*</span></label>
                <input type="text" id="username" name="username" 
                       value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>" 
                       required>
                <div class="role-info">Username can only contain letters, numbers, and underscores</div>
            </div>

            <div class="form-group">
                <label for="email">Email Address <span class="required">*</span></label>
                <input type="email" id="email" name="email" 
                       value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>" 
                       required>
            </div>

            <div class="form-group">
                <label for="password">Password <span class="required">*</span></label>
                <input type="password" id="password" name="password" required>
                <div class="password-requirements">
                    Password must be at least <?php echo PASSWORD_MIN_LENGTH; ?> characters long and include:
                    <?php if (PASSWORD_REQUIRE_UPPERCASE): ?>• At least one uppercase letter<br><?php endif; ?>
                    <?php if (PASSWORD_REQUIRE_LOWERCASE): ?>• At least one lowercase letter<br><?php endif; ?>
                    <?php if (PASSWORD_REQUIRE_NUMBERS): ?>• At least one number<br><?php endif; ?>
                    <?php if (PASSWORD_REQUIRE_SPECIAL_CHARS): ?>• At least one special character<br><?php endif; ?>
                </div>
            </div>

            <div class="form-group">
                <label for="confirm_password">Confirm Password <span class="required">*</span></label>
                <input type="password" id="confirm_password" name="confirm_password" required>
            </div>

            <div class="form-group">
                <label for="role">User Role <span class="required">*</span></label>
                <select id="role" name="role" required>
                    <option value="<?php echo ROLE_STUDENT; ?>" <?php echo (($_POST['role'] ?? ROLE_STUDENT) === ROLE_STUDENT) ? 'selected' : ''; ?>>
                        Student
                    </option>
                    <option value="<?php echo ROLE_ADMIN; ?>" <?php echo (($_POST['role'] ?? ROLE_STUDENT) === ROLE_ADMIN) ? 'selected' : ''; ?>>
                        Admin
                    </option>
                </select>
                <div class="role-info">
                    Admin users have full access to the system. Student users have view-only access.
                </div>
            </div>

            <div class="btn-group">
                <button type="submit" class="btn btn-primary">Register User</button>
                <a href="<?php echo ADMIN_DASHBOARD_URL; ?>" class="btn btn-secondary">Cancel</a>
            </div>
        </form>
    </div>

    <script>
        // Password confirmation validation
        document.getElementById('confirm_password').addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            const submitBtn = document.querySelector('button[type="submit"]');
            
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