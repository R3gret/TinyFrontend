import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from "@mui/material";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/MSW/MSWSidebar";
import { apiRequest } from "../../utils/api";
import { User, MapPin } from "lucide-react";

const ViewFocalPerson = () => {
  const [location, setLocation] = useState({
    province: "",
    municipality: ""
  });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [focalInfo, setFocalInfo] = useState(null);
  const [loadingFocal, setLoadingFocal] = useState(false);
  const [error, setError] = useState("");

  // Fetch MSW user info to determine province/municipality
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingLocation(true);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          setError("No logged in user found. Please log in again.");
          return;
        }

        const data = await apiRequest(
          `/api/user_session/current-user/details?userId=${user.id}`
        );
        if (data?.user?.other_info?.address) {
          // Expect format: "Barangay, Municipality, Province, Region"
          const addressParts = data.user.other_info.address
            .split(",")
            .map((part) => part.trim());
          if (addressParts.length >= 4) {
            const municipality = addressParts[1];
            const province = addressParts[2];
            setLocation({ province, municipality });
            fetchFocalInfo(municipality);
          } else {
            setError("Unable to parse MSW location information.");
          }
        } else {
          setError("Incomplete MSW profile. Please update your address information.");
        }
      } catch (err) {
        console.error("Error loading MSW info:", err);
        setError(err.message || "Failed to load MSW location information.");
      } finally {
        setLoadingLocation(false);
      }
    };

    const fetchFocalInfo = async (municipality) => {
      if (!municipality) return;
      try {
        setLoadingFocal(true);
        setError("");
        const response = await apiRequest(
          `/api/focalperson/check?municipality=${encodeURIComponent(municipality)}`
        );
        if (response.success && response.exists) {
          setFocalInfo(response.data);
        } else if (response.success && !response.exists) {
          setFocalInfo(null);
        } else {
          setError(response.message || "Failed to load focal person information.");
        }
      } catch (err) {
        console.error("Error loading focal info:", err);
        setError(err.message || "Failed to load focal person information.");
      } finally {
        setLoadingFocal(false);
      }
    };

    fetchUserInfo();
  }, []);

  const renderContent = () => {
    if (loadingLocation) {
      return (
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box display="flex" flexDirection="column" gap={3}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(20,83,45,0.15)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(235,248,238,0.9) 100%)"
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Your Assigned Location
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
            <Chip
              icon={<MapPin size={16} />}
              label={`Province: ${location.province || "N/A"}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<MapPin size={16} />}
              label={`Municipality: ${location.municipality || "N/A"}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(20,83,45,0.1)"
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Focal Person Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loadingFocal ? (
            <Box className="flex items-center justify-center py-6">
              <CircularProgress size={28} />
            </Box>
          ) : focalInfo ? (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <User size={18} />
                <Typography variant="body1" fontWeight={600}>
                  Username: {focalInfo.username}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Municipality: {focalInfo.municipality}
              </Typography>
              {focalInfo.province && (
                <Typography variant="body2" color="text.secondary">
                  Province: {focalInfo.province}
                </Typography>
              )}
              {focalInfo.cdcName && (
                <Typography variant="body2" color="text.secondary">
                  CDC Name: {focalInfo.cdcName}
                </Typography>
              )}
              {focalInfo.createdAt && (
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(focalInfo.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No focal person account exists for {location.municipality}. You can create one
              using the Create Focal Person page.
            </Alert>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="px-6 py-6">
          <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
            Focal Person Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review the current focal person assigned to your municipality. Only one focal person
            can exist per municipality.
          </Typography>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ViewFocalPerson;


