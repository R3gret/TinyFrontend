import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import locationData from "../../components/ECCDC/loc.json";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, TableContainer, Box, Autocomplete, InputAdornment
} from "@mui/material";
import { Search } from "@mui/icons-material";

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md">
      <TextField
        fullWidth
        label="Search admin accounts..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default function AdminAccountList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Location filter states
  const [locationFilter, setLocationFilter] = useState({
    province: null,
    municipality: null,
    barangay: null
  });
  
  // Location options
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Extract all provinces from location data
  useEffect(() => {
    const allProvinces = [];
    Object.values(locationData).forEach(region => {
      Object.keys(region.province_list || {}).forEach(province => {
        allProvinces.push(province);
      });
    });
    setProvinces([...new Set(allProvinces)].sort());
  }, []);

  // Update municipalities when province changes
  useEffect(() => {
    if (!locationFilter.province) {
      setMunicipalities([]);
      setLocationFilter(prev => ({ ...prev, municipality: null, barangay: null }));
      return;
    }

    const foundMunicipalities = [];
    Object.values(locationData).forEach(region => {
      if (region.province_list?.[locationFilter.province]) {
        Object.keys(region.province_list[locationFilter.province].municipality_list || {}).forEach(municipality => {
          foundMunicipalities.push(municipality);
        });
      }
    });
    setMunicipalities([...new Set(foundMunicipalities)].sort());
    setLocationFilter(prev => ({ ...prev, municipality: null, barangay: null }));
  }, [locationFilter.province]);

  // Update barangays when municipality changes
  useEffect(() => {
    if (!locationFilter.municipality || !locationFilter.province) {
      setBarangays([]);
      setLocationFilter(prev => ({ ...prev, barangay: null }));
      return;
    }

    const foundBarangays = [];
    Object.values(locationData).forEach(region => {
      if (region.province_list?.[locationFilter.province]?.municipality_list?.[locationFilter.municipality]) {
        foundBarangays.push(...region.province_list[locationFilter.province].municipality_list[locationFilter.municipality].barangay_list || []);
      }
    });
    setBarangays([...new Set(foundBarangays)].sort());
    setLocationFilter(prev => ({ ...prev, barangay: null }));
  }, [locationFilter.municipality]);

  // Fetch admin data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest(`/api/cdc/preslist?${new URLSearchParams({
          search: searchTerm,
          province: locationFilter.province || '',
          municipality: locationFilter.municipality || '',
          barangay: locationFilter.barangay || ''
        }).toString()}`);
    
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch data');
        }
    
        setAdmins(response.users || []);
        setFilteredAdmins(response.users || []);
      } catch (err) {
        setError(err.message);
        setAdmins([]);
        setFilteredAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, locationFilter]);

  const handleViewProfile = (userId) => {
    navigate(`/account-profile/${userId}`);
  };

  const renderAdminTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium">Error loading admin accounts</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredAdmins.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No admin accounts found matching your criteria
        </div>
      );
    }

    return (
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          President Accounts
        </h3>
        <Paper className="max-h-96 overflow-hidden">
          <TableContainer style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="admin table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">CDC Location</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewProfile(admin.id)}
                  >
                    <TableCell align="center">{admin.id}</TableCell>
                    <TableCell>
                      <img
                        src={admin.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell align="center">{admin.username}</TableCell>
                    <TableCell align="center">
                      {admin.cdc_location ? 
                        `${admin.cdc_location.barangay}, ${admin.cdc_location.municipality}, ${admin.cdc_location.province}` : 
                        'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(admin.id);
                        }}
                      >
                        View Profile
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    );
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Account List</h2>
          </div>
          
          {/* Location Filters */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Province Filter */}
              <Autocomplete
                options={provinces}
                value={locationFilter.province}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, province: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Province"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
              
              {/* Municipality Filter */}
              <Autocomplete
                options={municipalities}
                value={locationFilter.municipality}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, municipality: newValue }));
                }}
                disabled={!locationFilter.province}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Municipality"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
              
              {/* Barangay Filter */}
              <Autocomplete
                options={barangays}
                value={locationFilter.barangay}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, barangay: newValue }));
                }}
                disabled={!locationFilter.municipality}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Barangay"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </div>
          </div>
          
          {renderAdminTable()}
        </div>
      </div>
    </div>
  );
}