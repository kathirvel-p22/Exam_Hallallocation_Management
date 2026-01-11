<?php
/**
 * Integration Example
 * Shows how to integrate the security and validation system with existing forms
 * 
 * @package ExamSeatAllocation
 * @author Integration Team
 * @version 1.0.0
 */

// Example of integrating with an existing form
// This would typically be included at the top of your form processing files

// Include the security and validation library
require_once 'lib/validation.php';
require_once 'lib/security.php';
require_once 'lib/utils.php';
require_once 'lib/errors.php';
require_once 'lib/flash_messages.php';

// Initialize security middleware
SecurityMiddleware::init([
    'rate_limit' => ['enabled' => true, 'requests' => 100, 'window' => 300],
    'security_headers' => ['enabled' => true],
    'input_validation' => ['enabled' => true, 'max_input_vars' => 1000],
    'session_security' => ['enabled' => true, 'timeout' => 1800]
]);

// Initialize error handler
ErrorHandler::init([
    'log_file' => 'logs/errors.log',
    'log_level' => 'ERROR',
    'enable_logging' => true,
    'display_errors' => false
]);

// Example: User Registration Form Integration
function processRegistrationForm() {
    // Check if form was submitted
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return;
    }
    
    // Validate request method
    if (!RequestValidator::validateMethod('POST')) {
        ErrorHandler::logSecurityEvent('invalid_method', 'Invalid request method for registration');
        FlashMessages::error('Invalid request method');
        return;
    }
    
    // Validate CSRF token
    if (!SecurityValidator::validateCSRFToken($_POST['csrf_token'] ?? '')) {
        ErrorHandler::logSecurityEvent('csrf_token_invalid', 'Invalid CSRF token for registration');
        FlashMessages::error('Invalid request. Please try again.');
        return;
    }
    
    // Validate input data
    $rules = [
        'full_name' => [
            'required' => true,
            'min_length' => 2,
            'max_length' => 100,
            'callback' => function($value) {
                // Custom validation: no special characters except spaces and hyphens
                if (!preg_match('/^[a-zA-Z\s\-\'\.]+$/', $value)) {
                    return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
                }
                return true;
            }
        ],
        'email' => [
            'required' => true,
            'email' => true,
            'callback' => function($value) {
                // Check if email is disposable
                if (EmailUtils::isDisposableEmail($value)) {
                    return 'Disposable email addresses are not allowed';
                }
                return true;
            }
        ],
        'student_id' => [
            'required' => true,
            'min_length' => 5,
            'max_length' => 20,
            'callback' => function($value) {
                // Student ID format: alphanumeric with optional hyphens
                if (!preg_match('/^[A-Z0-9\-]+$/', $value)) {
                    return 'Student ID can only contain uppercase letters, numbers, and hyphens';
                }
                return true;
            }
        ],
        'password' => [
            'required' => true,
            'password' => true,
            'password_options' => [
                'min_length' => 8,
                'require_uppercase' => true,
                'require_lowercase' => true,
                'require_numbers' => true,
                'require_special' => true
            ]
        ],
        'confirm_password' => [
            'required' => true,
            'callback' => function($value, $data) {
                if ($value !== $data['password']) {
                    return 'Passwords do not match';
                }
                return true;
            }
        ],
        'date_of_birth' => [
            'required' => true,
            'date' => true,
            'date_format' => 'Y-m-d',
            'callback' => function($value) {
                // Check if user is at least 16 years old
                $age = DateTimeUtils::dateDifference($value, date('Y-m-d'), 'years');
                if ($age < 16) {
                    return 'You must be at least 16 years old to register';
                }
                if ($age > 100) {
                    return 'Invalid date of birth';
                }
                return true;
            }
        ],
        'phone' => [
            'required' => false,
            'callback' => function($value) {
                if (empty($value)) {
                    return true; // Optional field
                }
                // Basic phone number validation
                if (!preg_match('/^[+]?[\d\s\-\(\)]{7,15}$/', $value)) {
                    return 'Invalid phone number format';
                }
                return true;
            }
        ]
    ];
    
    // Sanitize input data
    $sanitizedData = [];
    foreach ($_POST as $key => $value) {
        $sanitizedData[$key] = Validator::sanitize($value, 'string');
    }
    
    // Validate form data
    $errors = Validator::validateForm($sanitizedData, $rules);
    
    if (!empty($errors)) {
        // Log validation errors
        ErrorHandler::logCustomError(
            ErrorTypes::VALIDATION_ERROR,
            'Form validation failed',
            ErrorSeverity::MEDIUM,
            ['errors' => $errors, 'user_ip' => $_SERVER['REMOTE_ADDR']]
        );
        
        // Display validation errors
        FlashMessages::fromValidationErrors($errors);
        return;
    }
    
    // Additional security checks
    if (!SecurityValidator::validateSessionSecurity()) {
        ErrorHandler::logSecurityEvent('session_invalid', 'Invalid session during registration');
        FlashMessages::error('Session expired. Please try again.');
        return;
    }
    
    if (!SecurityValidator::validateUserAgent()) {
        ErrorHandler::logSecurityEvent('user_agent_changed', 'User agent changed during registration');
        FlashMessages::error('Security check failed. Please try again.');
        return;
    }
    
    // Check for suspicious activity
    if (!SecurityValidator::checkSuspiciousActivity('registration', $sanitizedData['email'])) {
        ErrorHandler::logSecurityEvent('registration_rate_limit', 'Too many registration attempts');
        FlashMessages::error('Too many registration attempts. Please try again later.');
        return;
    }
    
    // Process valid data (example)
    try {
        // Hash password
        $hashedPassword = PasswordUtils::hashPassword($sanitizedData['password']);
        
        // Generate secure filename for any uploaded documents
        if (isset($_FILES['document']) && $_FILES['document']['error'] === UPLOAD_ERR_OK) {
            $fileErrors = Validator::validateFileUpload($_FILES['document'], [
                'allowed_types' => ['pdf', 'doc', 'docx'],
                'max_size' => 2 * 1024 * 1024 // 2MB
            ]);
            
            if (!empty($fileErrors)) {
                FlashMessages::fromValidationErrors(['document' => $fileErrors]);
                return;
            }
            
            $filename = FileUploadUtils::generateSecureFilename(
                $_FILES['document']['name'],
                'student_docs'
            );
            
            $uploadPath = 'uploads/documents/' . $filename;
            move_uploaded_file($_FILES['document']['tmp_name'], $uploadPath);
        }
        
        // Insert user into database using safe SQL
        $query = "INSERT INTO students (full_name, email, student_id, password_hash, date_of_birth, phone, created_at) 
                  VALUES (:full_name, :email, :student_id, :password_hash, :date_of_birth, :phone, NOW())";
        
        $params = [
            ':full_name' => $sanitizedData['full_name'],
            ':email' => $sanitizedData['email'],
            ':student_id' => $sanitizedData['student_id'],
            ':password_hash' => $hashedPassword,
            ':date_of_birth' => $sanitizedData['date_of_birth'],
            ':phone' => $sanitizedData['phone'] ?? null
        ];
        
        // This would use your database connection
        // $result = SQLInjectionPrevention::executeSafeQuery($pdo, $query, $params, 'insert');
        
        // Log successful registration
        ErrorHandler::logCustomError(
            ErrorTypes::SYSTEM_ERROR,
            'User registration successful',
            ErrorSeverity::LOW,
            ['email' => $sanitizedData['email'], 'student_id' => $sanitizedData['student_id']]
        );
        
        FlashMessages::success('Registration successful! Please check your email for verification.');
        
    } catch (Exception $e) {
        ErrorHandler::logCustomError(
            ErrorTypes::DATABASE_ERROR,
            'Registration failed: ' . $e->getMessage(),
            ErrorSeverity::HIGH,
            ['email' => $sanitizedData['email']]
        );
        
        FlashMessages::error('Registration failed. Please try again later.');
    }
}

