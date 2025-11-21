import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import FocalSidebar from "../../components/Focal/FocalSidebar";
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
import { getAllCategoryPaths, DOMAINS, QUARTERS, MATERIAL_TYPES, generateFilePath, generateCategoryName } from "../../utils/instructionalMaterialsStructure";

export default function FocalInstructionalMaterials({ SidebarComponent = FocalSidebar }) {
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
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState(null);
  const [initializingFolders, setInitializingFolders] = useState(false);
  // Navigation state for hierarchical file manager
  const [navigationPath, setNavigationPath] = useState([]); // ['domain', 'quarter', 'materialType']
  const [currentView, setCurrentView] = useState('domains'); // 'domains', 'quarters', 'materialTypes', 'files'

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

  // Navigation handlers for hierarchical file manager
  const handleDomainClick = (domain) => {
    setNavigationPath([domain]);
    setCurrentView('quarters');
    setSelectedDomain(domain.id);
    setSelectedQuarter(null);
    setSelectedMaterialType(null);
    setSelectedCategory(null);
    setFiles([]);
  };

  const handleQuarterClick = (quarter) => {
    setNavigationPath([navigationPath[0], quarter]);
    setCurrentView('materialTypes');
    setSelectedQuarter(quarter.id);
    setSelectedMaterialType(null);
    setSelectedCategory(null);
    setFiles([]);
  };

  const handleMaterialTypeClick = async (materialType) => {
    const domain = navigationPath[0];
    const quarter = navigationPath[1];
    
    setNavigationPath([domain, quarter, materialType]);
    setCurrentView('files');
    setSelectedMaterialType(materialType.id);
    
    // Find or create the category and load files
    const categoryName = generateCategoryName(domain.id, quarter.id, materialType.id);
    
    try {
      setLoading(true);
      // Find category by name
      const categoriesData = await apiRequest(`/api/files/get-categories`);
      const category = categoriesData.categories?.find(cat => cat.category_name === categoryName);
      
      if (category) {
        setSelectedCategory(category.category_id);
        const filesData = await apiRequest(
          `/api/files?category_id=${category.category_id}`
        );
        const returnedFiles = filesData.files || [];
        const filtered = returnedFiles.filter(f => String(f.category_id) === String(category.category_id));
        setFiles(filtered);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (currentView === 'files') {
      setCurrentView('materialTypes');
      setNavigationPath(navigationPath.slice(0, 2));
      setSelectedMaterialType(null);
      setSelectedCategory(null);
      setFiles([]);
    } else if (currentView === 'materialTypes') {
      setCurrentView('quarters');
      setNavigationPath(navigationPath.slice(0, 1));
      setSelectedQuarter(null);
      setSelectedMaterialType(null);
      setSelectedCategory(null);
      setFiles([]);
    } else if (currentView === 'quarters') {
      setCurrentView('domains');
      setNavigationPath([]);
      setSelectedDomain(null);
      setSelectedQuarter(null);
      setSelectedMaterialType(null);
      setSelectedCategory(null);
      setFiles([]);
    }
  };

  const getBreadcrumbPath = () => {
    const path = ['Domains'];
    if (navigationPath[0]) {
      path.push(navigationPath[0].name);
    }
    if (navigationPath[1]) {
      path.push(navigationPath[1].name);
    }
    if (navigationPath[2]) {
      path.push(navigationPath[2].name);
    }
    return path;
  };

  const handleOpenUploadModal = () => {
    // If we're in files view, set the category based on current navigation
    let categoryId = selectedCategory;
    if (currentView === 'files' && navigationPath[0] && navigationPath[1] && navigationPath[2]) {
      const categoryName = generateCategoryName(
        navigationPath[0].id,
        navigationPath[1].id,
        navigationPath[2].id
      );
      const category = categories.find(c => c.category_name === categoryName);
      if (category) {
        categoryId = category.category_id;
        setSelectedCategory(category.category_id);
      }
    }
    
    setNewFile(prev => ({
      ...prev,
      category_id: categoryId || '',
      file_name: '',
      file_data: null,
    }));
    
    // Pre-select domain, quarter, and material type if in files view
    if (currentView === 'files' && navigationPath[0] && navigationPath[1] && navigationPath[2]) {
      setSelectedDomain(navigationPath[0].id);
      setSelectedQuarter(navigationPath[1].id);
      setSelectedMaterialType(navigationPath[2].id);
    }
    
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

  // Initialize folder structure
  const initializeFolderStructure = async () => {
    setInitializingFolders(true);
    try {
      const allPaths = getAllCategoryPaths();
      let created = 0;
      let skipped = 0;

      for (const pathInfo of allPaths) {
        try {
          // Check if category exists
          const existingCategories = await apiRequest(`/api/files/get-categories`);
          const exists = existingCategories.categories?.some(
            cat => cat.category_name === pathInfo.categoryName
          );

          if (!exists) {
            // Create category with path structure
            await apiRequest('/api/files/categories', 'POST', {
              category_name: pathInfo.categoryName,
              file_path: pathInfo.path
            });
            created++;
          } else {
            skipped++;
          }
        } catch (err) {
          console.error(`Error creating category ${pathInfo.categoryName}:`, err);
        }
      }

      await fetchCategories();
      await refetchFileCounts();
      
      setSnackbar({
        open: true,
        message: `Folder structure initialized: ${created} folders created, ${skipped} already existed`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error initializing folder structure:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to initialize folder structure',
        severity: 'error'
      });
    } finally {
      setInitializingFolders(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Generate file path if domain, quarter, and material type are selected
      let filePath = null;
      if (selectedDomain && selectedQuarter && selectedMaterialType) {
        filePath = generateFilePath(selectedDomain, selectedQuarter, selectedMaterialType);
      }
      
      const formData = new FormData();
      formData.append('category_id', newFile.category_id);
      formData.append('file_name', newFile.file_name);
      formData.append('file_data', newFile.file_data);
      if (filePath) {
        formData.append('file_path', filePath);
      }
      
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

  const showBackButton = currentView !== 'domains';

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
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {getBreadcrumbPath().map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && <Typography sx={{ mx: 1, color: 'text.secondary' }}>/</Typography>}
            <Typography 
              variant="body2" 
              sx={{ 
                color: index === getBreadcrumbPath().length - 1 ? 'primary.main' : 'text.secondary',
                cursor: index < getBreadcrumbPath().length - 1 ? 'pointer' : 'default',
                '&:hover': index < getBreadcrumbPath().length - 1 ? { textDecoration: 'underline' } : {}
              }}
              onClick={() => {
                if (index === 0) {
                  setCurrentView('domains');
                  setNavigationPath([]);
                  setSelectedDomain(null);
                  setSelectedQuarter(null);
                  setSelectedMaterialType(null);
                  setSelectedCategory(null);
                  setFiles([]);
                } else if (index === 1 && currentView !== 'domains') {
                  handleBackClick();
                } else if (index === 2 && currentView === 'files') {
                  handleBackClick();
                }
              }}
            >
              {item}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {currentView === 'domains' && 'Instructional Materials'}
          {currentView === 'quarters' && `${navigationPath[0]?.name || ''} - Quarters`}
          {currentView === 'materialTypes' && `${navigationPath[0]?.name || ''} > ${navigationPath[1]?.name || ''} - Material Types`}
          {currentView === 'files' && `${navigationPath[0]?.name || ''} > ${navigationPath[1]?.name || ''} > ${navigationPath[2]?.name || ''}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {userRole !== 'President' && (
            <>
              <Button
                variant="outlined"
                onClick={initializeFolderStructure}
                disabled={initializingFolders}
                startIcon={<FolderIcon />}
              >
                {initializingFolders ? 'Initializing...' : 'Initialize Folder Structure'}
              </Button>
              {currentView === 'files' && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleOpenUploadModal}
                >
                  Upload File
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Hierarchical File Manager Views */}
      {currentView === 'domains' && (
        <Grid container spacing={2}>
          {DOMAINS.flatMap((domain) => {
            if (domain.id === 'self_help' && domain.subcategories) {
              return domain.subcategories.map((sub) => (
                <Grid item xs={12} sm={6} md={4} key={sub.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { boxShadow: 4 },
                      height: '100%'
                    }}
                    onClick={() => handleDomainClick(sub)}
                  >
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" align="center">
                        {sub.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ));
            }
            return (
              <Grid item xs={12} sm={6} md={4} key={domain.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    height: '100%'
                  }}
                  onClick={() => handleDomainClick(domain)}
                >
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" align="center">
                      {domain.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {currentView === 'quarters' && navigationPath[0] && (
        <Grid container spacing={2}>
          {QUARTERS.map((quarter) => (
            <Grid item xs={12} sm={6} md={3} key={quarter.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { boxShadow: 4 },
                  height: '100%'
                }}
                onClick={() => handleQuarterClick(quarter)}
              >
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FolderIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" align="center">
                    {quarter.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {currentView === 'materialTypes' && navigationPath[0] && navigationPath[1] && (
        <Grid container spacing={2}>
          {MATERIAL_TYPES.map((materialType) => (
            <Grid item xs={12} sm={6} md={4} key={materialType.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { boxShadow: 4 },
                  height: '100%'
                }}
                onClick={() => handleMaterialTypeClick(materialType)}
              >
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FolderIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" align="center">
                    {materialType.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {currentView === 'files' && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
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
                onChange={(e) => {
                  setNewFile({...newFile, category_id: e.target.value});
                  // Reset domain, quarter, material type when category changes
                  setSelectedDomain(null);
                  setSelectedQuarter(null);
                  setSelectedMaterialType(null);
                }}
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

            {/* Domain, Quarter, and Material Type Selection for File Path */}
            {newFile.category_id && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Domain</InputLabel>
                  <Select
                    value={selectedDomain || ''}
                    label="Domain"
                    onChange={(e) => {
                      setSelectedDomain(e.target.value);
                      setSelectedQuarter(null);
                      setSelectedMaterialType(null);
                    }}
                  >
                    <MenuItem value="">Select Domain</MenuItem>
                    {DOMAINS.flatMap((domain) => {
                      if (domain.id === 'self_help' && domain.subcategories) {
                        return domain.subcategories.map((sub) => (
                          <MenuItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </MenuItem>
                        ));
                      }
                      return (
                        <MenuItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                {selectedDomain && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Quarter</InputLabel>
                    <Select
                      value={selectedQuarter || ''}
                      label="Quarter"
                      onChange={(e) => {
                        setSelectedQuarter(e.target.value);
                        setSelectedMaterialType(null);
                      }}
                    >
                      <MenuItem value="">Select Quarter</MenuItem>
                      {QUARTERS.map((quarter) => (
                        <MenuItem key={quarter.id} value={quarter.id}>
                          {quarter.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedDomain && selectedQuarter && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Material Type</InputLabel>
                    <Select
                      value={selectedMaterialType || ''}
                      label="Material Type"
                      onChange={(e) => setSelectedMaterialType(e.target.value)}
                    >
                      <MenuItem value="">Select Material Type</MenuItem>
                      {MATERIAL_TYPES.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedDomain && selectedQuarter && selectedMaterialType && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    File Path: {generateFilePath(selectedDomain, selectedQuarter, selectedMaterialType)}
                  </Typography>
                )}
              </>
            )}
            
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
