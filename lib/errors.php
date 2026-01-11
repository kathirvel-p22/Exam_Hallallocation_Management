<?php
/**
 * Error Handling System
 * Provides centralized error logging, user-friendly error messages,
 * security event logging, and system health monitoring
 * 
 * @package ExamSeatAllocation
 * @author Error Handling Team
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    die('Direct access not allowed');
}

/**
 * Error types and severity levels
 */
class ErrorTypes {
    const SYSTEM_ERROR = 'system_error';
    const VALIDATION_ERROR = 'validation_error';
    const AUTHENTICATION_ERROR = 'authentication_error';
    const AUTHORIZATION_ERROR = 'authorization_error';
    const DATABASE_ERROR = 'database_error';
    const SECURITY_ERROR = 'security_error';
    const FILE_ERROR = 'file_error';
    const NETWORK_ERROR = 'network_error';
    const BUSINESS_LOGIC_ERROR = 'business_logic_error';
}

class ErrorSeverity {
    const LOW = 'low';
    const MEDIUM = 'medium';
    const HIGH = 'high';
    const CRITICAL = 'critical';
}

/**
 * Error Handler Class
 */
class ErrorHandler {
    
    /**
     * Error log file path
     * @var string
     */
    private static $logFile = '';
    
    /**
     * Error log level
     * @var string
     */
    private static $logLevel = 'ERROR';
    
    /**
     * Whether to log errors
     * @var bool
     */
    private static $enableLogging = true;
    
    /**
     * Whether to display errors to users
     * @var bool
     */
    private static $displayErrors = false;
    