// Example: Exam Allocation Form Integration
function processAllocationForm() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return;
    }
    
    // Validate CSRF token
    if (!SecurityValidator::validateCSRFToken($_POST['csrf_token'] ?? '')) {
        ErrorHandler::logSecurityEvent('csrf_token_invalid', 'Invalid CSRF token for allocation');
        FlashMessages::error('Invalid request. Please try again.');
        return;
    }
    
    // Validate input data
    $rules = [
        'exam_id' => [
            'required' => true,
            'callback' => function($value) {
                // Validate exam ID format and existence
                if (!is_numeric($value) || $value <= 0) {
                    return 'Invalid exam ID';
                }
                
                // This would check if exam exists in database
                // $examExists = checkExamExists($value);
                // if (!$examExists) {
                //     return 'Exam not found';
                // }
                
                return true;
            }
        ],
        'student_id' => [
            'required' => true,
            'callback' => function($value) {
                // Validate student ID format
                if (!preg_match('/^[A-Z0-9\-]+$/', $value)) {
                    return 'Invalid student ID format';
                }
                return true;
            }
        ],
        'preferred_room' => [
            'required' => false,
            'callback' => function($value) {
                if (empty($value)) {
                    return true; // Optional
                }
                // Validate room ID format
                if (!preg_match('/^[A-Z0-9\-]+$/', $value)) {
                    return 'Invalid room ID format';
                }
                return true;
            }
        ],
        'special_requirements' => [
            'required' => false,
            'max_length' => 500,
            'callback' => function($value) {
                if (empty($value)) {
                    return true; // Optional
                }
                // Sanitize special requirements
                $sanitized = XSSProtection::sanitizeHTML($value, ['p', 'br', 'strong', 'em']);
                if ($sanitized !== $value) {
                    return 'Special requirements contain invalid HTML';
                }
                return true;
            }
        ]
    ];
    
    // Sanitize input data
    $sanitizedData = [];
    foreach ($_POST as $key => $value) {
        $sanitizedData[$key] = Validator::sanitize($value, 'string');
    }
    
    // Validate form data
    $errors = Validator::validateForm($sanitizedData, $rules);
    
    if (!empty($errors)) {
        ErrorHandler::logCustomError(
            ErrorTypes::VALIDATION_ERROR,
            'Allocation form validation failed',
            ErrorSeverity::MEDIUM,
            ['errors' => $errors]
        );
        
        FlashMessages::fromValidationErrors($errors);
        return;
    }
    
    // Process allocation
    try {
        // This would process the allocation using your AllocationService
        // $result = AllocationService::allocateSeat($sanitizedData);
        
        FlashMessages::success('Seat allocation request submitted successfully!');
        
    } catch (Exception $e) {
        ErrorHandler::logCustomError(
            ErrorTypes::BUSINESS_LOGIC_ERROR,
            'Allocation failed: ' . $e->getMessage(),
            ErrorSeverity::HIGH
        );
        
        FlashMessages::error('Allocation failed. Please try again later.');
    }
}

