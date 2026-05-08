# 📚 AcadeX API Documentation

## 🔗 **Base URL**
```
http://localhost:5000/api
```

## 🔐 **Authentication**
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔑 **Authentication Endpoints**

### **POST /auth/login**
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "role": "STUDENT",
      "institutionId": "institution-id",
      "student": {
        "id": "student-id",
        "name": "John Doe",
        "registerNo": "21CS001",
        "semester": 3,
        "department": {
          "name": "Computer Science & Engineering",
          "code": "CSE"
        }
      }
    }
  }
}
```

### **POST /auth/signup**
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT"
}
```

### **POST /auth/refresh**
Refresh access token using refresh token.

**Request:**
- Refresh token in cookies or request body

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

### **GET /auth/me**
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "STUDENT",
    "student": { /* student profile */ },
    "institution": { /* institution details */ }
  }
}
```

### **POST /auth/logout**
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

## 👥 **User Management Endpoints**

### **GET /users**
Get list of users (Admin only).

**Query Parameters:**
- `role`: Filter by user role
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### **GET /users/:id**
Get specific user details.

### **PUT /users/:id**
Update user information.

### **DELETE /users/:id**
Delete user account.

---

## 🎓 **Student Endpoints**

### **GET /students**
Get list of students.

### **GET /students/:id**
Get student profile with exam allocations.

### **PUT /students/:id**
Update student information.

### **GET /students/:id/allocations**
Get student's exam allocations.

### **GET /students/:id/hall-ticket/:examId**
Generate hall ticket for specific exam.

---

## 👨‍🏫 **Invigilator Endpoints**

### **GET /invigilators**
Get list of invigilators.

### **GET /invigilators/:id/duties**
Get invigilator's duty assignments.

### **POST /invigilators/:id/attendance**
Mark student attendance.

**Request Body:**
```json
{
  "examId": "exam-id",
  "studentId": "student-id",
  "status": "PRESENT",
  "timestamp": "2026-03-10T10:00:00Z"
}
```

---

## 📋 **Exam Management Endpoints**

### **GET /exams**
Get list of examinations.

**Query Parameters:**
- `status`: Filter by exam status
- `date`: Filter by exam date
- `department`: Filter by department

### **POST /exams**
Create new examination (Admin only).

**Request Body:**
```json
{
  "title": "Computer Networks Final Exam",
  "subject": "Computer Networks",
  "date": "2026-03-15",
  "startTime": "10:00",
  "endTime": "13:00",
  "duration": 180,
  "departmentId": "dept-id",
  "totalMarks": 100
}
```

### **GET /exams/:id**
Get specific exam details.

### **PUT /exams/:id**
Update exam information.

### **DELETE /exams/:id**
Delete examination.

### **POST /exams/:id/allocate**
Run allocation engine for exam.

---

## 🏢 **Hall Management Endpoints**

### **GET /halls**
Get list of examination halls.

### **POST /halls**
Create new hall.

**Request Body:**
```json
{
  "name": "Main Auditorium",
  "code": "MAIN-AUD",
  "capacity": 200,
  "location": "Ground Floor",
  "facilities": ["AC", "Projector", "CCTV"]
}
```

### **GET /halls/:id**
Get hall details with current allocations.

### **PUT /halls/:id**
Update hall information.

---

## 🎯 **Allocation Engine Endpoints**

### **POST /allocation/generate**
Generate seat allocations for exam.

**Request Body:**
```json
{
  "examId": "exam-id",
  "strategy": "DEPARTMENT_MIXING",
  "preferences": {
    "mixingRatio": 0.7,
    "disabilitySupport": true,
    "genderSeparation": false
  }
}
```

### **GET /allocation/exam/:examId**
Get allocations for specific exam.

### **POST /allocation/optimize**
Optimize existing allocations.

---

## 📊 **Analytics Endpoints**

### **GET /analytics/dashboard**
Get dashboard analytics data.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 1250,
    "totalExams": 45,
    "upcomingExams": 12,
    "activeInvigilators": 25,
    "hallUtilization": 78.5,
    "recentActivity": [...]
  }
}
```

