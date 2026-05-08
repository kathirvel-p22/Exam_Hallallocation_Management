// Debug version of admin dashboard
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';

export default function DebugDashboard() {
  const { data: dash, isLoading, error } = useQuery({ 
    queryKey: ['admin-dash'], 
    queryFn: () => apiGet('/analytics/dashboard'),
    retry: false
  });
  
  const { data: examsData, isLoading: examsLoading, error: examsError } = useQuery({ 
    queryKey: ['exams-today'], 
    queryFn: () => apiGet('/exams?limit=5'),
    retry: false
  });

  console.log('Dashboard Debug:', {
    dash,
    isLoading,
    error,
    examsData,
    examsLoading,
    examsError
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Dashboard - Loading...</h1>
        <div className="bg-blue-50 p-4 rounded">
          Loading analytics data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Dashboard - Error</h1>
        <div className="bg-red-50 p-4 rounded">
          <h3 className="font-bold text-red-800">Analytics API Error:</h3>
          <pre className="text-sm mt-2">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Dashboard - Success</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold text-green-800 mb-2">Analytics Data:</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(dash, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold text-blue-800 mb-2">Exams Data:</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(examsData, null, 2)}
          </pre>
        </div>
      </div>

      {dash?.data && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="font-bold mb-2">KPIs:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow">
              <div className="text-2xl font-bold">{dash.data.kpis?.totalExams || 0}</div>
              <div className="text-sm text-gray-600">Total Exams</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-2xl font-bold">{dash.data.kpis?.totalStudents || 0}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-2xl font-bold">{dash.data.kpis?.totalHalls || 0}</div>
              <div className="text-sm text-gray-600">Total Halls</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-2xl font-bold">{dash.data.kpis?.attendanceRate || 0}%</div>
              <div className="text-sm text-gray-600">Attendance Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}