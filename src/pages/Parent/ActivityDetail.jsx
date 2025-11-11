import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Navbar from '../../components/all/Navbar';
import Sidebar from '../../components/Parent/ParentSidebar';
import { apiRequest } from '../../utils/api';

export default function ActivityDetail() {
  const { state } = useLocation();
  const { activityId } = useParams();
  const navigate = useNavigate();
  
  // The activity data is passed via navigation state to avoid a refetch
  const [activity, setActivity] = useState(state?.activity || null);
  const [submission, setSubmission] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!activity) return;
      setLoading(true);
      try {
        const subData = await apiRequest(`/api/submissions/mine/${activityId}`);
        if (subData) {
          setSubmission(subData);
        }
      } catch (error) {
        if (error.message.includes('404')) {
          setSubmission(null); // No submission found, which is not an error
        } else {
          console.error('Failed to fetch submission:', error);
          setSnackbar({ open: true, message: 'Failed to load submission data.', severity: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };

    if (activity) {
      fetchSubmission();
    } else {
      setSnackbar({ open: true, message: 'Activity data not found. Redirecting...', severity: 'error' });
      setTimeout(() => navigate('/parent-classworks'), 2000);
    }
  }, [activity, activityId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissionFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      setSnackbar({ open: true, message: 'Please select a file to submit.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('activity_id', activityId);
      formData.append('comments', comments);
      formData.append('submissionFile', submissionFile);

      const result = await apiRequest('/api/submissions', 'POST', formData, true);

      setSnackbar({ open: true, message: 'Submission uploaded successfully!', severity: 'success' });
      setSubmission(result.submission); // Assuming the backend returns the new submission
      setSubmissionFile(null);
      setComments('');

    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to upload submission.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setComments(submission.comments || '');
    setSubmissionFile(null); // Reset file input for editing
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setComments('');
    setSubmissionFile(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('comments', comments);
      if (submissionFile) {
        formData.append('submissionFile', submissionFile);
      }

      await apiRequest(`/api/submissions/${submission.submission_id}`, 'PUT', formData, true);

      // Refetch submission to get the latest data
      const subData = await apiRequest(`/api/submissions/mine/${activityId}`);
      setSubmission(subData);

      setSnackbar({ open: true, message: 'Submission updated successfully!', severity: 'success' });
      setIsEditing(false);
      setSubmissionFile(null);
      setComments('');
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to update submission.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await apiRequest(`/api/submissions/${submission.submission_id}`, 'DELETE');
      setSnackbar({ open: true, message: 'Submission deleted successfully.', severity: 'success' });
      setSubmission(null);
      setComments('');
      setSubmissionFile(null);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete submission.', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (!activity) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-10">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/parent-classworks')}
            sx={{ mb: 3 }}
          >
            Back to Classworks
          </Button>

          <Typography variant="h4" gutterBottom>
            {activity.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Due Date: {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'N/A'}
          </Typography>

          {activity.file_path && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Attachment:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${activity.file_path.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: 1 }}
                >
                  Download Attachment
                </Button>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {activity.file_path.split('-').slice(1).join('-')}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
            {activity.description}
          </Typography>

          {submission && !isEditing ? (
            <Box sx={{ mt: 6, borderTop: 1, borderColor: 'divider', pt: 4 }}>
              <Typography variant="h5" gutterBottom>Your Submission</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <IconButton onClick={handleEditClick} size="small"><EditIcon /></IconButton>
                <IconButton onClick={handleDeleteClick} size="small"><DeleteIcon /></IconButton>
              </Box>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                {submission.file_path && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Submitted File:</Typography>
                    <Button
                      variant="text"
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${submission.file_path.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {submission.file_path.split('-').slice(1).join('-')}
                    </Button>
                  </Box>
                )}
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Comments:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {submission.comments || 'No comments provided.'}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box component="form" onSubmit={isEditing ? handleUpdateSubmit : handleSubmit} sx={{ mt: 6, borderTop: 1, borderColor: 'divider', pt: 4 }}>
              <Typography variant="h5" gutterBottom>
                {isEditing ? 'Edit Your Submission' : 'Submit Your Work'}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Attachment {isEditing ? '(Optional: leave blank to keep existing file)' : '*'}</Typography>
                <Box sx={{ border: 2, borderColor: 'grey.300', borderStyle: 'dashed', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  {submissionFile ? (
                    <Typography>{submissionFile.name}</Typography>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Click to browse for your file
                      </Typography>
                      <Button variant="outlined" component="label">
                        Select File
                        <input type="file" hidden onChange={handleFileChange} required={!isEditing} />
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              <TextField
                label="Comments (Optional)"
                fullWidth
                multiline
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {isEditing && (
                  <Button onClick={handleCancelEdit} variant="text" disabled={loading}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Submit')}
                </Button>
              </Box>
            </Box>
          )}
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this submission? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