### **GET /analytics/exam/:examId**
Get analytics for specific exam.

### **GET /analytics/attendance**
Get attendance statistics.

---

## 🔔 **Notification Endpoints**

### **GET /notifications**
Get user notifications.

### **POST /notifications**
Send notification (Admin only).

**Request Body:**
```json
{
  "title": "Exam Schedule Update",
  "message": "Computer Networks exam has been rescheduled",
  "type": "EXAM_UPDATE",
  "recipients": ["student-id-1", "student-id-2"],
  "priority": "HIGH"
}
```

### **PUT /notifications/:id/read**
Mark notification as read.

---

## 🤖 **AI Chat Endpoints**

### **POST /chat/message**
Send message to AI chatbot.

**Request Body:**
```json
{
  "message": "What time is my Computer Networks exam?",
  "context": {
    "userId": "user-id",
    "examId": "exam-id"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Your Computer Networks exam is scheduled for March 15, 2026 at 10:00 AM in Main Auditorium.",
    "confidence": 0.95,
    "sources": ["exam-schedule"]
  }
}
```

---

## 📱 **QR Code Endpoints**

### **GET /qr/hall-ticket/:studentId/:examId**
Generate QR code for hall ticket.

### **POST /qr/verify**
Verify QR code authenticity.

**Request Body:**
```json
{
  "qrData": "encrypted-qr-data",
  "examId": "exam-id"
}
```

---

## 📄 **File Upload Endpoints**

### **POST /upload/profile-photo**
Upload user profile photo.

**Request:** Multipart form data with image file

### **POST /upload/documents**
Upload exam-related documents.

### **GET /files/:fileId**
Download file by ID.

---

## 🔍 **Search Endpoints**

### **GET /search**
Global search across platform.

**Query Parameters:**
- `q`: Search query
- `type`: Search type (users, exams, halls)
- `filters`: Additional filters

---

## 📊 **Reporting Endpoints**

### **GET /reports/exam-summary/:examId**
Get comprehensive exam report.

### **GET /reports/attendance/:examId**
Get attendance report for exam.

### **POST /reports/custom**
Generate custom report.

**Request Body:**
```json
{
  "type": "ATTENDANCE_ANALYSIS",
  "dateRange": {
    "start": "2026-03-01",
    "end": "2026-03-31"
  },
  "filters": {
    "departments": ["CSE", "ECE"],
    "examTypes": ["FINAL", "MIDTERM"]
  },
  "format": "PDF"
}
```

---

## 🔧 **System Endpoints**

### **GET /system/health**
Check system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-10T12:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "storage": "available"
  },
  "metrics": {
    "uptime": 86400,
    "memoryUsage": "45%",
    "cpuUsage": "12%"
  }
}
```

### **GET /system/stats**
Get system statistics (Admin only).

---

## 🚨 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### **Common Error Codes:**
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 🔐 **Rate Limiting**

API endpoints are rate limited:
- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **File Upload**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646928000
```

---

## 📝 **Request/Response Examples**

### **Complete Login Flow**
```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'arjun@student.acadex.edu',
    password: 'Student@2025'
  })
});

const { data } = await loginResponse.json();
const token = data.accessToken;

// 2. Get user profile
const profileResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Get exam allocations
const allocationsResponse = await fetch(`/api/students/${data.user.student.id}/allocations`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🧪 **Testing the API**

### **Using cURL**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@student.acadex.edu","password":"Student@2025"}'

# Get profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Using Postman**
1. Import the API collection
2. Set base URL to `http://localhost:5000/api`
3. Add Authorization header with Bearer token
4. Test endpoints with sample data

---

## 📚 **SDK Examples**

### **JavaScript/Node.js**
```javascript
class AcadeXAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async getExams() {
    const response = await fetch(`${this.baseURL}/exams`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}
```

---

*API Documentation | Version 2.0.0 | Last Updated: March 10, 2026*