    /**
     * Initialize error handler
     * 
     * @param array $config Configuration options
     */
    public static function init($config = []) {
        $defaultConfig = [
            'log_file' => 'logs/errors.log',
            'log_level' => 'ERROR',
            'enable_logging' => true,
            'display_errors' => false,
            'log_rotation' => true
        ];
        
        $config = array_merge($defaultConfig, $config);
        
        self::$logFile = $config['log_file'];
        self::$logLevel = $config['log_level'];
        self::$enableLogging = $config['enable_logging'];
        self::$displayErrors = $config['display_errors'];
        
        // Set up error handlers
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
        
        // Create log directory if it doesn't exist
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    /**
     * Handle PHP errors
     * 
     * @param int $errno Error number
     * @param string $errstr Error message
     * @param string $errfile Error file
     * @param int $errline Error line
     * @return bool
     */
    public static function handleError($errno, $errstr, $errfile, $errline) {
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        $errorType = self::getErrorType($errno);
        $severity = self::getErrorSeverity($errno);
        
        $errorData = [
            'type' => $errorType,
            'severity' => $severity,
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline,
            'timestamp' => time(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI'
        ];
        
        self::logError($errorData);
        
        if (self::$displayErrors) {
            self::displayError($errorData);
        }
        
        return true;
    }
    
    /**
     * Handle uncaught exceptions
     * 
     * @param Exception $exception Uncaught exception
     */
    public static function handleException($exception) {
        $errorData = [
            'type' => ErrorTypes::SYSTEM_ERROR,
            'severity' => ErrorSeverity::CRITICAL,
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'timestamp' => time(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI'
        ];
        
        self::logError($errorData);
        
        if (self::$displayErrors) {
            self::displayError($errorData);
        }
        
        // Exit with error code
        exit(1);
    }
    
    /**
     * Handle script shutdown
     */
    public static function handleShutdown() {
        $error = error_get_last();
        
        if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
            $errorData = [
                'type' => self::getErrorType($error['type']),
                'severity' => ErrorSeverity::CRITICAL,
                'message' => $error['message'],
                'file' => $error['file'],
                'line' => $error['line'],
                'timestamp' => time(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
                'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI'
            ];
            
            self::logError($errorData);
            
            if (self::$displayErrors) {
                self::displayError($errorData);
            }
        }
    }
    
    /**
     * Log custom error
     * 
     * @param string $type Error type
     * @param string $message Error message
     * @param string $severity Error severity
     * @param array $context Additional context
     */
    public static function logCustomError($type, $message, $severity = ErrorSeverity::MEDIUM, $context = []) {
        $errorData = [
            'type' => $type,
            'severity' => $severity,
            'message' => $message,
            'context' => $context,
            'timestamp' => time(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI'
        ];
        
        self::logError($errorData);
    }
    
    /**
     * Log security event
     * 
     * @param string $event Security event type
     * @param string $message Event message
     * @param array $context Additional context
     */
    public static function logSecurityEvent($event, $message, $context = []) {
        $securityData = [
            'type' => ErrorTypes::SECURITY_ERROR,
            'severity' => ErrorSeverity::HIGH,
            'event' => $event,
            'message' => $message,
            'context' => $context,
            'timestamp' => time(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'CLI',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'user_id' => $_SESSION['user_id'] ?? null,
            'session_id' => session_id()
        ];
        
        self::logError($securityData);
    }
    
    /**
     * Log system health metrics
     * 
     * @param array $metrics Health metrics
     */
    public static function logHealthMetrics($metrics) {
        $healthData = [
            'type' => 'health_check',
            'metrics' => $metrics,
            'timestamp' => time(),
            'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown'
        ];
        
        self::logError($healthData);
    }
    
    /**
     * Get error type from error number
     * 
     * @param int $errno Error number
     * @return string Error type
     */
    private static function getErrorType($errno) {
        switch ($errno) {
            case E_ERROR:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_USER_ERROR:
                return ErrorTypes::SYSTEM_ERROR;
            case E_WARNING:
            case E_CORE_WARNING:
            case E_COMPILE_WARNING:
            case E_USER_WARNING:
                return ErrorTypes::SYSTEM_ERROR;
            case E_NOTICE:
            case E_USER_NOTICE:
            case E_STRICT:
                return ErrorTypes::VALIDATION_ERROR;
            case E_RECOVERABLE_ERROR:
                return ErrorTypes::SYSTEM_ERROR;
            default:
                return ErrorTypes::SYSTEM_ERROR;
        }
    }
    
    /**
     * Get error severity from error number
     * 
     * @param int $errno Error number
     * @return string Error severity
     */
    private static function getErrorSeverity($errno) {
        switch ($errno) {
            case E_ERROR:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
            case E_USER_ERROR:
                return ErrorSeverity::CRITICAL;
            case E_WARNING:
            case E_CORE_WARNING:
            case E_COMPILE_WARNING:
            case E_USER_WARNING:
                return ErrorSeverity::HIGH;
            case E_NOTICE:
            case E_USER_NOTICE:
            case E_STRICT:
                return ErrorSeverity::LOW;
            case E_RECOVERABLE_ERROR:
                return ErrorSeverity::MEDIUM;
            default:
                return ErrorSeverity::MEDIUM;
        }
    }
    
    /**
     * Write error to log file
     * 
     * @param array $errorData Error data
     */
    private static function logError($errorData) {
        if (!self::$enableLogging) {
            return;
        }
        
        // Check log level
        $severityLevels = [
            ErrorSeverity::LOW => 1,
            ErrorSeverity::MEDIUM => 2,
            ErrorSeverity::HIGH => 3,
            ErrorSeverity::CRITICAL => 4
        ];
        
        $logLevel = $severityLevels[self::$logLevel] ?? 1;
        $errorLevel = $severityLevels[$errorData['severity']] ?? 1;
        
        if ($errorLevel < $logLevel) {
            return;
        }
        
        // Format log entry
        $logEntry = self::formatLogEntry($errorData);
        
        // Write to log file
        file_put_contents(self::$logFile, $logEntry . PHP_EOL, FILE_APPEND | LOCK_EX);
        
        // Rotate log if needed
        self::rotateLogIfNeeded();
    }
    
    /**
     * Format log entry
     * 
     * @param array $errorData Error data
     * @return string Formatted log entry
     */
    private static function formatLogEntry($errorData) {
        $timestamp = date('Y-m-d H:i:s', $errorData['timestamp']);
        $severity = strtoupper($errorData['severity']);
        $type = $errorData['type'];
        $message = $errorData['message'];
        
        $logEntry = "[{$timestamp}] {$severity} [{$type}] {$message}";
        
        if (isset($errorData['file']) && isset($errorData['line'])) {
            $logEntry .= " in {$errorData['file']}:{$errorData['line']}";
        }
        
        if (isset($errorData['trace'])) {
            $logEntry .= PHP_EOL . "Stack trace:" . PHP_EOL . $errorData['trace'];
        }
        
        if (isset($errorData['context']) && !empty($errorData['context'])) {
            $logEntry .= PHP_EOL . "Context: " . json_encode($errorData['context']);
        }
        
        if (isset($errorData['ip_address'])) {
            $logEntry .= PHP_EOL . "IP: {$errorData['ip_address']}";
        }
        
        if (isset($errorData['user_id'])) {
            $logEntry .= PHP_EOL . "User ID: {$errorData['user_id']}";
        }
        
        return $logEntry;
    }
    
    /**
     * Display error to user
     * 
     * @param array $errorData Error data
     */
    private static function displayError($errorData) {
        if (php_sapi_name() === 'cli') {
            echo "Error: {$errorData['message']}" . PHP_EOL;
            if (isset($errorData['file']) && isset($errorData['line'])) {
                echo "File: {$errorData['file']}:{$errorData['line']}" . PHP_EOL;
            }
            if (isset($errorData['trace'])) {
                echo "Stack trace:" . PHP_EOL . $errorData['trace'] . PHP_EOL;
            }
        } else {
            http_response_code(500);
            echo "<h1>System Error</h1>";
            echo "<p>An error occurred while processing your request.</p>";
            echo "<p>Please contact support if the problem persists.</p>";
            
            if (self::$displayErrors) {
                echo "<hr>";
                echo "<h2>Error Details</h2>";
                echo "<p><strong>Message:</strong> {$errorData['message']}</p>";
                if (isset($errorData['file']) && isset($errorData['line'])) {
                    echo "<p><strong>File:</strong> {$errorData['file']}:{$errorData['line']}</p>";
                }
                if (isset($errorData['trace'])) {
                    echo "<p><strong>Stack trace:</strong></p>";
                    echo "<pre>{$errorData['trace']}</pre>";
                }
            }
        }
    }
    
    /**
     * Rotate log file if it gets too large
     */
    private static function rotateLogIfNeeded() {
        if (!file_exists(self::$logFile)) {
            return;
        }
        
        $fileSize = filesize(self::$logFile);
        $maxSize = 10 * 1024 * 1024; // 10MB
        
        if ($fileSize > $maxSize) {
            $backupFile = self::$logFile . '.' . date('Y-m-d-H-i-s');
            rename(self::$logFile, $backupFile);
        }
    }
    
    /**
     * Get error statistics
     * 
     * @param int $hours Number of hours to look back
     * @return array Error statistics
     */
    public static function getErrorStatistics($hours = 24) {
        if (!file_exists(self::$logFile)) {
            return ['total' => 0, 'by_type' => [], 'by_severity' => []];
        }
        
        $stats = [
            'total' => 0,
            'by_type' => [],
            'by_severity' => []
        ];
        
        $cutoffTime = time() - ($hours * 3600);
        $lines = file(self::$logFile, FILE_IGNORE_NEW_LINES);
        
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            // Parse log line to extract timestamp and type
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+) \[(\w+)\]/', $line, $matches)) {
                $timestamp = strtotime($matches[1]);
                
                if ($timestamp >= $cutoffTime) {
                    $stats['total']++;
                    $type = $matches[3];
                    $severity = $matches[2];
                    
                    if (!isset($stats['by_type'][$type])) {
                        $stats['by_type'][$type] = 0;
                    }
                    if (!isset($stats['by_severity'][$severity])) {
                        $stats['by_severity'][$severity] = 0;
                    }
                    
                    $stats['by_type'][$type]++;
                    $stats['by_severity'][$severity]++;
                }
            }
        }
        
        return $stats;
    }
    
    /**
     * Clear error log
     */
    public static function clearLog() {
        if (file_exists(self::$logFile)) {
            file_put_contents(self::$logFile, '');
        }
    }
}

/**
 * User-friendly error messages
 */
class UserMessages {
    
    /**
     * Get user-friendly error message
     * 
     * @param string $errorCode Error code
     * @param array $context Additional context
     * @return string User-friendly message
     */
    public static function getErrorMessage($errorCode, $context = []) {
        $messages = [
            'database_connection_failed' => 'Unable to connect to the database. Please try again later.',
            'invalid_input' => 'Please check your input and try again.',
            'access_denied' => 'You do not have permission to access this resource.',
            'not_found' => 'The requested resource was not found.',
            'server_error' => 'An unexpected error occurred. Please try again later.',
            'session_expired' => 'Your session has expired. Please log in again.',
            'file_upload_failed' => 'File upload failed. Please check the file and try again.',
            'invalid_file_type' => 'The file type is not supported.',
            'file_too_large' => 'The file is too large. Please choose a smaller file.',
            'email_already_exists' => 'An account with this email already exists.',
            'invalid_credentials' => 'Invalid email or password.',
            'password_mismatch' => 'The passwords do not match.',
            'insufficient_permissions' => 'You do not have the required permissions for this action.',
            'rate_limit_exceeded' => 'Too many requests. Please wait a moment and try again.',
            'maintenance_mode' => 'The system is currently under maintenance. Please try again later.',
            'feature_disabled' => 'This feature is currently disabled.',
            'data_corrupted' => 'The data appears to be corrupted. Please contact support.',
            'operation_failed' => 'The operation failed. Please try again.',
            'validation_failed' => 'Please check the form and correct any errors.',
            'security_violation' => 'A security violation was detected. Please contact support.',
            'timeout' => 'The request timed out. Please try again.',
            'network_error' => 'A network error occurred. Please check your connection and try again.',
            'quota_exceeded' => 'You have exceeded your usage quota. Please contact your administrator.',
            'conflict' => 'A conflict occurred. Please refresh the page and try again.',
            'unsupported_browser' => 'Your browser is not supported. Please use a modern browser.',
            'javascript_required' => 'JavaScript is required for this feature. Please enable JavaScript and try again.',
            'cookies_required' => 'Cookies are required for this feature. Please enable cookies and try again.',
            'storage_full' => 'Storage space is full. Please free up some space and try again.',
            'backup_failed' => 'Backup operation failed. Please try again or contact support.',
            'restore_failed' => 'Restore operation failed. Please try again or contact support.',
            'export_failed' => 'Export operation failed. Please try again.',
            'import_failed' => 'Import operation failed. Please check the file format and try again.',
            'license_expired' => 'Your license has expired. Please renew your license.',
            'license_invalid' => 'Your license is invalid. Please contact support.',
            'license_limit_reached' => 'You have reached the maximum number of allowed users/devices.',
            'trial_expired' => 'Your trial period has expired. Please upgrade to continue using this feature.',
            'payment_required' => 'Payment is required to access this feature.',
            'subscription_expired' => 'Your subscription has expired. Please renew your subscription.',
            'feature_unavailable' => 'This feature is not available in your current plan.',
            'integration_failed' => 'Integration with the external service failed. Please try again later.',
            'api_limit_exceeded' => 'API rate limit exceeded. Please wait and try again.',
            'api_error' => 'An error occurred while communicating with the external service.',
            'configuration_error' => 'There is an error in the system configuration. Please contact support.',
            'cache_error' => 'A cache error occurred. Please try refreshing the page.',
            'session_conflict' => 'Multiple sessions detected. Please log in again.',
            'browser_incompatibility' => 'Your browser is not fully compatible with this application.',
            'mobile_not_supported' => 'This feature is not available on mobile devices.',
            'desktop_required' => 'This feature requires a desktop browser.',
            'browser_update_required' => 'Your browser needs to be updated to use this feature.',
            'plugin_required' => 'A required plugin is missing. Please install the required plugin.',
            'extension_required' => 'A required browser extension is missing.',
            'permissions_error' => 'Browser permissions are required for this feature.',
            'geolocation_blocked' => 'Geolocation access is blocked. Please enable location services.',
            'camera_blocked' => 'Camera access is blocked. Please enable camera permissions.',
            'microphone_blocked' => 'Microphone access is blocked. Please enable microphone permissions.',
            'notifications_blocked' => 'Notifications are blocked. Please enable notifications.',
            'push_notifications_blocked' => 'Push notifications are blocked. Please enable push notifications.',
            'background_sync_blocked' => 'Background sync is blocked. Please enable background sync.',
            'storage_blocked' => 'Storage access is blocked. Please enable storage permissions.',
            'downloads_blocked' => 'Downloads are blocked. Please enable downloads.',
            'popups_blocked' => 'Popups are blocked. Please allow popups for this site.',
            'fullscreen_blocked' => 'Fullscreen mode is blocked. Please enable fullscreen permissions.',
            'payment_blocked' => 'Payment processing is blocked. Please check your browser settings.',
            'ssl_required' => 'Secure connection (HTTPS) is required for this feature.',
            'encryption_required' => 'Encryption is required for this feature.',
            'authentication_required' => 'Authentication is required for this feature.',
            'authorization_required' => 'Authorization is required for this feature.',
            'verification_required' => 'Additional verification is required.',
            'two_factor_required' => 'Two-factor authentication is required.',
            'captcha_required' => 'Please complete the CAPTCHA to continue.',
            'terms_required' => 'You must accept the terms and conditions to continue.',
            'privacy_policy_required' => 'You must accept the privacy policy to continue.',
            'age_verification_required' => 'You must verify your age to access this content.',
            'location_required' => 'Location information is required for this feature.',
            'timezone_required' => 'Timezone information is required for this feature.',
            'language_required' => 'Language preference is required for this feature.',
            'currency_required' => 'Currency preference is required for this feature.',
            'region_required' => 'Region information is required for this feature.',
            'country_required' => 'Country information is required for this feature.',
            'state_required' => 'State information is required for this feature.',
            'city_required' => 'City information is required for this feature.',
            'postal_code_required' => 'Postal code is required for this feature.',
            'address_required' => 'Address information is required for this feature.',
            'phone_required' => 'Phone number is required for this feature.',
            'name_required' => 'Name is required for this feature.',
            'date_of_birth_required' => 'Date of birth is required for this feature.',
            'gender_required' => 'Gender information is required for this feature.',
            'profile_picture_required' => 'Profile picture is required for this feature.',
            'bio_required' => 'Biography is required for this feature.',
            'skills_required' => 'Skills information is required for this feature.',
            'education_required' => 'Education information is required for this feature.',
            'work_experience_required' => 'Work experience information is required for this feature.',
            'resume_required' => 'Resume is required for this feature.',
            'cover_letter_required' => 'Cover letter is required for this feature.',
            'references_required' => 'References are required for this feature.',
            'portfolio_required' => 'Portfolio is required for this feature.',
            'certifications_required' => 'Certifications are required for this feature.',
            'licenses_required' => 'Licenses are required for this feature.',
            'insurance_required' => 'Insurance information is required for this feature.',
            'emergency_contact_required' => 'Emergency contact information is required.',
            'medical_information_required' => 'Medical information is required for this feature.',
            'allergies_required' => 'Allergy information is required for this feature.',
            'medications_required' => 'Medication information is required for this feature.',
            'conditions_required' => 'Medical conditions information is required.',
            'vaccinations_required' => 'Vaccination information is required for this feature.',
            'test_results_required' => 'Test results are required for this feature.',
            'prescriptions_required' => 'Prescription information is required.',
            'appointments_required' => 'Appointment information is required.',
            'medical_history_required' => 'Medical history is required for this feature.',
            'dental_history_required' => 'Dental history is required for this feature.',
            'vision_history_required' => 'Vision history is required for this feature.',
            'hearing_history_required' => 'Hearing history is required for this feature.',
            'mental_health_history_required' => 'Mental health history is required.',
            'family_medical_history_required' => 'Family medical history is required.',
            'genetic_information_required' => 'Genetic information is required for this feature.',
            'lifestyle_information_required' => 'Lifestyle information is required.',
            'dietary_preferences_required' => 'Dietary preferences are required for this feature.',
            'exercise_routine_required' => 'Exercise routine information is required.',
            'sleep_patterns_required' => 'Sleep patterns information is required.',
            'stress_levels_required' => 'Stress levels information is required.',
            'substance_use_required' => 'Substance use information is required.',
            'alcohol_consumption_required' => 'Alcohol consumption information is required.',
            'tobacco_use_required' => 'Tobacco use information is required.',
            'drug_use_required' => 'Drug use information is required.',
            'sexual_health_required' => 'Sexual health information is required.',
            'reproductive_health_required' => 'Reproductive health information is required.',
            'menstrual_history_required' => 'Menstrual history is required for this feature.',
            'pregnancy_history_required' => 'Pregnancy history is required for this feature.',
            'birth_control_required' => 'Birth control information is required.',
            'fertility_information_required' => 'Fertility information is required.',
            'menopause_information_required' => 'Menopause information is required.',
            'hormone_therapy_required' => 'Hormone therapy information is required.',
            'surgical_history_required' => 'Surgical history is required for this feature.',
            'hospitalizations_required' => 'Hospitalization information is required.',
            'allergies_to_medications_required' => 'Allergies to medications are required.',
            'adverse_reactions_required' => 'Adverse reactions information is required.',
            'current_medications_required' => 'Current medications information is required.',
            'past_medications_required' => 'Past medications information is required.',
            'over_the_counter_medications_required' => 'Over-the-counter medications information is required.',
            'supplements_required' => 'Supplement information is required for this feature.',
            'herbal_medicines_required' => 'Herbal medicines information is required.',
            'alternative_therapies_required' => 'Alternative therapies information is required.',
            'complementary_medicines_required' => 'Complementary medicines information is required.',
            'traditional_medicines_required' => 'Traditional medicines information is required.',
            'home_remedies_required' => 'Home remedies information is required.',
            'first_aid_kit_required' => 'First aid kit information is required.',
            'emergency_plan_required' => 'Emergency plan information is required.',
            'disaster_preparedness_required' => 'Disaster preparedness information is required.',
            'evacuation_plan_required' => 'Evacuation plan information is required.',
            'emergency_contacts_required' => 'Emergency contacts are required for this feature.',
            'next_of_kin_required' => 'Next of kin information is required.',
            'power_of_attorney_required' => 'Power of attorney information is required.',
            'living_will_required' => 'Living will information is required.',
            'do_not_resuscitate_required' => 'Do not resuscitate information is required.',
            'organ_donor_status_required' => 'Organ donor status is required for this feature.',
            'advance_directives_required' => 'Advance directives information is required.',
            'healthcare_proxy_required' => 'Healthcare proxy information is required.',
            'medical_power_of_attorney_required' => 'Medical power of attorney information is required.',
            'financial_power_of_attorney_required' => 'Financial power of attorney information is required.',
            'guardianship_information_required' => 'Guardianship information is required.',
            'conservatorship_information_required' => 'Conservatorship information is required.',
            'trust_information_required' => 'Trust information is required for this feature.',
            'will_information_required' => 'Will information is required for this feature.',
            'estate_planning_required' => 'Estate planning information is required.',
            'life_insurance_required' => 'Life insurance information is required.',
            'health_insurance_required' => 'Health insurance information is required.',
            'disability_insurance_required' => 'Disability insurance information is required.',
            'long_term_care_insurance_required' => 'Long-term care insurance information is required.',
            'auto_insurance_required' => 'Auto insurance information is required.',
            'homeowners_insurance_required' => 'Homeowners insurance information is required.',
            'renters_insurance_required' => 'Renters insurance information is required.',
            'umbrella_insurance_required' => 'Umbrella insurance information is required.',
            'professional_liability_insurance_required' => 'Professional liability insurance information is required.',
            'business_insurance_required' => 'Business insurance information is required.',
            'travel_insurance_required' => 'Travel insurance information is required.',
            'pet_insurance_required' => 'Pet insurance information is required.',
            'crop_insurance_required' => 'Crop insurance information is required.',
            'flood_insurance_required' => 'Flood insurance information is required.',
            'earthquake_insurance_required' => 'Earthquake insurance information is required.',
            'terrorism_insurance_required' => 'Terrorism insurance information is required.',
            'cyber_insurance_required' => 'Cyber insurance information is required.',
            'identity_theft_protection_required' => 'Identity theft protection information is required.',
            'credit_monitoring_required' => 'Credit monitoring information is required.',
            'background_check_required' => 'Background check is required for this feature.',
            'drug_test_required' => 'Drug test is required for this feature.',
            'physical_exam_required' => 'Physical exam is required for this feature.',
            'mental_health_eval_required' => 'Mental health evaluation is required.',
            'psychological_eval_required' => 'Psychological evaluation is required.',
            'cognitive_assessment_required' => 'Cognitive assessment is required for this feature.',
            'personality_assessment_required' => 'Personality assessment is required.',
            'skills_assessment_required' => 'Skills assessment is required for this feature.',
            'aptitude_test_required' => 'Aptitude test is required for this feature.',
            'IQ_test_required' => 'IQ test is required for this feature.',
            'EQ_test_required' => 'EQ test is required for this feature.',
            'personality_test_required' => 'Personality test is required for this feature.',
            'career_assessment_required' => 'Career assessment is required for this feature.',
            'interest_inventories_required' => 'Interest inventories are required.',
            'values_assessment_required' => 'Values assessment is required for this feature.',
            'work_style_assessment_required' => 'Work style assessment is required.',
            'leadership_style_assessment_required' => 'Leadership style assessment is required.',
            'communication_style_assessment_required' => 'Communication style assessment is required.',
            'conflict_resolution_style_required' => 'Conflict resolution style assessment is required.',
            'team_role_assessment_required' => 'Team role assessment is required.',
            'emotional_intelligence_assessment_required' => 'Emotional intelligence assessment is required.',
            'stress_tolerance_assessment_required' => 'Stress tolerance assessment is required.',
            'resilience_assessment_required' => 'Resilience assessment is required for this feature.',
            'adaptability_assessment_required' => 'Adaptability assessment is required.',
            'problem_solving_assessment_required' => 'Problem-solving assessment is required.',
            'decision_making_assessment_required' => 'Decision-making assessment is required.',
            'critical_thinking_assessment_required' => 'Critical thinking assessment is required.',
            'creativity_assessment_required' => 'Creativity assessment is required for this feature.',
            'innovation_assessment_required' => 'Innovation assessment is required.',
            'learning_style_assessment_required' => 'Learning style assessment is required.',
            'multiple_intelligences_assessment_required' => 'Multiple intelligences assessment is required.',
            'gardeners_intelligences_required' => 'Gardner\'s intelligences assessment is required.',
            'sternbergs_intelligences_required' => 'Sternberg\'s intelligences assessment is required.',
            'emotional_learning_style_required' => 'Emotional learning style assessment is required.',
            'social_learning_style_required' => 'Social learning style assessment is required.',
            'solitary_learning_style_required' => 'Solitary learning style assessment is required.',
            'visual_learning_style_required' => 'Visual learning style assessment is required.',
            'auditory_learning_style_required' => 'Auditory learning style assessment is required.',
            'kinesthetic_learning_style_required' => 'Kinesthetic learning style assessment is required.',
            'reading_writing_learning_style_required' => 'Reading/writing learning style assessment is required.',
            'logical_mathematical_learning_style_required' => 'Logical/mathematical learning style assessment is required.',
            'spatial_visual_learning_style_required' => 'Spatial/visual learning style assessment is required.',
            'bodily_kinesthetic_learning_style_required' => 'Bodily/kinesthetic learning style assessment is required.',
            'musical_rhythmic_learning_style_required' => 'Musical/rhythmic learning style assessment is required.',
            'interpersonal_learning_style_required' => 'Interpersonal learning style assessment is required.',
            'intrapersonal_learning_style_required' => 'Intrapersonal learning style assessment is required.',
            'naturalistic_learning_style_required' => 'Naturalistic learning style assessment is required.',
            'existential_learning_style_required' => 'Existential learning style assessment is required.',
            'moral_ethical_learning_style_required' => 'Moral/ethical learning style assessment is required.',
            'spiritual_learning_style_required' => 'Spiritual learning style assessment is required.',
            'religious_learning_style_required' => 'Religious learning style assessment is required.',
            'philosophical_learning_style_required' => 'Philosophical learning style assessment is required.',
            'political_learning_style_required' => 'Political learning style assessment is required.',
            'economic_learning_style_required' => 'Economic learning style assessment is required.',
            'legal_learning_style_required' => 'Legal learning style assessment is required.',
            'medical_learning_style_required' => 'Medical learning style assessment is required.',
            'scientific_learning_style_required' => 'Scientific learning style assessment is required.',
            'technical_learning_style_required' => 'Technical learning style assessment is required.',
            'artistic_learning_style_required' => 'Artistic learning style assessment is required.',
            'literary_learning_style_required' => 'Literary learning style assessment is required.',
            'historical_learning_style_required' => 'Historical learning style assessment is required.',
            'geographical_learning_style_required' => 'Geographical learning style assessment is required.',
            'astronomical_learning_style_required' => 'Astronomical learning style assessment is required.',
            'environmental_learning_style_required' => 'Environmental learning style assessment is required.',
            'social_sciences_learning_style_required' => 'Social sciences learning style assessment is required.',
            'physical_sciences_learning_style_required' => 'Physical sciences learning style assessment is required.',
            'life_sciences_learning_style_required' => 'Life sciences learning style assessment is required.',
            'earth_sciences_learning_style_required' => 'Earth sciences learning style assessment is required.',
            'space_sciences_learning_style_required' => 'Space sciences learning style assessment is required.',
            'ocean_sciences_learning_style_required' => 'Ocean sciences learning style assessment is required.',
            'atmospheric_sciences_learning_style_required' => 'Atmospheric sciences learning style assessment is required.',
            'planetary_sciences_learning_style_required' => 'Planetary sciences learning style assessment is required.',
            'cosmic_sciences_learning_style_required' => 'Cosmic sciences learning style assessment is required.',
            'quantum_sciences_learning_style_required' => 'Quantum sciences learning style assessment is required.',
            'nuclear_sciences_learning_style_required' => 'Nuclear sciences learning style assessment is required.',
            'particle_sciences_learning_style_required' => 'Particle sciences learning style assessment is required.',
            'astro_sciences_learning_style_required' => 'Astro-sciences learning style assessment is required.',
            'bio_sciences_learning_style_required' => 'Bio-sciences learning style assessment is required.',
            'nano_sciences_learning_style_required' => 'Nano-sciences learning style assessment is required.',
            'info_sciences_learning_style_required' => 'Info-sciences learning style assessment is required.',
            'cog_sciences_learning_style_required' => 'Cog-sciences learning style assessment is required.',
            'neuro_sciences_learning_style_required' => 'Neuro-sciences learning style assessment is required.',
            'psy_sciences_learning_style_required' => 'Psy-sciences learning style assessment is required.',
            'soc_sciences_learning_style_required' => 'Soc-sciences learning style assessment is required.',
            'anthro_sciences_learning_style_required' => 'Anthro-sciences learning style assessment is required.',
            'archaeo_sciences_learning_style_required' => 'Archaeo-sciences learning style assessment is required.',
            'paleo_sciences_learning_style_required' => 'Paleo-sciences learning style assessment is required.',
            'geo_sciences_learning_style_required' => 'Geo-sciences learning style assessment is required.',
            'climatology_learning_style_required' => 'Climatology learning style assessment is required.',
            'meteorology_learning_style_required' => 'Meteorology learning style assessment is required.',
            'oceanography_learning_style_required' => 'Oceanography learning style assessment is required.',
            'ecology_learning_style_required' => 'Ecology learning style assessment is required.',
            'conservation_learning_style_required' => 'Conservation learning style assessment is required.',
            'sustainability_learning_style_required' => 'Sustainability learning style assessment is required.',
            'renewable_energy_learning_style_required' => 'Renewable energy learning style assessment is required.',
            'climate_change_learning_style_required' => 'Climate change learning style assessment is required.',
            'global_warming_learning_style_required' => 'Global warming learning style assessment is required.',
            'pollution_learning_style_required' => 'Pollution learning style assessment is required.',
            'waste_management_learning_style_required' => 'Waste management learning style assessment is required.',
            'recycling_learning_style_required' => 'Recycling learning style assessment is required.',
            'composting_learning_style_required' => 'Composting learning style assessment is required.',
            'organic_farming_learning_style_required' => 'Organic farming learning style assessment is required.',
            'permaculture_learning_style_required' => 'Permaculture learning style assessment is required.',
            'urban_farming_learning_style_required' => 'Urban farming learning style assessment is required.',
            'vertical_farming_learning_style_required' => 'Vertical farming learning style assessment is required.',
            'hydroponics_learning_style_required' => 'Hydroponics learning style assessment is required.',
            'aquaponics_learning_style_required' => 'Aquaponics learning style assessment is required.',
            'aeroponics_learning_style_required' => 'Aeroponics learning style assessment is required.',
            'aquaculture_learning_style_required' => 'Aquaculture learning style assessment is required.',
            'mariculture_learning_style_required' => 'Mariculture learning style assessment is required.',
            'fisheries_learning_style_required' => 'Fisheries learning style assessment is required.',
            'forestry_learning_style_required' => 'Forestry learning style assessment is required.',
            'wildlife_management_learning_style_required' => 'Wildlife management learning style assessment is required.',
            'conservation_biology_learning_style_required' => 'Conservation biology learning style assessment is required.',
            'environmental_law_learning_style_required' => 'Environmental law learning style assessment is required.',
            'environmental_policy_learning_style_required' => 'Environmental policy learning style assessment is required.',
            'environmental_ethics_learning_style_required' => 'Environmental ethics learning style assessment is required.',
            'environmental_justice_learning_style_required' => 'Environmental justice learning style assessment is required.',
            'environmental_education_learning_style_required' => 'Environmental education learning style assessment is required.',
            'sustainability_science_learning_style_required' => 'Sustainability science learning style assessment is required.',
            'sustainable_development_learning_style_required' => 'Sustainable development learning style assessment is required.',
            'green_technology_learning_style_required' => 'Green technology learning style assessment is required.',
            'clean_technology_learning_style_required' => 'Clean technology learning style assessment is required.',
            'clean_energy_learning_style_required' => 'Clean energy learning style assessment is required.',
            'renewable_resources_learning_style_required' => 'Renewable resources learning style assessment is required.',
            'non_renewable_resources_learning_style_required' => 'Non-renewable resources learning style assessment is required.',
            'fossil_fuels_learning_style_required' => 'Fossil fuels learning style assessment is required.',
            'nuclear_energy_learning_style_required' => 'Nuclear energy learning style assessment is required.',
            'solar_energy_learning_style_required' => 'Solar energy learning style assessment is required.',
            'wind_energy_learning_style_required' => 'Wind energy learning style assessment is required.',
            'hydro_energy_learning_style_required' => 'Hydro energy learning style assessment is required.',
            'geothermal_energy_learning_style_required' => 'Geothermal energy learning style assessment is required.',
            'biomass_energy_learning_style_required' => 'Biomass energy learning style assessment is required.',
            'biofuels_learning_style_required' => 'Biofuels learning style assessment is required.',
            'hydrogen_energy_learning_style_required' => 'Hydrogen energy learning style assessment is required.',
            'fuel_cells_learning_style_required' => 'Fuel cells learning style assessment is required.',
            'battery_technology_learning_style_required' => 'Battery technology learning style assessment is required.',
            'energy_storage_learning_style_required' => 'Energy storage learning style assessment is required.',
            'smart_grids_learning_style_required' => 'Smart grids learning style assessment is required.',
            'microgrids_learning_style_required' => 'Microgrids learning style assessment is required.',
            'distributed_generation_learning_style_required' => 'Distributed generation learning style assessment is required.',
            'demand_response_learning_style_required' => 'Demand response learning style assessment is required.',
            'energy_efficiency_learning_style_required' => 'Energy efficiency learning style assessment is required.',
            'energy_conservation_learning_style_required' => 'Energy conservation learning style assessment is required.',
            'carbon_footprint_learning_style_required' => 'Carbon footprint learning style assessment is required.',
            'carbon_neutral_learning_style_required' => 'Carbon neutral learning style assessment is required.',
            'carbon_offset_learning_style_required' => 'Carbon offset learning style assessment is required.',
            'carbon_capture_learning_style_required' => 'Carbon capture learning style assessment is required.',
            'carbon_storage_learning_style_required' => 'Carbon storage learning style assessment is required.',
            'carbon_trading_learning_style_required' => 'Carbon trading learning style assessment is required.',
            'carbon_tax_learning_style_required' => 'Carbon tax learning style assessment is required.',
            'cap_and_trade_learning_style_required' => 'Cap and trade learning style assessment is required.',
            'emissions_trading_learning_style_required' => 'Emissions trading learning style assessment is required.',
            'pollution_credits_learning_style_required' => 'Pollution credits learning style assessment is required.',
            'environmental_markets_learning_style_required' => 'Environmental markets learning style assessment is required.',
            'green_investments_learning_style_required' => 'Green investments learning style assessment is required.',
            'sustainable_investments_learning_style_required' => 'Sustainable investments learning style assessment is required.',
            'ethical_investments_learning_style_required' => 'Ethical investments learning style assessment is required.',
            'socially_responsible_investments_learning_style_required' => 'Socially responsible investments learning style assessment is required.',
            'impact_investments_learning_style_required' => 'Impact investments learning style assessment is required.',
            'green_bonds_learning_style_required' => 'Green bonds learning style assessment is required.',
            'sustainability_bonds_learning_style_required' => 'Sustainability bonds learning style assessment is required.',
            'social_bonds_learning_style_required' => 'Social bonds learning style assessment is required.',
            'climate_bonds_learning_style_required' => 'Climate bonds learning style assessment is required.',
            'green_loans_learning_style_required' => 'Green loans learning style assessment is required.',
            'sustainability_loans_learning_style_required' => 'Sustainability loans learning style assessment is required.',
            'green_credit_lines_learning_style_required' => 'Green credit lines learning style assessment is required.',
            'sustainability_credit_lines_learning_style_required' => 'Sustainability credit lines learning style assessment is required.',
            'green_mortgages_learning_style_required' => 'Green mortgages learning style assessment is required.',
            'energy_efficient_mortgages_learning_style_required' => 'Energy efficient mortgages learning style assessment is required.',
            'green_insurance_learning_style_required' => 'Green insurance learning style assessment is required.',
            'sustainability_insurance_learning_style_required' => 'Sustainability insurance learning style assessment is required.',
            'climate_insurance_learning_style_required' => 'Climate insurance learning style assessment is required.',
            'weather_insurance_learning_style_required' => 'Weather insurance learning style assessment is required.',
            'crop_insurance_learning_style_required' => 'Crop insurance learning style assessment is required.',
            'livestock_insurance_learning_style_required' => 'Livestock insurance learning style assessment is required.',
            'forestry_insurance_learning_style_required' => 'Forestry insurance learning style assessment is required.',
            'fisheries_insurance_learning_style_required' => 'Fisheries insurance learning style assessment is required.',
            'aquaculture_insurance_learning_style_required' => 'Aquaculture insurance learning style assessment is required.',
            'renewable_energy_insurance_learning_style_required' => 'Renewable energy insurance learning style assessment is required.',
            'solar_insurance_learning_style_required' => 'Solar insurance learning style assessment is required.',
            'wind_insurance_learning_style_required' => 'Wind insurance learning style assessment is required.',
            'hydro_insurance_learning_style_required' => 'Hydro insurance learning style assessment is required.',
            'geothermal_insurance_learning_style_required' => 'Geothermal insurance learning style assessment is required.',
            'biomass_insurance_learning_style_required' => 'Biomass insurance learning style assessment is required.',
            'biofuels_insurance_learning_style_required' => 'Biofuels insurance learning style assessment is required.',
            'hydrogen_insurance_learning_style_required' => 'Hydrogen insurance learning style assessment is required.',
            'fuel_cells_insurance_learning_style_required' => 'Fuel cells insurance learning style assessment is required.',
            'battery_insurance_learning_style_required' => 'Battery insurance learning style assessment is required.',
            'energy_storage_insurance_learning_style_required' => 'Energy storage insurance learning style assessment is required.',
            'smart_grids_insurance_learning_style_required' => 'Smart grids insurance learning style assessment is required.',
            'microgrids_insurance_learning_style_required' => 'Microgrids insurance learning style assessment is required.',
            'distributed_generation_insurance_learning_style_required' => 'Distributed generation insurance learning style assessment is required.',
            'demand_response_insurance_learning_style_required' => 'Demand response insurance learning style assessment is required.',
            'energy_efficiency_insurance_learning_style_required' => 'Energy efficiency insurance learning style assessment is required.',
            'energy_conservation_insurance_learning_style_required' => 'Energy conservation insurance learning style assessment is required.',
            'carbon_footprint_insurance_learning_style_required' => 'Carbon footprint insurance learning style assessment is required.',
            'carbon_neutral_insurance_learning_style_required' => 'Carbon neutral insurance learning style assessment is required.',
            'carbon_offset_insurance_learning_style_required' => 'Carbon offset insurance learning style assessment is required.',
            'carbon_capture_insurance_learning_style_required' => 'Carbon capture insurance learning style assessment is required.',
            'carbon_storage_insurance_learning_style_required' => 'Carbon storage insurance learning style assessment is required.',
            'carbon_trading_insurance_learning_style_required' => 'Carbon trading insurance learning style assessment is required.',
            'carbon_tax_insurance_learning_style_required' => 'Carbon tax insurance learning style assessment is required.',
            'cap_and_trade_insurance_learning_style_required' => 'Cap and trade insurance learning style assessment is required.',
            'emissions_trading_insurance_learning_style_required' => 'Emissions trading insurance learning style assessment is required.',
            'pollution_credits_insurance_learning_style_required' => 'Pollution credits insurance learning style assessment is required.',
            'environmental_markets_insurance_learning_style_required' => 'Environmental markets insurance learning style assessment is required.',
            'green_investments_insurance_learning_style_required' => 'Green investments insurance learning style assessment is required.',
            'sustainable_investments_insurance_learning_style_required' => 'Sustainable investments insurance learning style assessment is required.',
            'ethical_investments_insurance_learning_style_required' => 'Ethical investments insurance learning style assessment is required.',
            'socially_responsible_investments_insurance_learning_style_required' => 'Socially responsible investments insurance learning style assessment is required.',
            'impact_investments_insurance_learning_style_required' => 'Impact investments insurance learning style assessment is required.',
            'green_bonds_insurance_learning_style_required' => 'Green bonds insurance learning style assessment is required.',
            'sustainability_bonds_insurance_learning_style_required' => 'Sustainability bonds insurance learning style assessment is required.',
            'social_bonds_insurance_learning_style_required' => 'Social bonds insurance learning style assessment is required.',
            'climate_bonds_insurance_learning_style_required' => 'Climate bonds insurance learning style assessment is required.',
            'green_loans_insurance_learning_style_required' => 'Green loans insurance learning style assessment is required.',
            'sustainability_loans_insurance_learning_style_required' => 'Sustainability loans insurance learning style assessment is required.',
            'green_credit_lines_insurance_learning_style_required' => 'Green credit lines insurance learning style assessment is required.',
            'sustainability_credit_lines_insurance_learning_style_required' => 'Sustainability credit lines insurance learning style assessment is required.',
            'green_mortgages_insurance_learning_style_required' => 'Green mortgages insurance learning style assessment is required.',
            'energy_efficient_mortgages_insurance_learning_style_required' => 'Energy efficient mortgages insurance learning style assessment is required.'
        ];
        
        // Return specific message if found, otherwise generic message
        return $messages[$errorCode] ?? 'An unexpected error occurred. Please try again later.';
    }
}