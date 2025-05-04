import React, { useState, useEffect, useRef } from "react";
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

  // Responsive handling
  useEffect(() => {
    console.log("[Responsive] Checking screen size");
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      console.log(`[Responsive] Screen resize detected. Mobile: ${mobile}`);
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      console.log("[Responsive] Cleaning up resize listener");
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Input] Field ${name} changed to: ${value}`);
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetEmailChange = (e) => {
    console.log(`[Input] Reset email changed to: ${e.target.value}`);
    setResetEmail(e.target.value);
  };

  // Login handler
  const handleLogin = async (e) => {
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
  };

  // Password reset handler
  const handlePasswordReset = async () => {
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
  };

  // Login Form Component
  const LoginForm = React.memo(() => {
    console.log("[Render] LoginForm rendering");
    return (
      <div className={`w-full ${isMobile ? 'bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg' : 'bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl'}`}>
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className={`${isMobile ? 'w-24' : 'w-28'} h-auto`} />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4 text-green-700">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            ref={usernameRef}
            type="text"
            name="username"
            placeholder="Enter your username"
            value={loginData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg mb-4 text-gray-800"
            required
            autoComplete="username"
          />
          <div className="relative mb-6">
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-800"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => {
                console.log(`[UI] Password visibility toggled: ${!showPassword}`);
                setShowPassword(!showPassword);
              }}
              className="absolute right-3 top-3 text-gray-600"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          <p>
            Forgot password?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => {
                console.log("[UI] Password reset modal triggered");
                setShowModal(true);
              }}
            >
              Request password reset here
            </span>
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center mt-2 bg-red-100 border border-red-500 p-2 rounded-lg">
            {error}
          </p>
        )}
      </div>
    );
  });

  // Modal Component
  const ResetModal = React.memo(() => {
    console.log("[Render] ResetModal rendering");
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
          <input
            ref={resetEmailRef}
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={handleResetEmailChange}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            required
            autoComplete="email"
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={() => {
                console.log("[UI] Password reset modal cancelled");
                setShowModal(false);
              }}
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

  return (
    <>
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="relative flex min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="w-1/2 flex justify-center items-center bg-gradient-to-bl from-green-100 via-white to-green-100 z-10 relative">
            <div className="w-80 h-[500px] z-20">
              <div className="relative w-full h-full">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-bl from-green-100 via-white to-green-100 p-4">
          <div className="w-full max-w-md z-20">
            <LoginForm />
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
      {showModal && <ResetModal />}
    </>
  );
};

export default Login;