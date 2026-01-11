<?php
/**
 * Database Connection for Authentication
 *
 * Database connection and helper functions for authentication system
 */

require_once __DIR__ . '/config.php';
require_once '../config/database.php';

// Use the existing Database class
$db = new Database();
$pdo = $db->getConnection();

/**
 * Create authentication tables if they don't exist
 */
function create_auth_tables() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    // Users table
    $users_table = "CREATE TABLE IF NOT EXISTS " . USERS_TABLE . " (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('" . ROLE_ADMIN . "', '" . ROLE_STUDENT . "') NOT NULL DEFAULT '" . ROLE_STUDENT . "',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        failed_login_attempts INT NOT NULL DEFAULT 0,
        last_login DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    // Login attempts table for security
    $login_attempts_table = "CREATE TABLE IF NOT EXISTS " . LOGIN_ATTEMPTS_TABLE . " (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        username VARCHAR(50) NULL,
        attempt_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN NOT NULL,
        INDEX idx_ip_address (ip_address),
        INDEX idx_username (username),
        INDEX idx_attempt_time (attempt_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    // Password resets table
    $password_resets_table = "CREATE TABLE IF NOT EXISTS " . PASSWORD_RESETS_TABLE . " (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES " . USERS_TABLE . "(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    try {
        $pdo->exec($users_table);
        $pdo->exec($login_attempts_table);
        $pdo->exec($password_resets_table);
        
        // Insert default admin user if table is empty
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM " . USERS_TABLE);
        $result = $stmt->fetch();
        
        if ($result['count'] == 0) {
            $default_password = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO " . USERS_TABLE . " (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['admin', 'admin@examseat.com', $default_password, ROLE_ADMIN, 1]);
        }
        
        return true;
    } catch (PDOException $e) {
        error_log("Failed to create auth tables: " . $e->getMessage());
        return false;
    }
}

/**
 * Increment login attempts for IP and username
 *
 * @param string $ip_address
 * @param string $username
 * @return void
 */
function increment_login_attempts($ip_address, $username = null) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        // Log the attempt
        $stmt = $pdo->prepare("INSERT INTO " . LOGIN_ATTEMPTS_TABLE . " (ip_address, username, success) VALUES (?, ?, 0)");
        $stmt->execute([$ip_address, $username]);
        
        // Increment failed attempts for user
        if ($username) {
            $stmt = $pdo->prepare("UPDATE " . USERS_TABLE . " SET failed_login_attempts = failed_login_attempts + 1 WHERE username = ?");
            $stmt->execute([$username]);
        }
    } catch (PDOException $e) {
        error_log("Failed to increment login attempts: " . $e->getMessage());
    }
}

/**
 * Reset login attempts for IP and username
 *
 * @param string $ip_address
 * @param string $username
 * @return void
 */
function reset_login_attempts($ip_address, $username = null) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        // Reset user failed attempts
        if ($username) {
            $stmt = $pdo->prepare("UPDATE " . USERS_TABLE . " SET failed_login_attempts = 0 WHERE username = ?");
            $stmt->execute([$username]);
        }
    } catch (PDOException $e) {
        error_log("Failed to reset login attempts: " . $e->getMessage());
    }
}

/**
 * Check if IP is locked due to too many failed attempts
 *
 * @param string $ip_address
 * @return bool
 */
function is_ip_locked($ip_address) {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM " . LOGIN_ATTEMPTS_TABLE . " WHERE ip_address = ? AND success = 0 AND attempt_time > DATE_SUB(NOW(), INTERVAL ? SECOND)");
        $stmt->execute([$ip_address, LOCKOUT_TIME]);
        $result = $stmt->fetch();
        
        return $result['count'] >= MAX_LOGIN_ATTEMPTS;
    } catch (PDOException $e) {
        error_log("Failed to check IP lock status: " . $e->getMessage());
        return false;
    }
}

/**
 * Clean up old login attempts and expired password reset tokens
 */
function cleanup_auth_data() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    try {
        // Clean up old login attempts (older than 1 hour)
        $stmt = $pdo->prepare("DELETE FROM " . LOGIN_ATTEMPTS_TABLE . " WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute();
        
        // Clean up expired password reset tokens
        $stmt = $pdo->prepare("DELETE FROM " . PASSWORD_RESETS_TABLE . " WHERE expires_at < NOW()");
        $stmt->execute();
        
        return true;
    } catch (PDOException $e) {
        error_log("Failed to cleanup auth data: " . $e->getMessage());
        return false;
    }
}

// Create tables on include
create_auth_tables();

// Clean up old data periodically (1% chance on each request)
if (rand(1, 100) === 1) {
    cleanup_auth_data();
}