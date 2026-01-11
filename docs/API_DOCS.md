# API Documentation

This document provides comprehensive API documentation for the Exam Seat Allocation Management System, enabling developers to integrate with the system programmatically.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Base URL and Endpoints](#base-url-and-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoint Reference](#endpoint-reference)
7. [Examples](#examples)
8. [SDK and Libraries](#sdk-and-libraries)

## API Overview

The Exam Seat Allocation Management System provides a RESTful API that allows external applications to interact with the system programmatically. The API follows REST principles and uses JSON for data exchange.

### API Features

- **User Management**: Create, update, and manage user accounts
- **Examination Management**: Create and manage examination schedules
- **Seat Allocation**: Programmatic seat allocation and management
- **Room Management**: Manage examination rooms and capacity
- **Reporting**: Generate and retrieve system reports
- **Authentication**: Secure API access with token-based authentication

### API Versioning

The API uses versioning to ensure backward compatibility:

- **Current Version**: v1
- **Base URL**: `https://your-domain.com/api/v1/`
- **Future Versions**: Will be released as v2, v3, etc.

## Authentication

### JWT Authentication

The API uses JSON Web Tokens (JWT) for secure authentication.

#### Obtaining an API Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "username": "admin_user",
    "password": "secure_password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "admin_user",
      "role": "admin"
    }
  }
}
```

#### Using the API Token

Include the token in the Authorization header for all API requests:

```http
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Authentication (Alternative)

For server-to-server communication, API keys can be used:

```http
GET /api/v1/exams
X-API-Key: your_api_key_here
```

### Authentication Errors

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "details": "Please login again to obtain a new token"
  }
}
```

## Base URL and Endpoints

### Base URL

```
https://your-domain.com/api/v1/
```

### Available Endpoints

| Method | Endpoint               | Description             | Authentication        |
| ------ | ---------------------- | ----------------------- | --------------------- |
| POST   | `/auth/login`          | User authentication     | None                  |
| POST   | `/auth/logout`         | User logout             | Required              |
| GET    | `/users`               | List users              | Required (Admin)      |
| POST   | `/users`               | Create user             | Required (Admin)      |
| GET    | `/users/{id}`          | Get user details        | Required              |
| PUT    | `/users/{id}`          | Update user             | Required (Admin/Self) |
| DELETE | `/users/{id}`          | Delete user             | Required (Admin)      |
| GET    | `/exams`               | List examinations       | Required              |
| POST   | `/exams`               | Create examination      | Required (Admin)      |
| GET    | `/exams/{id}`          | Get examination details | Required              |
| PUT    | `/exams/{id}`          | Update examination      | Required (Admin)      |
| DELETE | `/exams/{id}`          | Delete examination      | Required (Admin)      |
| GET    | `/rooms`               | List rooms              | Required              |
| POST   | `/rooms`               | Create room             | Required (Admin)      |
| GET    | `/rooms/{id}`          | Get room details        | Required              |
| PUT    | `/rooms/{id}`          | Update room             | Required (Admin)      |
| DELETE | `/rooms/{id}`          | Delete room             | Required (Admin)      |
| GET    | `/allocations`         | List allocations        | Required              |
| POST   | `/allocations`         | Create allocation       | Required (Admin)      |
| GET    | `/allocations/{id}`    | Get allocation details  | Required              |
| PUT    | `/allocations/{id}`    | Update allocation       | Required (Admin)      |
| DELETE | `/allocations/{id}`    | Delete allocation       | Required (Admin)      |
| POST   | `/allocations/batch`   | Batch allocation        | Required (Admin)      |
| GET    | `/reports/allocations` | Allocation report       | Required (Admin)      |
| GET    | `/reports/rooms`       | Room utilization report | Required (Admin)      |
| GET    | `/reports/users`       | User report             | Required (Admin)      |

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2024-12-15T10:30:00Z"
  }
}
```

### Common Error Codes

| Code               | HTTP Status | Description                         |
| ------------------ | ----------- | ----------------------------------- |
| `VALIDATION_ERROR` | 400         | Request validation failed           |
| `UNAUTHORIZED`     | 401         | Authentication required or failed   |
| `FORBIDDEN`        | 403         | Insufficient permissions            |
| `NOT_FOUND`        | 404         | Resource not found                  |
| `CONFLICT`         | 409         | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED`     | 429         | Rate limit exceeded                 |
| `INTERNAL_ERROR`   | 500         | Internal server error               |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "email": ["The email field is required."],
      "password": ["Password must be at least 8 characters long."]
    },
    "timestamp": "2024-12-15T10:30:00Z"
  }
}
```

