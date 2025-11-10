import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import { useNavigate } from 'react-router-dom';
import {
  TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, Paper, IconButton, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination
} from "@mui/material";
import {
    Visibility, VisibilityOff
} from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md">
      <TextField
        fullWidth
        label="Search parents..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default function CreateParent() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('Logged in user CDC ID:', user?.cdc_id);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    student_id: ''
  });
  const [unlinkedGuardians, setUnlinkedGuardians] = useState([]);
  const [parents, setParents] = useState([]); // New state for existing parents
  const [searchTerm, setSearchTerm] = useState(""); // For searching parents
  const [page, setPage] = useState(0); // For pagination
  const rowsPerPage = 10; // Fixed number of rows per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const guardians = await apiRequest('/api/parent/guardians');
        setUnlinkedGuardians(guardians || []);
      } catch (err) {
        setError(err.message);
        setSnackbar({ open: true, message: `Failed to fetch guardians: ${err.message}`, severity: 'error' });
      }
    };
    fetchGuardians();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/parent/search?${new URLSearchParams({ query: searchTerm }).toString()}`);
      const sortedParents = (data || []).sort((a, b) => a.username.localeCompare(b.username));
      setParents(sortedParents);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchParents();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest('/api/parent', 'POST', formData);
      setSnackbar({ open: true, message: 'Parent account created successfully!', severity: 'success' });
      setFormData({ username: '', password: '', student_id: '' });
      setShowCreateForm(false); // Hide the form after successful creation
      fetchParents(); // Refresh the list of parents
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message || 'Failed to create parent account.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const renderParentTable = () => {
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
          <p className="font-medium">Error loading parents</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Retry
          </button>
        </div>
      );
    }

    if (parents.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          No parent accounts found.
        </div>
      );
    }

    const paginatedParents = parents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <div className="mb-10">
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="parent table">
              <TableHead>
                <TableRow>
                  <TableCell>Guardian Name</TableCell>
                  <TableCell>Relationship</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedParents.map((parent) => (
                  <TableRow key={parent.id} hover>
                    <TableCell>{parent.guardian_name}</TableCell>
                    <TableCell>{parent.relationship}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" onClick={() => navigate(`/parent-profile/${parent.id}`)} sx={{ mr: 1 }}>
                        View Profile
                      </Button>
                      <Button variant="outlined" size="small" color="primary" sx={{ mr: 1 }} onClick={() => handleEditParent(parent)}>
                        Edit
                      </Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteParent(parent)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={parents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]} // Hide the rows per page dropdown
          />
        </Paper>
      </div>
    );
  // Edit and Delete handlers
  const handleEditParent = (parent) => {
    // Placeholder for edit logic/modal
    alert(`Edit parent: ${parent.username}`);
  };

  const handleDeleteParent = async (parent) => {
    if (!window.confirm(`Are you sure you want to delete parent '${parent.username}'? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      await apiRequest(`/api/parent/${parent.id}`, 'DELETE');
      setSnackbar({ open: true, message: 'Parent deleted successfully!', severity: 'success' });
      fetchParents();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete parent.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <div className="p-6 pt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Parent Accounts</h2>
            <Button variant="contained" onClick={() => setShowCreateForm(true)}>
              Add Parent Account
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          {renderParentTable()}

          {showCreateForm && (
            <div className="max-w-lg mx-auto mt-8"> {/* Added mt-8 for spacing */}
              <Typography variant="h4" component="h1" gutterBottom>
                Create Parent Account
              </Typography>
              <Paper sx={{ p: 3, mt: 3 }}>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoFocus
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="student-select-label">Select Student</InputLabel>
                    <Select
                      labelId="student-select-label"
                      id="student-select"
                      value={formData.student_id}
                      label="Select Student"
                      name="student_id"
                      onChange={handleChange}
                    >
                      {unlinkedGuardians.map((guardian) => (
                        <MenuItem key={guardian.student_id} value={guardian.student_id}>
                          {guardian.student_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} variant="contained">
                      {loading ? <CircularProgress size={24} /> : 'Create Parent'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </div>
          )}
        </div> {/* Closing div for "p-6 pt-20" */}
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
