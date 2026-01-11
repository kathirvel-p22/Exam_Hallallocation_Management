<?php
/**
 * Flash Messages System
 * Provides user-friendly feedback messages with different types and persistence
 * 
 * @package ExamSeatAllocation
 * @author Flash Messages Team
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    die('Direct access not allowed');
}

/**
 * Flash message types
 */
class FlashMessageType {
    const SUCCESS = 'success';
    const INFO = 'info';
    const WARNING = 'warning';
    const ERROR = 'error';
    const DANGER = 'danger';
}

/**
 * Flash message system
 */
class FlashMessages {
    
    /**
     * Session key for flash messages
     * @var string
     */
    private static $sessionKey = 'flash_messages';
    
    /**
     * Add a flash message
     * 
     * @param string $message Message content
     * @param string $type Message type
     * @param bool $persistent Whether message should persist across requests
     * @param array $context Additional context for the message
     */
    public static function add($message, $type = FlashMessageType::INFO, $persistent = false, $context = []) {
        if (!isset($_SESSION[self::$sessionKey])) {
            $_SESSION[self::$sessionKey] = [];
        }
        
        $messageData = [
            'message' => $message,
            'type' => $type,
            'persistent' => $persistent,
            'timestamp' => time(),
            'context' => $context,
            'id' => uniqid('flash_', true)
        ];
        
        $_SESSION[self::$sessionKey][] = $messageData;
    }
    
    /**
     * Add a success message
     * 
     * @param string $message Message content
     * @param bool $persistent Whether message should persist
     * @param array $context Additional context
     */
    public static function success($message, $persistent = false, $context = []) {
        self::add($message, FlashMessageType::SUCCESS, $persistent, $context);
    }
    
    /**
     * Add an info message
     * 
     * @param string $message Message content
     * @param bool $persistent Whether message should persist
     * @param array $context Additional context
     */
    public static function info($message, $persistent = false, $context = []) {
        self::add($message, FlashMessageType::INFO, $persistent, $context);
    }
    
    /**
     * Add a warning message
     * 
     * @param string $message Message content
     * @param bool $persistent Whether message should persist
     * @param array $context Additional context
     */
    public static function warning($message, $persistent = false, $context = []) {
        self::add($message, FlashMessageType::WARNING, $persistent, $context);
    }
    
    /**
     * Add an error message
     * 
     * @param string $message Message content
     * @param bool $persistent Whether message should persist
     * @param array $context Additional context
     */
    public static function error($message, $persistent = false, $context = []) {
        self::add($message, FlashMessageType::ERROR, $persistent, $context);
    }
    
    /**
     * Add a danger message
     * 
     * @param string $message Message content
     * @param bool $persistent Whether message should persist
     * @param array $context Additional context
     */
    public static function danger($message, $persistent = false, $context = []) {
        self::add($message, FlashMessageType::DANGER, $persistent, $context);
    }
    
    /**
     * Get all messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of messages
     */
    public static function getMessages($includePersistent = true) {
        $messages = $_SESSION[self::$sessionKey] ?? [];
        
        if (!$includePersistent) {
            $messages = array_filter($messages, function($message) {
                return !$message['persistent'];
            });
        }
        
        return array_values($messages);
    }
    
    /**
     * Get messages by type
     * 
     * @param string $type Message type
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of messages
     */
    public static function getMessagesByType($type, $includePersistent = true) {
        $messages = self::getMessages($includePersistent);
        
        return array_filter($messages, function($message) use ($type) {
            return $message['type'] === $type;
        });
    }
    
    /**
     * Get success messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of success messages
     */
    public static function getSuccessMessages($includePersistent = true) {
        return self::getMessagesByType(FlashMessageType::SUCCESS, $includePersistent);
    }
    
    /**
     * Get info messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of info messages
     */
    public static function getInfoMessages($includePersistent = true) {
        return self::getMessagesByType(FlashMessageType::INFO, $includePersistent);
    }
    
    /**
     * Get warning messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of warning messages
     */
    public static function getWarningMessages($includePersistent = true) {
        return self::getMessagesByType(FlashMessageType::WARNING, $includePersistent);
    }
    
    /**
     * Get error messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of error messages
     */
    public static function getErrorMessages($includePersistent = true) {
        return self::getMessagesByType(FlashMessageType::ERROR, $includePersistent);
    }
    
    /**
     * Get danger messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return array Array of danger messages
     */
    public static function getDangerMessages($includePersistent = true) {
        return self::getMessagesByType(FlashMessageType::DANGER, $includePersistent);
    }
    
    /**
     * Check if there are any messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return bool True if messages exist, false otherwise
     */
    public static function hasMessages($includePersistent = true) {
        return count(self::getMessages($includePersistent)) > 0;
    }
    
    /**
     * Check if there are any error messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return bool True if error messages exist, false otherwise
     */
    public static function hasErrors($includePersistent = true) {
        return count(self::getErrorMessages($includePersistent)) > 0 || count(self::getDangerMessages($includePersistent)) > 0;
    }
    
    /**
     * Check if there are any success messages
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return bool True if success messages exist, false otherwise
     */
    public static function hasSuccess($includePersistent = true) {
        return count(self::getSuccessMessages($includePersistent)) > 0;
    }
    
