
import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  Paper, TextField, TableContainer, Button, Box, 
  Typography, CircularProgress, Snackbar, Alert, TablePagination,
  Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import { apiRequest, apiDownload } from "../../utils/api";

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
  const [isExporting, setIsExporting] = useState(false);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  
  // Generate academic year options (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const formatAcademicYear = (year) => {
    return `${year}-${year + 1}`;
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ 
        search: searchTerm,
        academic_year: formatAcademicYear(academicYear)
      });
      const data = await apiRequest(`/api/students?${params.toString()}`);
      const sortedStudents = (data.students || []).sort((a, b) => a.last_name.localeCompare(b.last_name));
      
      // If guardian_name is not in the response, fetch it from individual profiles
      const studentsWithGuardian = await Promise.all(
        sortedStudents.map(async (student) => {
          // If guardian_name already exists, return as is
          if (student.guardian_name || student.guardianName) {
            return {
              ...student,
              guardian_name: student.guardian_name || student.guardianName
            };
          }
          
          // Otherwise, fetch guardian name from profile
          try {
            const profileResponse = await apiRequest(`/api/student-profile/${student.student_id}`);
            return {
              ...student,
              guardian_name: profileResponse.profile?.guardian_name || 'N/A'
            };
          } catch (profileErr) {
            console.warn(`Failed to fetch guardian name for student ${student.student_id}:`, profileErr);
            return {
              ...student,
              guardian_name: 'N/A'
            };
          }
        })
      );
      
      setStudents(studentsWithGuardian);
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
  }, [searchTerm, academicYear, navigate]);

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

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A';
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
      
      if (days < 0) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
      
      years = Math.max(0, years);
      months = Math.max(0, months);
      
      if (years === 0 && months === 0) {
        return 'Less than 1 month';
      }
      
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const handleExportMasterlist = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams({
        format: exportFormat,
        academic_year: formatAcademicYear(academicYear)
      });
      const blob = await apiDownload(`/api/students/export?${params.toString()}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = exportFormat === 'pdf' ? 'pdf' : 'xlsx';
      link.download = `masterlist-${formatAcademicYear(academicYear)}-${timestamp}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ 
        open: true, 
        message: `Masterlist exported successfully as ${exportFormat.toUpperCase()}.`, 
        severity: 'success' 
      });
      setExportDialogOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || `Failed to export ${exportFormat.toUpperCase()}`, 
        severity: 'error' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  const handleAcademicYearChange = (event) => {
    setAcademicYear(event.target.value);
    setPage(0); // Reset to first page when year changes
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
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Guardian Name</strong></TableCell>
                  <TableCell><strong>Age</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.student_id} hover>
                    <TableCell>{student.student_id || 'N/A'}</TableCell>
                    <TableCell>{`${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}</TableCell>
                    <TableCell>{student.guardian_name || 'N/A'}</TableCell>
                    <TableCell>{calculateAge(student.birthdate)}</TableCell>
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
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6 w-full">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="academic-year-label">Academic Year</InputLabel>
              <Select
                labelId="academic-year-label"
                id="academic-year-select"
                value={academicYear}
                onChange={handleAcademicYearChange}
                label="Academic Year"
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {formatAcademicYear(year)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant="outlined"
                color="success"
                onClick={handleExportClick}
                disabled={isExporting || loading}
              >
                {isExporting ? 'Exporting...' : 'Export Masterlist'}
              </Button>
            </div>
          </div>
          {renderStudentTable()}
        </div>
      </div>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Export Format Selection Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Masterlist</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select the format for exporting the masterlist:
          </Typography>
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <FormControlLabel 
              value="excel" 
              control={<Radio />} 
              label="Excel (.xlsx)" 
            />
            <FormControlLabel 
              value="pdf" 
              control={<Radio />} 
              label="PDF (.pdf)" 
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExportMasterlist} 
            variant="contained" 
            color="success"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
