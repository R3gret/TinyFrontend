import { useState } from "react";
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
  IconButton
} from "@mui/material";
import { Lock, Person, Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "../../components/all/Navbar";
import { apiRequest } from "../../utils/api";

const MSW_CREATE_ENDPOINT = "/api/msw";
const PASSWORD_HASH = "25f90d668feb9abee2eb0ad264f5fa497ae117c569090f24ade1f7c8b3dd8973";

const palette = {
  primary: "#14532d",
  primaryDark: "#0f2c1b",
  accent: "#34d399",
  muted: "#e2f5ea"
};

const hashString = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const CreateFoalAccount = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetStatus = () => setStatus({ type: "", message: "" });

  const handleAccessSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const hashedInput = await hashString(authPassword);
      if (hashedInput === PASSWORD_HASH) {
        setIsAuthorized(true);
      } else {
        setAuthError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Authorization error:", error);
      setAuthError("Unable to verify password. Please refresh and try again.");
    } finally {
      setAuthPassword("");
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

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

    try {
      setSubmitting(true);
      await apiRequest(MSW_CREATE_ENDPOINT, "POST", {
        username: trimmedUsername,
        password: formData.password
      });

      setStatus({
        type: "success",
        message: "Foal person account has been created successfully."
      });
      setFormData({
        username: "",
        password: "",
        confirmPassword: ""
      });
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4 py-10">
          <Box
            component={Paper}
            elevation={6}
            sx={{
              width: "100%",
              maxWidth: 420,
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(226,245,234,0.95) 100%)",
              border: `1px solid ${palette.muted}`,
              boxShadow: "0 20px 45px -15px rgba(15,83,45,0.35)"
            }}
          >
            <Typography variant="h6" fontWeight={600} color={palette.primary} gutterBottom>
              Restricted Access
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Please enter the access password to continue.
            </Typography>

            <Box component="form" onSubmit={handleAccessSubmit} display="grid" gap={2}>
              <TextField
                type="password"
                label="Access Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
              {authError && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {authError}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={authLoading}
                sx={{
                  backgroundColor: palette.primary,
                  "&:hover": { backgroundColor: palette.primaryDark },
                  "&:disabled": { backgroundColor: "rgba(20,83,45,0.4)" }
                }}
              >
                {authLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Unlock"
                )}
              </Button>
            </Box>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <Box
          component={Paper}
          elevation={4}
          sx={{
            mt: 16,
            mb: 6,
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 720,
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
              Create Foal Person Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
              Provision a Municipal Social Worker profile with secure credentials.
              The backend route hashes passwords and enforces uniqueness.
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
                Username must be unique across the system. Passwords require at
                least 8 characters and are hashed using bcrypt on submission.
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
                Access Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This page is only accessible to authorized personnel only.
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
            />

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
                disabled={submitting}
                startIcon={
                  submitting ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {submitting ? "Creating..." : "Create Account"}
              </Button>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default CreateFoalAccount;

