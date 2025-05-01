import { useState, useEffect } from "react";
import { PieChart, BarChart, LineChart } from "../../components/Charts";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { 
  FiUsers, 
  FiCalendar, 
  FiClipboard, 
  FiPieChart, 
  FiAward,
  FiTrendingUp
} from "react-icons/fi";
import { CircularProgress, Alert, Button } from "@mui/material";

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Only mock other data, not enrollment stats
  if (import.meta.env.MODE === 'development' && endpoint !== '/api/students/enrollment-stats') {
    console.log(`Mocking API call to ${endpoint}`);
    return new Promise(resolve => {
      setTimeout(() => {
        if (endpoint === '/api/students/gender-distribution') {
          resolve({ 
            success: true,
            distribution: { 
              Male: 4,
              Female: 7,
              Other: 0
            }
          });
        } else {
          resolve({ 
            students: Array(11).fill({}).map((_, i) => ({
              student_id: i+1,
              first_name: ['Sophia', 'Liam', 'Ethan', 'Isabella', 'Mia', 'Chloe', 'Ella', 'Lucas', 'Aria', 'Samantha', 'asdfg'][i],
              last_name: ['Reyes', 'Santos', 'Cruz', 'Lopez', 'Gonzales', 'Torres', 'Flores', 'Ramos', 'Delos Reyes', 'Navarro', 'zxcv'][i],
              gender: ['Female', 'Male', 'Male', 'Female', 'Female', 'Female', 'Female', 'Male', 'Female', 'Female', 'Male'][i]
            })),
            attendance: Array(11).fill({ status: 'Present' }),
            data: {
              'Self-Help': { first: { yes: 8, total: 11 } },
              'Cognitive': { first: { yes: 7, total: 11 } },
              'Language': { first: { yes: 7, total: 11 } },
              'Social': { first: { yes: 6, total: 11 } },
              'Physical': { first: { yes: 6, total: 11 } }
            }
          });
        }
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: null,
    stats: {
      totalStudents: 0,
      currentMonthEnrollments: 0,
      enrollmentDifference: 0,
      attendanceRate: 0,
      ageGroups: { '3-4': 0, '4-5': 0, '5-6': 0 },
      genderDistribution: { Male: 0, Female: 0, Other: 0 },
      domainProgress: []
    },
    recentEvaluations: []
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all data in parallel
        const [genderRes, enrollmentRes, studentsRes, attendanceRes, domainsRes] = await Promise.all([
          apiRequest('/api/students/gender-distribution'),
          apiRequest('/api/students/enrollment-stats'), // Real endpoint
          apiRequest('/api/students'),
          apiRequest('/api/attendance'),
          apiRequest('/api/domains/evaluations/scores/sample')
        ]);

        // Process enrollment stats from real endpoint
        const enrollmentStats = enrollmentRes.success ? enrollmentRes.stats : {
          total: 0,
          currentMonthEnrollments: 0,
          lastMonthEnrollments: 0,
          difference: 0
        };

        // Process gender distribution
        const genderDistribution = genderRes.success ? genderRes.distribution : { Male: 0, Female: 0, Other: 0 };

        // Process other data
        const ageGroups = { '3-4': 5, '4-5': 4, '5-6': 2 }; // Example age distribution
        const domainProgress = [
          { name: 'Self-Help', progress: '72.7' },  // 8/11
          { name: 'Cognitive', progress: '63.6' },   // 7/11
          { name: 'Language', progress: '63.6' },    // 7/11
          { name: 'Social', progress: '54.5' },      // 6/11
          { name: 'Physical', progress: '54.5' }     // 6/11
        ];

        setDashboardData({
          loading: false,
          error: null,
          stats: {
            totalStudents: enrollmentStats.total,
            newThisMonth: enrollmentStats.currentMonthEnrollments,
            enrollmentDifference: enrollmentStats.difference,
            attendanceRate: 85, // Example attendance rate
            ageGroups,
            genderDistribution,
            domainProgress
          },
          recentEvaluations: [
            { evaluation_period: "1st Quarter", average_score: 70 },
            { evaluation_period: "2nd Quarter", average_score: 75 },
            { evaluation_period: "3rd Quarter", average_score: 72 }
          ]
        });

      } catch (err) {
        console.error("Dashboard error:", err);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="p-6">
          <Alert severity="error" className="mb-4">
            Error loading dashboard: {dashboardData.error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        {/* Navbar */}
        <Navbar />
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">CDC Analytics Dashboard</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
  icon={<FiUsers className="text-blue-500" size={24} />}
  title="Total Students"
  value={dashboardData.stats.totalStudents}
  subtitle={<span className="text-green-500"> 
    {dashboardData.stats.newThisMonth} new this month
  </span>}
/>
            <StatCard 
              icon={<FiCalendar className="text-green-500" size={24} />}
              title="Attendance Rate"
              value={`${dashboardData.stats.attendanceRate}%`}
              trend="2% improvement"
            />
            <StatCard 
              icon={<FiAward className="text-amber-500" size={24} />}
              title="Avg. Progress"
              value="68%"
              trend="4 domains mastered"
            />
            <StatCard 
              icon={<FiClipboard className="text-purple-500" size={24} />}
              title="Pending Evals"
              value="8"
              trend="Due this week"
            />
          </div>

          {/* Data Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPieChart className="text-pink-500" /> Gender Distribution
              </h3>
              <div className="h-64">
                <PieChart
                  data={Object.entries(dashboardData.stats.genderDistribution).map(([gender, count]) => ({
                    name: gender,
                    value: count,
                    color: 
                      gender === 'Male' ? '#3b82f6' : 
                      gender === 'Female' ? '#ec4899' : 
                      '#8b5cf6'
                  }))}
                />
              </div>
            </div>

            {/* Age Groups */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-amber-500" /> Students by Age Group
              </h3>
              <div className="h-64">
                <BarChart
                  data={[
                    { name: '3.1-4.0 yrs', value: dashboardData.stats.ageGroups['3-4'] },
                    { name: '4.1-5.0 yrs', value: dashboardData.stats.ageGroups['4-5'] },
                    { name: '5.1-5.11 yrs', value: dashboardData.stats.ageGroups['5-6'] }
                  ]}
                  colors={['#10b981', '#f59e0b', '#ef4444']}
                />
              </div>
            </div>
          </div>

          {/* Domain Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Domain Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dashboardData.stats.domainProgress.map((domain, i) => (
                <DomainProgressCard 
                  key={i}
                  name={domain.name}
                  progress={domain.progress}
                  color={['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5]}
                />
              ))}
            </div>
          </div>

          {/* Recent Evaluations */}
          {dashboardData.recentEvaluations.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Recent Evaluations</h3>
              <div className="h-64">
                <LineChart
                  data={dashboardData.recentEvaluations.map((evalItem) => ({
                    name: evalItem.evaluation_period,
                    progress: evalItem.average_score
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ icon, title, value, subtitle, trend }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            typeof subtitle === 'string' 
              ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              : subtitle
          )}
        </div>
        <div className="p-2 rounded-lg bg-opacity-20 bg-gray-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Component: Domain Progress Card
function DomainProgressCard({ name, progress, color }) {
  const circumference = 2 * Math.PI * 15.9155;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
      <div className="relative w-14 h-14 mx-auto mb-2">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold"
          style={{ color }}
        >
          {progress}%
        </span>
      </div>
      <p className="text-sm font-medium truncate">{name}</p>
    </div>
  );
}