<?php
/**
 * Database Configuration and Connection Class
 * 
 * This class handles database connections using PDO with proper error handling
 * and configuration management for the Exam Seat Allocation System.
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    private $options;

    /**
     * Constructor to initialize database configuration
     */
    public function __construct() {
        // Load configuration from config file
        $config = require_once __DIR__ . '/config.php';
        
        $db_config = $config['database'];
        
        $this->host = $db_config['host'];
        $this->db_name = $db_config['database'];
        $this->username = $db_config['username'];
        $this->password = $db_config['password'];
        
        // PDO options for better error handling and security
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true
        ];
    }

    /**
     * Get database connection
     * 
     * @return PDO|null Returns PDO connection or null on failure
     */
    public function getConnection() {
        try {
            if ($this->conn === null) {
                $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
                $this->conn = new PDO($dsn, $this->username, $this->password, $this->options);
            }
            return $this->conn;
        } catch (PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            return null;
        }
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * Execute a query with parameters
     * 
     * @param string $query SQL query
     * @param array $params Parameters for prepared statement
     * @return PDOStatement|false Returns statement on success, false on failure
     */
    public function executeQuery($query, $params = []) {
        try {
            $stmt = $this->getConnection()->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $exception) {
            error_log("Query execution error: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Begin transaction
     * 
     * @return bool True on success, false on failure
     */
    public function beginTransaction() {
        try {
            return $this->getConnection()->beginTransaction();
        } catch (PDOException $exception) {
            error_log("Transaction begin error: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Commit transaction
     * 
     * @return bool True on success, false on failure
     */
    public function commitTransaction() {
        try {
            return $this->getConnection()->commit();
        } catch (PDOException $exception) {
            error_log("Transaction commit error: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Rollback transaction
     * 
     * @return bool True on success, false on failure
     */
    public function rollbackTransaction() {
        try {
            return $this->getConnection()->rollback();
        } catch (PDOException $exception) {
            error_log("Transaction rollback error: " . $exception->getMessage());
            return false;
        }
    }
}