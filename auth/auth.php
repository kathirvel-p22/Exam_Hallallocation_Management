<?php
/**
 * Authentication Functions
 *
 * Core authentication system functions for user management, login, logout, and security
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/database.php';
require_once '../config/database.php';

/**
 * Initialize authentication system
 */
function init_auth() {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Regenerate session ID periodically for security
    if (!isset($_SESSION['last_regeneration'])) {
        regenerate_session_id();
    } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
        regenerate_session_id();
    }
    
    // Check session timeout
    check_session_timeout();
}

/**
 * User registration
 *
 * @param string $username
 * @param string $email
 * @param string $password
 * @param string $role
 * @return array
 */
function register_user($username, $email, $password, $role = ROLE_STUDENT) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Validate input
    $errors = validate_registration_data($username, $email, $password, $role);
    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }
    
    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT user_id FROM " . USERS_TABLE . " WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            log_auth_event('registration_failed', ['username' => $username, 'reason' => 'username_or_email_exists']);
            return ['success' => false, 'errors' => ['Username or email already exists']];
        }
        
        // Hash password
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert user
        $stmt = $pdo->prepare("INSERT INTO " . USERS_TABLE . " (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([$username, $email, $password_hash, $role, $username]); // Use username as full_name
        
        if ($result) {
            log_auth_event('user_registered', ['username' => $username, 'role' => $role]);
            return ['success' => true, 'message' => 'User registered successfully'];
        } else {
            return ['success' => false, 'errors' => ['Registration failed']];
        }
        
    } catch (PDOException $e) {
        log_auth_event('registration_error', ['username' => $username, 'error' => $e->getMessage()]);
        return ['success' => false, 'errors' => ['Database error occurred']];
    }
}

/**
 * User login
 *
 * @param string $username
 * @param string $password
 * @return array
 */
function login_user($username, $password) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Check for IP lockout
    if (is_ip_locked($_SERVER['REMOTE_ADDR'])) {
        log_auth_event('login_blocked', ['username' => $username, 'ip' => $_SERVER['REMOTE_ADDR'], 'reason' => 'ip_locked']);
        return ['success' => false, 'errors' => ['Account temporarily locked due to too many failed attempts']];
    }
    
    try {
        // Get user data
        $stmt = $pdo->prepare("SELECT user_id, username, email, password_hash, role, is_active, created_at FROM " . USERS_TABLE . " WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            log_auth_event('login_failed', ['username' => $username, 'reason' => 'user_not_found']);
            increment_login_attempts($_SERVER['REMOTE_ADDR'], $username);
            return ['success' => false, 'errors' => ['Invalid username or password']];
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            log_auth_event('login_failed', ['username' => $username, 'reason' => 'invalid_password']);
            increment_login_attempts($_SERVER['REMOTE_ADDR'], $username);
            return ['success' => false, 'errors' => ['Invalid username or password']];
        }
        
        // Reset failed login attempts (not using the failed_login_attempts column from our auth system)
        reset_login_attempts($_SERVER['REMOTE_ADDR'], $username);
        
        // Update last login (using updated_at column)
        $stmt = $pdo->prepare("UPDATE " . USERS_TABLE . " SET updated_at = NOW() WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
        
        // Set session data
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();
        $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
        
        // Regenerate session ID to prevent session fixation
        regenerate_session_id();
        
        log_auth_event('login_success', ['username' => $username, 'user_id' => $user['user_id']]);
        
        return ['success' => true, 'user' => $user];
        
    } catch (PDOException $e) {
        log_auth_event('login_error', ['username' => $username, 'error' => $e->getMessage()]);
        return ['success' => false, 'errors' => ['Database error occurred']];
    }
}

/**
 * User logout
 */