    /**
     * Clear all messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clear($includePersistent = false) {
        if (!isset($_SESSION[self::$sessionKey])) {
            return;
        }
        
        if ($includePersistent) {
            unset($_SESSION[self::$sessionKey]);
        } else {
            $_SESSION[self::$sessionKey] = array_filter($_SESSION[self::$sessionKey], function($message) {
                return $message['persistent'];
            });
        }
    }
    
    /**
     * Clear messages by type
     * 
     * @param string $type Message type to clear
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearByType($type, $includePersistent = false) {
        if (!isset($_SESSION[self::$sessionKey])) {
            return;
        }
        
        $_SESSION[self::$sessionKey] = array_filter($_SESSION[self::$sessionKey], function($message) use ($type, $includePersistent) {
            return $message['type'] !== $type || ($includePersistent && $message['persistent']);
        });
    }
    
    /**
     * Clear success messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearSuccess($includePersistent = false) {
        self::clearByType(FlashMessageType::SUCCESS, $includePersistent);
    }
    
    /**
     * Clear info messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearInfo($includePersistent = false) {
        self::clearByType(FlashMessageType::INFO, $includePersistent);
    }
    
    /**
     * Clear warning messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearWarning($includePersistent = false) {
        self::clearByType(FlashMessageType::WARNING, $includePersistent);
    }
    
    /**
     * Clear error messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearError($includePersistent = false) {
        self::clearByType(FlashMessageType::ERROR, $includePersistent);
    }
    
    /**
     * Clear danger messages
     * 
     * @param bool $includePersistent Whether to clear persistent messages
     */
    public static function clearDanger($includePersistent = false) {
        self::clearByType(FlashMessageType::DANGER, $includePersistent);
    }
    
    /**
     * Render messages as HTML
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @param array $options Rendering options
     * @return string HTML output
     */
    public static function render($includePersistent = true, $options = []) {
        $defaultOptions = [
            'container_class' => 'flash-messages',
            'message_class_prefix' => 'flash-message',
            'auto_dismiss' => true,
            'dismiss_delay' => 5000,
            'show_close_button' => true,
            'escape_html' => true
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        $messages = self::getMessages($includePersistent);
        
        if (empty($messages)) {
            return '';
        }
        
        $html = '<div class="' . htmlspecialchars($options['container_class']) . '">';
        
        foreach ($messages as $message) {
            $messageClass = $options['message_class_prefix'] . ' ' . $options['message_class_prefix'] . '-' . htmlspecialchars($message['type']);
            $messageContent = $options['escape_html'] ? htmlspecialchars($message['message']) : $message['message'];
            
            $html .= '<div class="' . $messageClass . '" data-type="' . htmlspecialchars($message['type']) . '" data-id="' . htmlspecialchars($message['id']) . '">';
            
            // Icon based on message type
            $icon = self::getMessageIcon($message['type']);
            if ($icon) {
                $html .= '<span class="flash-icon">' . $icon . '</span>';
            }
            
            $html .= '<span class="flash-content">' . $messageContent . '</span>';
            
            if ($options['show_close_button']) {
                $html .= '<button class="flash-close" data-dismiss="' . htmlspecialchars($message['id']) . '" aria-label="Close">×</button>';
            }
            
            $html .= '</div>';
        }
        
        $html .= '</div>';
        
        // Add JavaScript for auto-dismiss if enabled
        if ($options['auto_dismiss']) {
            $html .= '<script>
                document.addEventListener("DOMContentLoaded", function() {
                    var messages = document.querySelectorAll(".flash-message");
                    messages.forEach(function(message) {
                        setTimeout(function() {
                            message.style.opacity = "0";
                            message.style.transition = "opacity 0.5s ease";
                            setTimeout(function() {
                                message.remove();
                            }, 500);
                        }, ' . (int)$options['dismiss_delay'] . ');
                    });
                });
            </script>';
        }
        
        return $html;
    }
    
    /**
     * Get message icon based on type
     * 
     * @param string $type Message type
     * @return string HTML icon
     */
    private static function getMessageIcon($type) {
        switch ($type) {
            case FlashMessageType::SUCCESS:
                return '<i class="fas fa-check-circle"></i>';
            case FlashMessageType::INFO:
                return '<i class="fas fa-info-circle"></i>';
            case FlashMessageType::WARNING:
                return '<i class="fas fa-exclamation-triangle"></i>';
            case FlashMessageType::ERROR:
            case FlashMessageType::DANGER:
                return '<i class="fas fa-times-circle"></i>';
            default:
                return '';
        }
    }
    
    /**
     * Render messages as JSON
     * 
     * @param bool $includePersistent Whether to include persistent messages
     * @return string JSON output
     */
    public static function renderJSON($includePersistent = true) {
        $messages = self::getMessages($includePersistent);
        
        return json_encode([
            'messages' => $messages,
            'count' => count($messages),
            'has_errors' => self::hasErrors($includePersistent),
            'has_success' => self::hasSuccess($includePersistent)
        ]);
    }
    
    /**
     * Flash messages middleware for automatic rendering
     * 
     * @param array $options Rendering options
     */
    public static function middleware($options = []) {
        // Auto-render messages at the end of the request
        register_shutdown_function(function() use ($options) {
            echo self::render(true, $options);
        });
    }
    
    /**
     * Convert validation errors to flash messages
     * 
     * @param array $errors Validation errors
     * @param bool $persistent Whether messages should persist
     */
    public static function fromValidationErrors($errors, $persistent = false) {
        if (empty($errors)) {
            return;
        }
        
        foreach ($errors as $field => $fieldErrors) {
            if (is_array($fieldErrors)) {
                foreach ($fieldErrors as $error) {
                    self::error("{$field}: {$error}", $persistent);
                }
            } else {
                self::error("{$field}: {$fieldErrors}", $persistent);
            }
        }
    }
    
    /**
     * Convert exception to flash message
     * 
     * @param Exception $exception Exception to convert
     * @param bool $persistent Whether message should persist
     */
    public static function fromException($exception, $persistent = false) {
        self::error($exception->getMessage(), $persistent, [
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}