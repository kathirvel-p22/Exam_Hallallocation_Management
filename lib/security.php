<?php
/**
 * Security Middleware System
 * Provides comprehensive security measures including request validation,
 * rate limiting, security headers, XSS protection, and SQL injection prevention
 * 
 * @package ExamSeatAllocation
 * @author Security Team
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    die('Direct access not allowed');
}

/**
 * Security middleware class
 */
class SecurityMiddleware {
    
    /**
     * Security configuration
     * @var array
     */
    private static $config = [];
    
    /**
     * Initialize security middleware
     * 
     * @param array $config Security configuration
     */
    public static function init($config = []) {
        self::$config = array_merge([
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
        ], $config);
        
        // Apply security measures
        self::applySecurityHeaders();
        self::applyInputValidation();
        self::applyRateLimiting();
        self::applySessionSecurity();
    }
    
    /**
     * Apply security headers
     */
    private static function applySecurityHeaders() {
        if (!self::$config['security_headers']['enabled']) {
            return;
        }
        
        // HTTP Strict Transport Security (HSTS)
        if (self::$config['security_headers']['hsts']) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
        
        // Content Security Policy (CSP)
        if (self::$config['security_headers']['csp']) {
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " .
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
                   "font-src 'self' https://fonts.gstatic.com; " .
                   "img-src 'self' data: https:; " .
                   "connect-src 'self'; " .
                   "frame-ancestors 'none';";
            
            header("Content-Security-Policy: {$csp}");
        }
        
        // X-Frame-Options
        if (self::$config['security_headers']['x_frame_options']) {
            header('X-Frame-Options: DENY');
        }
        
        // X-Content-Type-Options
        if (self::$config['security_headers']['x_content_type_options']) {
            header('X-Content-Type-Options: nosniff');
        }
        
        // X-XSS-Protection
        if (self::$config['security_headers']['x_xss_protection']) {
            header('X-XSS-Protection: 1; mode=block');
        }
        
        // X-Permitted-Cross-Domain-Policies
        header('X-Permitted-Cross-Domain-Policies: none');
        
        // Referrer-Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
    }
    
    /**
     * Apply input validation settings
     */
    private static function applyInputValidation() {
        if (!self::$config['input_validation']['enabled']) {
            return;
        }
        
        // Set PHP configuration for input validation
        ini_set('max_input_vars', self::$config['input_validation']['max_input_vars']);
        ini_set('post_max_size', self::$config['input_validation']['max_post_size']);
        ini_set('max_input_time', 60);
        
        // Disable register_globals if enabled
        if (ini_get('register_globals')) {
            ini_set('register_globals', 'Off');
        }
        
        // Disable magic_quotes_gpc if enabled
        if (get_magic_quotes_gpc()) {
            // Remove magic quotes
            $_GET = self::stripslashesRecursive($_GET);
            $_POST = self::stripslashesRecursive($_POST);
            $_COOKIE = self::stripslashesRecursive($_COOKIE);
            $_REQUEST = self::stripslashesRecursive($_REQUEST);
        }
    }
    
    /**
     * Apply rate limiting
     */
    private static function applyRateLimiting() {
        if (!self::$config['rate_limit']['enabled']) {
            return;
        }
        
        $ip = self::getClientIP();
        $key = "rate_limit_{$ip}";
        
        // Check if IP is blocked
        if (isset($_SESSION["{$key}_blocked"])) {
            $blockTime = $_SESSION["{$key}_blocked"];
            if (time() - $blockTime < self::$config['rate_limit']['block_duration']) {
                self::blockRequest('Rate limit exceeded. Please try again later.');
            }
            unset($_SESSION["{$key}_blocked"]);
        }
        
        // Get current request count
        $requests = $_SESSION[$key] ?? [];
        $currentTime = time();
        $window = self::$config['rate_limit']['window'];
        
        // Remove old requests
        $requests = array_filter($requests, function($time) use ($currentTime, $window) {
            return $currentTime - $time < $window;
        });
        
        // Check if limit exceeded
        if (count($requests) >= self::$config['rate_limit']['requests']) {
            $_SESSION["{$key}_blocked"] = $currentTime;
            self::blockRequest('Rate limit exceeded. Please try again later.');
        }
        
        // Add current request
        $requests[] = $currentTime;
        $_SESSION[$key] = $requests;
    }
    
