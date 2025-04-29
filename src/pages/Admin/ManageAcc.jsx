import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import UserInfoModal from "../../components/Admin/UserInfoModal";
import bcrypt from 'bcryptjs';
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

const CreateUserModal = ({ open, onClose, onUserCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("worker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const data = await response.json();
      onUserCreated(data.id);
      onClose();
      setUsername("");
      setPassword("");
      setType("worker");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <Box
        sx={{
          width: "600px",
          backgroundColor: "white",
          borderRadius: 3,
          p: 4,
          boxShadow: 24,
        }}
      >
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              value={type}
              label="User Type"
              onChange={(e) => setType(e.target.value)}
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
  const [username, setUsername] = useState(user?.username || "");
  const [type, setType] = useState(user?.type || "worker");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [updateData, setUpdateData] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setType(user.type);
      setPassword("");
    }
  }, [user]);

  const prepareUpdate = (e) => {
    e.preventDefault();
    
    if (!username) {
      setError("Username is required");
      return;
    }

    const dataToUpdate = { username, type };
    if (password) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      dataToUpdate.password = password;
    }

    setUpdateData(dataToUpdate);
    setShowConfirmation(true);
  };

  const executeUpdate = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError("");
  
    try {
      // DON'T hash on the frontend - send plaintext password
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: updateData.username,
          password: updateData.password, // plaintext
          type: updateData.type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      onUserUpdated();
      onClose();
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Edit Modal */}
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <Box
          sx={{
            width: "600px",
            backgroundColor: "white",
            borderRadius: 3,
            p: 4,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: "center" }}>
            Edit User
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <form onSubmit={prepareUpdate}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                value={type}
                label="User Type"
                onChange={(e) => setType(e.target.value)}
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

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <Box
          sx={{
            width: "500px",
            backgroundColor: "white",
            borderRadius: 3,
            p: 4,
            boxShadow: 24,
          }}
        >
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
            <Typography><strong>Username:</strong> {username}</Typography>
            <Typography><strong>Type:</strong> {type}</Typography>
            {updateData?.password && (
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
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userPassword, setUserPassword] = useState("••••••••");
  const [fetchingPassword, setFetchingPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showSnackbar("Failed to fetch users", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchUserPassword = async (userId) => {
    setFetchingPassword(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/password`);
      if (!response.ok) {
        throw new Error('Failed to fetch password');
      }
      const data = await response.json();
      return data.password;
    } catch (error) {
      console.error("Error fetching password:", error);
      showSnackbar("Failed to fetch password", "error");
      return null;
    } finally {
      setFetchingPassword(false);
    }
  };

  const handleSearchChange = async (event, newValue) => {
    setSearchQuery(newValue);
    if (newValue) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/users/search?query=${newValue}`
        );
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        const results = await response.json();
        setUsers(results);
      } catch (error) {
        console.error("Error searching users:", error);
        showSnackbar("Failed to search users", "error");
      }
    } else {
      const response = await fetch("http://localhost:3001/api/users");
      const data = await response.json();
      setUsers(data);
    }
  };

  const saveUserInfo = async (infoData) => {
    try {
      const response = await fetch("http://localhost:3001/api/user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(infoData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user info');
      }
      
      const usersResponse = await fetch("http://localhost:3001/api/users");
      const usersData = await usersResponse.json();
      setUsers(usersData);
      showSnackbar("User info saved successfully");
    } catch (err) {
      console.error("Error saving user info:", err);
      showSnackbar("Failed to save user info", "error");
      throw err;
    }
  };

  const handleUserSelect = (event, newValue) => {
    const selected = users.find((user) => user.username === newValue);
    setSelectedUser(selected);
    setShowUserPassword(false);
    setUserPassword("••••••••");
  };

  const handleUserCreated = async (userId) => {
    try {
      const response = await fetch("http://localhost:3001/api/users");
      const data = await response.json();
      setUsers(data);
      setNewUserId(userId);
      setShowInfoModal(true);
      showSnackbar("User created successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      showSnackbar("Failed to create user", "error");
    }
  };

  const handleUserUpdated = async () => {
    try {
      // Refetch all users
      const response = await fetch("http://localhost:3001/api/users");
      const data = await response.json();
      setUsers(data);
      
      // Update the selected user with the latest data
      if (selectedUser) {
        const updatedUser = data.find(u => u.id === selectedUser.id);
        setSelectedUser(updatedUser);
        
        // Update the search query to match the new username if it changed
        if (updatedUser.username !== searchQuery) {
          setSearchQuery(updatedUser.username);
        }
      }
      
      showSnackbar("User updated successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      showSnackbar("Failed to update user", "error");
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
  
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to delete user");
  
      // Refetch users after deletion
      const usersResponse = await fetch("http://localhost:3001/api/users");
      const usersData = await usersResponse.json();
      setUsers(usersData);
      setSelectedUser(null); // Reset selected user
      setSearchQuery("");
      showSnackbar("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      showSnackbar("Failed to delete user", "error");
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto w-full">
        <Navbar />

        {/* Header */}
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

        {/* Search Bar */}
        <div className="px-6">
          <Autocomplete
            value={searchQuery}
            onInputChange={handleSearchChange}
            onChange={handleUserSelect}
            options={users.map((user) => user.username)}
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
            renderOption={(props, option) => (
              <Box {...props} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>{option}</Typography>
              </Box>
            )}
          />
        </div>

        {/* Selected User Display */}
        <div className="p-10 flex justify-start items-center h-full relative">
          {selectedUser && (
            <Box sx={{ 
              marginTop: -10,
              width: "40%", 
              marginLeft: "-15px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: 3,
              borderRadius: 2,
              boxShadow: 3
            }}>
              <TextField
                label="Username"
                value={selectedUser.username}
                variant="outlined"
                fullWidth
                disabled
                sx={{ marginBottom: 2 }}
              />
              
              <TextField
                label="Password"
                type={showUserPassword ? "text" : "password"}
                value={showUserPassword ? userPassword : "••••••••"}
                variant="outlined"
                fullWidth
                disabled
                sx={{ marginBottom: 2 }}
                InputProps={{
                  endAdornment: fetchingPassword ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconButton 
                      onClick={async () => {
                        if (!showUserPassword) {
                          const password = await fetchUserPassword(selectedUser.id);
                          if (password) {
                            setUserPassword(password);
                          }
                        }
                        setShowUserPassword(!showUserPassword);
                      }}
                    >
                      {showUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  ),
                }}
              />
              
              <TextField
                label="User Type"
                value={
                  selectedUser.type === 'admin' ? 'Administrator' :
                  selectedUser.type === 'worker' ? 'CD Worker' :
                  selectedUser.type === 'parent' ? 'Parent' :
                  selectedUser.type === 'president' ? 'President' : 'Regular User'
                }
                variant="outlined"
                fullWidth
                disabled
                sx={{ marginBottom: 2 }}
              />
            </Box>
          )}
        </div>
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
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