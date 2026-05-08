// src/pages/admin/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import { PageLoader, SectionHeader } from '../../components/ui';
import { useState } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState({});

  // TEMPORARY DEBUG - Remove this after testing
  console.log('AdminDashboard component is rendering');

  const { data: dash, isLoading } = useQuery({ 
    queryKey: ['admin-dash'], 
    queryFn: () => apiGet('/analytics/dashboard'),
    retry: false,
    refetchOnWindowFocus: false
  });

  if (isLoading) return <PageLoader />;

  // TEMPORARY DEBUG BANNER - Remove after testing
  const debugBanner = (
    <div style={{ 
      backgroundColor: '#10B981', 
      color: 'white', 
      padding: '20px', 
      textAlign: 'center', 
      fontWeight: 'bold',
      marginBottom: '20px',
      borderRadius: '10px'
    }}>
      ✅ ADMIN DASHBOARD IS LOADING CORRECTLY - This is the real dashboard component!
      <br />
      <small>API Data: {dash ? 'Loaded Successfully' : 'No Data'}</small>
    </div>
  );

  const d = dash?.data;

  return (
    <div className="space-y-7">
      {debugBanner}
      <SectionHeader
        eyebrow="Control Centre"
        title="Exam Admin Dashboard"
        subtitle={`Monitoring ${d?.kpis?.totalExams || 0} exams across ${d?.kpis?.totalHalls || 0} halls`}
        action={
          <button onClick={() => navigate('/admin/live')} className="btn btn-gold">
            ◉ Live Monitor →
          </button>
        }
      />

      {/* Simple KPI Display */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-navy">{d?.kpis?.totalExams || 0}</div>
          <div className="text-sm text-navy/60 mt-2">Total Exams</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-emerald-exam">{d?.kpis?.ongoingExams || 0}</div>
          <div className="text-sm text-navy/60 mt-2">Ongoing Now</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-gold">{(d?.kpis?.totalStudents || 0).toLocaleString()}</div>
          <div className="text-sm text-navy/60 mt-2">Total Students</div>
        </div>
        <div className="card card-md p-6 text-center">
          <div className="text-3xl font-bold text-navy">{d?.kpis?.attendanceRate || 0}%</div>
          <div className="text-sm text-navy/60 mt-2">Attendance Rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card card-md p-6">
        <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => navigate('/admin/allocation')} className="btn btn-gold">
            ✦ Run Allocation
          </button>
          <button onClick={() => navigate('/admin/live')} className="btn btn-emerald">
            ◉ Live Monitor
          </button>
          <button onClick={() => navigate('/admin/exams')} className="btn btn-navy">
            ◎ Create Exam
          </button>
          <button onClick={() => navigate('/admin/reports')} className="btn btn-navy">
            ◧ Export Report
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="card card-md p-4">
        <h4 className="font-bold mb-2">Debug Information:</h4>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({ 
            dashboardData: d ? 'Available' : 'Not Available',
            kpis: d?.kpis || 'No KPIs',
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}