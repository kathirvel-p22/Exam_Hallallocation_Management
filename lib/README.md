# Exam Seat Allocation Management System - Security and Validation Library

This library provides comprehensive security measures and validation functionality for the Exam Seat Allocation Management System.

## Overview

The security and validation library consists of several components:

- **Validation Library** (`validation.php`) - Input validation and data sanitization
- **Security Middleware** (`security.php`) - Request validation, rate limiting, and security headers
- **Utility Functions** (`utils.php`) - Common utility functions for file operations, passwords, dates, etc.
- **Error Handling System** (`errors.php`) - Centralized error logging and user-friendly messages
- **Flash Messages** (`flash_messages.php`) - User feedback system

## Quick Start

### Basic Usage

```php
// Initialize security middleware
SecurityMiddleware::init([
    'rate_limit' => ['enabled' => true, 'requests' => 100],
    'security_headers' => ['enabled' => true]
]);

// Validate form data
$rules = [
    'email' => ['required' => true, 'email' => true],
    'password' => ['required' => true, 'password' => true]
];

$errors = Validator::validateForm($_POST, $rules);

if (!empty($errors)) {
    FlashMessages::fromValidationErrors($errors);
    // Redirect back to form
} else {
    // Process valid data
}
```

## Components

### 1. Validation Library

#### Input Validation

```php
// Validate email
if (!Validator::validateEmail($email)) {
    FlashMessages::error('Invalid email address');
}

// Validate password strength
$passwordErrors = Validator::validatePassword($password, [
    'min_length' => 8,
    'require_uppercase' => true,
    'require_numbers' => true
]);

if (!empty($passwordErrors)) {
    FlashMessages::fromValidationErrors(['password' => $passwordErrors]);
}
```

#### File Upload Validation

```php
$fileErrors = Validator::validateFileUpload($_FILES['document'], [
    'allowed_types' => ['pdf', 'doc', 'docx'],
    'max_size' => 5 * 1024 * 1024 // 5MB
]);

if (!empty($fileErrors)) {
    FlashMessages::fromValidationErrors(['document' => $fileErrors]);
}
```

#### Custom Form Validation

```php
$rules = [
    'name' => [
        'required' => true,
        'min_length' => 2,
        'max_length' => 50
    ],
    'age' => [
        'required' => true,
        'range' => ['min' => 16, 'max' => 100, 'inclusive' => true]
    ],
    'email' => [
        'required' => true,
        'email' => true
    ],
    'password' => [
        'required' => true,
        'password' => true,
        'password_options' => [
            'min_length' => 8,
            'require_uppercase' => true
        ]
    ]
];

$errors = Validator::validateForm($_POST, $rules);
```

### 2. Security Middleware

#### Request Validation

```php
// Validate request method
if (!RequestValidator::validateMethod('POST')) {
    ErrorHandler::logSecurityEvent('invalid_method', 'Invalid request method');
    FlashMessages::error('Invalid request method');
    exit;
}

// Validate content type
if (!RequestValidator::validateContentType('application/json')) {
    ErrorHandler::logSecurityEvent('invalid_content_type', 'Invalid content type');
    FlashMessages::error('Invalid content type');
    exit;
}

// Validate request size
if (!RequestValidator::validateRequestSize(8 * 1024 * 1024)) { // 8MB
    ErrorHandler::logSecurityEvent('request_too_large', 'Request size exceeded');
    FlashMessages::error('Request too large');
    exit;
}
```

#### SQL Injection Prevention

```php
// Use prepared statements with parameter binding
$query = "SELECT * FROM users WHERE email = :email AND status = :status";
$params = [
    ':email' => $email,
    ':status' => 'active'
];

try {
    $results = SQLInjectionPrevention::executeSafeQuery($pdo, $query, $params, 'select');
} catch (Exception $e) {
    ErrorHandler::logCustomError('database_error', $e->getMessage());
    FlashMessages::error('Database error occurred');
}
```

#### XSS Protection

```php
// Sanitize output for HTML context
$safeOutput = XSSProtection::sanitizeOutput($userInput, 'html');

// Sanitize HTML input
$safeHTML = XSSProtection::sanitizeHTML($htmlInput, ['p', 'br', 'strong']);

// Escape JavaScript strings
$safeJS = XSSProtection::escapeJS($jsString);
```

### 3. Utility Functions

#### File Operations

