import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  TableContainer, 
  CircularProgress,
  Alert,
  AlertTitle,
  Button
} from "@mui/material";

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
    credentials: 'include',
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
        label="Search parents by username..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default function AdminParentList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiRequest(`/api/admin?${new URLSearchParams({
          search: searchTerm
        }).toString()}`);
        
        setParents(data.parents || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls
    const debounceTimer = setTimeout(() => {
      fetchParents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleViewProfile = (parentId) => {
    navigate(`/parent-profile/${parentId}`);
  };

  const renderParentTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <CircularProgress />
        </div>
      );
    }

    if (error) {
      return (
        <Alert severity="error" className="my-4">
          <AlertTitle>Error loading parent accounts</AlertTitle>
          {error}
          <Button 
            onClick={() => window.location.reload()} 
            color="inherit" 
            size="small"
            className="mt-2"
          >
            Retry
          </Button>
        </Alert>
      );
    }

    if (parents.length === 0) {
      return (
        <Alert severity="info" className="my-4">
          No parent accounts found matching your criteria
        </Alert>
      );
    }

    return (
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Parent Accounts
        </h3>
        <Paper className="max-h-96 overflow-hidden">
          <TableContainer style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="parent table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell>Profile</TableCell>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">CDC ID</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parents.map((parent) => (
                  <TableRow
                    key={parent.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewProfile(parent.id)}
                  >
                    <TableCell align="center">{parent.id}</TableCell>
                    <TableCell>
                      <img
                        src={parent.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell align="center">{parent.username}</TableCell>
                    <TableCell align="center">{parent.cdc_id}</TableCell>
                    <TableCell align="center">
                      <button
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(parent.id);
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
    <div className="w-screen h-screen flex overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>
      
      <Sidebar />
      
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Parent Accounts</h2>
          </div>
          
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>
          
          {renderParentTable()}
        </div>
      </div>
    </div>
  );
}