import React from 'react';
import { useState, useEffect } from "react";
import { PieChart, BarChart, LineChart } from "../../components/Charts";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Focal/FocalSidebar";
import { 
  FiUsers, 
  FiClipboard, 
  FiPieChart, 
  FiAward,
  FiTrendingUp,
  FiFilter
} from "react-icons/fi";
import { CircularProgress, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { apiRequest } from "../../utils/api";

export default function Focal_Dashboard() {
  // Filter states
  const [filters, setFilters] = useState({
    province: '',
    municipality: '',
    barangay: '',
    cdcName: '',
    academicYear: ''
  });

  // Generate academic year options (current year and past 5 years)
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = 0; i < 6; i++) {
      const year = currentYear - i;
      options.push(`${year}-${year + 1}`);
    }
    return options;
  };

  // Location data states
  const [barangays, setBarangays] = useState([]);
  const [cdcNames, setCdcNames] = useState([]);
  const [userMunicipality, setUserMunicipality] = useState('');
  const [userProvince, setUserProvince] = useState('');
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [cdcList, setCdcList] = useState([]);

  // MSW Dashboard specific data states
  const [cdcDistribution, setCdcDistribution] = useState({
    loading: false,
    error: null,
    data: []
  });

  const [genderDistribution, setGenderDistribution] = useState({
    loading: false,
    error: null,
    data: [],
    total: 0
  });

  const [ageDistribution, setAgeDistribution] = useState({
    loading: false,
    error: null,
    data: []
  });

  const [enrollmentTrend, setEnrollmentTrend] = useState({
    loading: false,
    error: null,
    data: []
  });

  const [cdwWorkers, setCdwWorkers] = useState({
    loading: false,
    error: null,
    count: 0
  });

  // Debounce CDC name filter
  const [cdcNameDebounce, setCdcNameDebounce] = useState('');

  // Build query string from filters
  const buildQueryString = ({
    includeAcademicYear = false,
    includeBarangay = true,
    includeCdcName = true
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.province) params.append('province', filters.province);
    if (filters.municipality) params.append('municipality', filters.municipality);
    if (includeBarangay && filters.barangay) params.append('barangay', filters.barangay);
    if (includeCdcName && cdcNameDebounce) params.append('cdcName', cdcNameDebounce);
    if (includeAcademicYear && filters.academicYear) params.append('academicYear', filters.academicYear);
    return params.toString();
  };

  // Fetch CDC Distribution by Barangay
  const fetchCdcDistribution = async () => {
    try {
      setCdcDistribution(prev => ({ ...prev, loading: true, error: null }));
      const query = buildQueryString({
        includeAcademicYear: false,
        includeBarangay: false,
        includeCdcName: false
      });
      const response = await apiRequest(`/api/msw-dashboard/cdc-distribution${query ? `?${query}` : ''}`);
      
      if (response.success) {
        setCdcDistribution({
          loading: false,
          error: null,
          data: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load CDC distribution');
      }
    } catch (err) {
      setCdcDistribution({
        loading: false,
        error: err.message,
        data: []
      });
    }
  };

  // Fetch Gender Distribution
  const fetchGenderDistribution = async () => {
    try {
      setGenderDistribution(prev => ({ ...prev, loading: true, error: null }));
      const query = buildQueryString({ includeAcademicYear: true });
      const response = await apiRequest(`/api/msw-dashboard/gender-distribution${query ? `?${query}` : ''}`);
      
      if (response.success) {
        setGenderDistribution({
          loading: false,
          error: null,
          data: response.data || [],
          total: response.total || 0
        });
      } else {
        throw new Error(response.message || 'Failed to load gender distribution');
      }
    } catch (err) {
      setGenderDistribution({
        loading: false,
        error: err.message,
        data: [],
        total: 0
      });
    }
  };

  // Fetch Age Distribution
  const fetchAgeDistribution = async () => {
    try {
      setAgeDistribution(prev => ({ ...prev, loading: true, error: null }));
      const query = buildQueryString();
      const response = await apiRequest(`/api/msw-dashboard/age-distribution${query ? `?${query}` : ''}`);
      
      if (response.success) {
        setAgeDistribution({
          loading: false,
          error: null,
          data: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load age distribution');
      }
    } catch (err) {
      setAgeDistribution({
        loading: false,
        error: err.message,
        data: []
      });
    }
  };

  // Fetch Enrollment Trend
  const fetchEnrollmentTrend = async () => {
    try {
      setEnrollmentTrend(prev => ({ ...prev, loading: true, error: null }));
      const query = buildQueryString();
      const response = await apiRequest(`/api/msw-dashboard/enrollment-trend${query ? `?${query}` : ''}`);
      
      if (response.success) {
        setEnrollmentTrend({
          loading: false,
          error: null,
          data: response.data || []
        });
      } else {
        throw new Error(response.message || 'Failed to load enrollment trend');
      }
    } catch (err) {
      setEnrollmentTrend({
        loading: false,
        error: err.message,
        data: []
      });
    }
  };

  // Fetch CDW Workers
  const fetchCdwWorkers = async () => {
    try {
      setCdwWorkers(prev => ({ ...prev, loading: true, error: null }));
      const query = buildQueryString();
      const response = await apiRequest(`/api/msw-dashboard/cdw-workers${query ? `?${query}` : ''}`);
      
      if (response.success) {
        setCdwWorkers({
          loading: false,
          error: null,
          count: response.data?.workerCount || 0
        });
      } else {
        throw new Error(response.message || 'Failed to load CDW workers');
      }
    } catch (err) {
      setCdwWorkers({
        loading: false,
        error: err.message,
        count: 0
      });
    }
  };

  // Fetch CDC list to populate dropdowns
  const fetchCdcList = async () => {
    try {
      if (!filters.municipality) return;
      
      const params = new URLSearchParams();
      params.append('municipality', filters.municipality);
      
      const data = await apiRequest(`/api/cdc?${params.toString()}`);
      const cdcs = data?.data || [];
      
      setCdcList(cdcs);
      
      // Extract unique barangays from CDC list
      const uniqueBarangays = [...new Set(cdcs.map(cdc => cdc.barangay).filter(Boolean))].sort();
      setBarangays(uniqueBarangays);
      
      // Extract unique CDC names from CDC list
      const uniqueCdcNames = [...new Set(cdcs.map(cdc => cdc.name).filter(Boolean))].sort();
      setCdcNames(uniqueCdcNames);
    } catch (err) {
      console.error('Error fetching CDC list:', err);
      setCdcList([]);
      setBarangays([]);
      setCdcNames([]);
    }
  };

  const applyDetectedLocation = (province, municipality) => {
    if (!province || !municipality) return;
    setFilters(prev => {
      if (prev.province === province && prev.municipality === municipality) {
        return prev;
      }
      return {
        ...prev,
        province,
        municipality
      };
    });
  };

  // Fetch user info and set municipality/province from account
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) {
          console.warn('No user found in localStorage');
          setLoadingUserInfo(false);
          return;
        }

        const data = await apiRequest(`/api/user_session/current-user/details?userId=${user.id}`);
        const otherInfo = data?.user?.other_info || {};
        let detectedMunicipality = '';
        let detectedProvince = '';

        if (otherInfo.address) {
          // Parse address: "Barangay, Municipality, Province[, Region]"
          const addressParts = otherInfo.address.split(',').map(part => part.trim());
          if (addressParts.length >= 3) {
            detectedMunicipality = addressParts[1] || '';
            detectedProvince = addressParts[2] || '';
          }
        }

        // Fallbacks in case address isn't in the expected format
        if (!detectedMunicipality) {
          detectedMunicipality = otherInfo.municipality || otherInfo.cityMunicipality || otherInfo.city_municipality || '';
        }
        if (!detectedProvince) {
          detectedProvince = otherInfo.province || '';
        }

        console.log('[Focal Dashboard] Retrieved location info:', {
          userId: user.id,
          rawAddress: otherInfo.address,
          otherInfoMunicipality: otherInfo.municipality || otherInfo.cityMunicipality || otherInfo.city_municipality || '',
          otherInfoProvince: otherInfo.province || '',
          detectedMunicipality,
          detectedProvince
        });

        if (detectedMunicipality && detectedProvince) {
          setUserMunicipality(detectedMunicipality);
          setUserProvince(detectedProvince);
          applyDetectedLocation(detectedProvince, detectedMunicipality);
        } else {
          console.warn('[Focal Dashboard] Unable to determine location from user info.');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch CDC list when municipality is set
  useEffect(() => {
    if (filters.municipality) {
      fetchCdcList();
    } else {
      setBarangays([]);
      setCdcNames([]);
      setCdcList([]);
    }
  }, [filters.municipality]);

  // Location filter handlers - provinces and municipalities are not needed since they're read-only
  // Barangays and CDC names are populated from CDC list

  // Debounce CDC name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setCdcNameDebounce(filters.cdcName);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [filters.cdcName]);

  // Fetch MSW Dashboard data when filters change
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchCdcDistribution(),
        fetchGenderDistribution(),
        fetchAgeDistribution(),
        fetchEnrollmentTrend(),
        fetchCdwWorkers()
      ]);
    };
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.province, filters.municipality, filters.barangay, cdcNameDebounce, filters.academicYear]);

  // Check if any data is loading
  const isLoading = cdcDistribution.loading || genderDistribution.loading || 
                    ageDistribution.loading || enrollmentTrend.loading || 
                    cdwWorkers.loading || loadingUserInfo;

  if (isLoading && !filters.municipality) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white overflow-auto">
        {/* Navbar */}
        <Navbar />
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Focal Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Province</InputLabel>
                <Select
                  value={filters.province}
                  label="Province"
                  disabled={true}
                >
                  <MenuItem value={filters.province}>{filters.province || (loadingUserInfo ? 'Loading...' : 'Not set')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={true}>
                <InputLabel>Municipality</InputLabel>
                <Select
                  value={filters.municipality}
                  label="Municipality"
                >
                  <MenuItem value={filters.municipality}>{filters.municipality || (loadingUserInfo ? 'Loading...' : 'Not set')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!filters.municipality || loadingUserInfo}>
                <InputLabel>Barangay</InputLabel>
                <Select
                  value={filters.barangay}
                  label="Barangay"
                  onChange={(e) => setFilters(prev => ({ ...prev, barangay: e.target.value }))}
                >
                  <MenuItem value="">All Barangays</MenuItem>
                  {barangays.map(barangay => (
                    <MenuItem key={barangay} value={barangay}>{barangay}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!filters.municipality || loadingUserInfo}>
                <InputLabel>CDC Name</InputLabel>
                <Select
                  value={filters.cdcName}
                  label="CDC Name"
                  onChange={(e) => setFilters(prev => ({ ...prev, cdcName: e.target.value }))}
                >
                  <MenuItem value="">All CDC Centers</MenuItem>
                  {cdcNames.map(cdcName => (
                    <MenuItem key={cdcName} value={cdcName}>{cdcName}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={filters.academicYear}
                  label="Academic Year"
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {getAcademicYearOptions().map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-36">
              <StatCard 
                icon={<FiUsers className="text-blue-500" />}
                title="Total Enrollees"
                value={genderDistribution.total}
                subtitle={`Based on current filters`}
              />
            </div>
            <div className="h-36">
              <StatCard 
                icon={<FiAward className="text-purple-500" />}
                title="CDW Workers"
                value={cdwWorkers.count}
                subtitle={`Child Development Workers`}
              />
            </div>
            <div className="h-36">
              <StatCard 
                icon={<FiClipboard className="text-green-500" />}
                title="CDC Centers"
                value={cdcDistribution.data.reduce((sum, item) => sum + (item.cdcCount || 0), 0)}
                subtitle={`Total CDC centers`}
              />
            </div>
          </div>

          {/* MSW Dashboard Charts Section */}
          <div className="space-y-6">
            {/* Gender Distribution and Age Distribution - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FiPieChart className="text-pink-500" /> Gender Distribution
                  </h3>
                  {genderDistribution.total > 0 && (
                    <span className="text-sm text-gray-600">
                      Total: {genderDistribution.total}
                    </span>
                  )}
                </div>
                <div className="h-64">
                  {genderDistribution.loading ? (
                    <div className="h-full flex items-center justify-center">
                      <CircularProgress size={40} />
                    </div>
                  ) : genderDistribution.error ? (
                    <div className="h-full flex items-center justify-center text-red-500">
                      Error: {genderDistribution.error}
                    </div>
                  ) : genderDistribution.data.length > 0 ? (
                    <PieChart
                      data={genderDistribution.data.map(item => ({
                        name: item.gender || 'Unknown',
                        value: item.count || 0,
                        color: 
                          item.gender === 'Male' ? '#3b82f6' : 
                          item.gender === 'Female' ? '#ec4899' : 
                          '#8b5cf6'
                      }))}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Age Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-amber-500" /> Age Distribution
                </h3>
                <div className="h-64">
                  {ageDistribution.loading ? (
                    <div className="h-full flex items-center justify-center">
                      <CircularProgress size={40} />
                    </div>
                  ) : ageDistribution.error ? (
                    <div className="h-full flex items-center justify-center text-red-500">
                      Error: {ageDistribution.error}
                    </div>
                  ) : ageDistribution.data.length > 0 ? (
                    <BarChart
                      data={ageDistribution.data.map(item => ({
                        name: item.ageGroup || 'Unknown',
                        value: item.count || 0
                      }))}
                      colors={['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CDC Distribution by Barangay - Full Width */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> CDC Distribution by Barangay
              </h3>
              <div className="h-64">
                {cdcDistribution.loading ? (
                  <div className="h-full flex items-center justify-center">
                    <CircularProgress size={40} />
                  </div>
                ) : cdcDistribution.error ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    Error: {cdcDistribution.error}
                  </div>
                ) : cdcDistribution.data.length > 0 ? (
                  <BarChart
                    data={cdcDistribution.data.map(item => ({
                      name: item.barangay || 'Unknown',
                      value: item.cdcCount || 0
                    }))}
                    colors={['#3b82f6']}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Trend per Academic Year - Full Width */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-green-500" /> Enrollment Trend per Academic Year
              </h3>
              <div className="h-64">
                {enrollmentTrend.loading ? (
                  <div className="h-full flex items-center justify-center">
                    <CircularProgress size={40} />
                  </div>
                ) : enrollmentTrend.error ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    Error: {enrollmentTrend.error}
                  </div>
                ) : enrollmentTrend.data.length > 0 ? (
                  <LineChart
                    data={enrollmentTrend.data.map(item => ({
                      name: item.academicYear || 'Unknown',
                      enrollmentCount: item.enrollmentCount || 0
                    }))}
                    config={{
                      keys: ['enrollmentCount'],
                      colors: ['#10b981'],
                      yAxisLabel: 'Enrollment Count',
                      tooltipFormat: (value, name, props) => [
                        `Enrollment: ${value}`,
                        `Academic Year: ${props.payload.name}`
                      ]
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
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