```php
// Generate secure filename
$secureName = FileUploadUtils::generateSecureFilename($_FILES['file']['name'], 'upload');

// Validate file type
if (!FileUploadUtils::validateMimeType($filePath, ['image/jpeg', 'image/png'])) {
    FlashMessages::error('Invalid file type');
}

// Format file size
$formattedSize = FileUploadUtils::formatFileSize($_FILES['file']['size']);
```

#### Password Management

```php
// Generate secure password
$password = PasswordUtils::generatePassword(12, [
    'include_symbols' => true,
    'exclude_ambiguous' => true
]);

// Hash password
$hash = PasswordUtils::hashPassword($password, 12);

// Verify password
if (PasswordUtils::verifyPassword($inputPassword, $hash)) {
    // Password is correct
}

// Check password strength
$strength = PasswordUtils::getPasswordStrength($password);
if ($strength['level'] === 'weak') {
    FlashMessages::warning('Password strength is weak');
}
```

#### Date/Time Operations

```php
// Format date
$formattedDate = DateTimeUtils::formatDate($timestamp, 'Y-m-d H:i:s');

// Calculate date difference
$days = DateTimeUtils::dateDifference($startDate, $endDate, 'days');

// Check if date is in future
if (DateTimeUtils::isFutureDate($examDate)) {
    FlashMessages::info('Exam is scheduled for the future');
}

// Get business days
$businessDays = DateTimeUtils::getBusinessDays($startDate, $endDate);
```

#### Numeric Operations

```php
// Validate range
if (!NumericUtils::isInRange($age, 16, 100)) {
    FlashMessages::error('Age must be between 16 and 100');
}

// Format number
$formattedNumber = NumericUtils::formatNumber($amount, 2);

// Calculate percentage
$percentage = NumericUtils::calculatePercentage($score, $total);
```

### 4. Error Handling System

#### Custom Error Logging

```php
// Log custom error
ErrorHandler::logCustomError(
    ErrorTypes::VALIDATION_ERROR,
    'Invalid form submission',
    ErrorSeverity::MEDIUM,
    ['form_id' => $formId, 'user_id' => $userId]
);

// Log security event
ErrorHandler::logSecurityEvent(
    'suspicious_activity',
    'Multiple failed login attempts',
    ['ip_address' => $ip, 'attempts' => 5]
);

// Log system health metrics
ErrorHandler::logHealthMetrics([
    'memory_usage' => memory_get_usage(),
    'execution_time' => microtime(true) - $startTime,
    'database_connections' => $dbConnections
]);
```

#### User-Friendly Error Messages

```php
// Get user-friendly error message
$userMessage = UserMessages::getErrorMessage('database_connection_failed');
FlashMessages::error($userMessage);

// Handle exceptions
try {
    // Some operation
} catch (Exception $e) {
    FlashMessages::fromException($e);
    ErrorHandler::logCustomError('operation_failed', $e->getMessage());
}
```

### 5. Flash Messages System

#### Basic Usage

```php
// Add messages
FlashMessages::success('Operation completed successfully');
FlashMessages::info('Please review your settings');
FlashMessages::warning('This action cannot be undone');
FlashMessages::error('An error occurred while processing your request');

// Check for messages
if (FlashMessages::hasErrors()) {
    // Handle errors
}

// Render messages
echo FlashMessages::render();

// Clear messages
FlashMessages::clear();
```

#### Advanced Usage

```php
// Add persistent message
FlashMessages::success('Welcome to the system', true);

// Get messages by type
$successMessages = FlashMessages::getSuccessMessages();

// Clear specific types
FlashMessages::clearError();

// Render with custom options
echo FlashMessages::render(true, [
    'container_class' => 'custom-messages',
    'auto_dismiss' => false,
    'show_close_button' => true
]);

// Render as JSON
echo FlashMessages::renderJSON();
```

## Security Features

### Rate Limiting

The security middleware automatically applies rate limiting to prevent abuse:

- Configurable request limits per time window
- Automatic IP blocking for excessive requests
- Configurable block duration

### Security Headers

Automatic application of security headers:

- HTTP Strict Transport Security (HSTS)
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### Input Validation

Comprehensive input validation:

- Email format validation
- Password strength checking
- File upload validation
- Date/time validation
- Numeric range validation
- Custom validation callbacks

### SQL Injection Prevention

- Prepared statement enforcement
- Parameter binding
- Query pattern validation
- Dangerous SQL pattern detection

### XSS Protection

- Output sanitization for different contexts
- HTML input sanitization
- JavaScript string escaping
- Content Security Policy enforcement

## Configuration

### Security Middleware Configuration

