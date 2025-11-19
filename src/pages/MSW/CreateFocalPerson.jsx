import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Lock, Person, Visibility, VisibilityOff, LocationOn, Email, Phone } from "@mui/icons-material";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/MSW/MSWSidebar";
import { apiRequest } from "../../utils/api";
import locationData from "../../components/ECCDC/loc.json";

const palette = {
  primary: "#14532d",
  primaryDark: "#0f2c1b",
  accent: "#34d399",
  muted: "#e2f5ea"
};

const CreateFocalPerson = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    email: "",
    phone: "",
    province: "",
    municipality: "",
    barangay: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [focalExists, setFocalExists] = useState(false);
  const [existingFocal, setExistingFocal] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [barangays, setBarangays] = useState([]);

  // Load barangays from location data
  const loadBarangays = (province, municipality) => {
    if (!province || !municipality) {
      setBarangays([]);
      return;
    }

    const allBarangays = [];
    Object.keys(locationData).forEach(regionCode => {
      const region = locationData[regionCode];
      if (region.province_list &&
          region.province_list[province] &&
          region.province_list[province].municipality_list &&
          region.province_list[province].municipality_list[municipality]) {
        const barangayList = region.province_list[province].municipality_list[municipality].barangay_list || [];
        barangayList.forEach(barangay => {
          if (!allBarangays.includes(barangay)) {
            allBarangays.push(barangay);
          }
        });
      }
    });
    setBarangays(allBarangays.sort());
  };

  // Check if focal account exists in municipality
  const checkFocalExists = async (municipality) => {
    if (!municipality) return;

    try {
      setChecking(true);
      const response = await apiRequest(`/api/focalperson/check?municipality=${encodeURIComponent(municipality)}`);

      if (response.success) {
        if (response.exists) {
          setFocalExists(true);
          setExistingFocal(response.data);
          setStatus({
            type: "error",
            message: `A focal person account already exists in ${municipality}. Only one focal person is allowed per municipality.`
          });
        } else {
          setFocalExists(false);
          setExistingFocal(null);
          setStatus({
            type: "success",
            message: `No focal person exists in ${municipality}. You can create an account.`
          });
        }
      }
    } catch (err) {
      console.error('Error checking focal existence:', err);
      setStatus({
        type: "error",
        message: err.message || "Failed to check if focal account exists."
      });
    } finally {
      setChecking(false);
    }
  };

  // Fetch user info and set municipality/province from account
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) {
          console.warn('No user found in localStorage');
          setLoadingUserInfo(false);
          return;
        }

        const data = await apiRequest(`/api/user_session/current-user/details?userId=${user.id}`);
        if (data?.user?.other_info?.address) {
          // Parse address: "Barangay, Municipality, Province, Region"
          const addressParts = data.user.other_info.address.split(',').map(part => part.trim());
          if (addressParts.length >= 4) {
            const municipality = addressParts[1]; // Second part is municipality
            const province = addressParts[2]; // Third part is province

            setFormData(prev => ({
              ...prev,
              province: province,
              municipality: municipality
            }));

            // Load barangays for this municipality
            loadBarangays(province, municipality);

            // Check if focal exists when municipality is set
            checkFocalExists(municipality);
          }
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear status when user types
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const resetStatus = () => setStatus({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

    // Validation
    const trimmedFullName = formData.full_name.trim();
    if (!trimmedFullName) {
      setStatus({ type: "error", message: "Full name is required." });
      return;
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) {
      setStatus({ type: "error", message: "Username is required." });
      return;
    }

    if (formData.password.length < 8) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters."
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match."
      });
      return;
    }

    if (!formData.municipality) {
      setStatus({
        type: "error",
        message: "Municipality is required."
      });
      return;
    }

    if (focalExists) {
      setStatus({
        type: "error",
        message: "Cannot create account. A focal person already exists in this municipality."
      });
      return;
    }

    try {
      setSubmitting(true);

      // Build request payload
      const payload = {
        username: trimmedUsername,
        password: formData.password,
        municipality: formData.municipality
      };

      // Add optional fields if provided
      if (formData.province) payload.province = formData.province;
      if (formData.barangay) payload.barangay = formData.barangay;
      const address = `${formData.barangay ? formData.barangay + ", " : ""}${formData.municipality}, ${formData.province}`;
      const otherInfo = {
        full_name: trimmedFullName,
        email: trimmedEmail,
        address
      };
      if (formData.phone.trim()) otherInfo.phone = formData.phone.trim();
      payload.other_info = otherInfo;

      const response = await apiRequest("/api/focalperson", "POST", payload);

      const profilePayload = {
        userId: response.id,
        full_name: trimmedFullName,
        email: trimmedEmail,
        address
      };
      if (formData.phone.trim()) profilePayload.phone = formData.phone.trim();
      await apiRequest("/api/user_session/update-profile", "PUT", profilePayload);

      setStatus({
        type: "success",
        message: response.message || "Focal person account created successfully!"
      });

      // Reset form (keep province and municipality from user account)
      setFormData(prev => ({
        username: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        email: "",
        phone: "",
        province: prev.province,
        municipality: prev.municipality,
        barangay: ""
      }));
      setFocalExists(false);
      setExistingFocal(null);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Unable to create account. Please try again or contact support."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-6">
        <Box
          component={Paper}
          elevation={4}
          sx={{
            mb: 6,
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 800,
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
              Create Focal Person Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
              Create a focal person account for a municipality. Only one focal person is allowed per municipality.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              mb: 3
            }}
          >
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(20,83,45,0.08)",
                border: `1px solid rgba(20,83,45,0.15)`
              }}
            >
              <Typography variant="subtitle2" color={palette.primary} gutterBottom>
                Requirements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username must be unique. Password requires at least 8 characters. Municipality is required and only one focal person per municipality is allowed.
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(52,211,153,0.15)",
                border: `1px solid rgba(52,211,153,0.3)`
              }}
            >
              <Typography variant="subtitle2" color={palette.primary} gutterBottom>
                One Per Municipality
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The system automatically checks if a focal person already exists in the selected municipality before allowing account creation.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: palette.muted }} />

          {status.message && (
            <Alert
              severity={status.type === "error" ? "error" : "success"}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: status.type === "error"
                  ? "1px solid rgba(220,38,38,0.4)"
                  : "1px solid rgba(52,211,153,0.4)"
              }}
              onClose={
                status.type ? () => setStatus({ type: "", message: "" }) : undefined
              }
            >
              {status.message}
            </Alert>
          )}

          {existingFocal && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2
              }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Existing Focal Person Found:
              </Typography>
              <Typography variant="body2">
                Username: <strong>{existingFocal.username}</strong>
              </Typography>
              <Typography variant="body2">
                Municipality: <strong>{existingFocal.municipality}</strong>
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} display="grid" gap={2.5}>
            <TextField
              name="username"
              label="Username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                )
              }}
              required
              disabled={focalExists}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              helperText="Minimum of 8 characters."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              required
              disabled={focalExists}
            />

            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              required
              disabled={focalExists}
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" fontWeight={600} color={palette.primary}>
              Focal Person Details
            </Typography>

            <TextField
              name="full_name"
              label="Full Name"
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={focalExists}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={focalExists}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              name="phone"
              label="Phone (Optional)"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={focalExists}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" fontWeight={600} color={palette.primary}>
              Location Information
            </Typography>

            <TextField
              name="province"
              label="Province"
              value={formData.province}
              disabled={true}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" />
                  </InputAdornment>
                )
              }}
              helperText="Set from your MSW account"
            />

            <TextField
              name="municipality"
              label="Municipality"
              value={formData.municipality}
              disabled={true}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: checking ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null
              }}
              helperText={checking ? "Checking if focal exists..." : "Set from your MSW account. Only one focal person per municipality."}
            />

            {loadingUserInfo ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading location data...
                </Typography>
              </Box>
            ) : (
              <FormControl fullWidth disabled={!formData.municipality || focalExists}>
                <InputLabel>Barangay (Optional)</InputLabel>
                <Select
                  value={formData.barangay}
                  label="Barangay (Optional)"
                  onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                >
                  <MenuItem value="">All Barangays</MenuItem>
                  {barangays.map(barangay => (
                    <MenuItem key={barangay} value={barangay}>{barangay}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box display="flex" justifyContent="flex-end" mt={1}>
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
                disabled={submitting || focalExists || checking}
                startIcon={
                  submitting ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {submitting ? "Creating..." : "Create Focal Person Account"}
              </Button>
            </Box>
          </Box>
        </Box>
        </div>
      </div>
    </div>
  );
};

export default CreateFocalPerson;