    /**
     * Apply session security measures
     */
    private static function applySessionSecurity() {
        if (!self::$config['session_security']['enabled']) {
            return;
        }
        
        // Regenerate session ID periodically
        if (self::$config['session_security']['regenerate_id']) {
            if (!isset($_SESSION['session_regenerated'])) {
                session_regenerate_id(true);
                $_SESSION['session_regenerated'] = time();
            } else {
                $lastRegeneration = $_SESSION['session_regenerated'];
                $timeout = self::$config['session_security']['timeout'];
                
                if (time() - $lastRegeneration > $timeout / 2) {
                    session_regenerate_id(true);
                    $_SESSION['session_regenerated'] = time();
                }
            }
        }
        
        // Set session timeout
        if (isset($_SESSION['last_activity'])) {
            $lastActivity = $_SESSION['last_activity'];
            $timeout = self::$config['session_security']['timeout'];
            
            if (time() - $lastActivity > $timeout) {
                session_unset();
                session_destroy();
                self::blockRequest('Session expired. Please log in again.');
            }
        }
        
        $_SESSION['last_activity'] = time();
    }
    
    /**
     * Block request with error response
     * 
     * @param string $message Error message
     */
    private static function blockRequest($message) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => true,
            'message' => $message,
            'code' => 'RATE_LIMIT_EXCEEDED'
        ]);
        exit;
    }
    
    /**
     * Get client IP address
     * 
     * @return string Client IP address
     */
    private static function getClientIP() {
        $headers = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'HTTP_VIA',
            'REMOTE_ADDR'
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Recursively strip slashes
     * 
     * @param mixed $value Value to process
     * @return mixed Processed value
     */
    private static function stripslashesRecursive($value) {
        if (is_array($value)) {
            return array_map([self::class, 'stripslashesRecursive'], $value);
        } else {
            return stripslashes($value);
        }
    }
}

/**
 * SQL Injection Prevention
 */
class SQLInjectionPrevention {
    
    /**
     * Prepared statement cache
     * @var array
     */
    private static $preparedStatements = [];
    
    /**
     * Execute safe SQL query
     * 
     * @param PDO $pdo Database connection
     * @param string $query SQL query with placeholders
     * @param array $params Parameters for the query
     * @param string $type Query type (select, insert, update, delete)
     * @return mixed Query result
     */
    public static function executeSafeQuery($pdo, $query, $params = [], $type = 'select') {
        try {
            // Validate query for dangerous patterns
            if (!self::validateQuery($query, $type)) {
                throw new Exception('Invalid query pattern detected');
            }
            
            // Prepare statement
            $stmt = $pdo->prepare($query);
            
            // Bind parameters safely
            foreach ($params as $key => $value) {
                $paramType = self::getPDOType($value);
                $stmt->bindValue($key, $value, $paramType);
            }
            
            // Execute query
            $stmt->execute();
            
            // Return result based on query type
            switch ($type) {
                case 'select':
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                case 'insert':
                    return $pdo->lastInsertId();
                case 'update':
                case 'delete':
                    return $stmt->rowCount();
                default:
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
        } catch (PDOException $e) {
            // Log the error without exposing sensitive information
            error_log("SQL Error: " . $e->getMessage());
            throw new Exception('Database error occurred');
        }
    }
    
    /**
     * Validate SQL query for dangerous patterns
     * 
     * @param string $query SQL query
     * @param string $type Query type
     * @return bool True if valid, false otherwise
     */
    private static function validateQuery($query, $type) {
        // Convert to lowercase for pattern matching
        $query = strtolower($query);
        
        // Dangerous patterns to block
        $dangerousPatterns = [
            '/drop\s+(table|database|view|procedure|function|trigger)/i',
            '/truncate\s+table/i',
            '/delete\s+from\s+.*\s+where\s+1\s*=\s*1/i',
            '/insert\s+into\s+.*\s+values\s*\(\s*null\s*,/i',
            '/union\s+select/i',
            '/load_file/i',
            '/into\s+outfile/i',
            '/into\s+dumpfile/i',
            '/sleep\s*\(/i',
            '/benchmark\s*\(/i',
            '/extractvalue\s*\(/i',
            '/updatexml\s*\(/i',
            '/information_schema/i',
            '/@@version/i',
            '/@@datadir/i',
            '/select\s+password/i',
            '/select\s+user/i',
            '/select\s+schema/i'
        ];
        
        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                return false;
            }
        }
        
