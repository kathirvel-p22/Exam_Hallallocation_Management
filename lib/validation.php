<?php
/**
 * Validation Library
 * Provides comprehensive input validation, data sanitization, and security validation
 * 
 * @package ExamSeatAllocation
 * @author Security Team
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    die('Direct access not allowed');
}

/**
 * Validation class for input validation and sanitization
 */
class Validator {
    
    /**
     * Validation rules cache
     * @var array
     */
    private static $rules = [];
    
    /**
     * Error messages cache
     * @var array
     */
    private static $errors = [];
    
    /**
     * Sanitize input data
     * 
     * @param mixed $input The input to sanitize
     * @param string $type The type of sanitization (string, email, url, etc.)
     * @return mixed Sanitized input
     */
    public static function sanitize($input, $type = 'string') {
        if (is_array($input)) {
            return array_map(function($value) use ($type) {
                return self::sanitize($value, $type);
            }, $input);
        }
        
        switch ($type) {
            case 'string':
                return trim(strip_tags($input));
            case 'email':
                return filter_var($input, FILTER_SANITIZE_EMAIL);
            case 'url':
                return filter_var($input, FILTER_SANITIZE_URL);
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
            case 'float':
                return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            case 'html':
                return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
            default:
                return trim(strip_tags($input));
        }
    }
    
    /**
     * Validate email address
     * 
     * @param string $email Email address to validate
     * @return bool True if valid, false otherwise
     */
    public static function validateEmail($email) {
        if (empty($email)) {
            return false;
        }
        
        // Basic format check
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }
        
        // Additional checks for security
        $email = strtolower($email);
        
        // Check for suspicious patterns
        if (preg_match('/[<>"\'\(\)]/', $email)) {
            return false;
        }
        
