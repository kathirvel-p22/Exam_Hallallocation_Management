<?php
/**
 * Utility Functions Library
 * Provides common utility functions for file operations, password management,
 * email validation, date/time operations, and numeric validation
 * 
 * @package ExamSeatAllocation
 * @author Utility Team
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    die('Direct access not allowed');
}

/**
 * File Upload Utilities
 */
class FileUploadUtils {
    
    /**
     * Generate secure filename
     * 
     * @param string $originalName Original filename
     * @param string $prefix Optional prefix
     * @return string Secure filename
     */
    public static function generateSecureFilename($originalName, $prefix = '') {
        // Remove path information and get extension
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Clean the basename
        $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $basename);
        $cleanName = substr($cleanName, 0, 50); // Limit length
        
        // Generate unique filename
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        $prefix = !empty($prefix) ? $prefix . '_' : '';
        
        return $prefix . $cleanName . '_' . $timestamp . '_' . $random . '.' . $extension;
    }
    
    /**
     * Check if file is an image
     * 
     * @param string $filePath Path to file
     * @return bool True if image, false otherwise
     */
    public static function isImage($filePath) {
        $allowedTypes = [
            IMAGETYPE_JPEG,
            IMAGETYPE_PNG,
            IMAGETYPE_GIF,
            IMAGETYPE_BMP,
            IMAGETYPE_WEBP
        ];
        
        if (!file_exists($filePath)) {
            return false;
        }
        
        $imageType = exif_imagetype($filePath);
        return in_array($imageType, $allowedTypes);
    }
    
    /**
     * Get file size in human readable format
     * 
     * @param int $bytes File size in bytes
     * @return string Human readable file size
     */
    public static function formatFileSize($bytes) {
        if ($bytes === 0) {
            return '0 B';
        }
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
    
    /**
     * Validate file MIME type
     * 
     * @param string $filePath Path to file
     * @param array $allowedTypes Allowed MIME types
     * @return bool True if valid, false otherwise
     */
    public static function validateMimeType($filePath, $allowedTypes) {
        if (!file_exists($filePath)) {
            return false;
        }
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);
        
        return in_array($mimeType, $allowedTypes);
    }
    
    /**
     * Create directory recursively
     * 
     * @param string $path Directory path
     * @param int $permissions Directory permissions
     * @return bool True if successful, false otherwise
     */
    public static function createDirectory($path, $permissions = 0755) {
        if (is_dir($path)) {
            return true;
        }
        
        return mkdir($path, $permissions, true);
    }
    
    /**
     * Clean up temporary files
     * 
     * @param string $directory Directory to clean
     * @param int $maxAge Maximum age in seconds
     * @return int Number of files deleted
     */
    public static function cleanupTempFiles($directory, $maxAge = 86400) {
        if (!is_dir($directory)) {
            return 0;
        }
        
        $deleted = 0;
        $currentTime = time();
        
        $files = glob($directory . '/*');
        
        foreach ($files as $file) {
            if (is_file($file)) {
                $fileTime = filemtime($file);
                if ($currentTime - $fileTime > $maxAge) {
                    unlink($file);
                    $deleted++;
                }
            }
        }
        
        return $deleted;
    }
}

/**
 * Password Utilities
 */
class PasswordUtils {
    
    /**
     * Generate secure random password
     * 
     * @param int $length Password length
     * @param array $options Password generation options
     * @return string Generated password
     */
    public static function generatePassword($length = 12, $options = []) {
        $defaultOptions = [
            'include_uppercase' => true,
            'include_lowercase' => true,
            'include_numbers' => true,
            'include_symbols' => true,
            'exclude_ambiguous' => true
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        $characters = '';
        
        if ($options['include_uppercase']) {
            $characters .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        
        if ($options['include_lowercase']) {
            $characters .= 'abcdefghijklmnopqrstuvwxyz';
        }
        
        if ($options['include_numbers']) {
            $characters .= '0123456789';
        }
        
        if ($options['include_symbols']) {
            $characters .= '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        if ($options['exclude_ambiguous']) {
            $characters = str_replace(['0', 'O', 'l', '1', 'I'], '', $characters);
        }
        
        $password = '';
        $charLength = strlen($characters);
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, $charLength - 1)];
        }
        
