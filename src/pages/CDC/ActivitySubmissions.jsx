import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  CircularProgress,
  Typography,
  Box,
  Button,
  Alert,
  Collapse
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon } from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

export default function ActivitySubmissions() {
  // Download file with auth token, streaming from backend
  const handleDownload = async (submissionId, fileName) => {
    try {
      const token = localStorage.getItem('token') || (JSON.parse(localStorage.getItem('user'))?.token);
      if (!token) {
        alert('No authorization token found.');
        return;
      }
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/submissions/download/${submissionId}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        alert(error.message || 'Failed to download file.');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'submission-file';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed.');
    }
  };
  const [expandedRow, setExpandedRow] = useState(null);
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [studentRecords, setStudentRecords] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch activity details
        const activityData = await apiRequest(`/api/activities/${activityId}`);
        setActivity(activityData || null);
        // Fetch student records
        const response = await apiRequest(`/api/submissions/activity/${activityId}/all-students`);
        if (response && response.students) {
          setStudentRecords(response.students);
        } else {
          setStudentRecords([]);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activityId]);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white overflow-auto">
        <Navbar />
        <div className="p-10">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
            Back to Classworks
          </Button>
          <Typography variant="h4" gutterBottom>Activity Submissions</Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Activity Details (top, full width, styled) */}
              <Box sx={{ mb: 4, width: '100%', background: '#f5f7fa', borderRadius: 2, boxShadow: 1, p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>Activity Details</Typography>
                {activity ? (
                  <>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <Box sx={{ minWidth: 220, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Title:</Typography>
                        <Typography variant="body1" gutterBottom>{activity.title}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Description:</Typography>
                        <Typography variant="body2" gutterBottom>{activity.description}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Age Group:</Typography>
                        <Typography variant="body2" gutterBottom>{activity.age_range || 'N/A'}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Due Date:</Typography>
                        <Typography variant="body2" gutterBottom>{activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 220, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>File:</Typography>
                        {activity.file_path ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${activity.file_path.replace(/\\/g, '/')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadIcon />}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                          >
                            {activity.file_path.split('-').slice(1).join('-')}
                          </Button>
                        ) : (
                          <Typography color="text.secondary">No file attached.</Typography>
                        )}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography color="text.secondary">No activity details found.</Typography>
                )}
              </Box>
              {/* Student Submissions Table (bottom, styled) */}
              <Paper sx={{ mt: 2, boxShadow: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', color: '#1976d2' }}>Student Submissions</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: '#e3eafc' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentRecords
                        .slice()
                        .sort((a, b) => {
                          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                          return nameA.localeCompare(nameB);
                        })
                        .map((rec) => (
                          <React.Fragment key={rec.student_id}>
                            <TableRow
                              hover
                              sx={{
                                cursor: rec.hasSubmitted ? 'pointer' : 'not-allowed',
                                background: expandedRow === rec.student_id ? '#e3eafc' : 'inherit',
                                transition: 'background 0.3s'
                              }}
                              onClick={() => rec.hasSubmitted ? setExpandedRow(expandedRow === rec.student_id ? null : rec.student_id) : null}
                            >
                              <TableCell>{rec.first_name} {rec.last_name}</TableCell>
                              <TableCell>
                                {rec.hasSubmitted ? (
                                  <Typography color="success.main" sx={{ fontWeight: 'bold' }}>Submitted</Typography>
                                ) : (
                                  <Typography color="warning.main" sx={{ fontWeight: 'bold' }}>Pending</Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {rec.hasSubmitted && rec.submission.submission_date
                                  ? new Date(rec.submission.submission_date).toLocaleString()
                                  : 'N/A'}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                <Collapse in={expandedRow === rec.student_id && rec.hasSubmitted} timeout="auto" unmountOnExit>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, background: '#f9fafc', p: 3, borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Submitted File:</Typography>
                                    {rec.submission && rec.submission.file_path ? (
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleDownload(rec.submission.submission_id, rec.submission.file_path.split('-').slice(1).join('-'))}
                                        startIcon={<DownloadIcon />}
                                        sx={{ textTransform: 'none', fontWeight: 'bold', mb: 2 }}
                                      >
                                        {rec.submission.file_path.split('-').slice(1).join('-')}
                                      </Button>
                                    ) : (
                                      <Typography color="text.secondary">No file submitted.</Typography>
                                    )}
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Comments:</Typography>
                                    <Typography variant="body2">{rec.submission && rec.submission.comments ? rec.submission.comments : 'None'}</Typography>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
