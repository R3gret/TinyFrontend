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
    barangay: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    const regionsArray = Object.entries(locationData).map(([code, region]) => ({
      code,
      name: region.region_name
    }));
    setRegions(regionsArray);
  }, []);

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
      }}>
        <Typography variant="h5" component="h2" sx={{ 
          mb: 4, 
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="CDC Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                fullWidth
                sx={{
                  width: '100%',  // Ensures full width within grid item
                  '& .MuiInputBase-root': {
                    height: '56px',
                    fontSize: '1.1rem',
                    minWidth: '400px'  // Minimum width for each field
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={regions.map(region => region.name)}
                value={formData.region}
                onChange={(e, value) => handleRegionChange(value || '')}
                onInputChange={(e, value) => handleRegionChange(value || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Region"
                    variant="outlined"
                    required
                    fullWidth
                    sx={{
                      width: '100%',  // Ensures full width within grid item
                      '& .MuiInputBase-root': {
                        height: '56px',
                        fontSize: '1.1rem',
                        minWidth: '400px'  // Minimum width for each field
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={provinces.map(province => province.name)}
                value={formData.province}
                onChange={(e, value) => handleProvinceChange(value || '')}
                onInputChange={(e, value) => handleProvinceChange(value || '')}
                disabled={!formData.region}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Province"
                    variant="outlined"
                    required
                    fullWidth
                    sx={{
                      width: '100%',  // Ensures full width within grid item
                      '& .MuiInputBase-root': {
                        height: '56px',
                        fontSize: '1.1rem',
                        minWidth: '400px'  // Minimum width for each field
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={municipalities.map(municipality => municipality.name)}
                value={formData.municipality}
                onChange={(e, value) => handleMunicipalityChange(value || '')}
                onInputChange={(e, value) => handleMunicipalityChange(value || '')}
                disabled={!formData.province}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Municipality"
                    variant="outlined"
                    required
                    fullWidth
                    sx={{
                      width: '100%',  // Ensures full width within grid item
                      '& .MuiInputBase-root': {
                        height: '56px',
                        fontSize: '1.1rem',
                        minWidth: '400px'  // Minimum width for each field
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={barangays.map(barangay => barangay.name)}
                value={formData.barangay}
                onChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                onInputChange={(e, value) => setFormData({...formData, barangay: value || ''})}
                disabled={!formData.municipality}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Barangay"
                    variant="outlined"
                    required
                    fullWidth
                    sx={{
                      width: '100%',  // Ensures full width within grid item
                      '& .MuiInputBase-root': {
                        height: '56px',
                        fontSize: '1.1rem',
                        minWidth: '400px'  // Minimum width for each field
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: 3, 
            mt: 5 
          }}>
            <Button 
              onClick={onClose} 
              variant="outlined" 
              startIcon={<X size={24} />}
              disabled={loading}
              sx={{ 
                width: '180px',
                height: '56px',
                fontSize: '1.1rem',
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
              startIcon={<Save size={24} />}
              disabled={loading}
              sx={{ 
                width: '180px',
                height: '56px',
                fontSize: '1.1rem',
                backgroundColor: "#2e7d32",
                "&:hover": { backgroundColor: "#1b5e20" }
              }}
            >
              {loading ? <CircularProgress size={28} /> : "Create CDC"}
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
              height: '56px',
              fontSize: '1.1rem'
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
              sx={{ width: '100%', fontSize: '1.1rem' }}
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