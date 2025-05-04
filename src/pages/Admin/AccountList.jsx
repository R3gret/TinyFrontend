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
  Button,
  Box
} from "@mui/material";

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

  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Request failed');
  }

  return response.json();
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
        
        const data = await apiRequest(`/api/admin/parents?search=${encodeURIComponent(searchTerm)}`);
        setParents(data.parents || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchParents, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleViewProfile = (parentId) => {
    navigate(`/admin/parents/${parentId}`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: -1
        }
      }}>
        <Navbar />
        
        <Box sx={{ 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          p: 3,
          boxShadow: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <h2>Manage Parent Accounts</h2>
            <TextField
              label="Search parents"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
              <Button 
                onClick={() => window.location.reload()} 
                sx={{ mt: 1 }}
              >
                Retry
              </Button>
            </Alert>
          ) : parents.length === 0 ? (
            <Alert severity="info">
              No parent accounts found matching your criteria
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Profile</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>CDC ID</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parents.map((parent) => (
                    <TableRow 
                      key={parent.id} 
                      hover 
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{parent.id}</TableCell>
                      <TableCell>
                        <Box
                          component="img"
                          src={parent.profile_pic || defaultProfile}
                          alt="Profile"
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      </TableCell>
                      <TableCell>{parent.username}</TableCell>
                      <TableCell>{parent.cdc_id}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleViewProfile(parent.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}