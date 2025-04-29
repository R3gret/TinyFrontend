import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink, FaUserEdit, FaKey } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// API configuration - using Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Custom hook for form state management
const useFormState = (initialState) => {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return [state, setState, errors, setErrors, handleChange];
};

export default function Profile() {
  const [fadeIn, setFadeIn] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [editForm, setEditForm, editErrors, setEditErrors, handleEditChange] = useFormState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    website: '',
    social_media: ''
  });

  const [passwordForm, setPasswordForm, passwordErrors, setPasswordErrors, handlePasswordChange] = useFormState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch user data when tab changes
  useEffect(() => {
    if (activeTab === "profile") {
      fetchUserData();
    }
  }, [activeTab]);

  // Update edit form when user data changes
  useEffect(() => {
    if (userData?.other_info) {
      setEditForm({
        full_name: userData.other_info.full_name || '',
        email: userData.other_info.email || userData.email || '',
        phone: userData.other_info.phone || '',
        address: userData.other_info.address || '',
        organization: userData.other_info.organization || '',
        website: userData.other_info.website || '',
        social_media: userData.other_info.social_media || ''
      });
    }
  }, [userData, setEditForm]);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setErrors({});
      setSuccess(null);
  
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error('No user logged in');
      }
  
      const response = await axios.get(
        `${API_BASE_URL}/api/user_session/current-user/details`,
        { params: { userId: user.id } }
      );
  
      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (editForm.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (editForm.website && !/^https?:\/\/.+\..+/.test(editForm.website)) {
      newErrors.website = 'Invalid website URL';
    }
    
    if (editForm.social_media && !/^https?:\/\/.+\..+/.test(editForm.social_media)) {
      newErrors.social_media = 'Invalid social media URL';
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      if (passwordForm.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(passwordForm.newPassword)) {
        newErrors.newPassword = 'Must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(passwordForm.newPassword)) {
        newErrors.newPassword = 'Must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(passwordForm.newPassword)) {
        newErrors.newPassword = 'Must contain at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(passwordForm.newPassword)) {
        newErrors.newPassword = 'Must contain at least one special character';
      }
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submissions
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErrors({});
    setSuccess(null);
  
    if (!validateEditForm()) return;
  
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/user_session/update-profile`,
        { userId: user.id, ...editForm }
      );
  
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        fetchUserData();
        setTimeout(() => setActiveTab('profile'), 1500);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setSuccess(null);
  
    if (!validatePasswordForm()) return;
  
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error('No user logged in');
      }
  
      const response = await axios.put(
        `${API_BASE_URL}/api/user_session/change-password`,
        {
          userId: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        }
      );
  
      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setActiveTab('profile'), 3000);
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors.reduce((acc, error) => {
          acc[error.path] = error.msg;
          return acc;
        }, {});
        setPasswordErrors(serverErrors);
      } else {
        setErrors({ general: err.response?.data?.message || err.message || 'Failed to change password' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      navigate('/login');
    } else if (err.response?.data?.errors) {
      setErrors(err.response.data.errors);
    } else {
      setErrors({ general: err.response?.data?.message || err.message || 'An error occurred' });
    }
  };

  // Helper function to format URLs
  const formatUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // Tab content components
  const ProfileTab = () => (
    <div className="flex flex-col md:flex-row items-center md:items-start">
      <div className="flex flex-col items-center md:items-start w-full md:w-1/3 p-4">
        <img
          src={userData.other_info?.profile_pic || userData.profile_pic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-36 h-36 rounded-full shadow-md border-4 border-green-700 object-cover"
        />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">
          {userData.other_info?.full_name || 'No name provided'}
        </h2>
        <p className="text-green-700 font-medium">
          {userData.type || 'No position specified'}
        </p>
      </div>

      <div className="w-full md:w-2/3 p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="text-green-600 mr-2" />
            <span>{userData.other_info?.address || 'No address provided'}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <FaPhone className="text-green-600 mr-2" />
            <span>{userData.other_info?.phone || 'No phone number provided'}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <FaEnvelope className="text-green-600 mr-2" />
            <span>{userData.other_info?.email || userData.email || 'No email provided'}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mt-6">Quick Links</h3>
        <div className="mt-3 space-y-2">
          {userData.other_info?.website && (
            <a
              href={formatUrl(userData.other_info.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-green-600 hover:text-green-800 transition-all"
            >
              <FaLink className="mr-2" />
              Personal Website
            </a>
          )}

          {userData.other_info?.social_media && (
            <a
              href={formatUrl(userData.other_info.social_media)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-green-600 hover:text-green-800 transition-all"
            >
              <FaLink className="mr-2" />
              Social Media
            </a>
          )}

          <div className="flex items-center text-green-600">
            <FaLink className="mr-2" />
            Organization: {userData.other_info?.organization || 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  );

  const EditTab = () => (
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h3>
      <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name *"
          name="full_name"
          value={editForm.full_name}
          onChange={handleEditChange}
          error={editErrors.full_name}
          required
        />
        
        <FormField
          label="Email"
          type="email"
          name="email"
          value={editForm.email}
          onChange={handleEditChange}
          error={editErrors.email}
        />
        
        <FormField
          label="Phone"
          name="phone"
          value={editForm.phone}
          onChange={handleEditChange}
        />
        
        <FormField
          label="Address"
          name="address"
          value={editForm.address}
          onChange={handleEditChange}
        />
        
        <FormField
          label="Organization"
          name="organization"
          value={editForm.organization}
          onChange={handleEditChange}
        />
        
        <FormField
          label="Website"
          type="url"
          name="website"
          value={editForm.website}
          onChange={handleEditChange}
          error={editErrors.website}
          placeholder="https://example.com"
        />
        
        <FormField
          label="Social Media"
          type="url"
          name="social_media"
          value={editForm.social_media}
          onChange={handleEditChange}
          error={editErrors.social_media}
          placeholder="https://facebook.com/username"
        />

        <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-all"
            disabled={loading}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  const PasswordTab = () => (
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
      <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md mx-auto">
        <PasswordField
          label="Current Password *"
          name="currentPassword"
          value={passwordForm.currentPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.currentPassword}
          showPassword={showPasswords.current}
          onToggleVisibility={() => togglePasswordVisibility('current')}
          required
        />
        
        <PasswordField
          label="New Password *"
          name="newPassword"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.newPassword}
          showPassword={showPasswords.new}
          onToggleVisibility={() => togglePasswordVisibility('new')}
          required
        >
          <div className="text-xs text-gray-500 mt-1">
            Password must contain:
            <ul className="list-disc pl-5">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>
        </PasswordField>
        
        <PasswordField
          label="Confirm New Password *"
          name="confirmPassword"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.confirmPassword}
          showPassword={showPasswords.confirm}
          onToggleVisibility={() => togglePasswordVisibility('confirm')}
          required
        />

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-all flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <ImSpinner8 className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Reusable form field component
  const FormField = ({ label, type = 'text', name, value, onChange, error, placeholder, required = false }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  // Reusable password field component
  const PasswordField = ({ label, name, value, onChange, error, showPassword, onToggleVisibility, children, required = false }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full p-2 border rounded-md ${error ? 'border-red-500' : ''}`}
          required={required}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {children}
    </div>
  );

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />

        <div className="flex justify-center items-start min-h-screen mt-8">
          <div
            className={`bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl min-h-[450px] transform transition-all duration-500 ${
              fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-4">
                {["profile", "edit", "password"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setErrors({});
                      setSuccess(null);
                    }}
                    disabled={loading}
                    className={`px-6 py-3 text-lg font-semibold flex items-center ${
                      activeTab === tab
                        ? "border-b-4 border-green-700 text-green-700"
                        : "text-gray-600 hover:text-green-600"
                    } transition-all`}
                  >
                    {tab === "profile" && <FaUserEdit className="mr-2" />}
                    {tab === "edit" && <FaUserEdit className="mr-2" />}
                    {tab === "password" && <FaKey className="mr-2" />}
                    {tab === "profile" && "Profile"}
                    {tab === "edit" && "Edit Profile"}
                    {tab === "password" && "Change Password"}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[300px] relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <ImSpinner8 className="animate-spin text-green-700 text-4xl" />
                </div>
              )}
              
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.general}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              {activeTab === "profile" && userData && <ProfileTab />}
              {activeTab === "edit" && <EditTab />}
              {activeTab === "password" && <PasswordTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}