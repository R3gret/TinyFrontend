import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import locationData from "../../components/ECCDC/loc.json";
import {
  TextField,
  Button,
  Box,
  Typography,
  Modal,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  IconButton,
  TablePagination
} from "@mui/material";
import { Search, Add, Save, Close, Edit, Delete } from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL;

const CDCPage = () => {
  const [cdcList, setCdcList] = useState([]);
  const [filter, setFilter] = useState({
    province: '',
    municipality: '',
    barangay: ''
  });
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCDC, setSelectedCDC] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
    president_id: null
  });
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [presidents, setPresidents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load regions from imported JSON
  useEffect(() => {
    const regionsArray = Object.entries(locationData).map(([code, region]) => ({
      code,
      name: region.region_name
    }));
    setRegions(regionsArray);
  }, []);

  useEffect(() => {
    const fetchPresidents = async () => {
      if (openModal) {
        try {
          const data = await apiRequest('/api/cdc/admins');
          setPresidents(data.data);
        } catch (err) {
          console.error('Failed to fetch presidents:', err);
          setSnackbar({
            open: true,
            message: "Failed to load presidents list",
            severity: "error"
          });
        }
      }
    };
    fetchPresidents();
  }, [openModal]);

  // Fetch CDCs with API helper
  const fetchCDCs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.province) params.append('province', filter.province);
      if (filter.municipality) params.append('municipality', filter.municipality);
      if (filter.barangay) params.append('barangay', filter.barangay);
      
      const data = await apiRequest(`/api/cdc?${params.toString()}`);
      setCdcList(data.data);
    } catch (err) {
      console.error('Failed to fetch CDCs:', err);
      setSnackbar({
        open: true,
        message: "Failed to load CDC data",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCDCs();
  }, [filter]);

  const handleRegionChange = (value) => {
    const region = regions.find(r => r.name === value);
    if (region) {
      const regionData = locationData[region.code];
      const provincesArray = Object.keys(regionData.province_list || {}).map(name => ({ name }));
      setProvinces(provincesArray);
      
      setFormData(prev => ({
        ...prev,
        region: value,
        province: "",
        municipality: "",
        barangay: ""
      }));
    }
  };

  const handleProvinceChange = (value) => {
    const regionCode = Object.keys(locationData).find(code => 
      formData.region === locationData[code].region_name
    );
    
    if (regionCode && locationData[regionCode].province_list[value]) {
      const municipalitiesArray = Object.keys(
        locationData[regionCode].province_list[value].municipality_list || {}
      ).map(name => ({ name }));
      setMunicipalities(municipalitiesArray);
    }
    
    setFormData(prev => ({
      ...prev,
      province: value,
      municipality: "",
      barangay: ""
    }));
  };

  const handleMunicipalityChange = (value) => {
    const regionCode = Object.keys(locationData).find(code => 
      formData.region === locationData[code].region_name
    );
    
    if (regionCode && locationData[regionCode].province_list[formData.province]?.municipality_list[value]) {
      const barangaysArray = (locationData[regionCode]
        .province_list[formData.province]
        .municipality_list[value]
        .barangay_list || []).map(name => ({ name }));
      setBarangays(barangaysArray);
    }
    
    setFormData(prev => ({
      ...prev,
      municipality: value,
      barangay: ""
    }));
  };

  // Create CDC with API helper
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await apiRequest('/api/cdc', 'POST', formData);
      setSnackbar({
        open: true,
        message: "CDC created successfully!",
        severity: "success"
      });
      setOpenModal(false);
      fetchCDCs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit CDC with API helper
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await apiRequest(`/api/cdc/${selectedCDC.cdcId}`, 'PUT', formData);
      setSnackbar({
        open: true,
        message: "CDC updated successfully!",
        severity: "success"
      });
      setOpenEditModal(false);
      setSelectedCDC(null);
      fetchCDCs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete CDC with API helper
  const handleDelete = async () => {
    if (!selectedCDC) return;
    
    setLoading(true);
    try {
      const data = await apiRequest(`/api/cdc/${selectedCDC.cdcId}`, 'DELETE');
      setSnackbar({
        open: true,
        message: "CDC deleted successfully!",
        severity: "success"
      });
      setSelectedCDC(null);
      fetchCDCs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with selected CDC data
  const handleEditClick = (cdc) => {
    setSelectedCDC(cdc);
    setFormData({
      name: cdc.name || "",
      region: cdc.region || "",
      province: cdc.province || "",
      municipality: cdc.municipality || "",
      barangay: cdc.barangay || ""
    });
    setOpenEditModal(true);
  };

  // Styled components
  const modalStyle = {
    width: "900px",
    backgroundColor: "white",
    borderRadius: 3,
    p: 4,
    boxShadow: 24,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const textFieldStyle = {
    width: '100%',
    minWidth: '350px',
    '& .MuiInputBase-root': {
      height: '50px',
      fontSize: '1rem'
    },
    '& .MuiInputLabel-root': {
      fontSize: '1rem'
    }
  };

  const buttonStyle = {
    width: '120px',
    height: '40px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-64 pt-16">
        <Navbar />

        <div className="p-6">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Filter by Province"
                value={filter.province}
                onChange={(e) => setFilter({...filter, province: e.target.value})}
                size="small"
                sx={{ width: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Filter by Municipality"
                value={filter.municipality}
                onChange={(e) => setFilter({...filter, municipality: e.target.value})}
                size="small"
                sx={{ width: 200 }}
              />
              <TextField
                label="Filter by Barangay"
                value={filter.barangay}
                onChange={(e) => setFilter({...filter, barangay: e.target.value})}
                size="small"
                sx={{ width: 200 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={() => selectedCDC && handleEditClick(selectedCDC)}
                disabled={!selectedCDC}
                sx={{ 
                  ...buttonStyle,
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#1565c0" }
                }}
              >
                Edit CDC
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={!selectedCDC}
                sx={{ 
                  ...buttonStyle,
                  backgroundColor: "#d32f2f",
                  "&:hover": { backgroundColor: "#b71c1c" }
                }}
              >
                Delete CDC
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => {
                  setFormData({
                    name: "",
                    region: "",
                    province: "",
                    municipality: "",
                    barangay: ""
                  });
                  setOpenModal(true);
                }}
                sx={{ 
                  ...buttonStyle,
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" }
                }}
              >
                Create CDC
              </Button>
            </Box>
          </Box>

          <Paper>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Select</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Province</TableCell>
                    <TableCell>Municipality</TableCell>
                    <TableCell>Barangay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : cdcList.length > 0 ? (
                    cdcList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((cdc) => (
                      <TableRow 
                        key={cdc.cdcId}
                        onClick={() => setSelectedCDC(cdc)}
                        selected={selectedCDC?.cdcId === cdc.cdcId}
                        hover
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="selectedCDC"
                            checked={selectedCDC?.cdcId === cdc.cdcId}
                            onChange={() => setSelectedCDC(cdc)}
                          />
                        </TableCell>
                        <TableCell>{cdc.name}</TableCell>
                        <TableCell>{cdc.region}</TableCell>
                        <TableCell>{cdc.province}</TableCell>
                        <TableCell>{cdc.municipality}</TableCell>
                        <TableCell>{cdc.barangay}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No CDC records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={cdcList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
            />
          </Paper>

          {/* Create CDC Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={modalStyle}>
              <Typography variant="h6" component="h2" sx={{ mb: 3, textAlign: "center" }}>
                Create New CDC
              </Typography>
              
              {snackbar.open && (
                <Alert severity={snackbar.severity} sx={{ mb: 3 }}>
                  {snackbar.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* CDC Name */}
                  <TextField
                    label="CDC Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    sx={textFieldStyle}
                  />

                  {/* Location Fields - Two Columns */}
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Region */}
                    <Autocomplete
                      freeSolo
                      options={regions.map(region => region.name)}
                      value={formData.region}
                      onChange={(e, value) => handleRegionChange(value || '')}
                      onInputChange={(e, value) => handleRegionChange(value || '')}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Region"
                          variant="outlined"
                          required
                        />
                      )}
                    />

                    {/* Province */}
                    <Autocomplete
                      freeSolo
                      options={provinces.map(province => province.name)}
                      value={formData.province}
                      onChange={(e, value) => handleProvinceChange(value || '')}
                      onInputChange={(e, value) => handleProvinceChange(value || '')}
                      disabled={!formData.region}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Province"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Municipality */}
                    <Autocomplete
                      freeSolo
                      options={municipalities.map(municipality => municipality.name)}
                      value={formData.municipality}
                      onChange={(e, value) => handleMunicipalityChange(value || '')}
                      onInputChange={(e, value) => handleMunicipalityChange(value || '')}
                      disabled={!formData.province}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Municipality"
                          variant="outlined"
                          required
                        />
                      )}
                    />

                    {/* Barangay */}
                    <Autocomplete
                      freeSolo
                      options={barangays.map(barangay => barangay.name)}
                      value={formData.barangay}
                      onChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                      onInputChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                      disabled={!formData.municipality}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Barangay"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  </Box>

                  {/* President Selection */}
                  <Autocomplete
                    options={presidents}
                    getOptionLabel={(option) => option.username}
                    onChange={(e, value) => setFormData({...formData, president_id: value ? value.id : null})}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assign President (Optional)"
                        variant="outlined"
                      />
                    )}
                  />

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button 
                      onClick={() => setOpenModal(false)} 
                      variant="outlined" 
                      startIcon={<Close />}
                      disabled={loading}
                      sx={{ 
                        ...buttonStyle,
                        color: "#2e7d32", 
                        borderColor: "#2e7d32",
                        '&:hover': {
                          borderColor: "#1b5e20"
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ 
                        ...buttonStyle,
                        backgroundColor: "#2e7d32",
                        "&:hover": { backgroundColor: "#1b5e20" }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Create CDC"}
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          </Modal>

          {/* Edit CDC Modal */}
          <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
            <Box sx={modalStyle}>
              <Typography variant="h6" component="h2" sx={{ mb: 3, textAlign: "center" }}>
                Edit CDC
              </Typography>
              
              {snackbar.open && (
                <Alert severity={snackbar.severity} sx={{ mb: 3 }}>
                  {snackbar.message}
                </Alert>
              )}

              <form onSubmit={handleEditSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* CDC Name */}
                  <TextField
                    label="CDC Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    sx={textFieldStyle}
                  />

                  {/* Location Fields - Two Columns */}
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Region */}
                    <Autocomplete
                      freeSolo
                      options={regions.map(region => region.name)}
                      value={formData.region}
                      onChange={(e, value) => handleRegionChange(value || '')}
                      onInputChange={(e, value) => handleRegionChange(value || '')}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Region"
                          variant="outlined"
                          required
                        />
                      )}
                    />

                    {/* Province */}
                    <Autocomplete
                      freeSolo
                      options={provinces.map(province => province.name)}
                      value={formData.province}
                      onChange={(e, value) => handleProvinceChange(value || '')}
                      onInputChange={(e, value) => handleProvinceChange(value || '')}
                      disabled={!formData.region}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Province"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {/* Municipality */}
                    <Autocomplete
                      freeSolo
                      options={municipalities.map(municipality => municipality.name)}
                      value={formData.municipality}
                      onChange={(e, value) => handleMunicipalityChange(value || '')}
                      onInputChange={(e, value) => handleMunicipalityChange(value || '')}
                      disabled={!formData.province}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Municipality"
                          variant="outlined"
                          required
                        />
                      )}
                    />

                    {/* Barangay */}
                    <Autocomplete
                      freeSolo
                      options={barangays.map(barangay => barangay.name)}
                      value={formData.barangay}
                      onChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                      onInputChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                      disabled={!formData.municipality}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Barangay"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  </Box>

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button 
                      onClick={() => setOpenEditModal(false)} 
                      variant="outlined" 
                      startIcon={<Close />}
                      disabled={loading}
                      sx={{ 
                        ...buttonStyle,
                        color: "#2e7d32", 
                        borderColor: "#2e7d32",
                        '&:hover': {
                          borderColor: "#1b5e20"
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ 
                        ...buttonStyle,
                        backgroundColor: "#2e7d32",
                        "&:hover": { backgroundColor: "#1b5e20" }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Update CDC"}
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          </Modal>

          {/* Centered Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
            anchorOrigin={{ 
              vertical: 'bottom', 
              horizontal: 'center' 
            }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              <Alert 
                onClose={() => setSnackbar({...snackbar, open: false})}
                severity={snackbar.severity}
                sx={{ 
                  width: 'auto',
                  minWidth: '300px',
                  maxWidth: '600px',
                  boxShadow: 3,
                  '& .MuiAlert-message': {
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                {snackbar.message}
              </Alert>
            </Box>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default CDCPage;