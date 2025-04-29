import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, TableContainer, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

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

const typeMapping = {
  admin: 'Administrator',
  worker: 'CD Worker',
  parent: 'Parent',
  president: 'President'
};  

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md">
      <TextField
        fullWidth
        label="Search by username..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

const FilterBar = ({ selectedType, setSelectedType, userTypes }) => {
  return (
    <div className="flex-1 max-w-xs">
      <FormControl fullWidth size="small">
        <InputLabel>User Type</InputLabel>
        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="User Type"
        >
          <MenuItem value="">All Types</MenuItem>
          {userTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {typeMapping[type] || type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default function AccountList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [users, setUsers] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user types and users in parallel using Promise.all
        const [typesData, usersData] = await Promise.all([
          apiRequest('/api/account/types/all'),
          apiRequest(`/api/account?${new URLSearchParams({
            type: selectedType,
            search: searchTerm
          }).toString()}`)
        ]);

        setUserTypes(typesData.types);
        setUsers(usersData.users);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedType, searchTerm]);

  const handleViewProfile = (userId) => {
    navigate(`/account-profile/${userId}`);
  };

  const renderUserTable = () => {
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
          <p className="font-medium">Error loading users</p>
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

    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No users found matching your criteria
        </div>
      );
    }

    return (
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {selectedType ? `${typeMapping[selectedType] || selectedType} Users` : 'All Users'}
        </h3>
        <Paper className="max-h-96 overflow-hidden">
          <TableContainer style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="user table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewProfile(user.id)}
                  >
                    <TableCell align="center">{user.id}</TableCell>
                    <TableCell>
                      <img
                        src={user.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell align="center">{user.username}</TableCell>
                    <TableCell align="center">
                      {typeMapping[user.type] || user.type}
                    </TableCell>
                    <TableCell align="center">
                      <button
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(user.id);
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
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          </div>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <FilterBar 
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                userTypes={userTypes}
              />
              <SearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>
          {renderUserTable()}
        </div>
      </div>
    </div>
  );
}