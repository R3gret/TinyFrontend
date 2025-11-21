import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import FocalSidebar from "../../components/Focal/FocalSidebar";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, TableContainer, Button, Modal, Box, 
  Typography, CircularProgress, IconButton, Snackbar, Alert, TablePagination
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md">
      <TextField
        fullWidth
        label="Search workers..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const EditWorkerModal = ({ open, onClose, worker, onWorkerUpdated }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (worker) {
      setFormData({ username: worker.username, password: '' });
      setError('');
    }
  }, [worker, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { username: formData.username };
      if (formData.password) {
        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        payload.password = formData.password;
      }
      await apiRequest(`/api/workers/${worker.id}`, 'PUT', payload);
      onWorkerUpdated("Worker updated successfully!");
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update worker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">Edit Worker</Typography>
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
          fullWidth
          name="password"
          label="New Password (optional)"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          helperText="Leave blank to keep current password."
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default function FocalWorkerList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [newWorkerData, setNewWorkerData] = useState({ username: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const rowsPerPage = 4; // Set a fixed number of rows per page

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For Focal users, try the all workers endpoint first
      // This endpoint should return all workers regardless of CDC association
      let data;
      try {
        // Try Focal-specific endpoint that returns all workers
        data = await apiRequest(`/api/workers/all?${new URLSearchParams({ search: searchTerm }).toString()}`);
      } catch (focalErr) {
        // If Focal endpoint doesn't exist, try regular endpoint
        // This will fail for Focal users but we'll show a helpful error
        try {
          data = await apiRequest(`/api/workers?${new URLSearchParams({ search: searchTerm }).toString()}`);
        } catch (regularErr) {
          // If both fail, check if it's a CDC association error
          if (regularErr.message.includes('not associated with a CDC') || regularErr.message.includes('Access denied')) {
            throw new Error('Backend needs GET /api/workers/all endpoint for Focal users. The current endpoint requires CDC association.');
          }
          throw regularErr;
        }
      }
      
      // Sort workers alphabetically by username
      const sortedWorkers = (data.data || []).sort((a, b) => a.username.localeCompare(b.username));
      setWorkers(sortedWorkers);
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
      fetchWorkers();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, navigate]);

  const handleDeleteModalOpen = (worker) => {
    setSelectedWorker(worker);
    setDeleteModalOpen(true);
  };
  const handleDeleteModalClose = () => setDeleteModalOpen(false);

  const handleCreateModalOpen = () => setCreateModalOpen(true);
  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setNewWorkerData({ username: '', password: '' });
    setError(null);
  };

  const handleEditModalOpen = (worker) => {
    setSelectedWorker(worker);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => setEditModalOpen(false);

  const handleDelete = async () => {
    try {
      await apiRequest(`/api/workers/${selectedWorker.id}`, 'DELETE');
      setSnackbar({ open: true, message: 'Worker deleted successfully!', severity: 'success' });
      fetchWorkers(); // Refetch after delete
      handleDeleteModalClose();
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message || 'Failed to delete worker.', severity: 'error' });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Frontend validation to match backend requirements
    if (newWorkerData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (newWorkerData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await apiRequest('/api/workers', 'POST', {
        username: newWorkerData.username.trim(),
        password: newWorkerData.password
      });
      setSnackbar({ open: true, message: 'Worker created successfully!', severity: 'success' });
      fetchWorkers(); // Refetch after create
      handleCreateModalClose();
    } catch (err) {
      // Handle backend validation errors
      if (err.responseData?.errors) {
        const errorMessages = err.responseData.errors.map(e => e.msg).join(', ');
        setError(errorMessages);
      } else if (err.responseData?.message) {
        setError(err.responseData.message);
      } else {
        setError(err.message || 'Failed to create worker');
      }
    }
  };

  const handleNewWorkerChange = (e) => {
    setNewWorkerData({ ...newWorkerData, [e.target.name]: e.target.value });
  };

  const handleViewProfile = (userId) => {
    navigate(`/worker-profile/${userId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const renderWorkerTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error && !createModalOpen && !editModalOpen) {
      return (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium">Error loading workers</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Retry
          </button>
        </div>
      );
    }

    if (workers.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          No workers found.
        </div>
      );
    }

    const paginatedWorkers = workers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <div className="mb-10">
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="worker table">
              <TableHead>
                <TableRow>
                  <TableCell>Profile</TableCell>
                  <TableCell align="center">Username</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkers.map((worker) => (
                  <TableRow key={worker.id} hover>
                    <TableCell>
                      <img
                        src={worker.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell align="center">{worker.username}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" onClick={() => handleViewProfile(worker.id)} sx={{ mr: 1 }}>
                        View Profile
                      </Button>
                      <Button variant="contained" size="small" color="primary" onClick={() => handleEditModalOpen(worker)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button variant="contained" size="small" color="error" onClick={() => handleDeleteModalOpen(worker)}>
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
            count={workers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]} // Hide the rows per page dropdown
          />
        </Paper>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <FocalSidebar />
      <div className="ml-64">
        <Navbar />
        <div className="p-6 pt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">CD Workers</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <Button variant="contained" onClick={handleCreateModalOpen}>Create Worker</Button>
          </div>
          {renderWorkerTable()}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={handleDeleteModalClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Delete Worker</Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete {selectedWorker?.username}?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleDeleteModalClose}>Cancel</Button>
            <Button onClick={handleDelete} color="error">Delete</Button>
          </Box>
        </Box>
      </Modal>

      {/* Create Worker Modal */}
      <Modal open={createModalOpen} onClose={handleCreateModalClose}>
        <Box sx={modalStyle} component="form" onSubmit={handleCreate}>
          <Typography variant="h6" component="h2">Create New Worker</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            value={newWorkerData.username}
            onChange={handleNewWorkerChange}
            autoFocus
            helperText="Must be at least 3 characters"
            inputProps={{ minLength: 3 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={newWorkerData.password}
            onChange={handleNewWorkerChange}
            helperText="Must be at least 8 characters"
            inputProps={{ minLength: 8 }}
          />
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCreateModalClose}>Cancel</Button>
            <Button type="submit">Create</Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Worker Modal */}
      {selectedWorker && (
        <EditWorkerModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          worker={selectedWorker}
          onWorkerUpdated={(message) => {
            handleEditModalClose();
            fetchWorkers(); // Refetch workers to show updated data
            setSnackbar({ open: true, message, severity: 'success' });
          }}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