        return $password;
    }
    
    /**
     * Hash password using bcrypt
     * 
     * @param string $password Plain text password
     * @param int $cost Cost factor (4-31)
     * @return string Hashed password
     */
    public static function hashPassword($password, $cost = 12) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]);
    }
    
    /**
     * Verify password against hash
     * 
     * @param string $password Plain text password
     * @param string $hash Password hash
     * @return bool True if password matches, false otherwise
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Check if password needs rehashing
     * 
     * @param string $hash Current password hash
     * @param int $cost Cost factor
     * @return bool True if rehash needed, false otherwise
     */
    public static function needsRehash($hash, $cost = 12) {
        return password_needs_rehash($hash, PASSWORD_BCRYPT, ['cost' => $cost]);
    }
    
    /**
     * Calculate password strength score
     * 
     * @param string $password Password to analyze
     * @return array Password strength analysis
     */
    public static function getPasswordStrength($password) {
        $score = 0;
        $feedback = [];
        
        // Length check
        $length = strlen($password);
        if ($length >= 8) {
            $score += 2;
        } else {
            $feedback[] = 'Password should be at least 8 characters long';
        }
        
        if ($length >= 12) {
            $score += 1;
        }
        
        // Character variety checks
        if (preg_match('/[a-z]/', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Add lowercase letters';
        }
        
        if (preg_match('/[A-Z]/', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Add uppercase letters';
        }
        
        if (preg_match('/[0-9]/', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Add numbers';
        }
        
        if (preg_match('/[^a-zA-Z0-9]/', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Add special characters';
        }
        
        // Pattern checks
        if (!preg_match('/(.)\1{2,}/', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Avoid repeated characters';
        }
        
        if (!preg_match('/(123|abc|qwe|asd|zxc)/i', $password)) {
            $score += 1;
        } else {
            $feedback[] = 'Avoid common sequences';
        }
        
        // Determine strength level
        if ($score >= 8) {
            $level = 'strong';
        } elseif ($score >= 6) {
            $level = 'medium';
        } elseif ($score >= 4) {
            $level = 'weak';
        } else {
            $level = 'very_weak';
        }
        
        return [
            'score' => $score,
            'max_score' => 10,
            'level' => $level,
            'feedback' => $feedback
        ];
    }
}

/**
 * Email Utilities
 */
class EmailUtils {
    
    /**
     * Validate email format
     * 
     * @param string $email Email address
     * @return bool True if valid, false otherwise
     */
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Check if email domain is disposable
     * 
     * @param string $email Email address
     * @return bool True if disposable, false otherwise
     */
    public static function isDisposableEmail($email) {
        $domain = substr(strrchr($email, '@'), 1);
        
        // List of known disposable email domains
        $disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org'
        ];
        
        return in_array(strtolower($domain), $disposableDomains);
    }
    
    /**
     * Sanitize email address
     * 
     * @param string $email Email address
     * @return string Sanitized email
     */
    public static function sanitizeEmail($email) {
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    }
    
    /**
     * Get email domain
     * 
     * @param string $email Email address
     * @return string Email domain
     */
    public static function getEmailDomain($email) {
        if (!self::isValidEmail($email)) {
            return '';
        }
        
        return substr(strrchr($email, '@'), 1);
    }
}

/**
 * Date/Time Utilities
 */
class DateTimeUtils {
    
    /**
     * Format date for display
     * 
     * @param string $date Date string
     * @param string $format Output format
     * @return string Formatted date
     */
    public static function formatDate($date, $format = 'Y-m-d H:i:s') {
        if (empty($date)) {
            return '';
        }
        
        $timestamp = is_numeric($date) ? $date : strtotime($date);
        
        if ($timestamp === false) {
            return '';
        }
        
        return date($format, $timestamp);
    }
    
    /**
     * Calculate date difference
     * 
     * @param string $date1 First date
     * @param string $date2 Second date
     * @param string $unit Unit of measurement (days, hours, minutes, seconds)
     * @return int Date difference
     */
    public static function dateDifference($date1, $date2, $unit = 'days') {
        $timestamp1 = is_numeric($date1) ? $date1 : strtotime($date1);
        $timestamp2 = is_numeric($date2) ? $date2 : strtotime($date2);
        
        $diff = abs($timestamp2 - $timestamp1);
        
        switch ($unit) {
            case 'seconds':
                return $diff;
            case 'minutes':
                return floor($diff / 60);
            case 'hours':
                return floor($diff / 3600);
            case 'days':
                return floor($diff / 86400);
            case 'weeks':
                return floor($diff / 604800);
            case 'months':
                return floor($diff / 2592000);
            case 'years':
                return floor($diff / 31536000);
            default:
                return $diff;
        }
    }
    
    /**
     * Check if date is in future
     * 
     * @param string $date Date to check
     * @return bool True if future date, false otherwise
     */
    public static function isFutureDate($date) {
        $timestamp = is_numeric($date) ? $date : strtotime($date);
        return $timestamp > time();
    }
    
    /**
     * Check if date is in past
     * 
     * @param string $date Date to check
     * @return bool True if past date, false otherwise
     */
    public static function isPastDate($date) {
        $timestamp = is_numeric($date) ? $date : strtotime($date);
        return $timestamp < time();
    }
    
    /**
     * Get business days between two dates
     * 
     * @param string $startDate Start date
     * @param string $endDate End date
     * @return int Number of business days
     */
    public static function getBusinessDays($startDate, $endDate) {
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $interval = new DateInterval('P1D');
        $period = new DatePeriod($start, $interval, $end);
        
        $businessDays = 0;
        
        foreach ($period as $date) {
            if ($date->format('N') < 6) { // Monday = 1, Sunday = 7
                $businessDays++;
            }
        }
        
        return $businessDays;
    }
}

/**
 * Numeric Utilities
 */
class NumericUtils {
    
    /**
     * Validate numeric range
     * 
     * @param mixed $value Value to validate
     * @param float $min Minimum value
     * @param float $max Maximum value
     * @param bool $inclusive Whether bounds are inclusive
     * @return bool True if in range, false otherwise
     */
    public static function isInRange($value, $min, $max, $inclusive = true) {
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
     * Format number with locale
     * 
     * @param float $number Number to format
     * @param int $decimals Number of decimal places
     * @param string $decimalPoint Decimal point character
     * @param string $thousandSeparator Thousand separator character
     * @return string Formatted number
     */
    public static function formatNumber($number, $decimals = 2, $decimalPoint = '.', $thousandSeparator = ',') {
        return number_format($number, $decimals, $decimalPoint, $thousandSeparator);
    }
    
    /**
     * Round number to nearest increment
     * 
     * @param float $number Number to round
     * @param float $increment Increment to round to
     * @return float Rounded number
     */
    public static function roundToIncrement($number, $increment = 0.05) {
        return round($number / $increment) * $increment;
    }
    
    /**
     * Calculate percentage
     * 
     * @param float $part Part value
     * @param float $total Total value
     * @param int $decimals Number of decimal places
     * @return float Percentage value
     */
    public static function calculatePercentage($part, $total, $decimals = 2) {
        if ($total == 0) {
            return 0;
        }
        
        return round(($part / $total) * 100, $decimals);
    }
    
    /**
     * Generate random number within range
     * 
     * @param int $min Minimum value
     * @param int $max Maximum value
     * @return int Random number
     */
    public static function generateRandomNumber($min, $max) {
        return random_int($min, $max);
    }
}

/**
 * String Utilities
 */
class StringUtils {
    
    /**
     * Generate random string
     * 
     * @param int $length String length
     * @param string $type String type (alpha, numeric, alphanumeric, mixed)
     * @return string Random string
     */
    public static function generateRandomString($length = 10, $type = 'alphanumeric') {
        $characters = '';
        
        switch ($type) {
            case 'alpha':
                $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'numeric':
                $characters = '0123456789';
                break;
            case 'alphanumeric':
                $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
            case 'mixed':
                $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                break;
            default:
                $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        }
        
        $string = '';
        $charLength = strlen($characters);
        
        for ($i = 0; $i < $length; $i++) {
            $string .= $characters[random_int(0, $charLength - 1)];
        }
        
        return $string;
    }
    
    /**
     * Truncate string with ellipsis
     * 
     * @param string $string String to truncate
     * @param int $length Maximum length
     * @param string $ellipsis Ellipsis string
     * @return string Truncated string
     */
    public static function truncateString($string, $length = 100, $ellipsis = '...') {
        if (strlen($string) <= $length) {
            return $string;
        }
        
        return substr($string, 0, $length - strlen($ellipsis)) . $ellipsis;
    }
    
    /**
     * Convert string to slug
     * 
     * @param string $string String to convert
     * @param string $separator Separator character
     * @return string Slug string
     */
    public static function stringToSlug($string, $separator = '-') {
        // Convert to lowercase
        $string = strtolower($string);
        
        // Replace spaces and special characters with separator
        $string = preg_replace('/[^a-z0-9]+/', $separator, $string);
        
        // Remove leading and trailing separators
        $string = trim($string, $separator);
        
        return $string;
    }
    
    /**
     * Check if string contains substring
     * 
     * @param string $haystack Main string
     * @param string $needle Substring to find
     * @param bool $caseSensitive Case sensitivity
     * @return bool True if contains, false otherwise
     */
    public static function contains($haystack, $needle, $caseSensitive = false) {
        if ($caseSensitive) {
            return strpos($haystack, $needle) !== false;
        } else {
            return stripos($haystack, $needle) !== false;
        }
    }
}