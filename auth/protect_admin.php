<?php
/**
 * Admin Route Protection
 * 
 * Protects admin routes from unauthorized access
 * Must be included at the top of admin pages
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/logger.php';

// Check if user is logged in
if (!is_logged_in()) {
    // Log unauthorized access attempt
    log_auth_event('unauthorized_admin_access', [
        'ip_address' => $_SERVER['REMOTE_ADDR'],
        'requested_url' => $_SERVER['REQUEST_URI'],
        'reason' => 'not_logged_in'
    ]);
    
    // Redirect to login page
    header('Location: ' . LOGIN_URL . '?error=not_authenticated&redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit();
}

// Check if user has admin role
if (!is_admin()) {
    // Log unauthorized access attempt
    log_auth_event('unauthorized_admin_access', [
        'user_id' => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['username'] ?? null,
        'ip_address' => $_SERVER['REMOTE_ADDR'],
        'requested_url' => $_SERVER['REQUEST_URI'],
        'reason' => 'insufficient_permissions'
    ]);
    
    // Redirect based on user role
    if (is_student()) {
        header('Location: ' . STUDENT_DASHBOARD_URL . '?error=access_denied');
        exit();
    } else {
        header('Location: ' . HOME_URL . '?error=access_denied');
        exit();
    }
}

// Check session security
if (!validate_session_security()) {
    log_auth_event('session_security_violation', [
        'user_id' => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['username'] ?? null,
        'ip_address' => $_SERVER['REMOTE_ADDR'],
        'requested_url' => $_SERVER['REQUEST_URI']
    ]);
    
    // Destroy session and redirect to login
    session_destroy();
    header('Location: ' . LOGIN_URL . '?error=session_invalid');
    exit();
}

// Update session activity
update_session_activity();

// Optional: Check if session is about to expire
if (is_session_about_to_expire()) {
    // Set a warning flag that can be used in the admin interface
    $_SESSION['session_warning'] = true;
} else {
    unset($_SESSION['session_warning']);
}

// Admin access granted - continue with page execution