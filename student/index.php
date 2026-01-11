<?php
// Student Portal Index
require_once '../auth/protect_student.php';

// Redirect to dashboard
header('Location: dashboard.php');
exit();
?>