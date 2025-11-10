import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
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
  IconButton,
  Menu,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  InsertDriveFile as InsertDriveFileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

import { apiRequest, apiDownload } from "../../utils/api";

export default function InstructionalMaterials() {
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
      <div className="ml-64">
        <Navbar />
        <div className="p-6 pt-20">
          <div className="p-6 bg-white shadow-lg rounded-lg">
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
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    category_id: '',
    age_group_id: '',
    file_name: '',
    file_type: '',
    file_data: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCounts, setFileCounts] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [renameFile, setRenameFile] = useState(null); // For rename modal
  const [editingCategory, setEditingCategory] = useState(null); // For editing a category
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  const fetchCategories = async (ageGroupId) => {
    if (!ageGroupId) {
      setCategories([]);
      return;
    }
    try {
      const categoriesData = await apiRequest(`/api/files/get-categories?age_group_id=${ageGroupId}`);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch categories',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        setLoading(true);
        const ageGroupsData = await apiRequest('/api/files/get-age-groups');
        setAgeGroups(ageGroupsData.ageGroups || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err.message);
        setSnackbar({
          open: true,
          message: 'Failed to fetch initial data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAgeGroups();
  }, [setSnackbar]);

  useEffect(() => {
    if (selectedAgeGroup) {
      setLoading(true);
      const fetchDependentData = async () => {
        await Promise.all([
          fetchCategories(selectedAgeGroup),
          refetchFileCounts(selectedAgeGroup)
        ]);
        setLoading(false);
      };
      fetchDependentData();
    } else {
      setCategories([]);
      setFileCounts({});
    }
  }, [selectedAgeGroup, setSnackbar]);

  useEffect(() => {
    if (selectedCategory && selectedAgeGroup) {
      const fetchFiles = async () => {
        try {
          setLoading(true);
          const data = await apiRequest(
            `/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
          );
          setFiles(data.files || []);
        } catch (err) {
          console.error('Error fetching files:', err);
setError(err.message);
          setSnackbar({
            open: true,
            message: 'Failed to fetch files',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchFiles();
    }
  }, [selectedCategory, selectedAgeGroup, setSnackbar]);

  const handleOpenUploadModal = () => {
    setNewFile(prev => ({
      ...prev,
      category_id: selectedCategory || '',
      age_group_id: selectedAgeGroup || '',
      file_name: '',
      file_data: null,
    }));
    setIsModalOpen(true);
  };

  const refetchFileCounts = async (ageGroupId) => {
    if (ageGroupId) {
      try {
        const countsData = await apiRequest(
          `/api/files/counts?age_group_id=${ageGroupId}`
        );
        setFileCounts(countsData.counts || {});
      } catch (err) {
        console.error('Error refetching file counts:', err);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', newFile.category_id);
      formData.append('age_group_id', newFile.age_group_id);
      formData.append('file_name', newFile.file_name);
      formData.append('file_data', newFile.file_data);
      
      await apiRequest('/api/files', 'POST', formData, true);
      
      if (selectedCategory && selectedAgeGroup) {
        const filesData = await apiRequest(
          `/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
        );
        setFiles(filesData.files || []);
      }
      
      if (selectedAgeGroup) {
        const countsData = await apiRequest(
          `/api/files/counts?age_group_id=${selectedAgeGroup}`
        );
        setFileCounts(countsData.counts || {});
      }
      
      setIsModalOpen(false);
      setNewFile({
        category_id: '',
        age_group_id: '',
        file_name: '',
        file_type: '',
        file_data: null
      });
      
      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to upload file',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenameFile = async () => {
    if (!renameFile || !renameFile.name.trim()) {
      setSnackbar({ open: true, message: 'File name cannot be empty', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`/api/files/${renameFile.id}`, 'PUT', { file_name: renameFile.name });
      setFiles(files.map(f => f.file_id === renameFile.id ? { ...f, file_name: renameFile.name } : f));
      setRenameFile(null);
      setSnackbar({ open: true, message: 'File renamed successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to rename file', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = (fileId) => {
    setConfirmationModal({
      isOpen: true,
      message: 'Are you sure you want to delete this file?',
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiRequest(`/api/files/${fileId}`, 'DELETE');
          setFiles(files.filter(f => f.file_id !== fileId));
          await refetchFileCounts(selectedAgeGroup);
          setSnackbar({ open: true, message: 'File deleted successfully', severity: 'success' });
        } catch (error) {
          setSnackbar({ open: true, message: error.message || 'Failed to delete file', severity: 'error' });
        } finally {
          setLoading(false);
          setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleMenuClick = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategoryForMenu(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategoryForMenu(null);
  };

  const handleOpenRenameCategory = () => {
    setEditingCategory(selectedCategoryForMenu);
    handleMenuClose();
  };

  const handleDeleteCategory = () => {
    const categoryId = selectedCategoryForMenu.category_id;
    handleMenuClose();
    setConfirmationModal({
      isOpen: true,
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiRequest(`/api/files/categories/${categoryId}`, 'DELETE');
          await fetchCategories(selectedAgeGroup); // Refetch categories for the current age group
          await refetchFileCounts(selectedAgeGroup); // Refresh file counts
          setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
        } catch (error) {
          setSnackbar({ open: true, message: error.message || 'Failed to delete category', severity: 'error' });
        } finally {
          setLoading(false);
          setConfirmationModal({ isOpen: false, message: '', onConfirm: null });
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile({
        ...newFile,
        file_name: file.name,
        file_type: file.type,
        file_data: file
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const blob = await apiDownload(`/api/files/download/${fileId}`);
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
      setError(err.message);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const handleBackClick = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedAgeGroup) {
      setSelectedAgeGroup(null);
    }
  };

  const showBackButton = selectedAgeGroup || selectedCategory;
  const backButtonLabel = selectedCategory ? "Back to Categories" : "Back to Age Groups";

  if (loading && !selectedCategory) {
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
          {showBackButton && (
            <Button
              onClick={handleBackClick}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              {backButtonLabel}
            </Button>
          )}
        </Box>
      </Box>

      {!selectedCategory && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Instructional Materials
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {userRole !== 'President' && (
              <Button
                variant="contained"
                onClick={() => setIsCategoryModalOpen(true)}
                disabled={!selectedAgeGroup} // Disable if no age group is selected
              >
                Add Category
              </Button>
            )}
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Select Age Group</InputLabel>
              <Select
                value={selectedAgeGroup || ''}
                label="Select Age Group"
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
              >
                <MenuItem value="">Select Age</MenuItem>
                {ageGroups.map((ageGroup) => (
                  <MenuItem key={ageGroup.age_group_id} value={ageGroup.age_group_id}>
                    {ageGroup.age_range.replace(/\?/g, '-')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {!selectedAgeGroup ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Please select an age group to view categories
          </Typography>
        </Box>
      ) : selectedCategory ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {categories.find(c => c.category_id == selectedCategory)?.category_name} - 
              {ageGroups.find(a => a.age_group_id == selectedAgeGroup)?.age_range}
            </Typography>
            {userRole !== 'President' && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleOpenUploadModal}
              >
                Upload File
              </Button>
            )}
          </Box>

          {files.length === 0 ? (
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
                No files uploaded
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get started by uploading a new file.
              </Typography>
              {userRole !== 'President' && (
                <Button
                  onClick={handleOpenUploadModal}
                  variant="contained"
                  startIcon={<UploadIcon />}
                >
                  Upload File
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.file_id}>
                      <TableCell>{file.file_name}</TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{new Date(file.upload_date).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDownload(file.file_id, file.file_name)}
                          color="primary"
                          title="Download"
                        >
                          <DownloadIcon />
                        </IconButton>
                        {userRole !== 'President' && (
                          <>
                            <IconButton
                              onClick={() => setRenameFile({ id: file.file_id, name: file.file_name })}
                              color="default"
                              title="Rename"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteFile(file.file_id)}
                              color="error"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell align="center">Files</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.category_id}
                  hover
                  sx={{ '&:hover .action-button': { opacity: 1 } }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    onClick={() => setSelectedCategory(category.category_id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FolderIcon sx={{ mr: 2, color: 'success.main' }} />
                      {category.category_name}
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => setSelectedCategory(category.category_id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {fileCounts[category.category_id] || 0}
                  </TableCell>
                  <TableCell align="right">
                    {userRole !== 'President' && (
                      <IconButton
                        className="action-button"
                        sx={{ opacity: 0 }}
                        onClick={(e) => handleMenuClick(e, category)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenRenameCategory}>Rename</MenuItem>
        <MenuItem onClick={handleDeleteCategory}>Delete</MenuItem>
      </Menu>

      <ConfirmationModal
        open={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, message: '', onConfirm: null })}
        onConfirm={confirmationModal.onConfirm}
        message={confirmationModal.message}
        loading={loading}
      />

      <CategoryModal
        open={isCategoryModalOpen || !!editingCategory}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        ageGroupId={selectedAgeGroup}
        onSave={() => {
          fetchCategories(selectedAgeGroup);
          refetchFileCounts(selectedAgeGroup);
        }}
        setSnackbar={setSnackbar}
      />

      {/* Rename File Modal */}
      <Modal open={!!renameFile} onClose={() => setRenameFile(null)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Rename File
          </Typography>
          <TextField
            label="New File Name"
            fullWidth
            value={renameFile?.name || ''}
            onChange={(e) => setRenameFile({ ...renameFile, name: e.target.value })}
            sx={{ mb: 3 }}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setRenameFile(null)} variant="outlined" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleRenameFile} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Upload New File
          </Typography>
          
          <form onSubmit={handleFileUpload}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newFile.category_id}
                label="Category"
                onChange={(e) => setNewFile({...newFile, category_id: e.target.value})}
                required
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            
            <TextField
              label="File Name"
              fullWidth
              required
              value={newFile.file_name}
              onChange={(e) => setNewFile({...newFile, file_name: e.target.value})}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Select File</Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                {newFile.file_name ? (
                  <Typography>{newFile.file_name}</Typography>
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
                        required
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
                onClick={() => setIsModalOpen(false)}
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
                {loading ? <CircularProgress size={24} /> : 'Upload File'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

function ConfirmationModal({ open, onClose, onConfirm, message, loading }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Confirm Action
        </Typography>
        <Typography sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

function CategoryModal({ open, onClose, category, ageGroupId, onSave, setSnackbar }) {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setCategoryName(category.category_name);
    } else {
      setCategoryName('');
    }
  }, [category, open]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setSnackbar({ open: true, message: 'Category name cannot be empty', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      if (category) { // Update existing category
        await apiRequest(`/api/files/categories/${category.category_id}`, 'PUT', { category_name: categoryName });
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else { // Add new category
        await apiRequest('/api/files/categories', 'POST', { category_name: categoryName, age_group_id: ageGroupId });
        setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      }
      await onSave(); // Refetch categories and counts
      onClose();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to save category', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
          {category ? 'Rename Category' : 'Add New Category'}
        </Typography>
        <TextField
          label="Category Name"
          fullWidth
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          sx={{ mb: 3 }}
          autoFocus
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