        // Additional validation based on query type
        switch ($type) {
            case 'select':
                // Allow SELECT queries
                return preg_match('/^select\s+/', $query) && !preg_match('/\s+(into\s+(outfile|dumpfile)|load_file)\s+/', $query);
            
            case 'insert':
                // Allow INSERT queries
                return preg_match('/^insert\s+into\s+/', $query) && !preg_match('/\s+values\s*\(\s*null\s*,/', $query);
            
            case 'update':
                // Allow UPDATE queries with WHERE clause
                return preg_match('/^update\s+.*\s+set\s+.*\s+where\s+/', $query);
            
            case 'delete':
                // Allow DELETE queries with WHERE clause
                return preg_match('/^delete\s+from\s+.*\s+where\s+/', $query);
            
            default:
                return false;
        }
    }
    
    /**
     * Get PDO parameter type
     * 
     * @param mixed $value Parameter value
     * @return int PDO parameter type constant
     */
    private static function getPDOType($value) {
        if (is_int($value) || is_bool($value)) {
            return PDO::PARAM_INT;
        } elseif (is_null($value)) {
            return PDO::PARAM_NULL;
        } elseif (is_string($value)) {
            return PDO::PARAM_STR;
        } else {
            return PDO::PARAM_STR;
        }
    }
}

/**
 * XSS Protection
 */
class XSSProtection {
    
    /**
     * Sanitize output for HTML context
     * 
     * @param string $input Input string
     * @param string $context Output context (html, js, css, url)
     * @return string Sanitized string
     */
    public static function sanitizeOutput($input, $context = 'html') {
        if (empty($input)) {
            return '';
        }
        
        switch ($context) {
            case 'html':
                return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            case 'js':
                return json_encode($input, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
            
            case 'css':
                return preg_replace('/[^a-zA-Z0-9#\.,_ -]/', '', $input);
            
            case 'url':
                return filter_var($input, FILTER_SANITIZE_URL);
            
            default:
                return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
    }
    
    /**
     * Validate and sanitize HTML input
     * 
     * @param string $input HTML input
     * @param array $allowedTags Allowed HTML tags
     * @return string Sanitized HTML
     */
    public static function sanitizeHTML($input, $allowedTags = []) {
        if (empty($input)) {
            return '';
        }
        
        // Default allowed tags for safe HTML
        $defaultTags = [
            'p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
        ];
        
        $allowedTags = empty($allowedTags) ? $defaultTags : $allowedTags;
        
        // Remove dangerous HTML elements and attributes
        $input = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i', '', $input);
        $input = preg_replace('/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i', '', $input);
        $input = preg_replace('/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/i', '', $input);
        $input = preg_replace('/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/i', '', $input);
        $input = preg_replace('/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/i', '', $input);
        
        // Remove JavaScript event handlers
        $input = preg_replace('/\s+on\w+\s*=\s*["\'][^"\']*["\']/i', '', $input);
        
        // Remove dangerous attributes
        $input = preg_replace('/\s+(style|class|id)\s*=\s*["\'][^"\']*["\']/i', '', $input);
        
        // Allow only specified tags
        $allowedTagsPattern = implode('|', $allowedTags);
        $input = preg_replace("/<(?!\/?({$allowedTagsPattern})\b)[^>]*>/i", '', $input);
        
        return $input;
    }
    
    /**
     * Escape JavaScript strings
     * 
     * @param string $input JavaScript string
     * @return string Escaped string
     */
    public static function escapeJS($input) {
        if (empty($input)) {
            return '';
        }
        
        return addcslashes($input, "\0..\37\177..\377\\'");
    }
}

/**
 * Request Validation
 */
class RequestValidator {
    
    /**
     * Validate request method
     * 
     * @param string $method Expected method
     * @return bool True if valid, false otherwise
     */
    public static function validateMethod($method) {
        $currentMethod = $_SERVER['REQUEST_METHOD'] ?? '';
        return strtoupper($currentMethod) === strtoupper($method);
    }
    
    /**
     * Validate content type
     * 
     * @param string $expectedType Expected content type
     * @return bool True if valid, false otherwise
     */
    public static function validateContentType($expectedType) {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        return stripos($contentType, $expectedType) !== false;
    }
    
    /**
     * Validate request size
     * 
     * @param int $maxSize Maximum request size in bytes
     * @return bool True if valid, false otherwise
     */
    public static function validateRequestSize($maxSize) {
        $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
        return $contentLength <= $maxSize;
    }
    
    /**
     * Validate request headers
     * 
     * @param array $requiredHeaders Required headers
     * @return bool True if valid, false otherwise
     */
    public static function validateHeaders($requiredHeaders = []) {
        foreach ($requiredHeaders as $header) {
            if (empty($_SERVER[$header])) {
                return false;
            }
        }
        return true;
    }
}