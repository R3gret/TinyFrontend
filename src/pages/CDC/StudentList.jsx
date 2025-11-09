import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, TableContainer, Button, Box, 
  Typography, CircularProgress, Snackbar, Alert, TablePagination
} from "@mui/material";
import { apiRequest } from "../../utils/api";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md">
      <TextField
        fullWidth
        label="Search students..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default function CDCStudentList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10; // Set a fixed number of rows per page

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest(`/api/students?${new URLSearchParams({ search: searchTerm }).toString()}`);
      const sortedStudents = (data.students || []).sort((a, b) => a.last_name.localeCompare(b.last_name));
      setStudents(sortedStudents);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, navigate]);

  const handleViewProfile = (studentId) => {
    // Assuming a route like /student-profile/:id exists
    navigate(`/student-profile/${studentId}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const renderStudentTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium">Error loading students</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Retry
          </button>
        </div>
      );
    }

    if (students.length === 0 && !loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          No students found in your CDC.
        </div>
      );
    }

    const paginatedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <div className="mb-10">
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="student table">
              <TableHead>
                <TableRow>
                  <TableCell>Profile</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.student_id} hover>
                    <TableCell>
                      <img
                        src={student.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                      />
                    </TableCell>
                    <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" onClick={() => handleViewProfile(student.student_id)} sx={{ mr: 1 }}>
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]} // Hide the rows per page dropdown
          />
        </Paper>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <div className="p-6 pt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Students</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          {renderStudentTable()}
        </div>
      </div>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
