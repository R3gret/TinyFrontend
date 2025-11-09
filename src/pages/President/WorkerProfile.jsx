import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/President/PresidentSidebar";
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

export default function WorkerProfile() {
  const { id: userId } = useParams();
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
  }, [activeTab, userId]);

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
  
      if (!userId) {
        throw new Error('No user ID provided');
      }
  
      const data = await apiRequest(`/api/user_session/current-user/details?userId=${userId}`);
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
      if (!userId) {
        throw new Error('No user ID provided');
      }
      
      await apiRequest(`/api/users/${userId}`, {
        method: 'PUT',
        body: {
          ...editForm,
          type: 'other_info'
        }
      });
      
      setSuccess('Profile updated successfully!');
      fetchUserData();
    } catch (err) {
      console.error('Error updating profile:', err);
      handleApiError(err, setEditErrors);
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
      if (!userId) {
        throw new Error('No user ID provided');
      }
      
      await apiRequest(`/api/users/${userId}`, {
        method: 'PUT',
        body: {
          ...passwordForm,
          type: 'password'
        }
      });
      
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      handleApiError(err, setPasswordErrors);
    } finally {
      setLoading(false);
    }
  };

  // Error handling
  const handleApiError = (err, formSetter = setErrors) => {
    if (err.message.includes('Unauthorized')) {
      navigate('/login');
    } else if (err.response?.data?.errors) {
      formSetter(err.response.data.errors);
    } else {
      formSetter({ general: err.message || 'An unexpected error occurred' });
    }
  };

  // Render functions
  const renderLoading = () => (
    <div className="flex justify-center items-center h-full">
      <ImSpinner8 className="animate-spin text-5xl text-green-600" />
    </div>
  );

  const renderError = () => (
    <div className="text-center text-red-500">
      <p>Error: {errors.general || 'Could not load user data.'}</p>
      <button onClick={fetchUserData} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Retry
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <img
          src={userData.profile_pic || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
        />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{userData.other_info?.full_name || userData.username}</h2>
          <p className="text-gray-500 capitalize">{userData.type}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <InfoItem icon={<FaEnvelope />} label="Email" value={userData.other_info?.email || userData.email} />
        <InfoItem icon={<FaPhone />} label="Phone" value={userData.other_info?.phone} />
        <InfoItem icon={<FaMapMarkerAlt />} label="Address" value={userData.other_info?.address} />
        <InfoItem icon={<FaUserEdit />} label="Organization" value={userData.other_info?.organization} />
        <InfoItem icon={<FaLink />} label="Website" value={userData.other_info?.website} isLink={true} />
        <InfoItem icon={<FaLink />} label="Social Media" value={userData.other_info?.social_media} isLink={true} />
      </div>
    </div>
  );

  const renderEditForm = () => (
    <form onSubmit={handleEditSubmit} className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Full Name" name="full_name" value={editForm.full_name} onChange={handleEditChange} error={editErrors.full_name} required />
        <InputField label="Email" name="email" type="email" value={editForm.email} onChange={handleEditChange} error={editErrors.email} />
        <InputField label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} error={editErrors.phone} />
        <InputField label="Address" name="address" value={editForm.address} onChange={handleEditChange} error={editErrors.address} />
        <InputField label="Organization" name="organization" value={editForm.organization} onChange={handleEditChange} error={editErrors.organization} />
        <InputField label="Website" name="website" type="url" value={editForm.website} onChange={handleEditChange} error={editErrors.website} placeholder="https://example.com" />
        <InputField label="Social Media" name="social_media" type="url" value={editForm.social_media} onChange={handleEditChange} error={editErrors.social_media} placeholder="https://linkedin.com/in/..." />
      </div>
      <div className="flex justify-end items-center pt-4">
        {success && <p className="text-green-600 mr-4">{success}</p>}
        {errors.general && <p className="text-red-500 mr-4">{errors.general}</p>}
        <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center">
          {loading ? <ImSpinner8 className="animate-spin mr-2" /> : null}
          Save Changes
        </button>
      </div>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h3>
      <PasswordField
        label="Current Password"
        name="currentPassword"
        value={passwordForm.currentPassword}
        onChange={handlePasswordChange}
        error={passwordErrors.currentPassword}
        show={showPasswords.current}
        toggle={() => togglePasswordVisibility('current')}
        required
      />
      <PasswordField
        label="New Password"
        name="newPassword"
        value={passwordForm.newPassword}
        onChange={handlePasswordChange}
        error={passwordErrors.newPassword}
        show={showPasswords.new}
        toggle={() => togglePasswordVisibility('new')}
        required
      />
      <PasswordField
        label="Confirm New Password"
        name="confirmPassword"
        value={passwordForm.confirmPassword}
        onChange={handlePasswordChange}
        error={passwordErrors.confirmPassword}
        show={showPasswords.confirm}
        toggle={() => togglePasswordVisibility('confirm')}
        required
      />
      <div className="flex justify-end items-center pt-4">
        {success && <p className="text-green-600 mr-4">{success}</p>}
        {errors.general && <p className="text-red-500 mr-4">{errors.general}</p>}
        <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center">
          {loading ? <ImSpinner8 className="animate-spin mr-2" /> : null}
          Update Password
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className={`p-8 pt-24 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="flex border-b border-gray-200 mb-8">
              <TabButton name="profile" icon={<FaUserEdit />} label="Profile" activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton name="password" icon={<FaKey />} label="Security" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {loading && !userData ? renderLoading() : null}
            {errors.general && !userData ? renderError() : null}
            
            {userData && (
              <>
                {activeTab === 'profile' && renderProfile()}
                {activeTab === 'edit-profile' && renderEditForm()}
                {activeTab === 'password' && renderPasswordForm()}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Sub-components
const InfoItem = ({ icon, label, value, isLink = false }) => (
  <div className="flex items-start space-x-4 text-gray-700">
    <div className="text-green-600 mt-1">{icon}</div>
    <div>
      <p className="font-semibold">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
          {value}
        </a>
      ) : (
        <p className="text-gray-600">{value || "Not provided"}</p>
      )}
    </div>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, error, required, placeholder }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-2 font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, value, onChange, error, show, toggle, required }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-2 font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      <button type="button" onClick={toggle} className="absolute inset-y-0 right-0 px-4 text-gray-500">
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const TabButton = ({ name, icon, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(name)}
    className={`flex items-center space-x-2 px-6 py-3 text-lg font-medium transition ${
      activeTab === name
        ? "border-b-2 border-green-600 text-green-600"
        : "text-gray-500 hover:text-green-600"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
