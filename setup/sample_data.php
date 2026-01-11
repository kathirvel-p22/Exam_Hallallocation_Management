<?php
/**
 * Exam Seat Allocation Management System - Sample Data Script
 * 
 * This script creates sample data for testing and demonstration purposes.
 * Run this script after the database setup to populate the system with test data.
 * 
 * Usage: php sample_data.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Colors for output
$colors = [
    'reset' => "\033[0m",
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'magenta' => "\033[35m",
    'cyan' => "\033[36m"
];

function colored_output($text, $color = 'reset') {
    global $colors;
    echo $colors[$color] . $text . $colors['reset'] . PHP_EOL;
}

function print_header() {
    colored_output("╔══════════════════════════════════════════════════════════════╗", 'cyan');
    colored_output("║           Exam Seat Allocation Management System             ║", 'cyan');
    colored_output("║                    Sample Data Creation                      ║", 'cyan');
    colored_output("╚══════════════════════════════════════════════════════════════╝", 'cyan');
    echo PHP_EOL;
}

function load_config() {
    if (!file_exists('config/config.php')) {
        colored_output("✗ Configuration file not found", 'red');
        colored_output("Please run setup/quick_start.php first or create config/config.php", 'red');
        return false;
    }
    
    require_once 'config/config.php';
    return true;
}

function connect_to_database() {
    if (!load_config()) {
        return false;
    }
    
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS ?? '', DB_NAME);
    
    if ($conn->connect_error) {
        colored_output("✗ Database connection failed: " . $conn->connect_error, 'red');
        return false;
    }
    
    colored_output("✓ Connected to database", 'green');
    return $conn;
}

function clear_existing_data($conn) {
    colored_output("Clearing existing sample data...", 'blue');
    
    $tables = ['allocations', 'exams', 'rooms', 'classes', 'users'];
    
    foreach ($tables as $table) {
        // Only clear non-admin users
        if ($table === 'users') {
            $sql = "DELETE FROM $table WHERE role != 'admin'";
        } else {
            $sql = "DELETE FROM $table";
        }
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Cleared $table table", 'green');
        } else {
            colored_output("✗ Error clearing $table: " . $conn->error, 'yellow');
        }
    }
}

function create_sample_classes($conn) {
    colored_output("Creating sample classes...", 'blue');
    
    $classes = [
        ['Computer Science 101', 50],
        ['Mathematics 201', 40],
        ['Physics 301', 30],
        ['Chemistry 101', 45],
        ['Biology 201', 35],
        ['English Literature', 60],
        ['History 101', 55],
        ['Economics 201', 40]
    ];
    
    $success_count = 0;
    
    foreach ($classes as $class) {
        $class_name = $conn->real_escape_string($class[0]);
        $capacity = $class[1];
        $created_at = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO classes (class_name, capacity, created_at) VALUES ('$class_name', $capacity, '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created class: $class_name", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating class $class_name: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample classes", 'blue');
    return $success_count;
}

function create_sample_rooms($conn) {
    colored_output("Creating sample rooms...", 'blue');
    
    $rooms = [
        ['Room A101', 30, 'Building A, Floor 1'],
        ['Room A102', 30, 'Building A, Floor 1'],
        ['Room A103', 30, 'Building A, Floor 1'],
        ['Room B201', 40, 'Building B, Floor 2'],
        ['Room B202', 40, 'Building B, Floor 2'],
        ['Room C301', 50, 'Building C, Floor 3'],
        ['Room C302', 50, 'Building C, Floor 3'],
        ['Room D401', 60, 'Building D, Floor 4']
    ];
    
    $success_count = 0;
    
    foreach ($rooms as $room) {
        $room_name = $conn->real_escape_string($room[0]);
        $capacity = $room[1];
        $location = $conn->real_escape_string($room[2]);
        $created_at = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO rooms (room_name, capacity, location, created_at) VALUES ('$room_name', $capacity, '$location', '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created room: $room_name", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating room $room_name: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample rooms", 'blue');
    return $success_count;
}

function create_sample_exams($conn) {
    colored_output("Creating sample exams...", 'blue');
    
    $exams = [
        ['Midterm Exam - Fall 2024', '2024-11-15', '09:00:00', '11:00:00'],
        ['Final Exam - Fall 2024', '2024-12-10', '14:00:00', '16:00:00'],
        ['Midterm Exam - Spring 2024', '2024-03-15', '09:00:00', '11:00:00'],
        ['Final Exam - Spring 2024', '2024-05-10', '14:00:00', '16:00:00']
    ];
    
    $success_count = 0;
    
    foreach ($exams as $exam) {
        $exam_name = $conn->real_escape_string($exam[0]);
        $exam_date = $exam[1];
        $start_time = $exam[2];
        $end_time = $exam[3];
        $created_at = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO exams (exam_name, exam_date, start_time, end_time, created_at) VALUES ('$exam_name', '$exam_date', '$start_time', '$end_time', '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created exam: $exam_name", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating exam $exam_name: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample exams", 'blue');
    return $success_count;
}

function create_sample_students($conn) {
    colored_output("Creating sample students...", 'blue');
    
    $students = [
        ['john.doe', 'john.doe@example.com', 'John Doe', 'Computer Science 101'],
        ['jane.smith', 'jane.smith@example.com', 'Jane Smith', 'Mathematics 201'],
        ['bob.johnson', 'bob.johnson@example.com', 'Bob Johnson', 'Physics 301'],
        ['alice.brown', 'alice.brown@example.com', 'Alice Brown', 'Chemistry 101'],
        ['charlie.wilson', 'charlie.wilson@example.com', 'Charlie Wilson', 'Biology 201'],
        ['diana.davis', 'diana.davis@example.com', 'Diana Davis', 'English Literature'],
        ['eve.miller', 'eve.miller@example.com', 'Eve Miller', 'History 101'],
        ['frank.moore', 'frank.moore@example.com', 'Frank Moore', 'Economics 201'],
        ['grace.taylor', 'grace.taylor@example.com', 'Grace Taylor', 'Computer Science 101'],
        ['henry.anderson', 'henry.anderson@example.com', 'Henry Anderson', 'Mathematics 201']
    ];
    
    $success_count = 0;
    
    foreach ($students as $student) {
        $username = $conn->real_escape_string($student[0]);
        $email = $conn->real_escape_string($student[1]);
        $full_name = $conn->real_escape_string($student[2]);
        $class_name = $conn->real_escape_string($student[3]);
        
        // Get class ID
        $class_result = $conn->query("SELECT id FROM classes WHERE class_name = '$class_name'");
        if ($class_result && $class_result->num_rows > 0) {
            $class_row = $class_result->fetch_assoc();
            $class_id = $class_row['id'];
        } else {
            colored_output("✗ Class not found: $class_name", 'red');
            continue;
        }
        
        $password = password_hash('student123', PASSWORD_DEFAULT);
        $created_at = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO users (username, email, full_name, password, role, class_id, created_at) VALUES ('$username', '$email', '$full_name', '$password', 'student', $class_id, '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created student: $full_name", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating student $full_name: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample students", 'blue');
    return $success_count;
}

function create_sample_admins($conn) {
    colored_output("Creating sample administrators...", 'blue');
    
    $admins = [
        ['exam.admin', 'admin@example.com', 'Exam Administrator'],
        ['system.admin', 'sysadmin@example.com', 'System Administrator']
    ];
    
    $success_count = 0;
    
    foreach ($admins as $admin) {
        $username = $conn->real_escape_string($admin[0]);
        $email = $conn->real_escape_string($admin[1]);
        $full_name = $conn->real_escape_string($admin[2]);
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $created_at = date('Y-m-d H:i:s');
        
        // Check if admin already exists
        $check_sql = "SELECT COUNT(*) as count FROM users WHERE email = '$email'";
        $check_result = $conn->query($check_sql);
        $check_row = $check_result->fetch_assoc();
        
        if ($check_row['count'] > 0) {
            colored_output("ℹ Admin already exists: $full_name", 'yellow');
            continue;
        }
        
        $sql = "INSERT INTO users (username, email, full_name, password, role, created_at) VALUES ('$username', '$email', '$full_name', '$password', 'admin', '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created admin: $full_name", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating admin $full_name: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample administrators", 'blue');
    return $success_count;
}

function create_sample_allocations($conn) {
    colored_output("Creating sample allocations...", 'blue');
    
    // Get sample data IDs
    $exam_result = $conn->query("SELECT id FROM exams ORDER BY id LIMIT 1");
    $room_result = $conn->query("SELECT id FROM rooms ORDER BY id LIMIT 1");
    $student_result = $conn->query("SELECT id FROM users WHERE role = 'student' ORDER BY id LIMIT 5");
    
    if (!$exam_result || !$room_result || !$student_result) {
        colored_output("✗ Could not retrieve sample data for allocations", 'red');
        return 0;
    }
    
    $exam_row = $exam_result->fetch_assoc();
    $room_row = $room_result->fetch_assoc();
    
    if (!$exam_row || !$room_row) {
        colored_output("✗ Not enough sample data for allocations", 'red');
        return 0;
    }
    
    $exam_id = $exam_row['id'];
    $room_id = $room_row['id'];
    
    $success_count = 0;
    
    while ($student_row = $student_result->fetch_assoc()) {
        $student_id = $student_row['id'];
        $seat_number = $success_count + 1;
        $created_at = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO allocations (student_id, exam_id, room_id, seat_number, created_at) VALUES ($student_id, $exam_id, $room_id, $seat_number, '$created_at')";
        
        if ($conn->query($sql) === TRUE) {
            colored_output("✓ Created allocation for student ID $student_id", 'green');
            $success_count++;
        } else {
            colored_output("✗ Error creating allocation: " . $conn->error, 'red');
        }
    }
    
    colored_output("Created $success_count sample allocations", 'blue');
    return $success_count;
}

function print_summary($results) {
    echo PHP_EOL;
    colored_output("╔══════════════════════════════════════════════════════════════╗", 'cyan');
    colored_output("║                        Summary                               ║", 'cyan');
    colored_output("╚══════════════════════════════════════════════════════════════╝", 'cyan');
    echo PHP_EOL;
    
    $total_created = 0;
    
    foreach ($results as $item => $count) {
        colored_output("$item: $count", 'green');
        $total_created += $count;
    }
    
    echo PHP_EOL;
    colored_output("Total sample records created: $total_created", 'blue');
}

function main() {
    print_header();
    
    $conn = connect_to_database();
    if (!$conn) {
        exit(1);
    }
    
    // Clear existing sample data
    clear_existing_data($conn);
    
    // Create sample data
    $results = [
        'Classes' => create_sample_classes($conn),
        'Rooms' => create_sample_rooms($conn),
        'Exams' => create_sample_exams($conn),
        'Students' => create_sample_students($conn),
        'Administrators' => create_sample_admins($conn),
        'Allocations' => create_sample_allocations($conn)
    ];
    
    $conn->close();
    
    print_summary($results);
    
    echo PHP_EOL;
    colored_output("Sample data creation completed!", 'green');
    colored_output("Default login credentials:", 'blue');
    colored_output("Admin: admin@example.com / admin123", 'blue');
    colored_output("Student: john.doe@example.com / student123", 'blue');
    echo PHP_EOL;
    colored_output("Visit your application to start using the sample data.", 'blue');
}

// Run the script
main();
?>