import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon } from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

export default function SubmissionDetail() {
  const { activityId, studentId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        // Fetch all submissions for the activity, then filter by studentId
        const data = await apiRequest(`/api/submissions/activity/${activityId}`);
        const found = (data || []).find(sub => String(sub.student_id) === String(studentId));
        setSubmission(found || null);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [activityId, studentId]);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white overflow-auto">
        <Navbar />
        <div className="p-10">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
            Back to Submissions
          </Button>
          <Typography variant="h4" gutterBottom>Submission Details</Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : !submission ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No submission found for this student.</Typography>
            </Box>
          ) : (
            <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>Student Name: {submission.student_first_name} {submission.student_last_name}</Typography>
              <Typography variant="body1" gutterBottom>Guardian Name: {submission.parent_name || 'N/A'}</Typography>
              <Typography variant="body1" gutterBottom>Submission Date: {submission.submission_date ? new Date(submission.submission_date).toLocaleString() : 'N/A'}</Typography>
              <Typography variant="body1" gutterBottom>Comments: {submission.comments || 'None'}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>File:</Typography>
                {submission.file_path ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${submission.file_path.replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<DownloadIcon />}
                  >
                    {submission.file_path.split('-').slice(1).join('-')}
                  </Button>
                ) : 'None'}
              </Box>
            </Paper>
          )}
        </div>
      </div>
    </div>
  );
}
