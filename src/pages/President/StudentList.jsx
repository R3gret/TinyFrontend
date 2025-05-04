import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/President/PresidentSidebar";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { useNavigate } from 'react-router-dom';
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
  Button
} from "@mui/material";

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

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

export default function StudentList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student data from the API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest('/api/students');
        if (data.success) {
          setStudents(data.students);
        } else {
          throw new Error(data.message || 'Failed to fetch students');
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) =>
        getFullName(student).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const getFullName = (student) => {
    const firstName = student.first_name || "";
    const middleName = student.middle_name ? `${student.middle_name.charAt(0)}.` : "";
    const lastName = student.last_name || "";
    return `${firstName} ${middleName} ${lastName}`.trim();
  };

  const handleViewProfile = (studentId) => {
    navigate(`/student-profile/${studentId}`);
  };

  const renderStudentTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <CircularProgress />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium">Error loading students</p>
          <p className="text-sm">{error}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (filteredStudents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No students found matching your search' : 'No students available'}
        </div>
      );
    }

    return (
      <Paper className="shadow-lg rounded-lg">
        <TableContainer style={{ maxHeight: "calc(100vh - 200px)" }}>
          <Table stickyHeader aria-label="student table">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Birthdate</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.student_id}
                  hover
                  onClick={() => handleViewProfile(student.student_id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell align="center">{student.student_id}</TableCell>
                  <TableCell>
                    <img
                      src={student.profile_pic || defaultProfile}
                      alt="Profile"
                      className="w-10 h-10 rounded-full shadow-md object-cover"
                      onError={(e) => (e.target.src = defaultProfile)}
                    />
                  </TableCell>
                  <TableCell>{getFullName(student)}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{formatDate(student.birthdate)}</TableCell>
                  <TableCell>{student.age || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(student.student_id);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Student List</h2>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          {renderStudentTable()}
        </div>
      </div>
    </div>
  );
}