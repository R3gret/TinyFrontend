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

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  // Always include Authorization if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!isFormData && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
    credentials: 'include', // Only needed if using cookies
    ...(body && { body: isFormData ? body : JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 specifically to trigger token refresh/logout
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', {
      endpoint,
      method,
      error: error.message
    });
    throw error;
  }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Stream");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const tabs = ["Stream", "Classworks", "Students"];

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
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
            {activeTab === "Students" && <StudentsSection setSnackbar={setSnackbar} />}
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
    attachment: null,
    attachmentName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');

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

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('message', newAnnouncement.message);
      formData.append('ageFilter', newAnnouncement.ageFilter);
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
            onClick={() => setIsCreatingAnnouncement(true)}
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
            onClick={() => setIsCreatingAnnouncement(true)}
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
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    category_id: '',
    age_group_id: '',
    file_name: '',
    file_type: '',
    file_data: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCounts, setFileCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [categoriesData, ageGroupsData] = await Promise.all([
          apiRequest('/api/files/categories'),
          apiRequest('/api/files/age-groups')
        ]);
        
        setCategories(categoriesData.categories || []);
        setAgeGroups(ageGroupsData.ageGroups || []);
        
        if (selectedAgeGroup) {
          const countsData = await apiRequest(
            `/api/files/counts?age_group_id=${selectedAgeGroup}`
          );
          setFileCounts(countsData.counts || {});
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedAgeGroup, setSnackbar]);

  useEffect(() => {
    if (selectedAgeGroup && !selectedCategory) {
      const fetchFileCounts = async () => {
        try {
          const data = await apiRequest(
            `/api/files/counts?age_group_id=${selectedAgeGroup}`
          );
          setFileCounts(data.counts || {});
        } catch (err) {
          console.error('Error fetching file counts:', err);
        }
      };
      
      fetchFileCounts();
    }
  }, [selectedAgeGroup, selectedCategory]);

  useEffect(() => {
    if (selectedCategory && selectedAgeGroup) {
      const fetchFiles = async () => {
        try {
          setLoading(true);
          const data = await apiRequest(
            `/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
          );
          setFiles(data.files || []);
        } catch (err) {
          console.error('Error fetching files:', err);
          setError(err.message);
          setSnackbar({
            open: true,
            message: 'Failed to fetch files',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchFiles();
    }
  }, [selectedCategory, selectedAgeGroup, setSnackbar]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', newFile.category_id);
      formData.append('age_group_id', newFile.age_group_id);
      formData.append('file_name', newFile.file_name);
      formData.append('file_data', newFile.file_data);
      
      await apiRequest('/api/files', 'POST', formData, true);
      
      if (selectedCategory && selectedAgeGroup) {
        const filesData = await apiRequest(
          `/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
        );
        setFiles(filesData.files || []);
      }
      
      if (selectedAgeGroup) {
        const countsData = await apiRequest(
          `/api/files/counts?age_group_id=${selectedAgeGroup}`
        );
        setFileCounts(countsData.counts || {});
      }
      
      setIsModalOpen(false);
      setNewFile({
        category_id: '',
        age_group_id: '',
        file_name: '',
        file_type: '',
        file_data: null
      });
      
      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to upload file',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile({
        ...newFile,
        file_name: file.name,
        file_type: file.type,
        file_data: file
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const handleBackClick = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedAgeGroup) {
      setSelectedAgeGroup(null);
    }
  };

  const showBackButton = selectedAgeGroup || selectedCategory;
  const backButtonLabel = selectedCategory ? "Back to Categories" : "Back to Age Groups";

  if (loading && !selectedCategory) {
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showBackButton && (
            <Button
              onClick={handleBackClick}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              {backButtonLabel}
            </Button>
          )}
          <Typography variant="h5" component="h2">
            Developmental Domains
          </Typography>
        </Box>

        {!selectedCategory && (
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Select Age Group</InputLabel>
            <Select
              value={selectedAgeGroup || ''}
              label="Select Age Group"
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
            >
              <MenuItem value="">Select Age</MenuItem>
              {ageGroups.map((ageGroup) => (
                <MenuItem key={ageGroup.age_group_id} value={ageGroup.age_group_id}>
                  {ageGroup.age_range.replace(/\?/g, '-')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {!selectedAgeGroup ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Please select an age group to view categories
          </Typography>
        </Box>
      ) : selectedCategory ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {categories.find(c => c.category_id == selectedCategory)?.category_name} - 
              {ageGroups.find(a => a.age_group_id == selectedAgeGroup)?.age_range}
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Upload File
            </Button>
          </Box>

          {files.length === 0 ? (
            <Box sx={{ 
              border: 2, 
              borderColor: 'grey.300', 
              borderStyle: 'dashed', 
              borderRadius: 1, 
              p: 6, 
              textAlign: 'center',
              my: 4
            }}>
              <Typography variant="h6" gutterBottom>
                No files uploaded
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get started by uploading a new file.
              </Typography>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="contained"
                startIcon={<UploadIcon />}
              >
                Upload File
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.file_id}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1">{file.file_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {file.file_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleDownload(file.file_id, file.file_name)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.category_id}>
              <Card 
                sx={{ 
                  height: 200, // Fixed height
                  minWidth: 200, // Minimum width
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#2e7d32', // Dark green background
                  color: 'white', // White text
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    backgroundColor: '#1b5e20', // Darker green on hover
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => setSelectedCategory(category.category_id)}
              >
                <FolderIcon sx={{ 
                  fontSize: 60, 
                  color: 'white', // White icon
                  mb: 1 
                }} />
                <Typography variant="h6" component="h3" sx={{ 
                  fontWeight: 'bold',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {category.category_name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  px: 1,
                  borderRadius: 1,
                  mt: 1
                }}>
                  {fileCounts[category.category_id] || 0} files
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Upload New File
          </Typography>
          
          <form onSubmit={handleFileUpload}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newFile.category_id}
                label="Category"
                onChange={(e) => setNewFile({...newFile, category_id: e.target.value})}
                required
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Age Group</InputLabel>
              <Select
                value={newFile.age_group_id}
                label="Age Group"
                onChange={(e) => setNewFile({...newFile, age_group_id: e.target.value})}
                required
              >
                <MenuItem value="">Select Age Group</MenuItem>
                {ageGroups.map((ageGroup) => (
                  <MenuItem key={ageGroup.age_group_id} value={ageGroup.age_group_id}>
                    {ageGroup.age_range}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="File Name"
              fullWidth
              required
              value={newFile.file_name}
              onChange={(e) => setNewFile({...newFile, file_name: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Select File</Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                {newFile.file_name ? (
                  <Typography>{newFile.file_name}</Typography>
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
                        required
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
                onClick={() => setIsModalOpen(false)}
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
                {loading ? <CircularProgress size={24} /> : 'Upload File'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

function StudentsSection({ setSnackbar }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const endpoint = ageFilter !== 'all' 
          ? `/api/students?ageFilter=${ageFilter}`
          : '/api/students';
        
        const data = await apiRequest(endpoint);
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch students');
        }
        
        setStudents(data.students);
        setFilteredStudents(data.students);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch students',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [ageFilter, setSnackbar]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFullName = (student) => {
    return `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`;
  };

  return (
    <div className="text-gray-800">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h5" component="h2">
          Student List
        </Typography>
        
        <TextField
          label="Search students"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', md: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Age</InputLabel>
          <Select
            value={ageFilter}
            label="Filter by Age"
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <MenuItem value="all">All Ages</MenuItem>
            <MenuItem value="3-4">3.0 - 4.0 years</MenuItem>
            <MenuItem value="4-5">4.1 - 5.0 years</MenuItem>
            <MenuItem value="5-6">5.1 - 5.11 years</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredStudents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {searchQuery ? 'No students match your search' : 'No students found'}
          </Typography>
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Birthdate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow hover key={student.student_id}>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{getFullName(student)}</TableCell>
                    <TableCell>{student.age}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{formatDate(student.birthdate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </div>
  );
}