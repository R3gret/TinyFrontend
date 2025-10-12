import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/login_bg.png";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Memoized Input Component
const InputField = React.memo(({ 
  type, 
  name, 
  value, 
  placeholder, 
  onChange, 
  inputRef,
  autoComplete,
  className = "" 
}) => {
  return (
    <input
      ref={inputRef}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg text-gray-800 ${className}`}
      required
      autoComplete={autoComplete}
    />
  );
});

const Login = () => {
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const resetEmailRef = useRef(null);

  // State management
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive handling
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    if (mobile !== isMobile) {
      setIsMobile(mobile);
    }
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Form handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleResetEmailChange = useCallback((e) => {
    setResetEmail(e.target.value);
  }, []);

  // Authentication handlers
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: formData.username,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Clear ALL data from the previous session before setting new data
      localStorage.clear();

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        let path;
        switch(response.data.user.type.toLowerCase()) {
          case 'admin': path = "/admin-dashboard"; break;
          case 'president': path = "/president-dashboard"; break;
          case 'worker': path = "/dashboard"; break;
          case 'parent': path = "/parent-dashboard"; break;
          case 'eccdc': path = "/president-list"; break;
          default: path = "/";
        }
        window.location.href = path;
      } else {
        setError(response.data.message || "Invalid username or password.");
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message ||
        (err.response?.status === 500 ? "Server error. Please try again later." :
        err.response?.status === 401 ? "Invalid credentials" :
        err.code === 'ERR_NETWORK' ? "Network error. Check your connection." :
        "Login failed. Please try again.");
      
      setError(errorMessage);
    }
  }, [formData, navigate]);

  const handlePasswordReset = useCallback(async () => {
    if (!resetEmail) {
      setError("Please enter your email.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/api/password-reset`, { email: resetEmail });
      setSuccessMessage("Password reset link sent to your email!");
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    }
  }, [resetEmail]);

  // Main render
  return (
    <>
      {!isMobile ? (
        <div className="relative flex min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="w-1/2 flex justify-center items-center bg-gradient-to-bl from-green-100 via-white to-green-100 z-10 relative">
            <div className="w-80 h-[500px] z-20">
              <div className="relative w-full h-full">
                <LoginFormContent 
                  formData={formData}
                  showPassword={showPassword}
                  error={error}
                  handleInputChange={handleInputChange}
                  handleLogin={handleLogin}
                  setShowPassword={setShowPassword}
                  setShowModal={setShowModal}
                  isMobile={isMobile}
                  usernameRef={usernameRef}
                  passwordRef={passwordRef}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-bl from-green-100 via-white to-green-100 p-4">
          <div className="w-full max-w-md z-20">
            <LoginFormContent 
              formData={formData}
              showPassword={showPassword}
              error={error}
              handleInputChange={handleInputChange}
              handleLogin={handleLogin}
              setShowPassword={setShowPassword}
              setShowModal={setShowModal}
              isMobile={isMobile}
              usernameRef={usernameRef}
              passwordRef={passwordRef}
            />
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-600 border border-green-300 p-3 rounded-lg shadow-md z-30">
          {successMessage}
        </div>
      )}

      {showModal && (
        <ResetModalContent 
          resetEmail={resetEmail}
          handleResetEmailChange={handleResetEmailChange}
          handlePasswordReset={handlePasswordReset}
          setShowModal={setShowModal}
          isMobile={isMobile}
          resetEmailRef={resetEmailRef}
        />
      )}
    </>
  );
};

// Login Form Component
const LoginFormContent = React.memo(({
  formData,
  showPassword,
  error,
  handleInputChange,
  handleLogin,
  setShowPassword,
  setShowModal,
  isMobile,
  usernameRef,
  passwordRef
}) => {
  return (
    <div className={`w-full ${isMobile ? 'bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg' : 'bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl'}`}>
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo" className={`${isMobile ? 'w-24' : 'w-28'} h-auto`} />
      </div>
      <h2 className="text-2xl font-semibold text-center mb-6 text-green-700">Login</h2>
      <form onSubmit={handleLogin}>
        <InputField
          type="text"
          name="username"
          value={formData.username}
          placeholder="Enter your username"
          onChange={handleInputChange}
          inputRef={usernameRef}
          autoComplete="username"
          className="mb-6" // Increased spacing below username field
        />
        <div className="relative mb-6">
          <InputField
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleInputChange}
            inputRef={passwordRef}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-600"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition mb-4"
        >
          Login
        </button>
      </form>

      <div className="text-center mt-4 text-sm text-gray-600">
        <p>
          Forgot password?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => setShowModal(true)}
          >
            Request password reset here
          </span>
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-center mt-4 bg-red-100 border border-red-500 p-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
});

// Reset Modal Component
const ResetModalContent = React.memo(({
  resetEmail,
  handleResetEmailChange,
  handlePasswordReset,
  setShowModal,
  isMobile,
  resetEmailRef
}) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    }}>
      <div className={`bg-white p-6 rounded-lg shadow-lg ${isMobile ? 'w-full max-w-sm' : 'w-80'}`}>
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className={`${isMobile ? 'w-20' : 'w-24'} h-auto`} />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
        <InputField
          type="email"
          name="resetEmail"
          value={resetEmail}
          placeholder="Enter your email"
          onChange={handleResetEmailChange}
          inputRef={resetEmailRef}
          autoComplete="email"
          className="mb-6"
        />
        <div className="flex justify-between gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handlePasswordReset}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg flex-1"
          >
            {isMobile ? 'Reset' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default Login;