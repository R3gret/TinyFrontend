import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import locationData from "../../components/ECCDC/loc.json";
import bgImage from "../../assets/bg1.jpg";
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
  Autocomplete
} from "@mui/material";
import { Save, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
    credentials: 'include',
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

const CreateCDCModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
    location_details: ""
  });
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [error, setError] = useState("");
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Load regions from imported JSON
  useEffect(() => {
    const loadRegions = () => {
      try {
        const regionsArray = Object.entries(locationData).map(([code, region]) => ({
          code,
          name: region.region_name
        }));
        setRegions(regionsArray);
      } catch (err) {
        console.error("Failed to load regions:", err);
      }
    };
    loadRegions();
  }, []);

  const handleRegionChange = async (regionCode) => {
    setDropdownLoading(true);
    const regionData = locationData[regionCode];
    if (regionData && regionData.province_list) {
      const provincesArray = Object.keys(regionData.province_list).map(name => ({
        name
      }));
      setProvinces(provincesArray);
    }
    
    setFormData(prev => ({
      ...prev,
      region: regions.find(r => r.code === regionCode)?.name || "",
      province: "",
      municipality: "",
      barangay: ""
    }));
    setDropdownLoading(false);
  };

  const handleProvinceChange = async (provinceName) => {
    setDropdownLoading(true);
    const regionCode = Object.keys(locationData).find(code => 
      formData.region === locationData[code].region_name
    );
    
    if (regionCode && locationData[regionCode].province_list[provinceName]) {
      const municipalitiesArray = Object.keys(
        locationData[regionCode].province_list[provinceName].municipality_list
      ).map(name => ({ name }));
      setMunicipalities(municipalitiesArray);
    }
    
    setFormData(prev => ({
      ...prev,
      province: provinceName,
      municipality: "",
      barangay: ""
    }));
    setDropdownLoading(false);
  };

  const handleMunicipalityChange = async (municipalityName) => {
    setDropdownLoading(true);
    const regionCode = Object.keys(locationData).find(code => 
      formData.region === locationData[code].region_name
    );
    
    if (regionCode && 
        locationData[regionCode].province_list[formData.province]?.municipality_list[municipalityName]) {
      const barangaysArray = locationData[regionCode]
        .province_list[formData.province]
        .municipality_list[municipalityName]
        .barangay_list.map(name => ({ name }));
      setBarangays(barangaysArray);
    }
    
    setFormData(prev => ({
      ...prev,
      municipality: municipalityName,
      barangay: ""
    }));
    setDropdownLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.region || !formData.province || 
        !formData.municipality || !formData.barangay) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/cdc', 'POST', formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width: "800px",
        backgroundColor: "white",
        borderRadius: 3,
        p: 4,
        boxShadow: 24,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '90vh',
        overflowY: 'auto',
        '& .MuiAutocomplete-root': {
          width: '100%'
        }
      }}>
        <Typography variant="h6" component="h2" sx={{ 
          mb: 3, 
          textAlign: "center",
          color: "#2e7d32",
          fontWeight: 'bold'
        }}>
          Create New Child Development Center
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* CDC Name Field */}
            <Grid item xs={4}>
              <TextField
                label="CDC Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    height: '56px'
                  }
                }}
              />
            </Grid>

            {/* Region Dropdown */}
            <Grid item xs={4}>
              <Autocomplete
                options={regions}
                getOptionLabel={(option) => option.name}
                value={regions.find(r => r.name === formData.region) || null}
                onChange={(e, newValue) => handleRegionChange(newValue?.code || '')}
                loading={dropdownLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Region"
                    variant="outlined"
                    required
                    sx={{ 
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {dropdownLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>

            {/* Province Dropdown */}
            <Grid item xs={4}>
              <Autocomplete
                options={provinces}
                getOptionLabel={(option) => option.name}
                value={provinces.find(p => p.name === formData.province) || null}
                onChange={(e, newValue) => handleProvinceChange(newValue?.name || '')}
                disabled={!formData.region}
                loading={dropdownLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Province"
                    variant="outlined"
                    required
                    sx={{ 
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {dropdownLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>

            {/* Municipality Dropdown */}
            <Grid item xs={4}>
              <Autocomplete
                options={municipalities}
                getOptionLabel={(option) => option.name}
                value={municipalities.find(m => m.name === formData.municipality) || null}
                onChange={(e, newValue) => handleMunicipalityChange(newValue?.name || '')}
                disabled={!formData.province}
                loading={dropdownLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Municipality"
                    variant="outlined"
                    required
                    sx={{ 
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {dropdownLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>

            {/* Barangay Dropdown */}
            <Grid item xs={4}>
              <Autocomplete
                options={barangays}
                getOptionLabel={(option) => option.name}
                value={barangays.find(b => b.name === formData.barangay) || null}
                onChange={(e, newValue) => setFormData({...formData, barangay: newValue?.name || ''})}
                disabled={!formData.municipality}
                loading={dropdownLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Barangay"
                    variant="outlined"
                    required
                    sx={{ 
                      width: '100%',
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {dropdownLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Grid>

            <Grid item xs={4}>
              {/* Empty cell for alignment */}
            </Grid>

            {/* Location Details */}
            <Grid item xs={12}>
              <TextField
                label="Location Details (Street, Landmark, etc.)"
                value={formData.location_details}
                onChange={(e) => setFormData({...formData, location_details: e.target.value})}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: 2, 
            mt: 4 
          }}>
            <Button 
              onClick={onClose} 
              variant="outlined" 
              startIcon={<X />}
              disabled={loading}
              sx={{ 
                width: '150px',
                height: '48px',
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
                width: '150px',
                height: '48px',
                backgroundColor: "#2e7d32",
                "&:hover": { backgroundColor: "#1b5e20" }
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Create CDC"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

const CDCPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSuccess = () => {
    setSnackbar({
      open: true,
      message: "CDC created successfully!",
      severity: "success"
    });
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto w-full">
        <Navbar />

        <div className="p-6">
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ 
              backgroundColor: "#2e7d32",
              "&:hover": { backgroundColor: "#1b5e20" },
              width: '250px',
              height: '48px'
            }}
          >
            Create New CDC
          </Button>

          <CreateCDCModal 
            open={openModal} 
            onClose={() => setOpenModal(false)} 
            onSuccess={handleSuccess}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar({...snackbar, open: false})}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default CDCPage;