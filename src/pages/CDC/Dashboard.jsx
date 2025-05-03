import React from 'react';
import { useState, useEffect } from "react";
import { PieChart, BarChart, LineChart } from "../../components/Charts";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
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

const SCORE_TABLES = {
  '3.1-4.0': {
    'Gross Motor': [
      { min: 0, max: 3, score: 1 }, { min: 4, max: 4, score: 2 },
      { min: 5, max: 5, score: 3 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 6 }, { min: 8, max: 8, score: 7 },
      { min: 9, max: 9, score: 8 }, { min: 10, max: 10, score: 10 },
      { min: 11, max: 11, score: 11 }, { min: 12, max: 12, score: 12 },
      { min: 13, max: 13, score: 14 }
    ],
    'Fine Motor': [
      { min: 0, max: 3, score: 2 },
      { min: 4, max: 4, score: 4 }, { min: 5, max: 5, score: 5 },
      { min: 6, max: 6, score: 7 }, { min: 7, max: 7, score: 9 },
      { min: 8, max: 8, score: 10 }, { min: 9, max: 9, score: 12 },
      { min: 10, max: 10, score: 14 }, { min: 11, max: 11, score: 15 }
    ],
    'Self-Help': [
      { min: 0, max: 9, score: 1 }, { min: 10, max: 10, score: 2 },
      { min: 11, max: 11, score: 3 }, { min: 12, max: 12, score: 4 },
      { min: 13, max: 14, score: 5 }, { min: 15, max: 15, score: 6 },
      { min: 16, max: 16, score: 7 }, { min: 17, max: 17, score: 8 },
      { min: 18, max: 19, score: 9 }, { min: 20, max: 20, score: 10 },
      { min: 21, max: 21, score: 11 }, { min: 22, max: 22, score: 12 },
      { min: 23, max: 24, score: 13 }, { min: 25, max: 25, score: 14 },
      { min: 26, max: 26, score: 15 }, { min: 27, max: 27, score: 16 }
    ],
    'Receptive Language': [
      { min: 0, max: 1, score: 3 }, { min: 2, max: 2, score: 5 },
      { min: 3, max: 3, score: 7 }, { min: 4, max: 4, score: 10 },
      { min: 5, max: 5, score: 12 }
    ],
    'Expressive Language': [
      { min: 0, max: 2, score: 1 }, { min: 3, max: 3, score: 3 },
      { min: 4, max: 4, score: 4 }, { min: 5, max: 5, score: 6 },
      { min: 6, max: 6, score: 8 }, { min: 7, max: 7, score: 10 },
      { min: 8, max: 8, score: 12 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 3 }, { min: 1, max: 1, score: 4 },
      { min: 2, max: 3, score: 5 }, { min: 4, max: 4, score: 6 },
      { min: 5, max: 5, score: 7 }, { min: 6, max: 6, score: 8 },
      { min: 7, max: 7, score: 9 }, { min: 8, max: 9, score: 10 },
      { min: 10, max: 10, score: 11 }, { min: 11, max: 11, score: 12 },
      { min: 12, max: 12, score: 13 }, { min: 13, max: 14, score: 14 },
      { min: 15, max: 15, score: 15 }, { min: 16, max: 16, score: 16 },
      { min: 17, max: 17, score: 17 }, { min: 18, max: 18, score: 18 },
      { min: 19, max: 21, score: 19 }
    ],
    'Social Emotional': [
      { min: 0, max: 9, score: 1 }, { min: 10, max: 11, score: 2 },
      { min: 12, max: 12, score: 3 }, { min: 13, max: 13, score: 4 },
      { min: 14, max: 14, score: 5 }, { min: 15, max: 15, score: 6 },
      { min: 16, max: 16, score: 7 }, { min: 17, max: 18, score: 8 },
      { min: 19, max: 19, score: 9 }, { min: 20, max: 20, score: 10 },
      { min: 21, max: 21, score: 11 }, { min: 22, max: 22, score: 12 },
      { min: 23, max: 23, score: 13 }, { min: 24, max: 24, score: 14 }
    ]
  },
  '4.1-5.0': {
    'Gross Motor': [
      { min: 0, max: 5, score: 1 }, { min: 6, max: 6, score: 2 },
      { min: 7, max: 7, score: 4 }, { min: 8, max: 8, score: 5 },
      { min: 9, max: 9, score: 7 }, { min: 10, max: 10, score: 8 }, 
      { min: 11, max: 11, score: 10 },{ min: 12, max: 12, score: 11 },
      { min: 13, max: 13, score: 13 }
    ],
    'Fine Motor': [
      { min: 0, max: 3, score: 1 }, { min: 4, max: 4, score: 2 },
      { min: 5, max: 5, score: 4 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 7 }, { min: 8, max: 8, score: 9 },
      { min: 9, max: 9, score: 10 }, { min: 10, max: 10, score: 12 },
      { min: 11, max: 11, score: 14 }
    ],
    'Self-Help': [
      { min: 0, max: 15, score: 1 }, { min: 16, max: 16, score: 2 },
      { min: 17, max: 17, score: 3 }, { min: 18, max: 18, score: 4 },
      { min: 19, max: 19, score: 5 }, { min: 20, max: 20, score: 6 },
      { min: 21, max: 21, score: 8 },
      { min: 22, max: 22, score: 9 }, { min: 23, max: 23, score: 10 },
      { min: 24, max: 24, score: 11 }, { min: 25, max: 25, score: 12 },
      { min: 26, max: 26, score: 13 }, { min: 27, max: 27, score: 14 }
    ],
    'Receptive Language': [
      { min: 0, max: 1, score: 1 }, { min: 2, max: 2, score: 3 },
      { min: 3, max: 3, score: 6 }, { min: 4, max: 4, score: 9 },
      { min: 5, max: 5, score: 11 }
    ],
    'Expressive Language': [
      { min: 0, max: 5, score: 2 }, { min: 6, max: 6, score: 5 },
      { min: 7, max: 7, score: 8 }, { min: 8, max: 8, score: 11 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 1 }, { min: 1, max: 1, score: 2 },
      { min: 2, max: 3, score: 3 }, { min: 4, max: 4, score: 4 },
      { min: 5, max: 5, score: 5 }, { min: 6, max: 7, score: 6 },
      { min: 8, max: 8, score: 7 }, { min: 9, max: 10, score: 8 },
      { min: 11, max: 11, score: 9 }, { min: 12, max: 12, score: 10 },
      { min: 13, max: 14, score: 11 }, { min: 15, max: 15, score: 12 },
      { min: 16, max: 17, score: 13 }, { min: 18, max: 18, score: 14 },
      { min: 19, max: 20, score: 15 }, { min: 21, max: 21, score: 16 }
    ],
    'Social Emotional': [
      { min: 0, max: 13, score: 1 }, { min: 14, max: 14, score: 2 },
      { min: 15, max: 15, score: 3 }, { min: 16, max: 16, score: 4 },
      { min: 17, max: 17, score: 5 }, { min: 18, max: 18, score: 7 },
      { min: 19, max: 19, score: 8 }, { min: 20, max: 20, score: 9 },
      { min: 21, max: 21, score: 10 }, { min: 22, max: 22, score: 11 },
      { min: 23, max: 23, score: 12 }, { min: 24, max: 24, score: 13 }
    ]
  },
  '5.1-5.11': {
    'Gross Motor': [
      { min: 0, max: 10, score: 1 }, { min: 11, max: 11, score: 4 }, 
      { min: 12, max: 12, score: 7 }, { min: 13, max: 13, score: 11 }
    ],
    'Fine Motor': [
      { min: 0, max: 5, score: 1 }, { min: 6, max: 6, score: 3 },
      { min: 7, max: 7, score: 5 }, { min: 8, max: 8, score: 7 },
      { min: 8, max: 8, score: 9 }, { min: 10, max: 10, score: 10 },
      { min: 11, max: 11, score: 12 }
    ],
    'Self-Help': [
      { min: 0, max: 19, score: 2 },
      { min: 20, max: 20, score: 3 }, { min: 21, max: 21, score: 4 },
      { min: 22, max: 22, score: 6 }, { min: 23, max: 23, score: 7 },
      { min: 24, max: 24, score: 9 }, { min: 25, max: 25, score: 10 },
      { min: 26, max: 26, score: 12 }, { min: 27, max: 27, score: 13 }
    ],
    'Receptive Language': [
      { min: 0, max: 2, score: 1 }, { min: 3, max: 3, score: 4 },
      { min: 4, max: 4, score: 8 }, { min: 5, max: 5, score: 11 }
    ],
    'Expressive Language': [
      { min: 0, max: 7, score: 5 }, { min: 8, max: 8, score: 11 }
    ],
    'Cognitive': [
      { min: 0, max: 0, score: 1 }, { min: 10, max: 10, score: 2 },
      { min: 11, max: 11, score: 3 }, { min: 12, max: 12, score: 4 },
      { min: 13, max: 13, score: 5 }, { min: 14, max: 14, score: 6 },
      { min: 15, max: 15, score: 7 }, { min: 16, max: 16, score: 8 },
      { min: 17, max: 17, score: 9 }, { min: 18, max: 18, score: 10 },
      { min: 19, max: 19, score: 11 }, { min: 20, max: 20, score: 12 },
      { min: 21, max: 21, score: 13 }
    ],
    'Social Emotional': [
      { min: 0, max: 15, score: 1 }, { min: 16, max: 16, score: 2 },
      { min: 17, max: 17, score: 3 }, 
      { min: 18, max: 18, score: 5 }, { min: 19, max: 19, score: 6 },
      { min: 20, max: 20, score: 7 }, { min: 21, max: 21, score: 9 },
      { min: 22, max: 22, score: 10 }, { min: 23, max: 23, score: 11 },
      { min: 24, max: 24, score: 13 }
    ]
  }
};

