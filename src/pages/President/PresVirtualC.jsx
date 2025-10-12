import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/President/PresidentSidebar";
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64 pt-16">
        <Navbar />
        <div className="p-6">
          <div className="p-6 bg-white shadow-lg rounded-lg">
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
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
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
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
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
                bgcolor: 'success.main', 
                color: 'white', 
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ overflow: 'hidden', pr: 2 }}>
                  <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{announcement.title}</Typography>
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
                <Typography sx={{ whiteSpace: 'pre-line', mb: 2, wordBreak: 'break-word' }}>
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



