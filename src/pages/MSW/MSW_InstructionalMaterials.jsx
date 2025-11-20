import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/all/Navbar";
import MSWSidebar from "../../components/MSW/MSWSidebar";
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
  Checkbox,
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

export default function MSWInstructionalMaterials({ SidebarComponent = MSWSidebar }) {
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
      <SidebarComponent />
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    category_id: '',
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
  const [multiUploadModalOpen, setMultiUploadModalOpen] = useState(false);
  const [multiUploadFolder, setMultiUploadFolder] = useState('');
  const [multiUploadFiles, setMultiUploadFiles] = useState([]);
  const [selectedCdcIds, setSelectedCdcIds] = useState([]);
  const [cdcListForUpload, setCdcListForUpload] = useState([]);
  const [cdcBarangayFilter, setCdcBarangayFilter] = useState('');
  const [cdcBarangayOptions, setCdcBarangayOptions] = useState([]);
  const [cdcListLoading, setCdcListLoading] = useState(false);
  const [multiUploadSubmitting, setMultiUploadSubmitting] = useState(false);
  const [userMunicipality, setUserMunicipality] = useState('');

  const fetchCategories = async () => {
    try {
      const categoriesData = await apiRequest(`/api/files/get-categories`);
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

  const fetchCdcOptions = async (municipalityParam) => {
    try {
      setCdcListLoading(true);
      const params = new URLSearchParams();
      if (municipalityParam) {
        params.append('municipality', municipalityParam);
      }
      const response = await apiRequest(`/api/cdc?${params.toString()}`);
      const list = response?.data || [];
      setCdcListForUpload(list);
      const uniqueBarangays = [...new Set(list.map(item => item.barangay).filter(Boolean))].sort();
      setCdcBarangayOptions(uniqueBarangays);
    } catch (err) {
      console.error('Error fetching CDC list:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load CDC list',
        severity: 'error'
      });
    } finally {
      setCdcListLoading(false);
    }
  };

  useEffect(() => {
    if (userMunicipality) {
      fetchCdcOptions(userMunicipality);
    }
  }, [userMunicipality]);

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
    const fetchUserInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) {
          return;
        }

        const data = await apiRequest(`/api/user_session/current-user/details?userId=${user.id}`);
        if (data?.user?.other_info?.address) {
          const addressParts = data.user.other_info.address.split(',').map(part => part.trim());
          if (addressParts.length >= 2) {
            const municipality = addressParts.length === 2 ? addressParts[0] : addressParts[1];
            setUserMunicipality(municipality || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch user info for CDC uploads:', err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCategories(),
          refetchFileCounts()
        ]);
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
    fetchInitialData();
  }, [setSnackbar]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchFiles = async () => {
        try {
          // Clear current files immediately to avoid showing files from the
          // previously-opened category while the next category's files load.
          setFiles([]);
          setLoading(true);

          const data = await apiRequest(
            `/api/files?category_id=${selectedCategory}`
          );
          // Defensive: only show files that match the currently-selected category.
          const returnedFiles = data.files || [];
          const filtered = returnedFiles.filter(f => String(f.category_id) === String(selectedCategory));
          setFiles(filtered);
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
  }, [selectedCategory, setSnackbar]);

  const handleOpenUploadModal = () => {
    setNewFile(prev => ({
      ...prev,
      category_id: selectedCategory || '',
      file_name: '',
      file_data: null,
    }));
    setIsModalOpen(true);
  };

  const refetchFileCounts = async () => {
    try {
      const countsData = await apiRequest(
        `/api/files/counts`
      );
      setFileCounts(countsData.counts || {});
    } catch (err) {
      console.error('Error refetching file counts:', err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', newFile.category_id);
      formData.append('file_name', newFile.file_name);
      formData.append('file_data', newFile.file_data);
      
      await apiRequest('/api/files', 'POST', formData, true);
      
      if (selectedCategory) {
        const filesData = await apiRequest(
          `/api/files?category_id=${selectedCategory}`
        );
        const returnedFiles = filesData.files || [];
        const filtered = returnedFiles.filter(f => String(f.category_id) === String(selectedCategory));
        setFiles(filtered);
      }
      
      const countsData = await apiRequest(
        `/api/files/counts`
      );
      setFileCounts(countsData.counts || {});
      
      setIsModalOpen(false);
      setNewFile({
        category_id: '',
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
          await refetchFileCounts();
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
          await fetchCategories(); // Refetch categories
          await refetchFileCounts(); // Refresh file counts
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

  const filteredCdcList = useMemo(() => {
    const baseList = cdcBarangayFilter
      ? cdcListForUpload.filter(cdc => cdc.barangay === cdcBarangayFilter)
      : cdcListForUpload;
    return [...baseList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [cdcBarangayFilter, cdcListForUpload]);

  const toggleCdcSelection = (cdcId) => {
    const id = String(cdcId);
    setSelectedCdcIds(prev => (
      prev.includes(id) ? prev.filter(existingId => existingId !== id) : [...prev, id]
    ));
  };

  const allFilteredSelected = filteredCdcList.length > 0 && filteredCdcList.every(cdc => selectedCdcIds.includes(String(cdc.cdcId)));
  const someFilteredSelected = filteredCdcList.some(cdc => selectedCdcIds.includes(String(cdc.cdcId)));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = filteredCdcList.map(cdc => String(cdc.cdcId));
      setSelectedCdcIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const newIds = filteredCdcList.map(cdc => String(cdc.cdcId));
      setSelectedCdcIds(prev => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const handleMultiUploadFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setMultiUploadFiles(files);
  };

  const handleRemoveSelectedFile = (index) => {
    setMultiUploadFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const resetMultiUploadState = () => {
    setMultiUploadFolder('');
    setMultiUploadFiles([]);
    setSelectedCdcIds([]);
    setCdcBarangayFilter('');
  };

  const handleCloseMultiUploadModal = () => {
    setMultiUploadModalOpen(false);
    resetMultiUploadState();
  };

  const handleOpenMultiUploadModal = () => {
    if (!cdcListForUpload.length && !cdcListLoading) {
      fetchCdcOptions(userMunicipality);
    }
    setMultiUploadModalOpen(true);
  };

  const handleMultiUploadSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCdcIds.length) {
      setSnackbar({
        open: true,
        message: 'Select at least one CDC',
        severity: 'warning'
      });
      return;
    }

    if (!multiUploadFolder.trim()) {
      setSnackbar({
        open: true,
        message: 'Folder name is required',
        severity: 'warning'
      });
      return;
    }

    if (!multiUploadFiles.length) {
      setSnackbar({
        open: true,
        message: 'Select at least one file to upload',
        severity: 'warning'
      });
      return;
    }

    try {
      setMultiUploadSubmitting(true);
      const formData = new FormData();
      formData.append('folder_name', multiUploadFolder.trim());
      selectedCdcIds.forEach(id => formData.append('cdc_ids[]', id));
      multiUploadFiles.forEach(file => formData.append('files', file));

      await apiRequest('/api/files/multi-cdc-upload', 'POST', formData, true);

      setSnackbar({
        open: true,
        message: 'Files uploaded to selected CDCs',
        severity: 'success'
      });
      handleCloseMultiUploadModal();
      refetchFileCounts();
    } catch (err) {
      console.error('Error uploading files to multiple CDCs:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to upload files to CDCs',
        severity: 'error'
      });
    } finally {
      setMultiUploadSubmitting(false);
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
        message: err.message || 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const handleBackClick = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const showBackButton = selectedCategory;
  const backButtonLabel = "Back to Categories";

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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {userRole !== 'President' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleOpenMultiUploadModal}
                >
                  Upload to Multiple CDCs
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  Add Category
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}

      {selectedCategory ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {categories.find(c => c.category_id == selectedCategory)?.category_name}
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
        onSave={() => {
          fetchCategories();
          refetchFileCounts();
        }}
        setSnackbar={setSnackbar}
      />

      <Modal open={multiUploadModalOpen} onClose={handleCloseMultiUploadModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Upload Files to Multiple CDCs
          </Typography>

          <form onSubmit={handleMultiUploadSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Filter by Barangay</InputLabel>
              <Select
                value={cdcBarangayFilter}
                label="Filter by Barangay"
                onChange={(e) => setCdcBarangayFilter(e.target.value)}
              >
                <MenuItem value="">All Barangays</MenuItem>
                {cdcBarangayOptions.map(barangay => (
                  <MenuItem key={barangay} value={barangay}>
                    {barangay}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{
              border: 1,
              borderColor: 'grey.300',
              borderRadius: 1,
              p: 2,
              mb: 3
            }}>
              {cdcListLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox
                      checked={allFilteredSelected}
                      indeterminate={!allFilteredSelected && someFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                      disabled={!filteredCdcList.length}
                    />
                    <Typography>
                      Select All ({filteredCdcList.length})
                    </Typography>
                  </Box>
                  <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                    {filteredCdcList.length === 0 ? (
                      <Typography color="text.secondary" sx={{ p: 2 }}>
                        No CDCs available for the selected filter.
                      </Typography>
                    ) : (
                      filteredCdcList.map(cdc => (
                        <Box
                          key={cdc.cdcId}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            borderBottom: '1px solid',
                            borderColor: 'grey.100',
                          }}
                        >
                          <Checkbox
                            checked={selectedCdcIds.includes(String(cdc.cdcId))}
                            onChange={() => toggleCdcSelection(cdc.cdcId)}
                          />
                          <Box>
                            <Typography fontWeight={600}>{cdc.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Barangay: {cdc.barangay || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </>
              )}
            </Box>

            <TextField
              label="Folder Name"
              fullWidth
              required
              value={multiUploadFolder}
              onChange={(e) => setMultiUploadFolder(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Select Files
              </Typography>
              <Box sx={{
                border: 2,
                borderColor: 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 1,
                p: 3,
                textAlign: 'center'
              }}>
                <Button variant="outlined" component="label">
                  Choose Files
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleMultiUploadFilesChange}
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  You can select multiple files (PDF, DOCX, XLSX up to 10MB each)
                </Typography>

                {multiUploadFiles.length > 0 ? (
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mt: 2,
                    justifyContent: 'center'
                  }}>
                    {multiUploadFiles.map((file, index) => (
                      <Chip
                        key={`${file.name}-${index}`}
                        label={file.name}
                        onDelete={() => handleRemoveSelectedFile(index)}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No files selected yet.
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseMultiUploadModal}
                disabled={multiUploadSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={multiUploadSubmitting}
                startIcon={!multiUploadSubmitting && <CloudUploadIcon />}
              >
                {multiUploadSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Upload Files'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

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

function CategoryModal({ open, onClose, category, onSave, setSnackbar }) {
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
        await apiRequest('/api/files/categories', 'POST', { category_name: categoryName });
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
