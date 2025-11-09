import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import locationData from "../../components/ECCDC/loc.json";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, TableContainer, Box, Autocomplete, InputAdornment,
  TablePagination,
  Modal,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { apiRequest } from "../../utils/api";

const CreateUserModal = ({ open, onClose, onUserCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    type: "president"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData({ username: "", password: "", type: "president" });
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      return;
    }
  
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
  
    setLoading(true);
  
    try {
      const userData = await apiRequest('/api/cdc/presidents', 'POST', {
        username: formData.username,
        password: formData.password
      });
      
      if (!userData.success) {
        throw new Error(userData.message || 'Failed to create president');
      }
      
      onUserCreated(userData.data.id);
      onClose();
      
    } catch (err) {
      console.error('Error in president creation:', err);
      setError(err.message || 'Failed to create president');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        width: "450px",
        backgroundColor: "white",
        borderRadius: 3,
        p: 4,
        boxShadow: 24,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: "center" }}>
          Create New President
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            fullWidth
            sx={{ mb: 2 }}
            helperText="Only letters, numbers, underscores, and periods allowed"
            inputProps={{
              pattern: "[a-zA-Z0-9_.]+",
              title: "Only letters, numbers, underscores, and periods allowed",
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            fullWidth
            sx={{ mb: 2 }}
            helperText="Minimum 8 characters"
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <VisibilityOff size={20} /> : <Visibility size={20} />}
                </IconButton>
              ),
            }}
          />

          <TextField
            label="User Type"
            value="President"
            fullWidth
            sx={{ mb: 2 }}
            disabled
            helperText="All new users are created as Presidents"
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button onClick={onClose} disabled={loading} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Create President"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

