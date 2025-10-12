import React from 'react';
import { useState, useEffect } from "react";
import { PieChart, BarChart } from "../../components/Charts";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/President/PresidentSidebar";
import { 
  FiUsers, 
  FiClipboard, 
  FiBell,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { CircularProgress, Alert, Button } from "@mui/material";
import { apiRequest } from '../../utils/api';

export default function PresidentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: null,
    stats: {
      totalWorkers: 0,
      totalCDCs: 0,
      totalUsers: 0,
    },
    announcements: []
  });

  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use Promise.all to fetch workers and announcements concurrently
        const [workerData, announcementsData] = await Promise.all([
          apiRequest('/api/workers'),
          apiRequest('/api/announcements') 
        ]);

        const totalWorkers = workerData.data ? workerData.data.length : 0;
        const announcements = announcementsData.announcements || [];

        // Mock other API calls for now
        const otherStats = { totalCDCs: 50, totalUsers: 500 };

        setDashboardData({
          loading: false,
          error: null,
          stats: {
            totalWorkers: totalWorkers,
            totalCDCs: otherStats.totalCDCs,
            totalUsers: otherStats.totalUsers,
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
    <div className="w-screen h-screen flex overflow-hidden bg-white">
      <Sidebar />
      
      <div className="flex flex-col flex-grow pl-64 pt-16 overflow-auto">
        <Navbar />
        
        <div className="p-6 space-y-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">President's Dashboard</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              icon={<FiUsers className="text-blue-500" />}
              title="Total CD Workers"
              value={dashboardData.stats.totalWorkers}
            />
            <StatCard 
              icon={<FiClipboard className="text-green-500" />}
              title="Total CDCs"
              value={dashboardData.stats.totalCDCs}
            />
            <StatCard 
              icon={<FiUsers className="text-purple-500" />}
              title="Total Users"
              value={dashboardData.stats.totalUsers}
            />
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 h-48">
              <div className="flex items-center gap-2 mb-2">
                <FiBell className="text-purple-500" size={16} />
                <h3 className="text-md font-semibold text-gray-800">Announcements</h3>
              </div>
              
              {dashboardData.announcements.length > 0 ? (
                <div className="relative h-36">
                  <div className="overflow-hidden h-full">
                    <div className="h-full transition-all duration-300 ease-in-out">
                      <div className="h-full flex flex-col justify-center text-center">
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                            {dashboardData.announcements[activeAnnouncementIndex].title}
                          </h4>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-4">
                            {dashboardData.announcements[activeAnnouncementIndex].message}
                          </p>
                          <div className="text-xs text-gray-500 mt-2">
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
                  </div>
                  
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                CDC Distribution
              </h3>
              <div className="h-64">
                <BarChart
                  data={[
                    { name: 'District 1', value: 10 },
                    { name: 'District 2', value: 15 },
                    { name: 'District 3', value: 5 },
                    { name: 'District 4', value: 20 },
                  ]}
                  colors={['#10b981', '#f59e0b', '#ef4444', '#3b82f6']}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                User Roles
              </h3>
              <div className="h-64">
                <PieChart
                  data={[
                    { name: 'Admins', value: 10, color: '#3b82f6' },
                    { name: 'CDCs', value: 50, color: '#ec4899' },
                    { name: 'Parents', value: 440, color: '#8b5cf6' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="flex items-center justify-between h-full">
        <div className="flex flex-col justify-between h-full">
          <div>
            <p className="text-gray-500 text-xs font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        </div>
        <div className="p-1.5 rounded-lg bg-opacity-20 bg-gray-200">
          {React.cloneElement(icon, { size: 20 })}
        </div>
      </div>
    </div>
  );
}