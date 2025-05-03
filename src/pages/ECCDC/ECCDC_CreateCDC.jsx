import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/ECCDC/ECCDCSidebar";
import locationData from "../../components/ECCDC/loc.json";  // Fixed import name
import bgImage from "../../assets/bg1.jpg";
import {
  TextField,
  Button,
  Box,
  Typography,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Grid
} from "@mui/material";
import { Save, Cancel } from "lucide-react";

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

  const handleRegionChange = (regionCode) => {
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
  };

  const handleProvinceChange = (provinceName) => {
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
  };

  const handleMunicipalityChange = (municipalityName) => {
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
        width: { xs: "90%", md: "800px" },
        maxWidth: "800px",
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
        <Typography variant="h6" component="h2" sx={{ 
          mb: 3, 
          textAlign: "center",
          color: "#2e7d32"
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
            <Grid item xs={12}>
              <TextField
                label="CDC Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.region}
                  label="Region"
                  onChange={(e) => handleRegionChange(e.target.value)}
                  required
                >
                  {regions.map((region) => (
                    <MenuItem key={region.code} value={region.code}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.province}
                  label="Province"
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={!formData.region}
                  required
                >
                  {provinces.map((province, index) => (
                    <MenuItem key={index} value={province.name}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Municipality</InputLabel>
                <Select
                  value={formData.municipality}
                  label="Municipality"
                  onChange={(e) => handleMunicipalityChange(e.target.value)}
                  disabled={!formData.province}
                  required
                >
                  {municipalities.map((municipality, index) => (
                    <MenuItem key={index} value={municipality.name}>
                      {municipality.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Barangay</InputLabel>
                <Select
                  value={formData.barangay}
                  label="Barangay"
                  onChange={(e) => setFormData({...formData, barangay: e.target.value})}
                  disabled={!formData.municipality}
                  required
                >
                  {barangays.map((barangay, index) => (
                    <MenuItem key={index} value={barangay.name}>
                      {barangay.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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
            mt: 3 
          }}>
            <Button 
              onClick={onClose} 
              variant="outlined" 
              startIcon={<Cancel />}
              disabled={loading}
              sx={{ color: "#2e7d32", borderColor: "#2e7d32" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              sx={{ 
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
              "&:hover": { backgroundColor: "#1b5e20" }
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