const EditUserModal = ({ open, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    type: user?.type || "worker",
    password: "",
    cdc_id: user?.cdc_id || null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cdcLoading, setCdcLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cdcOptions, setCdcOptions] = useState([]);
  const [selectedCdc, setSelectedCdc] = useState(null);

  // Fetch CDC options and set initial selected CDC
  useEffect(() => {
    const fetchCdcOptions = async () => {
      if (open) {
        setCdcLoading(true);
        try {
          const response = await apiRequest('/api/cdc');
          const cdcs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
          
          // Transform CDC data to ensure consistent structure
          const formattedCdcs = cdcs.map(cdc => ({
            cdcId: cdc.cdcId || cdc.cdc_id,
            name: cdc.name,
            region: cdc.region,
            province: cdc.province,
            municipality: cdc.municipality,
            barangay: cdc.barangay
          }));

          setCdcOptions(formattedCdcs);
          
          // If editing a president, find and set their current CDC
          if (user?.type === 'president' && user?.cdc_id) {
            const currentCdc = formattedCdcs.find(c => c.cdcId === user.cdc_id);
            if (currentCdc) {
              setSelectedCdc(currentCdc);
              setFormData(prev => ({ ...prev, cdc_id: currentCdc.cdcId }));
            }
          }
        } catch (err) {
          console.error("Error fetching CDC options:", err);
          setCdcOptions([]);
        } finally {
          setCdcLoading(false);
        }
      }
    };

    if (open) {
      fetchCdcOptions();
      // Reset form when opening
      setFormData({
        username: user?.username || "",
        type: user?.type || "worker",
        password: "",
        cdc_id: user?.cdc_id || null
      });
      setSelectedCdc(null);
      setError("");
    }
  }, [open, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Validation
    if (!formData.username) {
      setError("Username is required");
      return;
    }
  
    if (formData.password && formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
  
    // Additional validation for president type
    if (formData.type === 'president') {
      if (!selectedCdc) {
        setError("Please select a CDC for the president");
        return;
      }
      if (!selectedCdc?.cdcId) {
        setError("Please select a valid CDC");
        return;
      }
    }
  
    setShowConfirmation(true);
  };

  const executeUpdate = async () => {
    setShowConfirmation(false);
    setLoading(true);
  
    try {
      const updatePayload = {
        username: formData.username,
        type: formData.type,
        ...(formData.password && { password: formData.password }),
        // Only include cdc_id if type is president
        ...(formData.type === 'president' && { 
          cdc_id: selectedCdc?.cdcId 
        })
      };
  
      await apiRequest(`/api/cdc/users/cdc/${user.id}`, 'PUT', updatePayload);
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={{ 
          width: "600px", 
          backgroundColor: "white",
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: "center" }}>
            Edit User
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="New Password (leave blank to keep current)"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff size={20} /> : <Visibility size={20} />}
                  </IconButton>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {formData.type === 'president' && (
                <FormControl sx={{ flex: 1 }}>
                  <Autocomplete
                    options={cdcOptions}
                    getOptionLabel={(option) => `${option.name} (ID: ${option.cdcId})`}
                    value={selectedCdc}
                    onChange={(_, newValue) => {
                      setSelectedCdc(newValue);
                      // Update formData with the new CDC ID
                      setFormData(prev => ({
                        ...prev,
                        cdc_id: newValue?.cdcId || null
                      }));
                    }}
                    isOptionEqualToValue={(option, value) => option.cdcId === value.cdcId}
                    loading={cdcLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select CDC"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {cdcLoading ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button 
                onClick={onClose} 
                disabled={loading}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Update User"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <Box sx={{ 
          width: "500px", 
          backgroundColor: "white",
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3, textAlign: "center" }}>
            Confirm User Update
          </Typography>

          <Typography sx={{ mb: 2 }}>
            Are you sure you want to update this user?
          </Typography>

          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            mb: 3
          }}>
            <Typography><strong>Username:</strong> {formData.username}</Typography>
            <Typography><strong>Type:</strong> {formData.type}</Typography>
            {formData.type === 'president' && selectedCdc && (
              <>
                <Typography><strong>CDC Name:</strong> {selectedCdc.name}</Typography>
                <Typography><strong>CDC ID:</strong> {selectedCdc.cdcId}</Typography>
              </>
            )}
            {formData.password && (
              <Typography><strong>Password:</strong> Will be updated</Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button 
              onClick={() => setShowConfirmation(false)} 
              variant="outlined"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={executeUpdate}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Confirm Update"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

const DeleteConfirmationModal = ({ open, onClose, onConfirm, user, loading }) => {
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        width: "450px",
        backgroundColor: "white",
        borderRadius: 3,
        p: 4,
        boxShadow: 24,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: "center" }}>
          Confirm Deletion
        </Typography>
        <Typography sx={{ mb: 3, textAlign: 'center' }}>
          Are you sure you want to delete the user <strong>{user.username}</strong>? This action cannot be undone.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
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
  );
};

const ECCDCAccountList = () => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Location filter states
  const [locationFilter, setLocationFilter] = useState({
    province: null,
    municipality: null,
    barangay: null
  });
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Populate provinces on component mount
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
  }, [locationFilter.municipality, locationFilter.province]);

  // Fetch admins from API with debounced search and filters
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        province: locationFilter.province || '',
        municipality: locationFilter.municipality || '',
        barangay: locationFilter.barangay || ''
      });
      const data = await apiRequest(`/api/cdc/preslist?${params.toString()}`);
      setAdmins(data.users || []);
    } catch (error) {
      setNotification({ open: true, message: error.message || 'Failed to fetch users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAdmins();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, locationFilter]);


  // CRUD handlers
  const handleUserCreated = () => {
    fetchAdmins();
    setNotification({ open: true, message: 'User created successfully!', severity: 'success' });
  };
  const handleUserUpdated = () => {
    fetchAdmins();
    setNotification({ open: true, message: 'User updated successfully!', severity: 'success' });
  };
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };
  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      await apiRequest(`/api/users/${userToDelete.id}`, 'DELETE');
      setNotification({ open: true, message: 'User deleted successfully!', severity: 'success' });
      fetchAdmins();
    } catch (err) {
      setNotification({ open: true, message: err.message || 'Failed to delete user.', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  // Table rendering
  const renderAdminTable = () => {
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - admins.length) : 0;
    return (
      <Paper sx={{ width: '100%', mb: 2, mt: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Profile</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">CDC Location</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((admin) => (
                  <TableRow
                    key={admin.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                      '& > *': { padding: '6px 16px !important' } // Reduce row height
                    }}
                  >
                    <TableCell>
                      <img
                        src={admin.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-8 h-8 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell align="center">{admin.username}</TableCell>
                    <TableCell align="center">
                      {admin.cdc_location ? 
                        `${admin.cdc_location.barangay}, ${admin.cdc_location.municipality}, ${admin.cdc_location.province}` : 
                        'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => navigate(`/account-profile/${admin.id}`)}
                          sx={{ mr: 1 }}
                        >
                          Profile
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleEdit(admin)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small" 
                          onClick={() => handleDelete(admin)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={admins.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
        />
      </Paper>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <div className="p-4">
          <Paper sx={{ p: 3, borderRadius: 3, mt: 8 }}>
            <Typography variant="h5" gutterBottom>
              President Accounts
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr auto'
              }, 
              gap: 2, 
              mb: 2,
              alignItems: 'center'
            }}>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <Autocomplete
                options={provinces}
                value={locationFilter.province}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, province: newValue, municipality: null, barangay: null }));
                }}
                renderInput={(params) => <TextField {...params} label="Province" size="small" />}
              />
              <Autocomplete
                options={municipalities}
                value={locationFilter.municipality}
                disabled={!locationFilter.province}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, municipality: newValue, barangay: null }));
                }}
                renderInput={(params) => <TextField {...params} label="Municipality" size="small" />}
              />
              <Autocomplete
                options={barangays}
                value={locationFilter.barangay}
                disabled={!locationFilter.municipality}
                onChange={(event, newValue) => {
                  setLocationFilter(prev => ({ ...prev, barangay: newValue }));
                }}
                renderInput={(params) => <TextField {...params} label="Barangay" size="small" />}
              />
              <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ height: '40px', whiteSpace: 'nowrap' }}>
                Add President
              </Button>
            </Box>
            {renderAdminTable()}
          </Paper>
        </div>
      </div>
      <CreateUserModal 
        open={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
      {selectedUser && (
        <EditUserModal 
          open={isEditModalOpen} 
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        user={userToDelete}
        loading={loading}
      />
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ECCDCAccountList;