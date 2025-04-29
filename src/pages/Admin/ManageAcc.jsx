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
    type: "worker"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const data = await apiRequest('/api/users', 'POST', formData);
      onUserCreated(data.id);
      onClose();
      setFormData({ username: "", password: "", type: "worker" });
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
          Create New User
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

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              value={formData.type}
              label="User Type"
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <MenuItem value="worker">CD Worker</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="president">President</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Create User"}
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
        type: user.type,
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
        type: formData.type,
        ...(formData.password && { password: formData.password })
      };

      await apiRequest(`/api/users/${user.id}`, 'PUT', updatePayload);
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

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>User Type</InputLabel>
              <Select
                value={formData.type}
                label="User Type"
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <MenuItem value="worker">CD Worker</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="president">President</MenuItem>
              </Select>
            </FormControl>

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
            Are you sure you want to update this user?
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
            <Typography><strong>Type:</strong> {formData.type}</Typography>
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
      const data = await apiRequest('/api/users');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch users",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      const endpoint = query ? `/api/users/search?query=${query}` : '/api/users';
      const data = await apiRequest(endpoint);
      setUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
      setSnackbar({
        open: true,
        message: "Failed to search users",
        severity: "error"
      });
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
                Add User
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
                label="Search User"
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