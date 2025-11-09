import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Parent/ParentSidebar";
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

import { apiRequest } from "../../utils/api";

export default function ParentVirtualC() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-10">
          <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
            <StreamSection setSnackbar={setSnackbar} />
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

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
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
            No announcements available.
          </Typography>
        </Box>
      )}

      {!loading && announcements.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {announcements.map((announcement) => (
            <Paper key={announcement.id} elevation={3} sx={{ p: 0 }}>
              <Box sx={{ 
                bgcolor: 'success.main', 
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
                      <InsertDriveFileIcon color="success" sx={{ mr: 1 }} />
                      <Typography>{announcement.attachmentName}</Typography>
                    </Box>
                    <Button
                      onClick={() => handleDownload(announcement.attachmentUrl, announcement.attachmentName)}
                      color="success"
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
    </div>
  );
}

function ClassworksSection({ setSnackbar }) {
  const [classworks, setClassworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch student info and filtered classworks
        const classworksData = await apiRequest('/api/parentannouncements/filtered-classworks');
        
        if (!classworksData.success) {
          throw new Error(classworksData.message || 'Failed to fetch classworks');
        }

        // Then fetch categories
        const categoriesData = await apiRequest('/api/files/categories');
        
        setClassworks(classworksData.classworks || []);
        setStudentInfo({
          age: classworksData.age,
          ageGroup: classworksData.ageGroup,
          cdc_id: classworksData.cdc_id
        });
        setCategories(categoriesData.categories || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch classworks data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setSnackbar]);

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/download/${fileId}`,
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

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const filteredClassworks = selectedCategory
    ? classworks.filter(cw => cw.category_id == selectedCategory)
    : classworks;

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedCategory && (
            <Button
              onClick={handleBackClick}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Back to Categories
            </Button>
          )}
          <Typography variant="h5" component="h2">
            Developmental Domains
          </Typography>
        </Box>

        {studentInfo && !selectedCategory && (
          <Typography variant="body2">
            Showing classworks for: {studentInfo.ageGroup} years
          </Typography>
        )}
      </Box>

      {classworks.length === 0 ? (
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
            No classworks available for your child's age group
          </Typography>
        </Box>
      ) : selectedCategory ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {categories.find(c => c.category_id == selectedCategory)?.category_name} - 
              {studentInfo?.ageGroup} years
            </Typography>
          </Box>

          {filteredClassworks.length === 0 ? (
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
                No files available in this category
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredClassworks.map((classwork) => (
                <Grid item xs={12} sm={6} md={4} key={classwork.id}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1">{classwork.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classwork.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Posted: {new Date(classwork.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => handleDownload(classwork.file_id, classwork.file_name)}
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                    {classwork.attachment_path && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <InsertDriveFileIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {classwork.attachment_name}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => {
            const count = classworks.filter(cw => cw.category_id == category.category_id).length;
            return count > 0 ? (
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
                    {count} files
                  </Typography>
                </Card>
              </Grid>
            ) : null;
          })}
        </Grid>
      )}
    </div>
  );
}