// Example: Display form with security measures
function displayRegistrationForm() {
    // Generate CSRF token
    $csrfToken = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $csrfToken;
    
    // Display any flash messages
    echo FlashMessages::render();
    
    // Display form
    echo '
    <form method="POST" action="register.php" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="' . htmlspecialchars($csrfToken) . '">
        
        <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" id="full_name" name="full_name" required
                   pattern="[a-zA-Z\s\-\'\.]+" title="Letters, spaces, hyphens, apostrophes, and periods only">
        </div>
        
        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
            <label for="student_id">Student ID</label>
            <input type="text" id="student_id" name="student_id" required
                   pattern="[A-Z0-9\-]+" title="Uppercase letters, numbers, and hyphens only">
        </div>
        
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required
                   minlength="8" title="At least 8 characters with uppercase, lowercase, numbers, and special characters">
        </div>
        
        <div class="form-group">
            <label for="confirm_password">Confirm Password</label>
            <input type="password" id="confirm_password" name="confirm_password" required>
        </div>
        
        <div class="form-group">
            <label for="date_of_birth">Date of Birth</label>
            <input type="date" id="date_of_birth" name="date_of_birth" required>
        </div>
        
        <div class="form-group">
            <label for="phone">Phone Number (Optional)</label>
            <input type="tel" id="phone" name="phone" 
                   pattern="[+]?[\d\s\-\(\)]{7,15}" title="Valid phone number format">
        </div>
        
        <div class="form-group">
            <label for="document">Upload Document (Optional)</label>
            <input type="file" id="document" name="document" accept=".pdf,.doc,.docx">
            <small>Maximum file size: 2MB</small>
        </div>
        
        <button type="submit">Register</button>
    </form>';
    
    // Add JavaScript for client-side validation and security
    echo '
    <script>
        // Client-side password strength indicator
        document.getElementById("password").addEventListener("input", function() {
            var password = this.value;
            var strength = 0;
            
            if (password.length >= 8) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;
            
            var indicator = document.getElementById("password-strength");
            if (!indicator) {
                indicator = document.createElement("div");
                indicator.id = "password-strength";
                this.parentNode.appendChild(indicator);
            }
            
            indicator.className = "strength-" + strength;
            indicator.textContent = "Password strength: " + ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength] || "Unknown";
        });
        
        // Confirm password matching
        document.getElementById("confirm_password").addEventListener("input", function() {
            var password = document.getElementById("password").value;
            var confirmPassword = this.value;
            var message = document.getElementById("password-match");
            
            if (!message) {
                message = document.createElement("div");
                message.id = "password-match";
                this.parentNode.appendChild(message);
            }
            
            if (password === confirmPassword && password.length > 0) {
                message.className = "match-valid";
                message.textContent = "Passwords match";
            } else if (confirmPassword.length > 0) {
                message.className = "match-invalid";
                message.textContent = "Passwords do not match";
            } else {
                message.className = "";
                message.textContent = "";
            }
        });
    </script>';
}

// Example usage
// processRegistrationForm();
// displayRegistrationForm();