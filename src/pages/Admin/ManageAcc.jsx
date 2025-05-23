import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
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
    type: "parent",
    guardianId: "" // New field for guardian association
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guardians, setGuardians] = useState([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);

  // Fetch guardians when modal opens
  useEffect(() => {
    if (open) {
      const fetchGuardians = async () => {
  setGuardiansLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching guardians...');
    const response = await fetch(`${API_URL}/api/parent/guardians`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response data:', errorData);
      throw new Error(errorData.error || 'Failed to fetch guardians');
    }
    
    const data = await response.json();
    console.log('Received guardians data:', data);
    setGuardians(data);
  } catch (err) {
    console.error("Failed to fetch guardians:", err);
    setError(`Failed to load guardians list: ${err.message}`);
  } finally {
    setGuardiansLoading(false);
  }
};
      fetchGuardians();
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
      const response = await fetch(`${API_URL}/api/parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          guardianId: formData.guardianId || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create parent account');
      }

      const data = await response.json();
      onUserCreated(data.id);
      onClose();
      setFormData({ username: "", password: "", type: "parent", guardianId: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Create New Parent Account
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

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="guardian-select-label">Associate Existing Guardian (Optional)</InputLabel>
            <Select
              labelId="guardian-select-label"
              id="guardian-select"
              value={formData.guardianId}
              label="Associate Existing Guardian (Optional)"
              onChange={(e) => setFormData({...formData, guardianId: e.target.value})}
              disabled={guardiansLoading}
            >
              <MenuItem value="">
                <em>None - Create new guardian</em>
              </MenuItem>
              {guardians.map((guardian) => (
                <MenuItem key={guardian.guardian_id} value={guardian.guardian_id}>
                  {guardian.guardian_name} ({guardian.relationship} of {guardian.student_name})
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              You can associate this account with an existing guardian record
            </Typography>
          </FormControl>

          <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
            This account will be created as a Parent type and linked to your CDC center.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || guardiansLoading}
            >
              {loading ? <CircularProgress size={24} /> : "Create Parent Account"}
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
    type: "parent", // Locked to parent
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        type: "parent", // Force parent type
        password: ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username) {
      setError("Username is required");
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setShowConfirmation(true);
  };

  const executeUpdate = async () => {
    setShowConfirmation(false);
    setLoading(true);

    try {
      const updatePayload = {
        username: formData.username,
        type: "parent", // Ensure type remains parent
        ...(formData.password && { password: formData.password })
      };

      await apiRequest(`/api/parent/${user.id}`, 'PUT', updatePayload);
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
            Edit Parent Account
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
              label="New Password (leave blank to keep current)"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              fullWidth
              sx={{ mb: 2 }}
              helperText="Minimum 8 characters if changing"
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

            <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
              This account is a Parent type and cannot be changed.
            </Typography>

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
                {loading ? <CircularProgress size={24} /> : "Review Changes"}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

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
            Confirm Changes
          </Typography>

          <Typography sx={{ mb: 2 }}>
            Are you sure you want to update this parent account?
          </Typography>

          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            mb: 3,
            borderLeft: '4px solid',
            borderColor: 'primary.main'
          }}>
            <Typography><strong>Username:</strong> {formData.username}</Typography>
            <Typography><strong>Type:</strong> Parent (cannot be changed)</Typography>
            {formData.password && (
              <Typography><strong>Password:</strong> Will be updated (securely hashed)</Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button 
              onClick={() => setShowConfirmation(false)} 
              variant="outlined"
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              onClick={executeUpdate}
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? <CircularProgress size={24} /> : "Confirm Update"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

const ManageAcc = () => {
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
      const data = await apiRequest('/api/parent');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching parent accounts:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch parent accounts",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      const endpoint = query ? `/api/parent/search?query=${query}` : '/api/parent';
      const data = await apiRequest(endpoint);
      setUsers(data);
    } catch (error) {
      console.error("Error searching parent accounts:", error);
      setSnackbar({
        open: true,
        message: "Failed to search parent accounts",
        severity: "error"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this parent account?")) return;
    
    try {
      await apiRequest(`/api/parent/${userId}`, 'DELETE');
      await fetchUsers();
      setSelectedUser(null);
      setSearchQuery("");
      setSnackbar({
        open: true,
        message: "Parent account deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error deleting parent account:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete parent account",
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
      message: "Parent account created successfully",
      severity: "success"
    });
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setSnackbar({
      open: true,
      message: "Parent account updated successfully",
      severity: "success"
    });
  };

  const saveUserInfo = async (infoData) => {
    try {
      await apiRequest('/api/parent/user-info', 'POST', infoData);
      await fetchUsers();
      setSnackbar({
        open: true,
        message: "Parent info saved successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error saving parent info:", error);
      setSnackbar({
        open: true,
        message: "Failed to save parent info",
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
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto w-full">
        <Navbar />

        <div className="p-6 mb-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Manage Parent Accounts</h2>
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
                Add Parent
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
                label="Search Parent Accounts"
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
                Parent Account Details
              </Typography>
              <Typography>Username: {selectedUser.username}</Typography>
              <Typography>CDC ID: {selectedUser.cdc_id}</Typography>
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

export default ManageAcc;