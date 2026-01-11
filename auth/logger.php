<?php
/**
 * Authentication Logger
 * 
 * Logging functions for authentication events and security monitoring
 */

require_once __DIR__ . '/config.php';

/**
 * Log authentication event
 * 
 * @param string $event_type
 * @param array $data
 * @return void
 */
function log_auth_event($event_type, $data = []) {
    if (!LOG_AUTH_EVENTS) {
        return;
    }
    
    // Ensure log directory exists
    $log_dir = dirname(LOG_FILE_PATH);
    if (!file_exists($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    // Prepare log entry
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event_type' => $event_type,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'session_id' => session_id(),
        'data' => $data
    ];
    
    // Write to log file
    $log_line = json_encode($log_entry) . PHP_EOL;
    file_put_contents(LOG_FILE_PATH, $log_line, FILE_APPEND | LOCK_EX);
}

/**
 * Log security event
 * 
 * @param string $event_type
 * @param string $message
 * @param array $context
 * @return void
 */
function log_security_event($event_type, $message, $context = []) {
    log_auth_event('security_' . $event_type, [
        'message' => $message,
        'context' => $context
    ]);
}

/**
 * Log failed login attempt
 * 
 * @param string $username
 * @param string $ip_address
 * @param string $reason
 * @return void
 */
function log_failed_login($username, $ip_address, $reason) {
    log_auth_event('failed_login', [
        'username' => $username,
        'ip_address' => $ip_address,
        'reason' => $reason
    ]);
}

/**
 * Log successful login
 * 
 * @param string $username
 * @param int $user_id
 * @return void
 */
function log_successful_login($username, $user_id) {
    log_auth_event('successful_login', [
        'username' => $username,
        'user_id' => $user_id
    ]);
}

/**
 * Log logout
 * 
 * @param string $username
 * @param int $user_id
 * @return void
 */
function log_logout($username, $user_id) {
    log_auth_event('logout', [
        'username' => $username,
        'user_id' => $user_id
    ]);
}

/**
 * Log password change
 * 
 * @param int $user_id
 * @param string $username
 * @return void
 */
function log_password_change($user_id, $username) {
    log_auth_event('password_change', [
        'user_id' => $user_id,
        'username' => $username
    ]);
}

/**
 * Log account lockout
 * 
 * @param string $username
 * @param string $ip_address
 * @param string $reason
 * @return void
 */
function log_account_lockout($username, $ip_address, $reason) {
    log_security_event('account_lockout', 'Account locked due to security policy', [
        'username' => $username,
        'ip_address' => $ip_address,
        'reason' => $reason
    ]);
}

/**
 * Log suspicious activity
 * 
 * @param string $activity_type
 * @param string $description
 * @param array $context
 * @return void
 */
function log_suspicious_activity($activity_type, $description, $context = []) {
    log_security_event('suspicious_activity', $description, [
        'activity_type' => $activity_type,
        'context' => $context
    ]);
}

/**
 * Get authentication log entries
 * 
 * @param int $limit
 * @param string $event_type
 * @return array
 */
function get_auth_logs($limit = 100, $event_type = null) {
    if (!file_exists(LOG_FILE_PATH)) {
        return [];
    }
    
    $logs = [];
    $lines = array_slice(file(LOG_FILE_PATH, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -$limit);
    
    foreach ($lines as $line) {
        $log_entry = json_decode($line, true);
        if ($log_entry && ($event_type === null || $log_entry['event_type'] === $event_type)) {
            $logs[] = $log_entry;
        }
    }
    
    return array_reverse($logs);
}

/**
 * Get failed login attempts for an IP
 * 
 * @param string $ip_address
 * @param int $time_window
 * @return int
 */
function get_failed_login_attempts($ip_address, $time_window = 900) {
    $logs = get_auth_logs(1000, 'failed_login');
    $count = 0;
    $cutoff_time = time() - $time_window;
    
    foreach ($logs as $log) {
        if ($log['data']['ip_address'] === $ip_address) {
            $log_time = strtotime($log['timestamp']);
            if ($log_time >= $cutoff_time) {
                $count++;
            }
        }
    }
    
    return $count;
}