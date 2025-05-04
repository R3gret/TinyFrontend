import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/President/PresidentSidebar";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, TableContainer } from "@mui/material";

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
        label="Search administrators..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default function PresidentAdminList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiRequest(`/api/pres?${new URLSearchParams({
          search: searchTerm
        }).toString()}`);

        setAdmins(data.users);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        
        // If unauthorized, redirect to login
        if (err.message.includes('Unauthorized') || err.message.includes('president')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, navigate]);

  const handleViewProfile = (userId) => {
    navigate(`/admin-profile/${userId}`);
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
          <p className="font-medium">Error loading administrators</p>
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

    if (admins.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No administrators found in your CDC
        </div>
      );
    }

    return (
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Administrators in Your CDC
        </h3>
        <Paper className="max-h-96 overflow-hidden">
          <TableContainer style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="admin table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
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
            <h2 className="text-2xl font-bold text-gray-800">CDC Administrators</h2>
          </div>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>
          {renderAdminTable()}
        </div>
      </div>
    </div>
  );
}