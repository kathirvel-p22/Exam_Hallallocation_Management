<?php
/**
 * Session Management Utilities
 * 
 * Functions for secure session handling and management
 */

require_once __DIR__ . '/config.php';

/**
 * Initialize secure session settings
 */
function init_secure_session() {
    // Set session name
    session_name(SESSION_NAME);
    
    // Set session cookie parameters
    session_set_cookie_params([
        'lifetime' => SESSION_COOKIE_LIFETIME,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']), // Only send over HTTPS
        'httponly' => true, // Prevent JavaScript access
        'samesite' => 'Strict' // CSRF protection
    ]);
    
    // Start session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Set session timeout
    $_SESSION['session_timeout'] = time() + SESSION_TIMEOUT;
}

/**
 * Regenerate session ID to prevent session fixation
 */
function regenerate_session_id() {
    session_regenerate_id(true);
    $_SESSION['last_regeneration'] = time();
}

/**
 * Check session timeout and destroy if expired
 */
function check_session_timeout() {
    if (isset($_SESSION['session_timeout']) && time() > $_SESSION['session_timeout']) {
        // Session has expired
        session_destroy();
        header('Location: ' . LOGIN_URL . '?error=session_expired');
        exit();
    }
}

/**
 * Validate session security
 * 
 * @return bool
 */
function validate_session_security() {
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    
    // Check IP address consistency
    if (isset($_SESSION['ip_address']) && $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
        return false;
    }
    
    // Check user agent consistency
    if (isset($_SESSION['user_agent']) && $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
        return false;
    }
    
    return true;
}

/**
 * Destroy session and clear all session data
 */
function destroy_session() {
    // Unset all session variables
    $_SESSION = [];
    
    // Destroy the session
    session_destroy();
    
    // Clear session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
}

/**
 * Set session flash message
 * 
 * @param string $type
 * @param string $message
 */
function set_flash_message($type, $message) {
    $_SESSION['flash_messages'][] = [
        'type' => $type,
        'message' => $message,
        'timestamp' => time()
    ];
}

/**
 * Get and clear flash messages
 * 
 * @return array
 */
function get_flash_messages() {
    if (isset($_SESSION['flash_messages'])) {
        $messages = $_SESSION['flash_messages'];
        unset($_SESSION['flash_messages']);
        return $messages;
    }
    return [];
}

/**
 * Check if user is authenticated and session is valid
 * 
 * @return bool
 */
function is_session_valid() {
    return isset($_SESSION['user_id']) && 
           isset($_SESSION['username']) && 
           validate_session_security();
}

/**
 * Update session activity timestamp
 */
function update_session_activity() {
    if (isset($_SESSION['user_id'])) {
        $_SESSION['last_activity'] = time();
        $_SESSION['session_timeout'] = time() + SESSION_TIMEOUT;
    }
}

/**
 * Check if session is about to expire
 * 
 * @return bool
 */
function is_session_about_to_expire() {
    if (!isset($_SESSION['session_timeout'])) {
        return false;
    }
    
    $time_remaining = $_SESSION['session_timeout'] - time();
    return $time_remaining < 300; // 5 minutes
}