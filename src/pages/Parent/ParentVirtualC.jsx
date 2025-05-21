import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Parent/ParentSidebar";
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
  Typography,
  Snackbar,
  Alert,
  Chip,
  Grid,
  Card,
  IconButton,
  Box
} from "@mui/material";
import {
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from "@mui/icons-material";

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
    credentials: 'include',
    ...(body && { body: isFormData ? body : JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
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

  const tabs = ["Stream", "Classworks"];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/parentannouncements/announcements');
        
        setAnnouncements(data.announcements || []);
        setStudentInfo({
          age: data.age,
          ageGroup: data.ageGroup,
          cdc_id: data.cdc_id
        });
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

  const fetchSubmissions = async (announcementId) => {
    try {
      const data = await apiRequest(`/api/submissions/${announcementId}/submissions`);
      setSubmissions(prev => ({
        ...prev,
        [announcementId]: data.submissions || []
      }));
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch submissions',
        severity: 'error'
      });
    }
  };

  const handleDownload = async (filePath, fileName) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/submissions/submissions/${filePath}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );

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
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const handleFileChange = (e) => {
    setSubmissionFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    if (!submissionText && !submissionFile) {
      setSnackbar({
        open: true,
        message: 'Please provide either text or a file',
        severity: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('announcement_id', selectedAnnouncement.id);
      if (submissionText) formData.append('remarks', submissionText);
      if (submissionFile) formData.append('file', submissionFile);

      await apiRequest(
        `/api/submissions/${selectedAnnouncement.id}/submissions`,
        'POST',
        formData,
        true
      );

      setSnackbar({
        open: true,
        message: 'Submission successful!',
        severity: 'success'
      });

      await fetchSubmissions(selectedAnnouncement.id);
      
      // Reset form
      setSubmissionText('');
      setSubmissionFile(null);
      setFileInputKey(Date.now());
      setSelectedAnnouncement(null);
    } catch (err) {
      console.error('Error submitting:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Submission failed',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        {studentInfo && (
          <div className="flex items-center space-x-2">
            <Typography variant="body2">
              Showing announcements for: {studentInfo.ageGroup} years
            </Typography>
          </div>
        )}
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && announcements.length === 0 && (
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
            No announcements available for your child's age group
          </Typography>
        </Box>
      )}

      {!loading && announcements.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {announcements.map((announcement) => (
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
                    Posted by {announcement.author_name} on {new Date(announcement.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip 
                  label={announcement.age_filter === 'all' ? 'All Ages' : `${announcement.age_filter} years`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                  {announcement.message}
                </Typography>
                
                {announcement.attachment_path && (
                  <Box sx={{ 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    pt: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                      <Typography>{announcement.attachment_name}</Typography>
                    </Box>
                    <Button
                      onClick={() => handleDownload(announcement.attachment_path, announcement.attachment_name)}
                      color="primary"
                      size="small"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                )}

                {/* Submission section */}
                <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Submissions</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedAnnouncement(selectedAnnouncement?.id === announcement.id ? null : announcement);
                        if (!submissions[announcement.id]) {
                          fetchSubmissions(announcement.id);
                        }
                      }}
                    >
                      {selectedAnnouncement?.id === announcement.id ? 'Cancel' : 'Submit Response'}
                    </Button>
                  </Box>

                  {/* Submission form */}
                  {selectedAnnouncement?.id === announcement.id && (
                    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                      <form onSubmit={handleSubmit}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          label="Your response"
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ mb: 2 }}>
                          <input
                            key={fileInputKey}
                            accept="*/*"
                            style={{ display: 'none' }}
                            id={`file-upload-${announcement.id}`}
                            type="file"
                            onChange={handleFileChange}
                          />
                          <label htmlFor={`file-upload-${announcement.id}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<InsertDriveFileIcon />}
                              sx={{ mr: 2 }}
                            >
                              Attach File
                            </Button>
                          </label>
                          {submissionFile && (
                            <Typography variant="body2" display="inline">
                              {submissionFile.name}
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setSubmissionFile(null);
                                  setFileInputKey(Date.now());
                                }}
                                sx={{ ml: 1 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Typography>
                          )}
                        </Box>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </form>
                    </Paper>
                  )}

                  {/* Display existing submissions */}
                  {submissions[announcement.id]?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Previous Submissions:</Typography>
                      {submissions[announcement.id].map((submission) => (
                        <Paper key={submission.submission_id} elevation={1} sx={{ p: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              Submitted on {new Date(submission.submission_date).toLocaleString()}
                            </Typography>
                            <Chip 
                              label={submission.status || 'Submitted'} 
                              size="small"
                              color={
                                submission.status === 'approved' ? 'success' : 
                                submission.status === 'rejected' ? 'error' : 'default'
                              }
                            />
                          </Box>
                          {submission.remarks && (
                            <Typography sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                              {submission.remarks}
                            </Typography>
                          )}
                          {submission.files?.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2" sx={{ mr: 2 }}>
                                {submission.files[0].file_name}
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => handleDownload(
                                  submission.files[0].file_id,
                                  submission.files[0].file_name
                                )}
                                startIcon={<DownloadIcon />}
                              >
                                Download
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </div>
  );
}

function ClassworksSection({ setSnackbar }) {
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
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
                No files available
              </Typography>
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
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                    bgcolor: 'success.light',
                    color: 'primary.contrastText',
                    '& .MuiSvgIcon-root': {
                      color: 'primary.contrastText'
                    }
                  }
                }}
                onClick={() => setSelectedCategory(category.category_id)}
              >
                <FolderIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" component="h3">
                  {category.category_name}
                </Typography>
                <Typography variant="body2">
                  {fileCounts[category.category_id] || 0} files
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}