const STANDARD_SCORE_TABLE = [
  { sum: 29, score: 37 }, { sum: 30, score: 38 }, { sum: 31, score: 40 },
  { sum: 32, score: 41 }, { sum: 33, score: 43 }, { sum: 34, score: 44 },
  { sum: 35, score: 45 }, { sum: 36, score: 47 }, { sum: 37, score: 48 },
  { sum: 38, score: 50 }, { sum: 39, score: 51 }, { sum: 40, score: 53 },
  { sum: 41, score: 54 }, { sum: 42, score: 56 }, { sum: 43, score: 57 },
  { sum: 44, score: 59 }, { sum: 45, score: 60 }, { sum: 46, score: 62 },
  { sum: 47, score: 63 }, { sum: 48, score: 65 }, { sum: 49, score: 66 },
  { sum: 50, score: 67 }, { sum: 51, score: 69 }, { sum: 52, score: 70 },
  { sum: 53, score: 72 }, { sum: 54, score: 73 }, { sum: 55, score: 75 },
  { sum: 56, score: 76 }, { sum: 57, score: 78 }, { sum: 58, score: 79 },
  { sum: 59, score: 81 }, { sum: 60, score: 82 }, { sum: 61, score: 84 },
  { sum: 62, score: 85 }, { sum: 63, score: 86 }, { sum: 64, score: 88 },
  { sum: 65, score: 89 }, { sum: 66, score: 91 }, { sum: 67, score: 92 },
  { sum: 68, score: 94 }, { sum: 69, score: 95 }, { sum: 70, score: 97 },
  { sum: 71, score: 98 }, { sum: 72, score: 100 }, { sum: 73, score: 101 },
  { sum: 74, score: 103 }, { sum: 75, score: 104 }, { sum: 76, score: 105 },
  { sum: 77, score: 107 }, { sum: 78, score: 108 }, { sum: 79, score: 110 },
  { sum: 80, score: 111 }, { sum: 81, score: 113 }, { sum: 82, score: 114 },
  { sum: 83, score: 116 }, { sum: 84, score: 117 }, { sum: 85, score: 119 },
  { sum: 86, score: 120 }, { sum: 87, score: 122 }, { sum: 88, score: 123 },
  { sum: 89, score: 124 }, { sum: 90, score: 126 }, { sum: 91, score: 127 },
  { sum: 92, score: 129 }, { sum: 93, score: 130 }, { sum: 94, score: 132 },
  { sum: 95, score: 133 }, { sum: 96, score: 135 }, { sum: 97, score: 136 },
  { sum: 98, score: 138 }
];

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

  const getAgeRange = (years, months) => {
    if (years === 'N/A' || months === 'N/A') return null;
    const ageDecimal = years + (months / 12);
    if (ageDecimal >= 3.1 && ageDecimal <= 4.0) return '3.1-4.0';
    if (ageDecimal >= 4.1 && ageDecimal <= 5.0) return '4.1-5.0';
    if (ageDecimal >= 5.1 && ageDecimal <= 5.11) return '5.1-5.11';
    return null;
  };

  const calculateAgeAtEvaluation = (birthdate, evaluationDate) => {
    if (!birthdate || !evaluationDate) return { years: 'N/A', months: 'N/A' };
    try {
      const birthDate = new Date(birthdate);
      const evalDate = new Date(evaluationDate);
      let years = evalDate.getFullYear() - birthDate.getFullYear();
      let months = evalDate.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && evalDate.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      if (evalDate.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) months += 12;
      }
      return { years, months };
    } catch (e) {
      return { years: 'N/A', months: 'N/A' };
    }
  };
  
  // Add this function to get scaled score
  const getScaledScore = (domain, rawScore, ageRange) => {
    if (!ageRange || !SCORE_TABLES[ageRange]) return '-';
    const normalizedDomain = domain.split('/')[0].trim();
    if (!SCORE_TABLES[ageRange][normalizedDomain]) return '-';
    if (rawScore === '-' || rawScore === undefined || rawScore === null) return '-';
    
    const entry = SCORE_TABLES[ageRange][normalizedDomain].find(
      item => rawScore >= item.min && rawScore <= item.max
    );
    return entry ? entry.score : '-';
  };

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
    

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
    recentEvaluations: [],
    announcements: []
  });

  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const data = await apiRequest('/api/students');
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all data in parallel
        const [genderRes, enrollmentRes, ageRes, domainProgressRes, attendanceRes, announcementsRes] = await Promise.all([
          apiRequest('/api/students/gender-distribution'),
          apiRequest('/api/students/enrollment-stats'),
          apiRequest('/api/students/age-distribution'),
          apiRequest('/api/domains/progress-summary'), // Updated endpoint
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

        // Process domain progress
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
          recentEvaluations: [
            { evaluation_period: "1st Quarter", average_score: 70 },
            { evaluation_period: "2nd Quarter", average_score: 75 },
            { evaluation_period: "3rd Quarter", average_score: 72 }
          ],
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

          {/* Recent Evaluations */}
          {dashboardData.recentEvaluations.length > 0 && (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Recent Evaluations</h3>
      <div className="w-64">
        <Autocomplete
          options={students}
          getOptionLabel={(student) => `${student.first_name} ${student.last_name}`}
          loading={loadingStudents}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Select Student" 
              variant="outlined" 
              size="small"
            />
          )}
          onChange={(event, value) => setSelectedStudent(value)}
          value={selectedStudent}
        />
      </div>
    </div>
    <div className="h-64">
      <LineChart
        data={dashboardData.recentEvaluations.map((evalItem) => {
          // Calculate standard score if student is selected
          let standardScore = '-';
          if (selectedStudent) {
            const ageAtEval = calculateAgeAtEvaluation(
              selectedStudent.birthdate, 
              new Date().toISOString() // Use current date for demo, replace with actual eval date
            );
            const ageRange = getAgeRange(ageAtEval.years, ageAtEval.months);
            
            // Calculate total scaled score (simplified example)
            let totalScaled = 0;
            dashboardData.stats.domainProgress.forEach(domain => {
              const rawScore = Math.floor(Math.random() * 20); // Replace with actual score
              const scaled = getScaledScore(domain.name, rawScore, ageRange);
              if (scaled !== '-') totalScaled += parseInt(scaled);
            });
            
            // Find standard score
            const entry = STANDARD_SCORE_TABLE.find(item => totalScaled <= item.sum);
            standardScore = entry ? entry.score : '-';
          }
          
          return {
            name: evalItem.evaluation_period,
            progress: selectedStudent ? standardScore : evalItem.average_score,
            type: selectedStudent ? 'Standard Score' : 'Average Score'
          };
        })}
      />
    </div>
    {selectedStudent && (
      <div className="mt-4 text-sm text-gray-600">
        Showing standard scores for {selectedStudent.first_name} {selectedStudent.last_name}
      </div>
    )}
  </div>
)}
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