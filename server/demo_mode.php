<?php
/**
 * Demo Mode for Exam Seat Allocation Management System
 * 
 * Creates sample data and provides an interactive demo of the system functionality.
 */

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
$projectRoot = dirname(__DIR__);
require_once $projectRoot . '/config/database.php';

class DemoMode
{
    private $conn;
    private $verbose;

    public function __construct($verbose = false)
    {
        $this->verbose = $verbose;
        $this->connect();
    }

    private function connect()
    {
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
        } catch (Exception $e) {
            echo "❌ Database connection failed: " . $e->getMessage() . "\n";
            exit(1);
        }
    }

    public function run()
    {
        echo "🎭 Starting Demo Mode...\n";
        echo "========================\n\n";

        // Clear existing demo data
        $this->clearDemoData();

        // Create sample data
        $this->createSampleData();

        // Show demo information
        $this->showDemoInfo();

        echo "\n✅ Demo mode setup complete!\n";
        echo "🌐 Visit http://localhost:8000 to explore the system\n";
        echo "💡 Sample login credentials are shown above\n";
    }

    private function clearDemoData()
    {
        if ($this->verbose) {
            echo "🧹 Clearing existing demo data...\n";
        }

        // Clear demo data (be careful not to delete real data)
        $tables = ['allocations', 'students', 'classes', 'rooms', 'exams'];

        foreach ($tables as $table) {
            // Only clear if table exists and has demo data
            $checkQuery = "SELECT COUNT(*) as count FROM $table";
            $result = $this->conn->query($checkQuery);

            if ($result && $row = $result->fetch_assoc()) {
                if ($row['count'] < 100) { // Only clear small datasets (likely demo data)
                    $this->conn->query("DELETE FROM $table WHERE id > 0");
                    if ($this->verbose) {
                        echo "   Cleared $table table\n";
                    }
                }
            }
        }
    }

    private function createSampleData()
    {
        echo "📝 Creating sample data...\n";

        // Create sample rooms
        $this->createSampleRooms();

        // Create sample classes
        $this->createSampleClasses();

        // Create sample exams
        $this->createSampleExams();

        // Create sample students
        $this->createSampleStudents();

        // Create sample allocations
        $this->createSampleAllocations();

        // Create demo admin user
        $this->createDemoAdmin();

        // Create demo student users
        $this->createDemoStudents();
    }

    private function createSampleRooms()
    {
        $rooms = [
            ['name' => 'Room A101', 'capacity' => 30, 'layout' => 'rows', 'description' => 'Main lecture hall'],
            ['name' => 'Room B202', 'capacity' => 25, 'layout' => 'rows', 'description' => 'Computer lab'],
            ['name' => 'Room C303', 'capacity' => 20, 'layout' => 'rows', 'description' => 'Seminar room'],
            ['name' => 'Room D404', 'capacity' => 35, 'layout' => 'rows', 'description' => 'Large classroom'],
            ['name' => 'Room E505', 'capacity' => 15, 'layout' => 'rows', 'description' => 'Small discussion room']
        ];

        foreach ($rooms as $room) {
            $stmt = $this->conn->prepare("INSERT INTO rooms (name, capacity, layout, description) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("siss", $room['name'], $room['capacity'], $room['layout'], $room['description']);
            $stmt->execute();
        }

        if ($this->verbose) {
            echo "   Created 5 sample rooms\n";
        }
    }

    private function createSampleClasses()
    {
        $classes = [
            ['name' => 'Computer Science 101', 'code' => 'CS101', 'year' => 2024, 'semester' => 'Fall'],
            ['name' => 'Mathematics 201', 'code' => 'MATH201', 'year' => 2024, 'semester' => 'Fall'],
            ['name' => 'Physics 150', 'code' => 'PHYS150', 'year' => 2024, 'semester' => 'Fall'],
            ['name' => 'English Literature', 'code' => 'ENG101', 'year' => 2024, 'semester' => 'Fall'],
            ['name' => 'History 101', 'code' => 'HIST101', 'year' => 2024, 'semester' => 'Fall']
        ];

        foreach ($classes as $class) {
            $stmt = $this->conn->prepare("INSERT INTO classes (name, code, year, semester) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssis", $class['name'], $class['code'], $class['year'], $class['semester']);
            $stmt->execute();
        }

        if ($this->verbose) {
            echo "   Created 5 sample classes\n";
        }
    }

    private function createSampleExams()
    {
        $exams = [
            ['name' => 'Midterm Exam', 'date' => date('Y-m-d', strtotime('+1 week')), 'time' => '09:00:00', 'duration' => 120],
            ['name' => 'Final Exam', 'date' => date('Y-m-d', strtotime('+4 weeks')), 'time' => '14:00:00', 'duration' => 180],
            ['name' => 'Quiz 1', 'date' => date('Y-m-d', strtotime('+2 weeks')), 'time' => '10:00:00', 'duration' => 60],
            ['name' => 'Project Presentation', 'date' => date('Y-m-d', strtotime('+3 weeks')), 'time' => '13:00:00', 'duration' => 90]
        ];

        foreach ($exams as $exam) {
            $stmt = $this->conn->prepare("INSERT INTO exams (name, date, time, duration) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sssi", $exam['name'], $exam['date'], $exam['time'], $exam['duration']);
            $stmt->execute();
        }

        if ($this->verbose) {
            echo "   Created 4 sample exams\n";
        }
    }

    private function createSampleStudents()
    {
        $students = [
            ['name' => 'John Smith', 'roll_number' => 'CS2024001', 'email' => 'john.smith@example.com', 'class_id' => 1],
            ['name' => 'Sarah Johnson', 'roll_number' => 'CS2024002', 'email' => 'sarah.johnson@example.com', 'class_id' => 1],
            ['name' => 'Michael Brown', 'roll_number' => 'MATH2024001', 'email' => 'michael.brown@example.com', 'class_id' => 2],
            ['name' => 'Emily Davis', 'roll_number' => 'MATH2024002', 'email' => 'emily.davis@example.com', 'class_id' => 2],
            ['name' => 'David Wilson', 'roll_number' => 'PHYS2024001', 'email' => 'david.wilson@example.com', 'class_id' => 3],
            ['name' => 'Lisa Anderson', 'roll_number' => 'PHYS2024002', 'email' => 'lisa.anderson@example.com', 'class_id' => 3],
            ['name' => 'James Taylor', 'roll_number' => 'ENG2024001', 'email' => 'james.taylor@example.com', 'class_id' => 4],
            ['name' => 'Jessica Martinez', 'roll_number' => 'ENG2024002', 'email' => 'jessica.martinez@example.com', 'class_id' => 4],
            ['name' => 'Robert Thompson', 'roll_number' => 'HIST2024001', 'email' => 'robert.thompson@example.com', 'class_id' => 5],
            ['name' => 'Amanda White', 'roll_number' => 'HIST2024002', 'email' => 'amanda.white@example.com', 'class_id' => 5]
        ];

        foreach ($students as $student) {
            $stmt = $this->conn->prepare("INSERT INTO students (name, roll_number, email, class_id) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sssi", $student['name'], $student['roll_number'], $student['email'], $student['class_id']);
            $stmt->execute();
        }

        if ($this->verbose) {
            echo "   Created 10 sample students\n";
        }
    }

    private function createSampleAllocations()
    {
        // Get exam and room IDs for allocations
        $examResult = $this->conn->query("SELECT id FROM exams LIMIT 1");
        $roomResult = $this->conn->query("SELECT id FROM rooms LIMIT 1");

        if ($examResult->num_rows > 0 && $roomResult->num_rows > 0) {
            $examId = $examResult->fetch_assoc()['id'];
            $roomId = $roomResult->fetch_assoc()['id'];

            // Create some sample allocations
            $allocations = [
                ['student_id' => 1, 'exam_id' => $examId, 'room_id' => $roomId, 'seat_number' => 'A1'],
                ['student_id' => 2, 'exam_id' => $examId, 'room_id' => $roomId, 'seat_number' => 'A2'],
                ['student_id' => 3, 'exam_id' => $examId, 'room_id' => $roomId, 'seat_number' => 'A3'],
                ['student_id' => 4, 'exam_id' => $examId, 'room_id' => $roomId, 'seat_number' => 'A4'],
                ['student_id' => 5, 'exam_id' => $examId, 'room_id' => $roomId, 'seat_number' => 'A5']
            ];

            foreach ($allocations as $allocation) {
                $stmt = $this->conn->prepare("INSERT INTO allocations (student_id, exam_id, room_id, seat_number) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiis", $allocation['student_id'], $allocation['exam_id'], $allocation['room_id'], $allocation['seat_number']);
                $stmt->execute();
            }

            if ($this->verbose) {
                echo "   Created 5 sample allocations\n";
            }
        }
    }

    private function createDemoAdmin()
    {
        // Create demo admin user
        $username = 'demo_admin';
        $password = password_hash('demo123', PASSWORD_DEFAULT);
        $email = 'demo@admin.com';
        $role = 'admin';

        $stmt = $this->conn->prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $username, $password, $email, $role);
        $stmt->execute();

        if ($this->verbose) {
            echo "   Created demo admin user\n";
        }
    }

    private function createDemoStudents()
    {
        // Create demo student users
        $students = [
            ['username' => 'demo_student1', 'password' => 'student123', 'email' => 'demo@student1.com', 'role' => 'student'],
            ['username' => 'demo_student2', 'password' => 'student123', 'email' => 'demo@student2.com', 'role' => 'student']
        ];

        foreach ($students as $student) {
            $passwordHash = password_hash($student['password'], PASSWORD_DEFAULT);
            $stmt = $this->conn->prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $student['username'], $passwordHash, $student['email'], $student['role']);
            $stmt->execute();
        }

        if ($this->verbose) {
            echo "   Created 2 demo student users\n";
        }
    }

    private function showDemoInfo()
    {
        echo "\n🎯 Demo Data Summary:\n";
        echo "======================\n";

        // Count created data
        $tables = [
            'rooms' => 'Rooms',
            'classes' => 'Classes',
            'exams' => 'Exams',
            'students' => 'Students',
            'allocations' => 'Allocations',
            'users' => 'Users'
        ];

        foreach ($tables as $table => $name) {
            $result = $this->conn->query("SELECT COUNT(*) as count FROM $table");
            if ($result && $row = $result->fetch_assoc()) {
                echo "   $name: {$row['count']}\n";
            }
        }

        echo "\n🔑 Demo Login Credentials:\n";
        echo "===========================\n";
        echo "   Admin: demo_admin / demo123\n";
        echo "   Student: demo_student1 / student123\n";
        echo "   Student: demo_student2 / student123\n";

        echo "\n💡 Demo Features:\n";
        echo "==================\n";
        echo "   • View sample rooms and their layouts\n";
        echo "   • Explore class and exam management\n";
        echo "   • See student allocation examples\n";
        echo "   • Test admin and student interfaces\n";
        echo "   • Generate reports with sample data\n";
    }

    public function __destruct()
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

// Run demo if called directly
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    $verbose = isset($argv) && in_array('--verbose', $argv);
    $demo = new DemoMode($verbose);
    $demo->run();
}