## Rate Limiting

### Rate Limit Policy

The API implements rate limiting to ensure fair usage and system stability:

- **Authentication Endpoints**: 5 requests per minute per IP
- **User Management**: 60 requests per minute per user
- **Examination Management**: 100 requests per minute per user
- **Allocation Operations**: 30 requests per minute per user
- **Report Generation**: 10 requests per minute per user

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1608076800
```

### Handling Rate Limits

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "details": "Too many requests. Please wait before trying again.",
    "retry_after": 60
  }
}
```

## Endpoint Reference

### Authentication Endpoints

#### POST /auth/login

Authenticate a user and receive an API token.

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required)",
  "remember_me": "boolean (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "expires_in": "integer",
    "user": {
      "id": "integer",
      "username": "string",
      "email": "string",
      "role": "string",
      "name": "string"
    }
  }
}
```

#### POST /auth/logout

Logout the current user and invalidate the token.

**Response:**

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### User Management Endpoints

#### GET /users

List all users (Admin only).

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `role`: Filter by role (admin/student)
- `search`: Search term for name/email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "student",
        "created_at": "2024-12-15T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

#### POST /users

Create a new user.

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "role": "string (required: admin/student)",
  "password": "string (required, min 8 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

#### GET /users/{id}

Get user details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2024-12-15T10:30:00Z"
  }
}
```

#### PUT /users/{id}

Update user information.

**Request Body:**

```json
{
  "name": "string (optional)",
  "email": "string (optional, unique)",
  "role": "string (optional: admin/student)",
  "password": "string (optional, min 8 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "updated_at": "2024-12-15T10:30:00Z"
  }
}
```

#### DELETE /users/{id}

Delete a user.

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Examination Management Endpoints

#### GET /exams

List all examinations.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (scheduled/completed/cancelled)
- `date_from`: Filter from date
- `date_to`: Filter to date

**Response:**

```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": 1,
        "name": "Mathematics Final Examination",
        "exam_date": "2024-12-15",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "duration": 180,
        "status": "scheduled",
        "created_at": "2024-12-10T08:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 50,
      "items_per_page": 20
    }
  }
}
```

#### POST /exams

Create a new examination.

**Request Body:**

```json
{
  "name": "string (required)",
  "exam_date": "string (required, YYYY-MM-DD)",
  "start_time": "string (required, HH:MM:SS)",
  "end_time": "string (required, HH:MM:SS)",
  "duration": "integer (required, minutes)",
  "status": "string (optional: scheduled/completed/cancelled)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mathematics Final Examination",
    "exam_date": "2024-12-15",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "duration": 180,
    "status": "scheduled",
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

#### GET /exams/{id}

Get examination details.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mathematics Final Examination",
    "exam_date": "2024-12-15",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "duration": 180,
    "status": "scheduled",
    "created_at": "2024-12-10T08:00:00Z",
    "updated_at": "2024-12-15T10:00:00Z"
  }
}
```

#### PUT /exams/{id}

Update examination information.

**Request Body:**

```json
{
  "name": "string (optional)",
  "exam_date": "string (optional, YYYY-MM-DD)",
  "start_time": "string (optional, HH:MM:SS)",
  "end_time": "string (optional, HH:MM:SS)",
  "duration": "integer (optional, minutes)",
  "status": "string (optional: scheduled/completed/cancelled)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mathematics Final Examination",
    "exam_date": "2024-12-15",
    "start_time": "09:00:00",
    "end_time": "12:00:00",
    "duration": 180,
    "status": "scheduled",
    "updated_at": "2024-12-15T10:30:00Z"
  }
}
```

#### DELETE /exams/{id}

Delete an examination.

**Response:**

```json
{
  "success": true,
  "message": "Examination deleted successfully"
}
```

### Seat Allocation Endpoints

#### GET /allocations

List all seat allocations.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `exam_id`: Filter by examination
- `user_id`: Filter by user
- `room_id`: Filter by room

**Response:**

```json
{
  "success": true,
  "data": {
    "allocations": [
      {
        "id": 1,
        "user_id": 123,
        "room_id": 1,
        "seat_no": "A15",
        "exam_id": 1,
        "allocated_at": "2024-12-15T08:00:00Z",
        "status": "confirmed"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "items_per_page": 20
    }
  }
}
```

#### POST /allocations

Create a new seat allocation.

**Request Body:**

