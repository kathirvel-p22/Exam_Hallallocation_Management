# Student Portal

The student portal provides a secure, department-specific interface for students to view their exam hall allocations and download reports.

## Features

### Dashboard (`dashboard.php`)

- Welcome section with student information
- Department allocation statistics
- Recent allocation overview
- Quick action buttons for common tasks
- Important information banner

### Allocations (`allocations.php`)

- View all department hall allocations
- Detailed view for specific halls
- Search functionality for hall names/numbers
- Allocation statistics and utilization percentages
- Progress bars for visual representation

### Reports (`reports.php`)

- Department summary statistics
- Individual hall reports
- CSV and PDF download options
- Export functionality for allocation data

### Profile (`profile.php`)

- Student personal information display
- Contact details
- Read-only information (managed by admin)

## Security Features

- **Authentication Required**: All pages require student login
- **Department Isolation**: Students can only see their own department's data
- **Role-Based Access**: No access to admin functionality
- **Session Validation**: Proper session management and validation
- **CSRF Protection**: Built-in CSRF token validation

## File Structure

```
student/
├── index.php              # Portal entry point (redirects to dashboard)
├── dashboard.php          # Main dashboard with statistics
├── allocations.php        # View allocation details
├── reports.php           # Download department reports
├── profile.php           # Student profile information
├── header.php            # Navigation header
├── footer.php            # Footer with links
├── css/
│   └── student.css       # Student-specific styling
└── js/
    └── student.js        # Student JavaScript functionality
```

## Database Integration

The student portal integrates with the following models:

- `AllocationModel`: For allocation data and statistics
- `ClassModel`: For department information
- `RoomModel`: For hall information

## Key Methods Used

### AllocationModel Methods

- `getDepartmentAllocationSummary()`: Department statistics
- `getRecentDepartmentAllocations()`: Recent allocation data
- `getDepartmentAllocations()`: All department allocations
- `getHallAllocationDetails()`: Specific hall information

## Styling

The student portal uses a clean, professional design with:

- Blue color scheme (`#2563eb`)
- Responsive grid layouts
- Card-based design elements
- Progress bars for utilization
- Mobile-friendly responsive design

## JavaScript Features

- Search functionality for allocations
- Download progress indicators
- Notification system
- Tooltip support
- Responsive navigation

## Access Control

Students access the portal through:

1. Authentication via `auth/protect_student.php`
2. Department-based data filtering
3. Role-based navigation and functionality
4. Secure session management

## Usage

1. Students log in through the main authentication system
2. Access is automatically restricted to student-only pages
3. All data is filtered by the student's department
4. Students can view allocations, download reports, and manage their profile

## Security Notes

- Students cannot access individual student names or register numbers
- No access to other department data
- View-only access to allocation results
- All downloads are department-specific
- Proper session validation on every page load