        // Check domain format
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return false;
        }
        
        $domain = $parts[1];
        
        // Check for valid domain format
        if (!preg_match('/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/', $domain)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate password strength
     * 
     * @param string $password Password to validate
     * @param array $options Validation options
     * @return array Validation result with errors
     */
    public static function validatePassword($password, $options = []) {
        $defaultOptions = [
            'min_length' => 8,
            'require_uppercase' => true,
            'require_lowercase' => true,
            'require_numbers' => true,
            'require_special' => true,
            'max_length' => 128
        ];
        
        $options = array_merge($defaultOptions, $options);
        $errors = [];
        
        if (empty($password)) {
            $errors[] = 'Password is required';
            return $errors;
        }
        
        // Length validation
        if (strlen($password) < $options['min_length']) {
            $errors[] = "Password must be at least {$options['min_length']} characters long";
        }
        
        if (strlen($password) > $options['max_length']) {
            $errors[] = "Password must not exceed {$options['max_length']} characters";
        }
        
        // Character requirements
        if ($options['require_uppercase'] && !preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if ($options['require_lowercase'] && !preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if ($options['require_numbers'] && !preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if ($options['require_special'] && !preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        // Check for common patterns
        if (preg_match('/(.)\1{2,}/', $password)) {
            $errors[] = 'Password cannot contain repeated characters (more than 2 in a row)';
        }
        
        // Check for common sequences
        $commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
        foreach ($commonSequences as $sequence) {
            if (stripos($password, $sequence) !== false) {
                $errors[] = 'Password cannot contain common sequences';
                break;
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate date format
     * 
     * @param string $date Date string to validate
     * @param string $format Expected format
     * @return bool True if valid, false otherwise
     */
    public static function validateDate($date, $format = 'Y-m-d') {
        if (empty($date)) {
            return false;
        }
        
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }
    
    /**
     * Validate numeric range
     * 
     * @param mixed $value Value to validate
     * @param float $min Minimum value
     * @param float $max Maximum value
     * @param bool $inclusive Whether bounds are inclusive
     * @return bool True if valid, false otherwise
     */
    public static function validateRange($value, $min, $max, $inclusive = true) {
        if (!is_numeric($value)) {
            return false;
        }
        
        if ($inclusive) {
            return $value >= $min && $value <= $max;
        } else {
            return $value > $min && $value < $max;
        }
    }
    
    /**
     * Validate file upload
     * 
     * @param array $file File array from $_FILES
     * @param array $options Validation options
     * @return array Validation result with errors
     */
    public static function validateFileUpload($file, $options = []) {
        $defaultOptions = [
            'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
            'max_size' => 5 * 1024 * 1024, // 5MB
            'required' => false
        ];
        
        $options = array_merge($defaultOptions, $options);
        $errors = [];
        
        // Check if file was uploaded
        if (empty($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            if ($options['required']) {
                $errors[] = 'File upload is required';
            }
            return $errors;
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            switch ($file['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errors[] = 'File size exceeds maximum allowed size';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errors[] = 'File was only partially uploaded';
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $errors[] = 'Temporary folder not found';
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $errors[] = 'Failed to write file to disk';
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $errors[] = 'File upload stopped by extension';
                    break;
                default:
                    $errors[] = 'Unknown upload error';
            }
            return $errors;
        }
        
        // Check file size
        if ($file['size'] > $options['max_size']) {
            $errors[] = 'File size exceeds maximum allowed size';
        }
        
        // Check file type
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($fileInfo, $file['tmp_name']);
        finfo_close($fileInfo);
        
        // Get file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $options['allowed_types'])) {
            $errors[] = 'File type not allowed';
        }
        
        // Additional MIME type validation
        $allowedMimes = [
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        ];
        
        if (isset($allowedMimes[$extension]) && !in_array($mimeType, $allowedMimes[$extension])) {
            $errors[] = 'File MIME type does not match extension';
        }
        
        return $errors;
    }
    
    /**
     * Validate form data against rules
     * 
     * @param array $data Form data
     * @param array $rules Validation rules
     * @return array Validation result with errors
     */
    public static function validateForm($data, $rules) {
        $errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = isset($data[$field]) ? $data[$field] : null;
            
            // Check if field is required
            if (isset($fieldRules['required']) && $fieldRules['required'] && empty($value)) {
                $errors[$field][] = $fieldRules['required_message'] ?? ucfirst($field) . ' is required';
                continue;
            }
            
            // Skip validation if value is empty and not required
            if (empty($value) && !isset($fieldRules['required'])) {
                continue;
            }
            
            // Validate length
            if (isset($fieldRules['min_length']) && strlen($value) < $fieldRules['min_length']) {
                $errors[$field][] = $fieldRules['min_length_message'] ?? ucfirst($field) . " must be at least {$fieldRules['min_length']} characters";
            }
            
            if (isset($fieldRules['max_length']) && strlen($value) > $fieldRules['max_length']) {
                $errors[$field][] = $fieldRules['max_length_message'] ?? ucfirst($field) . " must not exceed {$fieldRules['max_length']} characters";
            }
            
            // Validate email
            if (isset($fieldRules['email']) && $fieldRules['email']) {
                if (!self::validateEmail($value)) {
                    $errors[$field][] = $fieldRules['email_message'] ?? 'Invalid email format';
                }
            }
            
            // Validate password
            if (isset($fieldRules['password']) && $fieldRules['password']) {
                $passwordErrors = self::validatePassword($value, $fieldRules['password_options'] ?? []);
                if (!empty($passwordErrors)) {
                    $errors[$field] = array_merge($errors[$field] ?? [], $passwordErrors);
                }
            }
            
            // Validate date
            if (isset($fieldRules['date']) && $fieldRules['date']) {
                $format = $fieldRules['date_format'] ?? 'Y-m-d';
                if (!self::validateDate($value, $format)) {
                    $errors[$field][] = $fieldRules['date_message'] ?? 'Invalid date format';
                }
            }
            
            // Validate numeric range
            if (isset($fieldRules['range'])) {
                $range = $fieldRules['range'];
                if (!self::validateRange($value, $range['min'], $range['max'], $range['inclusive'] ?? true)) {
                    $errors[$field][] = $fieldRules['range_message'] ?? 'Value is out of range';
                }
            }
            
            // Custom validation callback
            if (isset($fieldRules['callback']) && is_callable($fieldRules['callback'])) {
                $result = call_user_func($fieldRules['callback'], $value, $data);
                if ($result !== true) {
                    $errors[$field][] = $result;
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Get validation errors
     * 
     * @return array Current validation errors
     */
    public static function getErrors() {
        return self::$errors;
    }
    
    /**
     * Clear validation errors
     */
    public static function clearErrors() {
        self::$errors = [];
    }
    
    /**
     * Check if validation passed
     * 
     * @return bool True if no errors, false otherwise
     */
    public static function passed() {
        return empty(self::$errors);
    }
}

/**
 * Security validation helpers
 */
class SecurityValidator {
    
    /**
     * Validate CSRF token
     * 
     * @param string $token CSRF token to validate
     * @return bool True if valid, false otherwise
     */
    public static function validateCSRFToken($token) {
        if (empty($token)) {
            return false;
        }
        
        // Get stored token from session
        $storedToken = $_SESSION['csrf_token'] ?? null;
        
        if (empty($storedToken)) {
            return false;
        }
        
        // Use hash_equals for timing-safe comparison
        return hash_equals($storedToken, $token);
    }
    
    /**
     * Validate session security
     * 
     * @return bool True if session is secure, false otherwise
     */
    public static function validateSessionSecurity() {
        // Check if session is active
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return false;
        }
        
        // Check session timeout
        $lastActivity = $_SESSION['last_activity'] ?? 0;
        $timeout = 30 * 60; // 30 minutes
        
        if (time() - $lastActivity > $timeout) {
            return false;
        }
        
        // Check for session fixation
        if (!isset($_SESSION['session_created'])) {
            return false;
        }
        
        // Update last activity
        $_SESSION['last_activity'] = time();
        
        return true;
    }
    
    /**
     * Validate user agent consistency
     * 
     * @return bool True if user agent is consistent, false otherwise
     */
    public static function validateUserAgent() {
        $currentUA = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $storedUA = $_SESSION['user_agent'] ?? '';
        
        if (empty($storedUA)) {
            $_SESSION['user_agent'] = $currentUA;
            return true;
        }
        
        return hash_equals($storedUA, $currentUA);
    }
    
    /**
     * Validate IP address consistency
     * 
     * @return bool True if IP is consistent, false otherwise
     */
    public static function validateIPAddress() {
        $currentIP = $_SERVER['REMOTE_ADDR'] ?? '';
        $storedIP = $_SESSION['ip_address'] ?? '';
        
        if (empty($storedIP)) {
            $_SESSION['ip_address'] = $currentIP;
            return true;
        }
        
        // Allow for minor IP changes (e.g., load balancers)
        $currentIP = preg_replace('/\.\d+$/', '', $currentIP);
        $storedIP = preg_replace('/\.\d+$/', '', $storedIP);
        
        return $currentIP === $storedIP;
    }
    
    /**
     * Check for suspicious activity
     * 
     * @param string $activity Type of activity
     * @param string $identifier Unique identifier for the activity
     * @return bool True if activity is allowed, false if suspicious
     */
    public static function checkSuspiciousActivity($activity, $identifier) {
        $key = "suspicious_{$activity}_{$identifier}";
        $attempts = $_SESSION[$key] ?? 0;
        $lastAttempt = $_SESSION["{$key}_time"] ?? 0;
        
        // Reset counter after 1 hour
        if (time() - $lastAttempt > 3600) {
            $_SESSION[$key] = 0;
            return true;
        }
        
        // Check limits based on activity type
        $limits = [
            'login' => 5,
            'password_reset' => 3,
            'file_upload' => 10,
            'form_submit' => 20
        ];
        
        $limit = $limits[$activity] ?? 10;
        
        if ($attempts >= $limit) {
            return false;
        }
        
        $_SESSION[$key]++;
        $_SESSION["{$key}_time"] = time();
        
        return true;
    }
}