```json
{
  "user_id": "integer (required)",
  "room_id": "integer (required)",
  "seat_no": "string (required)",
  "exam_id": "integer (required)",
  "status": "string (optional: confirmed/pending/cancelled)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "room_id": 1,
    "seat_no": "A15",
    "exam_id": 1,
    "allocated_at": "2024-12-15T08:00:00Z",
    "status": "confirmed"
  }
}
```

#### POST /allocations/batch

Perform batch seat allocation for multiple students.

**Request Body:**

```json
{
  "exam_id": "integer (required)",
  "students": [
    {
      "user_id": "integer (required)",
      "preferences": {
        "room_id": "integer (optional)",
        "special_needs": "boolean (optional)"
      }
    }
  ],
  "allocation_strategy": "string (optional: random/class_separation/optimized)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_allocated": 50,
    "allocations": [
      {
        "user_id": 123,
        "room_id": 1,
        "seat_no": "A15",
        "exam_id": 1,
        "status": "confirmed"
      }
    ],
    "errors": [
      {
        "user_id": 456,
        "error": "No available seats in preferred room"
      }
    ]
  }
}
```

### Room Management Endpoints

#### GET /rooms

List all examination rooms.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active/inactive)
- `capacity_min`: Minimum capacity
- `capacity_max`: Maximum capacity

**Response:**

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Examination Hall A",
        "capacity": 100,
        "floor": "1st Floor",
        "status": "active",
        "created_at": "2024-12-01T09:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 25,
      "items_per_page": 20
    }
  }
}
```

#### POST /rooms

Create a new examination room.

**Request Body:**

```json
{
  "name": "string (required)",
  "capacity": "integer (required)",
  "floor": "string (optional)",
  "status": "string (optional: active/inactive)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Examination Hall A",
    "capacity": 100,
    "floor": "1st Floor",
    "status": "active",
    "created_at": "2024-12-15T10:00:00Z"
  }
}
```

### Report Endpoints

#### GET /reports/allocations

Generate allocation report.

**Query Parameters:**

- `exam_id`: Filter by examination (required)
- `format`: Output format (json/pdf/csv)
- `include_details`: Include detailed information (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "exam_id": 1,
    "exam_name": "Mathematics Final Examination",
    "total_students": 500,
    "total_rooms": 5,
    "allocations": [
      {
        "user_id": 123,
        "name": "John Doe",
        "room_id": 1,
        "room_name": "Examination Hall A",
        "seat_no": "A15",
        "status": "confirmed"
      }
    ],
    "summary": {
      "rooms_used": 5,
      "average_utilization": "85%",
      "special_accommodations": 12
    }
  }
}
```

## Examples

### JavaScript Example

```javascript
// Configuration
const API_BASE_URL = "https://your-domain.com/api/v1";
const API_TOKEN = "your_api_token_here";

// Helper function for API requests
async function apiRequest(endpoint, method = "GET", data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

// Example: Get all examinations
async function getExaminations() {
  try {
    const exams = await apiRequest("exams");
    console.log("Examinations:", exams);
    return exams;
  } catch (error) {
    console.error("Error fetching examinations:", error.message);
  }
}

// Example: Create a new user
async function createUser(userData) {
  try {
    const user = await apiRequest("users", "POST", userData);
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error.message);
  }
}

// Example: Allocate seats for an examination
async function allocateSeats(examId, students) {
  try {
    const result = await apiRequest("allocations/batch", "POST", {
      exam_id: examId,
      students: students,
      allocation_strategy: "optimized",
    });
    console.log("Allocation result:", result);
    return result;
  } catch (error) {
    console.error("Error allocating seats:", error.message);
  }
}
```

### Python Example

