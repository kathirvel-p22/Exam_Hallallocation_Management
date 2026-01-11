<?php
/**
 * System Configuration
 * 
 * This file contains all system configuration settings for the Exam Seat Allocation System.
 * It includes database settings, allocation rules, and system parameters.
 */

return [
    // Database Configuration
    'database' => [
        'host' => 'localhost',
        'database' => 'seat_management',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ],

    // Allocation Rules Configuration
    'allocation_rules' => [
        // Allow mixing of departments within same academic level
        'allow_department_mixing' => true,
        
        // Strict UG/PG separation (always true)
        'strict_ug_pg_separation' => true,
        
        // Strict shift separation (always true)
        'strict_shift_separation' => true,
        
        // Maximum percentage of room capacity that can be used
        'max_capacity_utilization' => 100,
        
        // Minimum percentage of room capacity that should be used
        'min_capacity_utilization' => 70,
        
        // Allow partial allocations (if class doesn't fit exactly)
        'allow_partial_allocations' => false,
        
        // Priority for exact matches (capacity exactly matches strength)
        'prioritize_exact_matches' => true
    ],

    // System Settings
    'system' => [
        // Enable detailed logging
        'enable_logging' => true,
        
        // Log file path
        'log_file' => __DIR__ . '/../logs/allocation.log',
        
        // Maximum number of allocation attempts per class
        'max_allocation_attempts' => 3,
        
        // Enable transaction rollback on failure
        'enable_rollback' => true,
        
        // Batch size for processing large datasets
        'batch_size' => 100
    ],

    // Validation Rules
    'validation' => [
        // Minimum class strength
        'min_class_strength' => 1,
        
        // Maximum class strength
        'max_class_strength' => 500,
        
        // Minimum room capacity
        'min_room_capacity' => 1,
        
        // Maximum room capacity
        'max_room_capacity' => 1000,
        
        // Valid shift types
        'valid_shifts' => ['morning', 'afternoon'],
        
        // Valid academic levels
        'valid_academic_levels' => ['UG', 'PG']
    ]
];