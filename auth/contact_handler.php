<?php
/**
 * Contact Form Handler
 * Processes contact form submissions
 */

// Prevent direct access
if (!defined('ALLOW_PUBLIC_ACCESS')) {
    header('Location: ../public/contact.php');
    exit;
}

// Include necessary files
require_once 'config.php';
require_once 'csrf.php';
require_once 'logger.php';

// Initialize response
$response = [
    'success' => false,
    'message' => 'An error occurred. Please try again.'
];

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Validate CSRF token
        if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
            throw new Exception('Invalid CSRF token');
        }
        
        // Get form data
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');
        
        // Validate inputs
        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            throw new Exception('All fields are required');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email address');
        }
        
        if (strlen($message) < 10) {
            throw new Exception('Message must be at least 10 characters long');
        }
        
        // Log the contact request
        logActivity('contact_form_submission', [
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message_length' => strlen($message)
        ]);
        
        // In a real application, you would:
        // 1. Send email to support team
        // 2. Save to database
        // 3. Send confirmation email to user
        
        // For now, we'll simulate successful processing
        $response['success'] = true;
        $response['message'] = 'Thank you for your message! We will get back to you soon.';
        
    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
        logActivity('contact_form_error', ['error' => $e->getMessage()]);
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
exit;