```python
import requests
import json

class ExamSystemAPI:
    def __init__(self, base_url, api_token):
        self.base_url = base_url
        self.api_token = api_token
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}'
        }

    def _make_request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}/api/v1/{endpoint}"

        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=self.headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=self.headers)

            response.raise_for_status()
            result = response.json()

            if not result.get('success'):
                raise Exception(result.get('error', {}).get('message', 'Unknown error'))

            return result.get('data')

        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None
        except Exception as e:
            print(f"API error: {e}")
            return None

    def get_examinations(self, status=None):
        """Get list of examinations"""
        params = {}
        if status:
            params['status'] = status

        endpoint = f"exams?{ '&'.join([f'{k}={v}' for k, v in params.items()]) }"
        return self._make_request(endpoint)

    def create_user(self, user_data):
        """Create a new user"""
        return self._make_request('users', 'POST', user_data)

    def allocate_seats(self, exam_id, students, strategy='optimized'):
        """Allocate seats for multiple students"""
        data = {
            'exam_id': exam_id,
            'students': students,
            'allocation_strategy': strategy
        }
        return self._make_request('allocations/batch', 'POST', data)

    def get_allocation_report(self, exam_id, format='json'):
        """Get allocation report"""
        return self._make_request(f'reports/allocations?exam_id={exam_id}&format={format}')

# Usage example
if __name__ == "__main__":
    api = ExamSystemAPI('https://your-domain.com', 'your_api_token')

    # Get all scheduled examinations
    exams = api.get_examinations(status='scheduled')
    print("Scheduled examinations:", exams)

    # Create a new user
    new_user = {
        'name': 'Jane Doe',
        'email': 'jane.doe@example.com',
        'role': 'student',
        'password': 'securepassword123'
    }
    user = api.create_user(new_user)
    print("Created user:", user)

    # Allocate seats for an examination
    students = [
        {'user_id': 123, 'preferences': {'special_needs': True}},
        {'user_id': 456, 'preferences': {'room_id': 1}}
    ]
    allocation_result = api.allocate_seats(1, students)
    print("Allocation result:", allocation_result)
```

### PHP Example

```php
<?php
class ExamSystemAPI {
    private $baseUrl;
    private $apiToken;
    private $headers;

    public function __construct($baseUrl, $apiToken) {
        $this->baseUrl = $baseUrl;
        $this->apiToken = $apiToken;
        $this->headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiToken
        ];
    }

    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . '/api/v1/' . $endpoint;

        $options = [
            'http' => [
                'header' => $this->headers,
                'method' => $method,
                'content' => $data ? json_encode($data) : null
            ]
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        if ($result === FALSE) {
            throw new Exception("API request failed");
        }

        $response = json_decode($result, true);

        if (!$response['success']) {
            throw new Exception($response['error']['message']);
        }

        return $response['data'];
    }

    public function getExaminations($status = null) {
        $endpoint = 'exams';
        if ($status) {
            $endpoint .= '?status=' . $status;
        }
        return $this->makeRequest($endpoint);
    }

    public function createUser($userData) {
        return $this->makeRequest('users', 'POST', $userData);
    }

    public function allocateSeats($examId, $students, $strategy = 'optimized') {
        $data = [
            'exam_id' => $examId,
            'students' => $students,
            'allocation_strategy' => $strategy
        ];
        return $this->makeRequest('allocations/batch', 'POST', $data);
    }

    public function getAllocationReport($examId, $format = 'json') {
        return $this->makeRequest("reports/allocations?exam_id={$examId}&format={$format}");
    }
}

// Usage example
$api = new ExamSystemAPI('https://your-domain.com', 'your_api_token');

try {
    // Get examinations
    $exams = $api->getExaminations('scheduled');
    print_r($exams);

    // Create user
    $userData = [
        'name' => 'John Smith',
        'email' => 'john.smith@example.com',
        'role' => 'student',
        'password' => 'securepassword123'
    ];
    $user = $api->createUser($userData);
    print_r($user);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

## SDK and Libraries

### Official SDKs

Currently available SDKs:

- **JavaScript/Node.js**: `@exam-system/api-client`
- **Python**: `exam-system-api`
- **PHP**: `exam-system/api-client`

### Installation

#### JavaScript/Node.js

```bash
npm install @exam-system/api-client
```

#### Python

```bash
pip install exam-system-api
```

#### PHP

```bash
composer require exam-system/api-client
```

### Community Libraries

The community has developed additional libraries for various programming languages:

- **Java**: `exam-system-java-client`
- **C#/.NET**: `ExamSystem.Api.Client`
- **Ruby**: `exam_system_api`
- **Go**: `exam-system-go`

### Contributing to SDKs

If you'd like to contribute to or request new SDKs:

1. **Fork the repository** on GitHub
2. **Follow the contribution guidelines**
3. **Submit a pull request** with your changes
4. **Join the developer community** for discussions

### API Testing Tools

#### Postman Collection

Download the official Postman collection for testing API endpoints:

- [Exam System API Postman Collection](https://example.com/postman-collection.json)

#### Swagger/OpenAPI

Access the interactive API documentation:

- [API Documentation](https://your-domain.com/api/docs)

#### cURL Examples

```bash
# Get all examinations
curl -X GET "https://your-domain.com/api/v1/exams" \
  -H "Authorization: Bearer your_token_here"

# Create a new user
curl -X POST "https://your-domain.com/api/v1/users" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "student",
    "password": "securepassword123"
  }'
```

This API documentation provides everything developers need to integrate with the Exam Seat Allocation Management System. For additional support or questions, please contact our developer support team.
