import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/login_bg.png";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Login = () => {
  console.log("[Login] Component rendering");
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const resetEmailRef = useRef(null);

  // State management
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Log focus events
  useEffect(() => {
    console.log("[Effect] Setting up focus listeners");
    const usernameInput = usernameRef.current;
    const passwordInput = passwordRef.current;
    const emailInput = resetEmailRef.current;

    const logFocus = (fieldName) => {
      console.log(`[Focus] ${fieldName} field received focus`);
    };

    const logBlur = (fieldName) => {
      console.log(`[Focus] ${fieldName} field lost focus`);
    };

    if (usernameInput) {
      usernameInput.addEventListener('focus', () => logFocus('Username'));
      usernameInput.addEventListener('blur', () => logBlur('Username'));
    }

    if (passwordInput) {
      passwordInput.addEventListener('focus', () => logFocus('Password'));
      passwordInput.addEventListener('blur', () => logBlur('Password'));
    }

    if (emailInput) {
      emailInput.addEventListener('focus', () => logFocus('Reset Email'));
      emailInput.addEventListener('blur', () => logBlur('Reset Email'));
    }

    return () => {
      console.log("[Effect] Cleaning up focus listeners");
      if (usernameInput) {
        usernameInput.removeEventListener('focus', () => logFocus('Username'));
        usernameInput.removeEventListener('blur', () => logBlur('Username'));
      }
      if (passwordInput) {
        passwordInput.removeEventListener('focus', () => logFocus('Password'));
        passwordInput.removeEventListener('blur', () => logBlur('Password'));
      }
      if (emailInput) {
        emailInput.removeEventListener('focus', () => logFocus('Reset Email'));
        emailInput.removeEventListener('blur', () => logBlur('Reset Email'));
      }
    };
  }, []);

  // Responsive handling - memoized callback
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    console.log(`[Responsive] Screen resize detected. Mobile: ${mobile}`);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    console.log("[Effect] Setting up resize listener");
    window.addEventListener('resize', handleResize);
    return () => {
      console.log("[Effect] Cleaning up resize listener");
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // Input handlers - stable references
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log(`[Input] Field ${name} changed to: ${value}`);
    setLoginData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleResetEmailChange = useCallback((e) => {
    console.log(`[Input] Reset email changed to: ${e.target.value}`);
    setResetEmail(e.target.value);
  }, []);

  // Login handler - stable reference
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    console.log("[Auth] Login attempt initiated");
    console.log("[Auth] Credentials:", { 
      username: loginData.username, 
      password: '••••••' // Don't log actual password
    });
    
    setError(null);
    
    try {
      console.log("[API] Sending request to:", `${API_BASE_URL}/api/login`);
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: loginData.username,
        password: loginData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log("[API] Response received:", {
        status: response.status,
        data: response.data
      });

      if (response.data.success) {
        console.log("[Auth] Login successful");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        console.log("[Auth] User data:", {
          id: response.data.user.id,
          username: response.data.user.username,
          type: response.data.user.type
        });

        setTimeout(() => {
          console.log("[Navigation] Redirecting to dashboard");
          switch(response.data.user.type.toLowerCase()) {
            case 'admin': 
              navigate("/admin-dashboard");
              break;
            case 'president': 
              navigate("/president-dashboard");
              break;
            case 'worker': 
              navigate("/dashboard");
              break;
            case 'parent': 
              navigate("/dashboard");
              break;
            case 'eccdc': 
              navigate("/president-list");
              break;
            default: 
              navigate("/");
          }
        }, 2000);
      } else {
        console.warn("[Auth] Login failed:", response.data.message);
        setError(response.data.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error("[API] Error during login:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        response: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });

      const errorMessage = 
        err.response?.data?.message ||
        (err.response?.status === 500 ? "Server error. Please try again later." :
        err.response?.status === 401 ? "Invalid credentials" :
        err.code === 'ERR_NETWORK' ? "Network error. Check your connection." :
        "Login failed. Please try again.");
      
      setError(errorMessage);
    }
  }, [loginData, navigate]);

  // Password reset handler - stable reference
  const handlePasswordReset = useCallback(async () => {
    if (!resetEmail) {
      console.warn("[Auth] Reset attempt with empty email");
      setError("Please enter your email.");
      return;
    }
    
    try {
      console.log("[API] Sending password reset request for email:", resetEmail);
      await axios.post(`${API_BASE_URL}/api/password-reset`, { email: resetEmail });
      console.log("[Auth] Password reset email sent successfully");
      setSuccessMessage("Password reset link sent to your email!");
      setShowModal(false);
    } catch (err) {
      console.error("[API] Password reset error:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data
      });
      setError(err.response?.data?.message || "Failed to send reset email.");
    }
  }, [resetEmail]);

  // Login Form Component - memoized with all dependencies
  const LoginForm = React.memo(({ 
    loginData, 
    showPassword, 
    error, 
    handleInputChange, 
    handleLogin, 
    setShowPassword, 
    setShowModal 
  }) => {
    console.log("[Render] LoginForm rendering");
    return (
      <div className={`w-full ${isMobile ? 'bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg' : 'bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl'}`}>
        {/* ... rest of the LoginForm JSX ... */}
      </div>
    );
  });

  // Modal Component - memoized with all dependencies
  const ResetModal = React.memo(({ 
    resetEmail, 
    handleResetEmailChange, 
    handlePasswordReset, 
    setShowModal 
  }) => {
    console.log("[Render] ResetModal rendering");
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4" style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}>
        {/* ... rest of the ResetModal JSX ... */}
      </div>
    );
  });

  return (
    <>
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="relative flex min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="w-1/2 flex justify-center items-center bg-gradient-to-bl from-green-100 via-white to-green-100 z-10 relative">
            <div className="w-80 h-[500px] z-20">
              <div className="relative w-full h-full">
                <LoginForm 
                  loginData={loginData}
                  showPassword={showPassword}
                  error={error}
                  handleInputChange={handleInputChange}
                  handleLogin={handleLogin}
                  setShowPassword={setShowPassword}
                  setShowModal={setShowModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-bl from-green-100 via-white to-green-100 p-4">
          <div className="w-full max-w-md z-20">
            <LoginForm 
              loginData={loginData}
              showPassword={showPassword}
              error={error}
              handleInputChange={handleInputChange}
              handleLogin={handleLogin}
              setShowPassword={setShowPassword}
              setShowModal={setShowModal}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-600 border border-green-300 p-3 rounded-lg shadow-md z-30">
          {successMessage}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ResetModal 
          resetEmail={resetEmail}
          handleResetEmailChange={handleResetEmailChange}
          handlePasswordReset={handlePasswordReset}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};

export default Login;