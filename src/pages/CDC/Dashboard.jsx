import React from 'react';
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
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiBell
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
  
  // Mock data for development
  if (import.meta.env.MODE === 'development') {
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
        } else if (endpoint === '/api/students/age-distribution') {
          resolve({
            success: true,
            distribution: {
              '3-4': 5,
              '4-5': 4,
              '5-6': 2
            }
          });
        } else if (endpoint === '/api/domains/progress-summary') {
          resolve({
            success: true,
            data: [
              { category: 'Cognitive', progress: 72, completed: 36, total: 50 },
              { category: 'Expressive Language', progress: 65, completed: 39, total: 60 },
              { category: 'Fine Motor', progress: 80, completed: 32, total: 40 },
              { category: 'Gross Motor', progress: 55, completed: 33, total: 60 },
              { category: 'Receptive Language', progress: 68, completed: 34, total: 50 },
              { category: 'Self-Help', progress: 75, completed: 45, total: 60 },
              { category: 'Social-Emotional', progress: 60, completed: 30, total: 50 }
            ]
          });
        } else if (endpoint === '/api/announcements') {
          resolve({
            success: true,
            announcements: [
              {
                id: 1,
                title: "Parent-Teacher Meeting",
                message: "Scheduled for next Friday at 2 PM. Please bring your child's progress report.",
                author: "Admin",
                ageFilter: "all",
                createdAt: new Date().toISOString(),
                attachmentUrl: null
              },
              {
                id: 2,
                title: "Field Trip Permission",
                message: "Permission slips for the museum trip are due by Wednesday. Don't forget to pack a lunch for your child.",
                author: "Teacher Sarah",
                ageFilter: "4-5",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                attachmentUrl: null
              },
              {
                id: 3,
                title: "Holiday Closure",
                message: "Center will be closed next Monday for Memorial Day. We will reopen on Tuesday at regular hours.",
                author: "Admin",
                ageFilter: "all",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                attachmentUrl: null
              }
            ]
          });
        } else if (endpoint === '/api/attendance/weekly') {
          // Mock data for daily attendance (7 days centered around today)
          const dailyData = [];
          const today = new Date();
          
          // Generate data for 3 days before and after today
          for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            const present = isWeekend ? 0 : Math.floor(Math.random() * 15) + 5;
            const total = isWeekend ? 0 : 20;
            const absent = isWeekend ? 0 : total - present - Math.floor(Math.random() * 3);
            const excused = isWeekend ? 0 : Math.floor(Math.random() * 3);
            
            dailyData.push({
              date: date.toISOString().split('T')[0],
              present: present,
              absent: absent,
              excused: excused,
              total: total,
              percentage: total > 0 ? Math.round((present / total) * 100) : null,
              isWeekend: isWeekend
            });
          }
          
          resolve({
            success: true,
            data: dailyData
          });
        } else {
          resolve({ 
            students: Array(11).fill({}).map((_, i) => ({
              student_id: i+1,
              first_name: ['Sophia', 'Liam', 'Ethan', 'Isabella', 'Mia', 'Chloe', 'Ella', 'Lucas', 'Aria', 'Samantha', 'asdfg'][i],
              last_name: ['Reyes', 'Santos', 'Cruz', 'Lopez', 'Gonzales', 'Torres', 'Flores', 'Ramos', 'Delos Reyes', 'Navarro', 'zxcv'][i],
              gender: ['Female', 'Male', 'Male', 'Female', 'Female', 'Female', 'Female', 'Male', 'Female', 'Female', 'Male'][i],
              birthdate: '2020-01-01'
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
    announcements: []
  });

  const [weeklyAttendance, setWeeklyAttendance] = useState({
    loading: true,
    error: null,
    data: []
  });

  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);

  // Generate mock attendance data for fallback
  const generateMockAttendanceData = () => {
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 8; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7));
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        present: Math.floor(Math.random() * 15) + 5,
        total: 20,
        percentage: Math.floor(Math.random() * 30) + 70
      });
    }
    
    return weeklyData;
  };

  // Fetch weekly attendance data separately
  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      try {
        console.log('Starting to fetch weekly attendance data');
        setWeeklyAttendance(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await apiRequest('/api/attendance/weekly');
        console.log('API response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load attendance data');
        }
  
        setWeeklyAttendance({
          loading: false,
          error: null,
          data: response.data || []
        });
        console.log('Successfully set attendance data');
      } catch (err) {
        console.error("Error fetching weekly attendance:", err);
        setWeeklyAttendance({
          loading: false,
          error: err.message,
          data: generateMockAttendanceData()
        });
        console.log('Fell back to mock data');
      }
    };
  
    fetchWeeklyAttendance();
  }, []);

  // Fetch all other dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        const [genderRes, enrollmentRes, ageRes, domainProgressRes, attendanceRes, announcementsRes] = await Promise.all([
          apiRequest('/api/dash/gender-distribution'),
          apiRequest('/api/dash/enrollment-stats'),
          apiRequest('/api/dash/age-distribution'),
          apiRequest('/api/domains/progress-summary'),
          apiRequest('/api/attendance/stats'),
          apiRequest('/api/announcements')
        ]);

        const attendanceStats = attendanceRes.success ? attendanceRes.stats : {
          attendanceRate: 0,
          presentRecords: 0,
          totalRecords: 0
        };

        const enrollmentStats = enrollmentRes.success ? enrollmentRes.stats : {
          total: 0,
          currentMonthEnrollments: 0,
          lastMonthEnrollments: 0,
          difference: 0
        };

        const genderDistribution = genderRes.success ? genderRes.distribution : { Male: 0, Female: 0, Other: 0 };
        const ageGroups = ageRes.success ? ageRes.distribution : { '3-4': 0, '4-5': 0, '5-6': 0 };
        const announcements = announcementsRes.success ? announcementsRes.announcements : [];

        const domainProgress = domainProgressRes.success 
          ? domainProgressRes.data.map(item => ({
              name: item.category,
              progress: item.progress.toString(),
              completed: item.completed,
              total: item.total
            }))
          : [];

        setDashboardData({
          loading: false,
          error: null,
          stats: {
            totalStudents: enrollmentStats.total,
            newThisMonth: enrollmentStats.currentMonthEnrollments,
            enrollmentDifference: enrollmentStats.difference,
            attendanceRate: attendanceStats.attendanceRate,
            presentRecords: attendanceStats.presentRecords,
            totalAttendanceRecords: attendanceStats.totalRecords,
            ageGroups,
            genderDistribution,
            domainProgress
          },
          announcements
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

  // Set up carousel auto-rotation
  useEffect(() => {
    if (dashboardData.announcements.length <= 1) return;

    const interval = setInterval(() => {
      setActiveAnnouncementIndex(prev => 
        prev === dashboardData.announcements.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [dashboardData.announcements.length]);

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
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">CDC Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-36">
              <StatCard 
                icon={<FiUsers className="text-blue-500" />}
                title="Total Students"
                value={dashboardData.stats.totalStudents}
                subtitle={`${dashboardData.stats.newThisMonth} new enrollments this month`}
                genderBreakdown={dashboardData.stats.genderDistribution}
              />
            </div>
            <div className="h-36">
              <StatCard 
                icon={<FiCalendar className="text-green-500" />}
                title="Attendance Rate"
                value={`${dashboardData.stats.attendanceRate}%`}
                subtitle={`${dashboardData.stats.presentRecords}/${dashboardData.stats.totalAttendanceRecords} present`}
              />
            </div>
            
            {/* Announcements Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 h-36">
              <div className="flex items-center gap-2 mb-2">
                <FiBell className="text-purple-500" size={16} />
                <h3 className="text-md font-semibold text-gray-800">Announcements</h3>
              </div>
              
              {dashboardData.announcements.length > 0 ? (
                <div className="relative h-24">
                  {/* Announcement Content */}
                  <div className="overflow-hidden h-full">
                    <div className="h-full transition-all duration-300 ease-in-out">
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                            {dashboardData.announcements[activeAnnouncementIndex].title}
                          </h4>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {dashboardData.announcements[activeAnnouncementIndex].message}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>
                            {new Date(dashboardData.announcements[activeAnnouncementIndex].createdAt)
                              .toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            {' • '}
                            {dashboardData.announcements[activeAnnouncementIndex].author}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  {dashboardData.announcements.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveAnnouncementIndex(prev => 
                          prev === 0 ? dashboardData.announcements.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 p-1 rounded-full bg-gray-100 hover:bg-gray-200 shadow"
                      >
                        <FiChevronLeft className="text-gray-600" size={16} />
                      </button>
                      <button 
                        onClick={() => setActiveAnnouncementIndex(prev => 
                          prev === dashboardData.announcements.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 p-1 rounded-full bg-gray-100 hover:bg-gray-200 shadow"
                      >
                        <FiChevronRight className="text-gray-600" size={16} />
                      </button>
                    </>
                  )}
                  
                  {/* Indicators */}
                  {dashboardData.announcements.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1">
                      {dashboardData.announcements.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveAnnouncementIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${index === activeAnnouncementIndex ? 'bg-purple-500' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-gray-400 text-sm">
                  No announcements available
                </div>
              )}
            </div>
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

          {/* Domain Progress - Single Row with Progress Circles */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Domain Progress</h3>
            <div className="grid grid-cols-7 gap-2">
              {dashboardData.stats.domainProgress.map((domain, i) => (
                <DomainProgressCard 
                  key={i}
                  name={domain.name}
                  progress={domain.progress}
                  completed={domain.completed}
                  total={domain.total}
                  color={['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#ef4444'][i % 7]}
                />
              ))}
            </div>
          </div>

          {/* Daily Attendance Graph */}
<div className="bg-white rounded-xl p-6 shadow-sm">
  <h3 className="text-xl font-semibold mb-4">Daily Attendance (7 Days)</h3>
  <div className="h-64">
    {weeklyAttendance.loading ? (
      <div className="h-full flex items-center justify-center">
        <CircularProgress size={40} />
      </div>
    ) : weeklyAttendance.error ? (
      <div className="h-full flex flex-col items-center justify-center text-red-500 p-4 text-center">
        <Alert severity="error" className="mb-2">
          Error loading attendance data: {weeklyAttendance.error}
        </Alert>
        <p className="text-sm text-gray-500">Showing sample data</p>
      </div>
    ) : weeklyAttendance.data.length > 0 ? (
      <LineChart
        data={weeklyAttendance.data.map(day => {
          const date = new Date(day.date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          // Calculate percentage if there's data, otherwise null for weekends, 0 for weekdays
          const percentage = day.total > 0 
            ? Math.round((day.present / day.total) * 100)
            : isWeekend ? null : 0;

          return {
            name: date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }),
            percentage: percentage,
            present: day.present,
            absent: day.absent,
            excused: day.excused,
            total: day.total,
            date: day.date,
            isWeekend: isWeekend,
            color: isWeekend ? '#94A3B8' : '#10B981',
            opacity: isWeekend ? 0.6 : 1
          };
        })}
        config={{
          keys: ['percentage'],
          colors: (d) => d.isWeekend ? '#94A3B8' : '#10B981',
          yAxisLabel: 'Attendance Percentage',
          yDomain: [0, 100], // Set fixed domain for percentage
          tooltipFormat: (value, name, props) => {
            if (props.payload.isWeekend) {
              return [
                'Weekend - No classes',
                new Date(props.payload.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })
              ];
            }
            if (props.payload.total === 0) {
              return [
                'No attendance data',
                new Date(props.payload.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })
              ];
            }
            return [
              `${props.payload.percentage}% Attendance`,
              `Present: ${props.payload.present} students`,
              `Absent: ${props.payload.absent} students`,
              `Excused: ${props.payload.excused} students`,
              `Total: ${props.payload.total} students`,
              new Date(props.payload.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            ];
          },
          xAxisConfig: {
            tickMargin: 10,
            interval: 0 // Show all ticks
          },
          areaProps: {
            fillOpacity: (d) => d.isWeekend ? 0.3 : 0.6
          },
          lineProps: {
            strokeWidth: (d) => d.isWeekend ? 1 : 2,
            strokeDasharray: (d) => d.isWeekend ? '4,4' : undefined
          },
          // Handle null values (weekends) by showing gaps in the line
          connectNulls: false
        }}
      />
    ) : (
      <div className="h-full flex items-center justify-center text-gray-500">
        No attendance data available
      </div>
    )}
  </div>
</div>
        </div>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ icon, title, value, subtitle, trend, genderBreakdown }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex flex-col justify-between h-full">
          <div>
            <p className="text-gray-500 text-xs font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div>
            {genderBreakdown && (
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-blue-500">
                  <FiUsers className="inline mr-1" size={10} />
                  {genderBreakdown.Male || 0} Boys
                </span>
                <span className="text-xs text-pink-500">
                  <FiUsers className="inline mr-1" size={10} />
                  {genderBreakdown.Female || 0} Girls
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="p-1.5 rounded-lg bg-opacity-20 bg-gray-200">
          {React.cloneElement(icon, { size: 20 })}
        </div>
      </div>
    </div>
  );
}

// Component: Domain Progress Card with circular progress
function DomainProgressCard({ name, progress, completed, total, color }) {
  const circumference = 2 * Math.PI * 15;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-2">
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#eee"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>
            {progress}%
          </span>
        </div>
      </div>
      <p className="text-xs font-medium text-center line-clamp-2">{name}</p>
      <p className="text-xs text-gray-500 mt-1">
        {completed}/{total}
      </p>
    </div>
  );
}