```php
SecurityMiddleware::init([
    'rate_limit' => [
        'enabled' => true,
        'requests' => 100,
        'window' => 300, // 5 minutes
        'block_duration' => 900 // 15 minutes
    ],
    'security_headers' => [
        'enabled' => true,
        'hsts' => true,
        'csp' => true,
        'x_frame_options' => true,
        'x_content_type_options' => true,
        'x_xss_protection' => true
    ],
    'input_validation' => [
        'enabled' => true,
        'max_input_vars' => 1000,
        'max_post_size' => '8M'
    ],
    'session_security' => [
        'enabled' => true,
        'regenerate_id' => true,
        'timeout' => 1800 // 30 minutes
    ]
]);
```

### Error Handler Configuration

```php
ErrorHandler::init([
    'log_file' => 'logs/errors.log',
    'log_level' => 'ERROR',
    'enable_logging' => true,
    'display_errors' => false,
    'log_rotation' => true
]);
```

## Best Practices

### Input Validation

1. Always validate user input on the server side
2. Use whitelist validation for file uploads
3. Sanitize output based on context
4. Use prepared statements for database queries

### Security

1. Enable all security headers
2. Implement rate limiting for sensitive operations
3. Log security events for monitoring
4. Use strong password policies
5. Implement proper session management

### Error Handling

1. Log all errors for debugging
2. Display user-friendly error messages
3. Never expose sensitive information in error messages
4. Monitor error rates and patterns

### Flash Messages

1. Use appropriate message types
2. Keep messages concise and actionable
3. Implement proper message persistence
4. Provide clear feedback for user actions

## Integration Examples

### Form Processing

```php
// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    if (!SecurityValidator::validateCSRFToken($_POST['csrf_token'])) {
        FlashMessages::error('Invalid request');
        exit;
    }

    // Validate input
    $rules = [
        'email' => ['required' => true, 'email' => true],
        'password' => ['required' => true, 'password' => true]
    ];

    $errors = Validator::validateForm($_POST, $rules);

    if (!empty($errors)) {
        FlashMessages::fromValidationErrors($errors);
        header('Location: register.php');
        exit;
    }

    // Process valid data
    // ...

    FlashMessages::success('Registration successful');
    header('Location: dashboard.php');
    exit;
}
```

### File Upload

```php
// Handle file upload
if (isset($_FILES['document'])) {
    $fileErrors = Validator::validateFileUpload($_FILES['document'], [
        'allowed_types' => ['pdf', 'doc', 'docx'],
        'max_size' => 5 * 1024 * 1024
    ]);

    if (!empty($fileErrors)) {
        FlashMessages::fromValidationErrors(['document' => $fileErrors]);
        exit;
    }

    // Generate secure filename
    $filename = FileUploadUtils::generateSecureFilename(
        $_FILES['document']['name'],
        'student_docs'
    );

    // Move uploaded file
    $uploadPath = 'uploads/' . $filename;
    if (move_uploaded_file($_FILES['document']['tmp_name'], $uploadPath)) {
        FlashMessages::success('File uploaded successfully');
    } else {
        FlashMessages::error('File upload failed');
    }
}
```

## Troubleshooting

### Common Issues

1. **Rate Limiting Too Strict**: Adjust the `requests` and `window` settings
2. **Security Headers Blocking Resources**: Review CSP settings
3. **Validation Too Restrictive**: Adjust validation rules
4. **Error Messages Not Displaying**: Check session configuration

### Debugging

1. Enable error logging in development
2. Use browser developer tools to check security headers
3. Monitor error logs for patterns
4. Test with various input scenarios

## Security Considerations

### OWASP Top 10 Compliance

This library helps protect against:

1. **Injection** - SQL injection prevention
2. **Broken Authentication** - Password validation and session security
3. **Sensitive Data Exposure** - Input sanitization and secure headers
4. **XML External Entities** - Input validation
5. **Broken Access Control** - Request validation
6. **Security Misconfiguration** - Security headers and middleware
7. **Cross-Site Scripting** - XSS protection
8. **Insecure Deserialization** - Input validation
9. **Known Vulnerabilities** - Security monitoring
10. **Insufficient Logging** - Comprehensive error logging

### Regular Security Reviews

1. Review and update validation rules
2. Monitor security logs for patterns
3. Update security headers as needed
4. Test for new vulnerabilities
5. Review access controls

## Support

For issues, questions, or contributions:

1. Check the error logs for detailed information
2. Review the configuration settings
3. Test with minimal examples
4. Consult the security documentation
5. Report security vulnerabilities responsibly

## License

This library is part of the Exam Seat Allocation Management System and follows the same licensing terms.
