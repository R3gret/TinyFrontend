import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import {
  TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert, Paper, Grid, Avatar, Card, CardContent, InputAdornment
} from "@mui/material";
import {
    ChildCare as ChildCareIcon,
    SupervisorAccount as SupervisorAccountIcon,
    Person as PersonIcon,
    Emergency as EmergencyIcon,
    Badge as BadgeIcon,
    Wc as WcIcon,
    Cake as CakeIcon,
    Home as HomeIcon,
    Language as LanguageIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    Phone as PhoneIcon,
    ContactMail as ContactMailIcon
} from "@mui/icons-material";
import { apiRequest } from "../../utils/api";
import defaultProfilePic from '../../assets/default-profile.png';

const InputField = ({ label, name, value, onChange, type = "text", required = false, multiline = false, rows = 1, isEditing, InputLabelProps, icon }) => (
    <TextField
      margin="dense"
      required={required}
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      multiline={multiline}
      rows={rows}
      variant="outlined"
      disabled={!isEditing}
      InputProps={{
        readOnly: !isEditing,
        startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : null,
        sx: {
          borderRadius: 2,
          "&.Mui-disabled": {
            backgroundColor: "#f8f8f8"
          }
        }
      }}
      InputLabelProps={InputLabelProps}
    />
  );

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    childFirstName: "",
    childLastName: "",
    childMiddleName: "",
    childGender: "",
    childAddress: "",
    childBirthday: "",
    childFirstLanguage: "",
    childSecondLanguage: "",
    guardianName: "",
    guardianRelationship: "",
    guardianEmail: "",
    motherName: "",
    motherOccupation: "",
    motherAddress: "",
    motherContactHome: "",
    motherContactWork: "",
    fatherName: "",
    fatherOccupation: "",
    fatherAddress: "",
    fatherContactHome: "",
    fatherContactWork: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyContactHome: "",
    emergencyContactWork: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setError("No student ID provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiRequest(`/api/student-profile/${studentId}`);
        const studentData = response.profile;

        setFormData(prev => ({
            ...prev,
            childFirstName: studentData.first_name || "",
            childLastName: studentData.last_name || "",
            childMiddleName: studentData.middle_name || "",
            childGender: studentData.gender || "",
            childAddress: studentData.child_address || "",
            childBirthday: studentData.birthdate ? studentData.birthdate.split('T')[0] : "",
            childFirstLanguage: studentData.first_language || "",
            childSecondLanguage: studentData.second_language || "",
            guardianName: studentData.guardian_name || "",
            guardianRelationship: studentData.relationship || "",
            guardianEmail: studentData.email_address || "",
            motherName: studentData.mother_name || "",
            motherOccupation: studentData.mother_occupation || "",
            motherAddress: studentData.mother_address || "",
            motherContactHome: studentData.mother_home_contact || "",
            motherContactWork: studentData.mother_work_contact || "",
            fatherName: studentData.father_name || "",
            fatherOccupation: studentData.father_occupation || "",
            fatherAddress: studentData.father_address || "",
            fatherContactHome: studentData.father_home_contact || "",
            fatherContactWork: studentData.father_work_contact || "",
            emergencyName: studentData.emergency_name || "",
            emergencyRelationship: studentData.emergency_relationship || "",
            emergencyContactHome: studentData.emergency_home_contact || "",
            emergencyContactWork: studentData.emergency_work_contact || "",
        }));
      } catch (err) {
        setError(err.message || "Failed to fetch student data.");
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const snakeCaseFormData = {
        first_name: formData.childFirstName,
        middle_name: formData.childMiddleName,
        last_name: formData.childLastName,
        birthdate: formData.childBirthday,
        gender: formData.childGender,
        child_address: formData.childAddress,
        first_language: formData.childFirstLanguage,
        second_language: formData.childSecondLanguage,
        guardian_name: formData.guardianName,
        relationship: formData.guardianRelationship,
        email_address: formData.guardianEmail,
        mother_name: formData.motherName,
        mother_occupation: formData.motherOccupation,
        mother_address: formData.motherAddress,
        mother_home_contact: formData.motherContactHome,
        mother_work_contact: formData.motherContactWork,
        father_name: formData.fatherName,
        father_occupation: formData.fatherOccupation,
        father_address: formData.fatherAddress,
        father_home_contact: formData.fatherContactHome,
        father_work_contact: formData.fatherContactWork,
        emergency_name: formData.emergencyName,
        emergency_relationship: formData.emergencyRelationship,
        emergency_home_contact: formData.emergencyContactHome,
        emergency_work_contact: formData.emergencyContactWork,
    };

    try {
      await apiRequest(`/api/student-profile/${studentId}`, "PUT", snakeCaseFormData);
      setSnackbar({ open: true, message: "Student profile updated successfully!", severity: "success" });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update student profile.");
      setSnackbar({ open: true, message: err.message || "Failed to update student profile.", severity: "error" });
      console.error("Error updating student profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-center p-8">
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <div className="p-6 pt-20">
          <div className="max-w-7xl mx-auto">
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={defaultProfilePic}
                      sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {formData.childFirstName} {formData.childLastName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Student
                    </Typography>
                  </Box>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ChildCareIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Child Information
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><InputField icon={<BadgeIcon />} label="First Name" name="childFirstName" value={formData.childFirstName} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<BadgeIcon />} label="Middle Name" name="childMiddleName" value={formData.childMiddleName} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<BadgeIcon />} label="Last Name" name="childLastName" value={formData.childLastName} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<WcIcon />} label="Gender" name="childGender" value={formData.childGender} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<CakeIcon />} label="Birthday" name="childBirthday" type="date" value={formData.childBirthday} onChange={handleChange} required InputLabelProps={{ shrink: true }} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<LanguageIcon />} label="First Language" name="childFirstLanguage" value={formData.childFirstLanguage} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<LanguageIcon />} label="Second Language" name="childSecondLanguage" value={formData.childSecondLanguage} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12}><InputField icon={<HomeIcon />} label="Address" name="childAddress" value={formData.childAddress} onChange={handleChange} required multiline rows={2} isEditing={isEditing} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
                            <SupervisorAccountIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Guardian Information
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><InputField icon={<PersonIcon />} label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<ContactMailIcon />} label="Guardian Relationship" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12}><InputField icon={<EmailIcon />} label="Guardian Email" name="guardianEmail" type="email" value={formData.guardianEmail} onChange={handleChange} isEditing={isEditing} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Mother's Information
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><InputField icon={<PersonIcon />} label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<WorkIcon />} label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12}><InputField icon={<HomeIcon />} label="Mother's Address" name="motherAddress" value={formData.motherAddress} onChange={handleChange} multiline rows={2} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Mother's Contact (Home)" name="motherContactHome" value={formData.motherContactHome} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Mother's Contact (Work)" name="motherContactWork" value={formData.motherContactWork} onChange={handleChange} isEditing={isEditing} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Father's Information
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><InputField icon={<PersonIcon />} label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<WorkIcon />} label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12}><InputField icon={<HomeIcon />} label="Father's Address" name="fatherAddress" value={formData.fatherAddress} onChange={handleChange} multiline rows={2} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Father's Contact (Home)" name="fatherContactHome" value={formData.fatherContactHome} onChange={handleChange} isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Father's Contact (Work)" name="fatherContactWork" value={formData.fatherContactWork} onChange={handleChange} isEditing={isEditing} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
                            <EmergencyIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Emergency Contact
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><InputField icon={<PersonIcon />} label="Emergency Name" name="emergencyName" value={formData.emergencyName} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<ContactMailIcon />} label="Emergency Relationship" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Emergency Contact (Home)" name="emergencyContactHome" value={formData.emergencyContactHome} onChange={handleChange} required isEditing={isEditing} /></Grid>
                            <Grid item xs={12} sm={6}><InputField icon={<PhoneIcon />} label="Emergency Contact (Work)" name="emergencyContactWork" value={formData.emergencyContactWork} onChange={handleChange} isEditing={isEditing} /></Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          {!isEditing ? (
                            <Button variant="contained" color="primary" onClick={toggleEditMode}>
                              Edit Profile
                            </Button>
                          ) : (
                            <>
                              <Button variant="outlined" color="secondary" onClick={toggleEditMode}>
                                Cancel
                              </Button>
                              <Button type="submit" variant="contained" color="primary" disabled={saving}>
                                {saving ? <CircularProgress size={24} /> : "Save Changes"}
                              </Button>
                            </>
                          )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
