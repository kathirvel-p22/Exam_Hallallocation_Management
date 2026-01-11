<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Check if user is a student
if ($_SESSION['role'] !== 'student') {
    header('Location: ../index.php');
    exit();
}

// Check if student is verified
if (!isset($_SESSION['is_verified']) || $_SESSION['is_verified'] !== 1) {
    header('Location: verify.php');
    exit();
}

// Check if student has completed profile
if (!isset($_SESSION['has_profile']) || $_SESSION['has_profile'] !== 1) {
    header('Location: profile.php');
    exit();
}

// Regenerate session ID periodically for security
if (!isset($_SESSION['last_regeneration'])) {
    session_regenerate_id(true);
    $_SESSION['last_regeneration'] = time();
} else {
    $interval = 60 * 30; // 30 minutes
    if (time() - $_SESSION['last_regeneration'] >= $interval) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}

// Log access attempt
if (function_exists('log_access')) {
    log_access($_SESSION['user_id'], 'student_portal_access', $_SERVER['REQUEST_URI']);
}
?>