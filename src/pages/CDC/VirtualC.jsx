import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Box,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Grid,
  Card,
  InputAdornment,
  IconButton 
} from "@mui/material";
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon
} from "@mui/icons-material";

import { apiRequest } from "../../utils/api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Stream");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const tabs = ["Stream", "Classworks"];

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      <Sidebar />
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-10">
          <div className="flex space-x-4 border-b-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg ${
                  activeTab === tab ? "bg-green-800 text-white" : "bg-gray-300 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
            {activeTab === "Stream" && <StreamSection setSnackbar={setSnackbar} />}
            {activeTab === "Classworks" && <ClassworksSection setSnackbar={setSnackbar} />}
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

function StreamSection({ setSnackbar }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    ageFilter: 'all',
    roleFilter: [],
    attachment: null,
    attachmentName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
        const loggedInUser = JSON.parse(userString);
        if (loggedInUser && (loggedInUser.role || loggedInUser.type)) {
          const role = loggedInUser.role || loggedInUser.type;
          setUserRole(role);
        }
    }
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/announcements');
        setAnnouncements(data.announcements || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch announcements',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [setSnackbar]);

  const handleOpenCreateModal = () => {
    setNewAnnouncement({
      title: '',
      message: '',
      ageFilter: 'all',
      roleFilter: userRole ? [userRole] : [],
      attachment: null,
      attachmentName: ''
    });
    setIsCreatingAnnouncement(true);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('message', newAnnouncement.message);
      formData.append('ageFilter', newAnnouncement.ageFilter);
      formData.append('roleFilter', newAnnouncement.roleFilter.join(','));
      if (newAnnouncement.attachment) {
        formData.append('attachment', newAnnouncement.attachment);
      }
      
      const data = await apiRequest('/api/announcements', 'POST', formData, true);
      
      setAnnouncements([data.announcement, ...announcements]);
      setIsCreatingAnnouncement(false);
      setNewAnnouncement({
        title: '',
        message: '',
        ageFilter: 'all',
        roleFilter: [],
        attachment: null,
        attachmentName: ''
      });
      setError(null);
      
      setSnackbar({
        open: true,
        message: 'Announcement created successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error creating announcement:', err);
      const errorMessage = err.message || 'Failed to create announcement';
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAnnouncement({
        ...newAnnouncement,
        attachment: file,
        attachmentName: file.name
      });
    }
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAnnouncements = ageFilter === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.ageFilter === ageFilter || ann.ageFilter === 'all');

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Filter:</label>
            <FormControl size="small">
              <InputLabel>Age Group</InputLabel>
              <Select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                label="Age Group"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="3-4">3.0 - 4.0 years</MenuItem>
                <MenuItem value="4-5">4.1 - 5.0 years</MenuItem>
                <MenuItem value="5-6">5.1 - 5.11 years</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <Button
            onClick={handleOpenCreateModal}
            variant="contained"
            color="primary"
            startIcon={<span>+</span>}
          >
            New Announcement
          </Button>
        </div>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !isCreatingAnnouncement && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && filteredAnnouncements.length === 0 && (
        <Box sx={{ 
          border: 2, 
          borderColor: 'grey.300', 
          borderStyle: 'dashed', 
          borderRadius: 2, 
          p: 6, 
          textAlign: 'center',
          my: 4
        }}>
          <Typography variant="h6" gutterBottom>
            No announcements yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Get started by creating a new announcement.
          </Typography>
          <Button
            onClick={handleOpenCreateModal}
            variant="contained"
            color="primary"
          >
            Create Announcement
          </Button>
        </Box>
      )}

      {!loading && filteredAnnouncements.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredAnnouncements.map((announcement) => (
            <Paper key={announcement.id} elevation={3} sx={{ p: 0 }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Posted by {announcement.author} on {new Date(announcement.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip 
                  label={announcement.ageFilter === 'all' ? 'All Ages' : `${announcement.ageFilter} years`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                  {announcement.message}
                </Typography>
                
                {announcement.attachmentUrl && (
                  <Box sx={{ 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>{announcement.attachmentName}</Typography>
                    </Box>
                    <Button
                      onClick={() => handleDownload(announcement.attachmentUrl, announcement.attachmentName)}
                      color="primary"
                      size="small"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Modal open={isCreatingAnnouncement} onClose={() => setIsCreatingAnnouncement(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Create New Announcement
          </Typography>
          
          <form onSubmit={handleCreateAnnouncement}>
            <TextField
              label="Title"
              fullWidth
              required
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Message"
              fullWidth
              required
              multiline
              rows={4}
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Age Group</InputLabel>
              <Select
                value={newAnnouncement.ageFilter}
                label="Target Age Group"
                onChange={(e) => setNewAnnouncement({...newAnnouncement, ageFilter: e.target.value})}
                required
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="3-4">3.0 - 4.0 years</MenuItem>
                <MenuItem value="4-5">4.1 - 5.0 years</MenuItem>
                <MenuItem value="5-6">5.1 - 5.11 years</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Target Roles</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label="CD Workers"
                  color={newAnnouncement.roleFilter.includes('worker') ? 'primary' : 'default'}
                  clickable={userRole !== 'worker'}
                  onClick={() => {
                    if (userRole !== 'worker') {
                      setNewAnnouncement((prev) => {
                        const exists = prev.roleFilter.includes('worker');
                        return {
                          ...prev,
                          roleFilter: exists
                            ? prev.roleFilter.filter((r) => r !== 'worker')
                            : [...prev.roleFilter, 'worker']
                        };
                      });
                    }
                  }}
                />
                <Chip
                  label="President"
                  color={newAnnouncement.roleFilter.includes('president') ? 'primary' : 'default'}
                  clickable={userRole !== 'president'}
                  onClick={() => {
                    if (userRole !== 'president') {
                      setNewAnnouncement((prev) => {
                        const exists = prev.roleFilter.includes('president');
                        return {
                          ...prev,
                          roleFilter: exists
                            ? prev.roleFilter.filter((r) => r !== 'president')
                            : [...prev.roleFilter, 'president']
                        };
                      });
                    }
                  }}
                />
                <Chip
                  label="Parents"
                  color={newAnnouncement.roleFilter.includes('parent') ? 'primary' : 'default'}
                  clickable={userRole !== 'parent'}
                  onClick={() => {
                    if (userRole !== 'parent') {
                      setNewAnnouncement((prev) => {
                        const exists = prev.roleFilter.includes('parent');
                        return {
                          ...prev,
                          roleFilter: exists
                            ? prev.roleFilter.filter((r) => r !== 'parent')
                            : [...prev.roleFilter, 'parent']
                        };
                      });
                    }
                  }}
                />
              </Box>
            </FormControl>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Attachment (Optional)</Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                {newAnnouncement.attachmentName ? (
                  <Typography>{newAnnouncement.attachmentName}</Typography>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Drag and drop file here or click to browse
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                    >
                      Select File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      PDF, DOCX, XLSX up to 10MB
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => setIsCreatingAnnouncement(false)}
                variant="outlined"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Post Announcement'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

function ClassworksSection({ setSnackbar }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null); // For editing
  const [activityData, setActivityData] = useState({
    title: '',
    description: '',
    due_date: '',
    activityFile: null,
    activityFileName: ''
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/activities');
      setActivities(data || []);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: 'Failed to fetch classworks.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [setSnackbar]);

  const handleOpenModal = (activity = null) => {
    setCurrentActivity(activity);
    if (activity) {
      setActivityData({
        title: activity.title,
        description: activity.description,
        due_date: activity.due_date ? new Date(activity.due_date).toISOString().split('T')[0] : '',
        activityFile: null,
        activityFileName: activity.file_path ? path.basename(activity.file_path) : ''
      });
    } else {
      setActivityData({ title: '', description: '', due_date: '', activityFile: null, activityFileName: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentActivity(null);
    setActivityData({ title: '', description: '', due_date: '', activityFile: null, activityFileName: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActivityData({
        ...activityData,
        activityFile: file,
        activityFileName: file.name
      });
    }
  };

  const handleSave = async () => {
    if (!activityData.title) {
      setSnackbar({ open: true, message: 'Title is required.', severity: 'warning' });
      return;
    }

    const apiPath = currentActivity ? `/api/activities/${currentActivity.activity_id}` : '/api/activities';
    const method = currentActivity ? 'PUT' : 'POST';

    try {
      // For new activities, we use FormData for file upload
      if (method === 'POST') {
        const formData = new FormData();
        formData.append('title', activityData.title);
        formData.append('description', activityData.description);
        formData.append('due_date', activityData.due_date);
        if (activityData.activityFile) {
          formData.append('activityFile', activityData.activityFile);
        }
        await apiRequest(apiPath, method, formData, true); // isFormData = true
      } else {
        // For updating, we send JSON as the backend doesn't handle file updates
        await apiRequest(apiPath, method, {
          title: activityData.title,
          description: activityData.description,
          due_date: activityData.due_date,
        });
      }

      setSnackbar({
        open: true,
        message: `Classwork ${currentActivity ? 'updated' : 'created'} successfully.`,
        severity: 'success'
      });
      handleCloseModal();
      fetchActivities(); // Refresh list
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${currentActivity ? 'update' : 'create'} classwork.`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this classwork?')) {
      try {
        await apiRequest(`/api/activities/${activityId}`, 'DELETE');
        setSnackbar({ open: true, message: 'Classwork deleted successfully.', severity: 'success' });
        fetchActivities(); // Refresh list
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete classwork.', severity: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="text-gray-800">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Classworks
        </Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>
          Add Classwork
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No classworks found.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.activity_id}>
                  <TableCell>{activity.title}</TableCell>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{activity.file_path ? activity.file_path.split('-').slice(1).join('-') : 'None'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(activity)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(activity.activity_id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            {currentActivity ? 'Edit Classwork' : 'Add Classwork'}
          </Typography>
          <TextField
            label="Title"
            fullWidth
            required
            value={activityData.title}
            onChange={(e) => setActivityData({ ...activityData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={activityData.description}
            onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            value={activityData.due_date}
            onChange={(e) => setActivityData({ ...activityData, due_date: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          
          {!currentActivity && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Attachment (Optional)</Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                {activityData.activityFileName ? (
                  <Typography>{activityData.activityFileName}</Typography>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Click to browse for a file
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                    >
                      Select File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

