import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import locationData from "../../components/ECCDC/loc.json";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment
} from "@mui/material";
import { Person, Email, Phone, LocationOn } from "@mui/icons-material";
import { apiRequest } from "../../utils/api";

const palette = {
  primary: "#14532d",
  primaryDark: "#0f2c1b",
  accent: "#34d399",
  muted: "#e2f5ea"
};

const MSW_ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
    organization: "",
    website: "",
    social_media: ""
  });

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Load regions from imported JSON
  useEffect(() => {
    const regionsArray = Object.entries(locationData).map(([code, region]) => ({
      code,
      name: region.region_name
    }));
    setRegions(regionsArray);
  }, []);

  // Check if user has profile on mount
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.id) {
          navigate("/");
          return;
        }

        setUser(userData);

        // Check if user has profile details
        try {
          // Try using the account endpoint first (used for viewing user profiles)
          const response = await apiRequest(`/api/account/${userData.id}/details`);
          
          // If user has other_info with full_name, they have a profile
          if (response?.user?.other_info?.full_name) {
            // Profile exists, redirect to dashboard
            navigate("/msw-dashboard");
            return;
          }
        } catch (err) {
          // If 404 or no profile, continue to show setup form
          if (err.message?.includes("not found") || err.message?.includes("404") || err.message?.includes("User not found")) {
            // No profile exists, show form
            setChecking(false);
            setLoading(false);
            return;
          }
          // For other errors, still show form but log error
          console.error("Error fetching user details:", err);
          // Show form anyway if there's an error
          setChecking(false);
          setLoading(false);
        }

        // If we get here, no profile exists
        setChecking(false);
        setLoading(false);
      } catch (err) {
        console.error("Error checking profile:", err);
        setError("Failed to check profile. Please refresh and try again.");
        setChecking(false);
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.region || !formData.province || !formData.municipality || !formData.barangay) {
      setError("Please complete all address fields (Region, Province, Municipality, Barangay).");
      return;
    }


    // Build address string
    const address = `${formData.barangay}, ${formData.municipality}, ${formData.province}, ${formData.region}`;

    try {
      setSubmitting(true);
      
      // Build request payload - only include fields that have values
      const payload = {
        userId: user.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        address: address
      };

      // Only include optional fields if they have values
      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      // Try using the user_session endpoint pattern like other profile pages
      // The backend should handle both create and update
      const response = await apiRequest("/api/user_session/update-profile", "PUT", payload);

      // Success - redirect to dashboard
      navigate("/msw-dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      
      // Handle validation errors from backend
      let errorMessage = err.message || "Failed to save profile. Please try again.";
      
      // Check if error contains full response data (from updated apiRequest)
      if (err.responseData && err.responseData.errors && Array.isArray(err.responseData.errors)) {
        const errorMessages = err.responseData.errors.map(e => {
          const fieldName = e.path === "social_media" ? "Social Media" : 
                           e.path === "website" ? "Website" : 
                           e.path === "email" ? "Email" :
                           e.path.charAt(0).toUpperCase() + e.path.slice(1);
          return `${fieldName}: ${e.msg}`;
        }).join("\n");
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: palette.primary }} />
          <Typography variant="body1" sx={{ mt: 2, color: palette.primary }}>
            Checking profile...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />
      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <Box
          component={Paper}
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 800,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(226,245,234,0.9) 100%)",
            border: `1px solid ${palette.muted}`,
            boxShadow: "0 25px 50px -12px rgba(15, 83, 45, 0.25)"
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(120deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`,
              borderRadius: 3,
              p: 3,
              mb: 3,
              color: "white",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)"
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Complete Your Profile
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
              Please provide your profile information to continue. This is required before you can access the system.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2.5}>
            {/* Full Name */}
            <TextField
              name="full_name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            {/* Email */}
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            {/* Phone */}
            <TextField
              name="phone"
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            {/* Address Fields */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: palette.primary, fontWeight: 600 }}>
              Address Information
            </Typography>

            {/* Region */}
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
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Province"
                  variant="outlined"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />

            {/* Municipality */}
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
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Barangay"
                  variant="outlined"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOn fontSize="small" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />


            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 999,
                  fontWeight: 600,
                  textTransform: "none",
                  backgroundColor: palette.primary,
                  "&:hover": {
                    backgroundColor: palette.primaryDark
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(20,83,45,0.4)"
                  }
                }}
                disabled={submitting}
                startIcon={
                  submitting ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {submitting ? "Saving..." : "Save Profile"}
              </Button>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default MSW_ProfileSetup;

