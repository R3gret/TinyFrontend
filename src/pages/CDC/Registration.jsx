import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import RegistrationPDF from "../../forms/RegistrationPDF";
import { Snackbar, Alert } from "@mui/material";

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
    ...(body && { body: JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

// Initial form state
const initialFormData = {
  childLastName: "",
  childFirstName: "",
  childMiddleName: "",
  childGender: "",
  childAddress: "",
  childBirthday: "",
  childAge: "",
  childFirstLanguage: "",
  childSecondLanguage: "",
  childRegistered: false,
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
};

export default function Registration() {
  const [showPDF, setShowPDF] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // "success", "error", "warning", "info"
  });

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (formData.childBirthday) {
      const birthDate = new Date(formData.childBirthday);
      const today = new Date();
  
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
  
      if (days < 0) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
  
      years = Math.max(0, years);
      months = Math.max(0, months);
  
      const ageString = `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
      setFormData(prev => ({ ...prev, childAge: ageString }));
    }
  }, [formData.childBirthday]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleRegister = async () => {
    // Validate required fields
    if (!formData.childFirstName || !formData.childLastName || 
        !formData.guardianName || !formData.motherName || !formData.fatherName) {
      setSubmitError('Required fields are missing');
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiRequest('/api/register', 'POST', formData);
      console.log('Registration successful:', response);
      
      // Show success notification
      setSnackbar({
        open: true,
        message: 'Registration successful!',
        severity: 'success'
      });
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
      setSnackbar({
        open: true,
        message: error.message || 'Registration failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-screen min-h-screen flex bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50">
        <Navbar />
        <h1 className="text-2xl font-bold text-gray-800 mt-11 mb-4 ml-10">Child Registration</h1>

        <div className="p-10 w-17/18 min-h-[500px] mx-auto bg-white shadow-lg rounded-lg">
          {showPDF ? (
            <div className="absolute inset-0 bg-white p-10 z-50">
              <button 
                className="mb-4 bg-red-600 text-white px-4 py-2 rounded" 
                onClick={() => setShowPDF(false)}
              >
                Close Preview
              </button>
              <PDFViewer width="100%" height={600}>
                <RegistrationPDF data={formData} />
              </PDFViewer>
            </div>
          ) : (
            <>
              <RegistrationForm formData={formData} onChange={handleChange} />
              {submitError && (
                <div className="text-red-500 mb-4">{submitError}</div>
              )}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowPDF(true)}
                >
                  Preview PDF
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                  onClick={handleRegister}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Snackbar Notification */}
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

// Combined Registration Form Component
function RegistrationForm({ formData, onChange }) {
  return (
    <form className="space-y-6">
      {/* Child Information Section */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-4">Child Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700">First Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.childFirstName} 
              onChange={(e) => onChange("childFirstName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.childLastName} 
              onChange={(e) => onChange("childLastName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Middle Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.childMiddleName} 
              onChange={(e) => onChange("childMiddleName", e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-gray-700">Gender</label>
            <select 
              className="w-full border rounded p-2" 
              value={formData.childGender} 
              onChange={(e) => onChange("childGender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Birthday</label>
            <input 
              type="date" 
              className="w-full border rounded p-2" 
              value={formData.childBirthday} 
              onChange={(e) => onChange("childBirthday", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Age</label>
<div className="w-full border rounded p-2 bg-gray-100 text-gray-800">
  {formData.childAge || "N/A"}
</div>
          </div>
          <div className="flex items-center">
            <label className="block text-gray-700 mr-2">Registered:</label>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-1" 
                checked={formData.childRegistered} 
                onChange={(e) => onChange("childRegistered", e.target.checked)} 
              />
              <span>Yes</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-gray-700">First Language</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.childFirstLanguage} 
              onChange={(e) => onChange("childFirstLanguage", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Second Language</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.childSecondLanguage} 
              onChange={(e) => onChange("childSecondLanguage", e.target.value)} 
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Address</label>
          <input 
            type="text" 
            className="w-full border rounded p-2" 
            value={formData.childAddress} 
            onChange={(e) => onChange("childAddress", e.target.value)} 
          />
        </div>
      </div>

      {/* Guardian Information Section */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-4">Guardian Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700">Guardian Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.guardianName} 
              onChange={(e) => onChange("guardianName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Relationship</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.guardianRelationship} 
              onChange={(e) => onChange("guardianRelationship", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="w-full border rounded p-2" 
              value={formData.guardianEmail} 
              onChange={(e) => onChange("guardianEmail", e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Mother Information Section */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-4">Mother's Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.motherName} 
              onChange={(e) => onChange("motherName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Occupation</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.motherOccupation} 
              onChange={(e) => onChange("motherOccupation", e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-gray-700">Address</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.motherAddress} 
              onChange={(e) => onChange("motherAddress", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Home Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.motherContactHome} 
              onChange={(e) => onChange("motherContactHome", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Work Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.motherContactWork} 
              onChange={(e) => onChange("motherContactWork", e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Father Information Section */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-4">Father's Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.fatherName} 
              onChange={(e) => onChange("fatherName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Occupation</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.fatherOccupation} 
              onChange={(e) => onChange("fatherOccupation", e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-gray-700">Address</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.fatherAddress} 
              onChange={(e) => onChange("fatherAddress", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Home Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.fatherContactHome} 
              onChange={(e) => onChange("fatherContactHome", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Work Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.fatherContactWork} 
              onChange={(e) => onChange("fatherContactWork", e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.emergencyName} 
              onChange={(e) => onChange("emergencyName", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Relationship</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.emergencyRelationship} 
              onChange={(e) => onChange("emergencyRelationship", e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-gray-700">Home Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.emergencyContactHome} 
              onChange={(e) => onChange("emergencyContactHome", e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-gray-700">Work Contact</label>
            <input 
              type="tel" 
              className="w-full border rounded p-2" 
              value={formData.emergencyContactWork} 
              onChange={(e) => onChange("emergencyContactWork", e.target.value)} 
            />
          </div>
        </div>
      </div>
    </form>
  );
}

