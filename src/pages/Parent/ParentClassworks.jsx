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
          message: 'Failed to fetch data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setSnackbar]);

  const handleDownload = async (filePath, fileName) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/download/${filePath}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
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

  const filteredClassworks = selectedCategory
    ? classworks.filter(cw => cw.category_id === selectedCategory)
    : classworks;

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Classworks</h2>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Filter by Category"
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

      {!loading && filteredClassworks.length === 0 && (
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
            No classworks available for the selected category.
          </Typography>
        </Box>
      )}

      {!loading && filteredClassworks.length > 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Uploaded</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClassworks.map((item) => (
                <TableRow key={item.file_id} hover>
                  <TableCell>{item.file_name}</TableCell>
                  <TableCell>{item.category_name}</TableCell>
                  <TableCell>{new Date(item.upload_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(item.file_path, item.file_name)}
                    >
                      Download
                    </Button>
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