function logout_user() {
    if (isset($_SESSION['user_id'])) {
        log_auth_event('logout', ['user_id' => $_SESSION['user_id'], 'username' => $_SESSION['username']]);
    }
    
    // Destroy session
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
 * Check if user is logged in
 * 
 * @return bool
 */
function is_logged_in() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

/**
 * Get current user data
 * 
 * @return array|null
 */
function get_current_user_data() {
    if (!is_logged_in()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'],
        'role' => $_SESSION['role']
    ];
}

/**
 * Check if user has admin role
 * 
 * @return bool
 */
function is_admin() {
    return is_logged_in() && $_SESSION['role'] === ROLE_ADMIN;
}

/**
 * Check if user has student role
 * 
 * @return bool
 */
function is_student() {
    return is_logged_in() && $_SESSION['role'] === ROLE_STUDENT;
}

/**
 * Validate registration data
 * 
 * @param string $username
 * @param string $email
 * @param string $password
 * @param string $role
 * @return array
 */
function validate_registration_data($username, $email, $password, $role) {
    $errors = [];
    
    // Validate username
    if (empty($username) || strlen($username) < 3) {
        $errors[] = 'Username must be at least 3 characters long';
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors[] = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Validate email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address';
    }
    
    // Validate password
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long';
    }
    
    if (PASSWORD_REQUIRE_UPPERCASE && !preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Password must contain at least one uppercase letter';
    }
    
    if (PASSWORD_REQUIRE_LOWERCASE && !preg_match('/[a-z]/', $password)) {
        $errors[] = 'Password must contain at least one lowercase letter';
    }
    
    if (PASSWORD_REQUIRE_NUMBERS && !preg_match('/[0-9]/', $password)) {
        $errors[] = 'Password must contain at least one number';
    }
    
    if (PASSWORD_REQUIRE_SPECIAL_CHARS && !preg_match('/[^a-zA-Z0-9]/', $password)) {
        $errors[] = 'Password must contain at least one special character';
    }
    
    // Validate role
    if (!in_array($role, [ROLE_ADMIN, ROLE_STUDENT])) {
        $errors[] = 'Invalid role specified';
    }
    
    return $errors;
}

/**
 * Validate password reset token
 * 
 * @param string $token
 * @return array
 */
function validate_password_reset_token($token) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        $stmt = $pdo->prepare("SELECT user_id, email, expires_at FROM " . PASSWORD_RESETS_TABLE . " WHERE token = ? AND used = 0 AND expires_at > NOW()");
        $stmt->execute([$token]);
        $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reset_request) {
            return ['valid' => false, 'error' => 'Invalid or expired reset token'];
        }
        
        return ['valid' => true, 'user_id' => $reset_request['user_id'], 'email' => $reset_request['email']];
        
    } catch (PDOException $e) {
        return ['valid' => false, 'error' => 'Database error occurred'];
    }
}

/**
 * Update user password
 * 
 * @param int $user_id
 * @param string $new_password
 * @return array
 */
function update_user_password($user_id, $new_password) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Validate password
    $errors = [];
    if (strlen($new_password) < PASSWORD_MIN_LENGTH) {
        $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long';
    }
    
    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }
    
    try {
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("UPDATE " . USERS_TABLE . " SET password_hash = ?, updated_at = NOW() WHERE user_id = ?");
        $result = $stmt->execute([$password_hash, $user_id]);
        
        if ($result) {
            log_auth_event('password_changed', ['user_id' => $user_id]);
            return ['success' => true, 'message' => 'Password updated successfully'];
        } else {
            return ['success' => false, 'errors' => ['Failed to update password']];
        }
        
    } catch (PDOException $e) {
        return ['success' => false, 'errors' => ['Database error occurred']];
    }
}

/**
 * Generate password reset token
 * 
 * @param string $email
 * @return array
 */
function generate_password_reset_token($email) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT user_id, username FROM " . USERS_TABLE . " WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return ['success' => false, 'errors' => ['No user found with this email address']];
        }
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + CSRF_TOKEN_LIFETIME);
        
        // Store token
        $stmt = $pdo->prepare("INSERT INTO " . PASSWORD_RESETS_TABLE . " (user_id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())");
        $result = $stmt->execute([$user['id'], $email, $token, $expires_at]);
        
        if ($result) {
            log_auth_event('password_reset_requested', ['user_id' => $user['id'], 'email' => $email]);
            return ['success' => true, 'token' => $token, 'user' => $user];
        } else {
            return ['success' => false, 'errors' => ['Failed to generate reset token']];
        }
        
    } catch (PDOException $e) {
        return ['success' => false, 'errors' => ['Database error occurred']];
    }
}

/**
 * Mark password reset token as used
 * 
 * @param string $token
 * @return bool
 */
function mark_reset_token_used($token) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        $stmt = $pdo->prepare("UPDATE " . PASSWORD_RESETS_TABLE . " SET used = 1 WHERE token = ?");
        return $stmt->execute([$token]);
    } catch (PDOException $e) {
        return false;
    }
}

// Initialize authentication system
init_auth();