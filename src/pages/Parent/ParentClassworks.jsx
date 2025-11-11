import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Parent/ParentSidebar";
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
  Snackbar,
  Alert,
  Box,
  Chip
} from "@mui/material";

import { apiRequest } from "../../utils/api";

export default function ParentClassworks() {
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
            <ClassworksSection setSnackbar={setSnackbar} />
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

function ClassworksSection({ setSnackbar }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const activitiesData = await apiRequest('/api/student/activities');
        
        // For each activity, check if a submission exists
        const activitiesWithSubmissionStatus = await Promise.all(
          (activitiesData || []).map(async (activity) => {
            try {
              const submissionStatus = await apiRequest(`/api/submissions/exists/${activity.activity_id}`);
              return { ...activity, hasSubmitted: submissionStatus.hasSubmitted };
            } catch (err) {
              console.error(`Failed to check submission status for activity ${activity.activity_id}`, err);
              return { ...activity, hasSubmitted: false }; // Assume not submitted on error
            }
          })
        );
        
        setActivities(activitiesWithSubmissionStatus);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch classworks.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [setSnackbar]);

  const handleRowClick = (activity) => {
    navigate(`/parent/activity/${activity.activity_id}`, { state: { activity } });
  };

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Classworks</h2>
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

      {!loading && activities.length === 0 && (
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
            No classworks available.
          </Typography>
        </Box>
      )}

      {!loading && activities.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#388e3c' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Creation Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow 
                  key={activity.activity_id} 
                  hover
                  onClick={() => handleRowClick(activity)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{activity.title}</TableCell>
                  <TableCell>{activity.creation_date ? new Date(activity.creation_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    {activity.hasSubmitted ? (
                      <Chip label="Submitted" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
