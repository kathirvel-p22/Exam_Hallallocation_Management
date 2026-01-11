<?php
/**
 * CSRF Protection
 * 
 * Cross-Site Request Forgery protection functions
 */

require_once __DIR__ . '/config.php';

/**
 * Generate CSRF token
 * 
 * @return string
 */
function generate_csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    } elseif (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_LIFETIME) {
        // Token expired, generate new one
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 * 
 * @param string $token
 * @return bool
 */
function validate_csrf_token($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    // Check if token has expired
    if (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_LIFETIME) {
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
        return false;
    }
    
    // Validate token
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Generate CSRF token input field for forms
 * 
 * @return string
 */
function csrf_token_field() {
    $token = generate_csrf_token();
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token) . '">';
}

/**
 * Check CSRF token from POST request
 * 
 * @return bool
 */
function check_csrf_token() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_POST['csrf_token'])) {
            return false;
        }
        
        return validate_csrf_token($_POST['csrf_token']);
    }
    
    return true; // GET requests don't need CSRF protection
}

/**
 * Generate CSRF meta tag for JavaScript
 * 
 * @return string
 */
function csrf_meta_tag() {
    $token = generate_csrf_token();
    return '<meta name="csrf-token" content="' . htmlspecialchars($token) . '">';
}

/**
 * Add CSRF protection to forms automatically
 */
function protect_form() {
    if (!check_csrf_token()) {
        http_response_code(403);
        die('CSRF token validation failed');
    }
}

/**
 * Generate AJAX-ready CSRF token
 * 
 * @return string
 */
function get_ajax_csrf_token() {
    return generate_csrf_token();
}

/**
 * Validate AJAX CSRF token
 * 
 * @param string $token
 * @return bool
 */
function validate_ajax_csrf_token($token) {
    return validate_csrf_token($token);
}