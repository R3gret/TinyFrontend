import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink, FaUserEdit, FaKey } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Profile() {
  const [fadeIn, setFadeIn] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 200);
  }, []);

  // Fetch user data when profile tab becomes active
  useEffect(() => {
    if (activeTab === "profile") {
      fetchUserData();
    }
  }, [activeTab]);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setErrors({});
      setSuccess(null);
  
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('User from localStorage:', user); // Debug log
  
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }
  
      // Use params option for axios to properly send query parameters
      const response = await axios.get(
        'http://localhost:3001/api/user_session/current-user/details',
        {
          params: { userId: user.id }
        }
      );
  
      console.log('API Response:', response.data); // Debug log
  
      if (response.data.success) {
        console.log('API user data:', response.data.user);  // Debug
  console.log('Organization field:', response.data.user.other_info.organization);  // Debug
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

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    website: '',
    social_media: ''
  });

  // Update edit form when userData changes
  useEffect(() => {
    if (userData && userData.other_info) {
      setEditForm({
        full_name: userData.other_info.full_name || '',
        email: userData.other_info.email || userData.email || '',
        phone: userData.other_info.phone || '',
        address: userData.other_info.address || '',
        organization: userData.other_info.organization || '',
        website: userData.other_info.website || '',
        social_media: userData.other_info.social_media || ''
      });
      
      // Debug log to verify the values
      console.log('Setting editForm with:', {
        organization: userData.other_info.organization,
        website: userData.other_info.website,
        social_media: userData.other_info.social_media
      });
    }
  }, [userData]);

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editForm.full_name.trim()) {
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
  
    if (!validateEditForm()) return;
  
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }

      console.log('User ID ng update:', user.id); // Log the userId
  
      // Send the userId as part of the request body
      const response = await axios.put(
        'http://localhost:3001/api/user_session/update-profile',
        {
          userId: user.id,
          ...editForm
        }
      );
  
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        fetchUserData(); // Re-fetch user data after updating
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

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Must contain at least one special character';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    
    // Debug log before validation
    console.log('Password form values:', {
      current: passwordForm.currentPassword,
      new: passwordForm.newPassword,
      confirm: passwordForm.confirmPassword,
      match: passwordForm.newPassword === passwordForm.confirmPassword
    });
  
    // Validate form before submission
    if (!validatePasswordForm()) {
      console.log('Password form validation failed');
      return;
    }
  
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }
  
      // Prepare request data
      const requestData = {
        userId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      };
  
      console.log('Sending password change request:', requestData);
  
      const response = await axios.put(
        'http://localhost:3001/api/user_session/change-password',
        requestData,
        {
          params: { userId: user.id }, // Send userId as query parameter
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        console.log('Password changed successfully');
        setSuccess('Password updated successfully!');
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Hide success message after 3 seconds
        setTimeout(() => {
          setActiveTab('profile');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (err) {
      console.error('Password change error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
  
      if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = err.response.data.errors.reduce((acc, error) => {
          acc[error.path] = error.msg;
          return acc;
        }, {});
        setErrors(serverErrors);
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: err.message || 'Failed to change password' });
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
      // Handle validation errors from server
      setErrors(err.response.data.errors);
    } else {
      setErrors({ general: err.response?.data?.message || err.message || 'An error occurred' });
    }
  };

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

            {/* Main Content Area with Fixed Height */}
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


              {activeTab === "profile" && userData && (
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  {/* Left Side: Profile Image and Name */}
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

                  {/* Right Side: Contact Details */}
                  <div className="w-full md:w-2/3 p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Contact Information
                    </h3>
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

                    {/* Quick Links */}
<h3 className="text-lg font-semibold text-gray-800 mt-6">
  Quick Links
</h3>
<div className="mt-3 space-y-2">
  {userData.other_info?.website && (
    <a
      href={
        userData.other_info.website.startsWith('http')
          ? userData.other_info.website
          : `https://${userData.other_info.website}`
      }
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
      href={
        userData.other_info.social_media.startsWith('http')
          ? userData.other_info.social_media
          : `https://${userData.other_info.social_media}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-green-600 hover:text-green-800 transition-all"
    >
      <FaLink className="mr-2" />
      Social Media
    </a>
  )}

  {userData.other_info?.organization ? (
    <a
      href="#"
      className="flex items-center text-green-600 hover:text-green-800 transition-all"
    >
      <FaLink className="mr-2" />
      Organization: ({userData.other_info.organization})
    </a>
  ) : (
    <a
      href="#"
      className="flex items-center text-green-600 hover:text-green-800 transition-all"
    >
      <FaLink className="mr-2" />
      Community Support Groups
    </a>
  )}
</div>

                  </div>
                </div>
              )}

              {activeTab === "edit" && (
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
                        className={`w-full p-2 border rounded-md ${errors.full_name ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
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
                        className={`w-full p-2 border rounded-md ${errors.website ? 'border-red-500' : ''}`}
                        placeholder="https://example.com"
                      />
                      {errors.website && (
                        <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Social Media</label>
                      <input
                        type="url"
                        name="social_media"
                        value={editForm.social_media}
                        onChange={handleEditChange}
                        className={`w-full p-2 border rounded-md ${errors.social_media ? 'border-red-500' : ''}`}
                        placeholder="https://facebook.com/username"
                      />
                      {errors.social_media && (
                        <p className="text-red-500 text-sm mt-1">{errors.social_media}</p>
                      )}
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
              )}

{activeTab === "password" && (
  <div className="p-4">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
    
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

    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md mx-auto">
      {/* Current Password Field */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Current Password *
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? "text" : "password"}
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            className={`w-full p-2 border rounded-md ${errors.currentPassword ? 'border-red-500' : ''}`}
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
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password Field */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          New Password *
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className={`w-full p-2 border rounded-md ${errors.newPassword ? 'border-red-500' : ''}`}
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
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
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

      {/* Confirm Password Field */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Confirm New Password *
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className={`w-full p-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : ''}`}
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
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
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
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}