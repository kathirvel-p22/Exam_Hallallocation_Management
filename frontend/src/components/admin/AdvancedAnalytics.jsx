// Advanced analytics dashboard with interactive charts
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockData = {
      overview: {
        totalExams: 156,
        totalStudents: 2847,
        totalInvigilators: 89,
        averageAttendance: 94.2,
        trends: {
          exams: { change: 12.5, direction: 'up' },
          students: { change: 8.3, direction: 'up' },
          attendance: { change: -2.1, direction: 'down' }
        }
      },
      examMetrics: {
        byDepartment: [
          { name: 'Computer Science', exams: 45, students: 892, attendance: 96.2 },
          { name: 'Electronics', exams: 38, students: 654, attendance: 93.8 },
          { name: 'Mechanical', exams: 42, students: 743, attendance: 91.5 },
          { name: 'Civil', exams: 31, students: 558, attendance: 95.1 }
        ],
        byMonth: [
          { month: 'Jan', exams: 23, attendance: 94.5 },
          { month: 'Feb', exams: 28, attendance: 93.2 },
          { month: 'Mar', exams: 35, attendance: 95.8 },
          { month: 'Apr', exams: 31, attendance: 92.1 },
          { month: 'May', exams: 39, attendance: 96.3 }
        ]
      },
      performance: {
        hallUtilization: [
          { hall: 'Main Auditorium', capacity: 200, utilized: 185, percentage: 92.5 },
          { hall: 'Hall A', capacity: 150, utilized: 142, percentage: 94.7 },
          { hall: 'Hall B', capacity: 120, utilized: 108, percentage: 90.0 },
          { hall: 'Lab Complex', capacity: 80, utilized: 76, percentage: 95.0 }
        ],
        timeSlots: [
          { time: '9:00 AM', utilization: 85.2 },
          { time: '11:00 AM', utilization: 92.8 },
          { time: '2:00 PM', utilization: 78.5 },
          { time: '4:00 PM', utilization: 65.3 }
        ]
      },
      issues: {
        byType: [
          { type: 'Technical Issues', count: 23, severity: 'medium' },
          { type: 'Student Queries', count: 45, severity: 'low' },
          { type: 'Hall Problems', count: 12, severity: 'high' },
          { type: 'Invigilator Issues', count: 8, severity: 'medium' }
        ],
        resolution: {
          resolved: 78,
          pending: 10,
          averageTime: '2.3 hours'
        }
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const metrics = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'exams', label: 'Exam Analytics', icon: '📋' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'issues', label: 'Issues & Support', icon: '🔧' }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your examination system</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
            <nav className="space-y-2">
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedMetric === metric.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{metric.icon}</span>
                  <span className="font-medium text-sm">{metric.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={selectedMetric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview */}
            {selectedMetric === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Exams"
                    value={analyticsData.overview.totalExams}
                    change={analyticsData.overview.trends.exams}
                    icon="📋"
                  />
                  <MetricCard
                    title="Total Students"
                    value={analyticsData.overview.totalStudents.toLocaleString()}
                    change={analyticsData.overview.trends.students}
                    icon="🎓"
                  />
                  <MetricCard
                    title="Invigilators"
                    value={analyticsData.overview.totalInvigilators}
                    icon="👨‍🏫"
                  />
                  <MetricCard
                    title="Avg Attendance"
                    value={`${analyticsData.overview.averageAttendance}%`}
                    change={analyticsData.overview.trends.attendance}
                    icon="✅"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Exam Trends" type="line">
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      📈 Line Chart: Exam trends over time
                    </div>
                  </ChartCard>
                  
                  <ChartCard title="Department Distribution" type="pie">
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      🥧 Pie Chart: Students by department
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}

            {/* Exam Analytics */}
            {selectedMetric === 'exams' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exams by Department</h3>
                  <div className="space-y-4">
                    {analyticsData.examMetrics.byDepartment.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{dept.name}</h4>
                          <p className="text-sm text-gray-600">{dept.students} students</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{dept.exams}</div>
                          <div className="text-sm text-gray-500">{dept.attendance}% attendance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ChartCard title="Monthly Exam Trends">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    📊 Bar Chart: Exams and attendance by month
                  </div>
                </ChartCard>
              </div>
            )}

            {/* Performance */}
            {selectedMetric === 'performance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hall Utilization</h3>
                  <div className="space-y-4">
                    {analyticsData.performance.hallUtilization.map((hall, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{hall.hall}</span>
                          <span className="text-sm text-gray-600">
                            {hall.utilized}/{hall.capacity} ({hall.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${hall.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ChartCard title="Time Slot Utilization">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    📊 Bar Chart: Utilization by time slots
                  </div>
                </ChartCard>
              </div>
            )}

            {/* Issues */}
            {selectedMetric === 'issues' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analyticsData.issues.resolution.resolved}
                      </div>
                      <div className="text-sm text-gray-600">Issues Resolved</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {analyticsData.issues.resolution.pending}
                      </div>
                      <div className="text-sm text-gray-600">Pending Issues</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {analyticsData.issues.resolution.averageTime}
                      </div>
                      <div className="text-sm text-gray-600">Avg Resolution Time</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Type</h3>
                  <div className="space-y-4">
                    {analyticsData.issues.byType.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            issue.severity === 'high' ? 'bg-red-500' :
                            issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium text-gray-900">{issue.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{issue.count}</div>
                          <div className="text-xs text-gray-500 capitalize">{issue.severity} priority</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {change && (
          <div className={`flex items-center text-sm ${
            change.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-1">
              {change.direction === 'up' ? '↗️' : '↘️'}
            </span>
            {Math.abs(change.change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

// Chart Card Component
function ChartCard({ title, children, type }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            📊
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            ⚙️
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}