import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import bgImage from "../../assets/bg1.jpg";
import UserInfoModal from "../../components/Admin/UserInfoModal";
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  Typography,
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

const CreateUserModal = ({ open, onClose, onUserCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    type: "president"
  });
  const [loading, setLoading] = useState(false);
  const [cdcLoading, setCdcLoading] = useState(false);
  const [error, setError] = useState("");
  const [cdcOptions, setCdcOptions] = useState([]);
  const [selectedCdc, setSelectedCdc] = useState(null);

  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchCdcOptions = async (query = "") => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    setSearchTimeout(setTimeout(async () => {
      if (!query.trim()) {
        setCdcOptions([]);
        return;
      }
      
      setCdcLoading(true);
      try {
        const response = await apiRequest(`/api/cdc/search/name?name=${encodeURIComponent(query)}`);
        const cdcs = response.data || response;
        setCdcOptions(Array.isArray(cdcs) ? cdcs : []);
      } catch (err) {
        console.error("Error fetching CDC options:", err);
        setCdcOptions([]);
      } finally {
        setCdcLoading(false);
      }
    }, 300));
  };

  useEffect(() => {
    if (open) {
      fetchCdcOptions();
      setFormData({ username: "", password: "", type: "president" });
      setSelectedCdc(null);
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
  
    if (!selectedCdc) {
      setError("Please select a CDC for the president");
      return;
    }
  
    setLoading(true);
  
    try {
      if (!selectedCdc.cdc_id) {
        throw new Error('Invalid CDC selection - missing ID');
      }
  
      const verifyResponse = await apiRequest(`/api/cdc/${selectedCdc.cdc_id}`);
  
      if (!verifyResponse.success || !verifyResponse.data) {
        throw new Error('Selected CDC not found in database');
      }
  
      const userData = await apiRequest('/api/cdc/presidents', 'POST', {
        username: formData.username,
        password: formData.password,
        cdc_id: selectedCdc.cdc_id
      });
      
      if (!userData.success) {
        throw new Error(userData.message || 'Failed to create president');
      }
      
      onUserCreated(userData.userId);
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
            helperText="Only letters, numbers and underscores allowed"
            inputProps={{
              pattern: "[a-zA-Z0-9_]+",
              title: "Only letters, numbers and underscores allowed",
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

          <Autocomplete
            options={cdcOptions}
            getOptionLabel={(option) => option.name}
            value={selectedCdc}
            onChange={(_, newValue) => setSelectedCdc(newValue)}
            onInputChange={(_, newInputValue, reason) => {
              if (reason === 'input') {
                fetchCdcOptions(newInputValue);
              }
            }}
            loading={cdcLoading}
            filterOptions={(options) => options}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search CDC by Name"
                required
                helperText="Type at least 1 character to search"
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button onClick={onClose} disabled={loading} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !selectedCdc}
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
          const cdcs = response.data || response;
          setCdcOptions(Array.isArray(cdcs) ? cdcs : []);
          
          // If editing a president, find and set their current CDC
          if (user?.type === 'president' && user?.cdc_id) {
            const currentCdc = cdcs.find(c => c.cdc_id === user.cdc_id);
            if (currentCdc) {
              setSelectedCdc(currentCdc);
              setFormData(prev => ({ ...prev, cdc_id: currentCdc.cdc_id }));
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
      if (!selectedCdc.cdc_id) {
        setError("Invalid CDC selection");
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
          cdc_id: selectedCdc.cdc_id 
        })
      };
  
      await apiRequest(`/api/cdc/users/cdc/${user.id}`, 'PUT', updatePayload);
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={formData.type}
                  label="User Type"
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData({
                      ...formData,
                      type: newType,
                      // Clear CDC if changing from president to another type
                      cdc_id: newType === 'president' ? formData.cdc_id : null
                    });
                    // Clear CDC selection if not president
                    if (newType !== 'president') {
                      setSelectedCdc(null);
                    }
                  }}
                >
                  <MenuItem value="worker">CD Worker</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="president">President</MenuItem>
                </Select>
              </FormControl>

              {formData.type === 'president' && (
                <FormControl sx={{ flex: 1 }}>
                  <Autocomplete
                    options={cdcOptions}
                    getOptionLabel={(option) => `${option.name} (${option.cdc_id})`}
                    value={selectedCdc}
                    onChange={(_, newValue) => {
                      setSelectedCdc(newValue);
                      // Update formData with the new CDC ID
                      setFormData(prev => ({
                        ...prev,
                        cdc_id: newValue?.cdc_id || null
                      }));
                    }}
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
                <Typography><strong>CDC:</strong> {selectedCdc.name}</Typography>
                <Typography><strong>CDC ID:</strong> {selectedCdc.cdc_id}</Typography>
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

const ECCDCManageAcc = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [newUserId, setNewUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/cdc/admins');
      const adminUsers = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setUsers(adminUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setUsers([]);
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch admin users",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const endpoint = query?.trim() 
        ? `/api/cdc/admins/search?query=${encodeURIComponent(query)}` 
        : '/api/cdc/admins';
      
      const response = await apiRequest(endpoint);
      const filteredAdmins = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      
      setUsers(filteredAdmins);
      
      if (filteredAdmins.length === 0 && query?.trim()) {
        setSnackbar({
          open: true,
          message: "No matching admin users found",
          severity: "info"
        });
      }
    } catch (error) {
      console.error("Error searching admin users:", error);
      setUsers([]);
      setSnackbar({
        open: true,
        message: error.message || "Failed to search admin users",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await apiRequest(`/api/users/${userId}`, 'DELETE');
      await fetchUsers();
      setSelectedUser(null);
      setSearchQuery("");
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error"
      });
    }
  };

  const handleUserCreated = (userId) => {
    fetchUsers();
    setNewUserId(userId);
    setShowInfoModal(true);
    setSnackbar({
      open: true,
      message: "User created successfully",
      severity: "success"
    });
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setSnackbar({
      open: true,
      message: "User updated successfully",
      severity: "success"
    });
  };

  const saveUserInfo = async (infoData) => {
    try {
      await apiRequest('/api/users/user-info', 'POST', infoData);
      await fetchUsers();
      setSnackbar({
        open: true,
        message: "User info saved successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error saving user info:", error);
      setSnackbar({
        open: true,
        message: "Failed to save user info",
        severity: "error"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-screen h-screen flex overflow-hidden relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto w-full">
        <Navbar />

        <div className="p-6 mb-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Account</h2>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Edit size={18} />}
                onClick={() => setOpenEditModal(true)}
                disabled={!selectedUser || loading}
              >
                Edit Account
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={18} />}
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
                disabled={!selectedUser || loading}
              >
                Delete Account
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setOpenUserModal(true)}
                disabled={loading}
              >
                Add President
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6">
          <Autocomplete
            value={searchQuery}
            onInputChange={(_, newValue) => {
              setSearchQuery(newValue);
              handleSearch(newValue);
            }}
            onChange={(_, newValue) => {
              const user = users.find(u => u.username === newValue);
              setSelectedUser(user || null);
            }}
            options={users.map(user => user.username)}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Admin Users"
                variant="outlined"
                sx={{ width: "300px" }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>

        {selectedUser && (
          <div className="p-10">
            <Box sx={{ 
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: 3,
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Typography>Username: {selectedUser.username}</Typography>
              <Typography>
                Role: {selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}
              </Typography>
              {selectedUser.cdc_id && (
                <Typography>
                  CDC ID: {selectedUser.cdc_id}
                </Typography>
              )}
            </Box>
          </div>
        )}
      </div>

      <CreateUserModal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      <UserInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onSave={saveUserInfo}
        userId={newUserId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ECCDCManageAcc;