import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/MSW/MSWSidebar";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink, FaUserEdit, FaKey } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { apiRequest } from "../../utils/api";

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
  
      const data = await apiRequest(`/api/user_session/current-user/details?userId=${user.id}`);
      setUserData(data.user);
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

      const data = await apiRequest('/api/user_session/update-profile', 'PUT', { 
        userId: user.id, 
        ...editForm 
      });
  
      setSuccess('Profile updated successfully!');
      fetchUserData();
      setTimeout(() => setActiveTab('profile'), 1500);
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
  
      const data = await apiRequest('/api/user_session/change-password', 'PUT', {
        userId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
  
      setSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setActiveTab('profile'), 3000);
    } catch (err) {
      if (err.message.includes('validation')) {
        // Handle validation errors from server
        const serverErrors = JSON.parse(err.message).errors.reduce((acc, error) => {
          acc[error.path] = error.msg;
          return acc;
        }, {});
        setPasswordErrors(serverErrors);
      } else {
        setErrors({ general: err.message || 'Failed to change password' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    if (err.message.includes('Unauthorized') || err.message.includes('No user logged in')) {
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      setErrors({ general: err.message || 'An error occurred' });
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
        <div>
          <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={editForm.full_name}
            onChange={handleEditChange}
            className={`w-full p-2 border rounded-md ${editErrors.full_name ? 'border-red-500' : ''}`}
            required
          />
          {editErrors.full_name && <p className="text-red-500 text-sm mt-1">{editErrors.full_name}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
            className={`w-full p-2 border rounded-md ${editErrors.email ? 'border-red-500' : ''}`}
          />
          {editErrors.email && <p className="text-red-500 text-sm mt-1">{editErrors.email}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={editForm.phone}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={editForm.address}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Organization</label>
          <input
            type="text"
            name="organization"
            value={editForm.organization}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Website</label>
          <input
            type="url"
            name="website"
            value={editForm.website}
            onChange={handleEditChange}
            className={`w-full p-2 border rounded-md ${editErrors.website ? 'border-red-500' : ''}`}
            placeholder="https://example.com"
          />
          {editErrors.website && <p className="text-red-500 text-sm mt-1">{editErrors.website}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Social Media</label>
          <input
            type="url"
            name="social_media"
            value={editForm.social_media}
            onChange={handleEditChange}
            className={`w-full p-2 border rounded-md ${editErrors.social_media ? 'border-red-500' : ''}`}
            placeholder="https://facebook.com/username"
          />
          {editErrors.social_media && <p className="text-red-500 text-sm mt-1">{editErrors.social_media}</p>}
        </div>

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
        <div>
          <label className="block text-gray-700 font-medium mb-1">Current Password *</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-md ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">New Password *</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-md ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
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
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Confirm New Password *</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-md ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
        </div>

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

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="ml-64 pt-16">
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

