import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/login_bg.png";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

// Set API base URL from Vite environment variables with localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Login = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      console.log("Attempting login to:", `${API_BASE_URL}/api/login`);
      console.log("Login payload:", { 
        username: loginUsername, 
        password: '[redacted]' // Don't log actual password in production
      });
  
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: loginUsername,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log("Login response:", {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
  
      if (response.data.success) {
        // Store authentication data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        console.log("Successful login for user:", {
          id: response.data.user.id,
          username: response.data.user.username,
          type: response.data.user.type
        });
  
        // Navigate based on user type after delay
        setTimeout(() => {
          switch(response.data.user.type) {
            case 'admin':
              console.log("Redirecting to admin dashboard");
              navigate("/admin-dashboard");
              break;
            case 'president':
              console.log("Redirecting to president dashboard");
              navigate("/president-dashboard");
              break;
            case 'worker':
              console.log("Redirecting to worker dashboard");
              navigate("/dashboard");
              break;
            case 'parent':
              console.log("Redirecting to worker dashboard");
              navigate("/dashboard");
              break;
            case 'eccdc':
                console.log("Redirecting to worker dashboard");
                navigate("/eccdc-manageacc");
                break;
            default:
              console.warn("Unknown user type, redirecting to home");
              navigate("/");
          }
        }, 2000);
      } else {
        console.warn("Login failed with server response:", response.data);
        setError(response.data.message || "Invalid username or password.");
      }
    } catch (err) {
      const errorDetails = {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      };
      
      console.error("Full login error:", errorDetails);
      
      // User-friendly error messages
      const errorMessage = 
        err.response?.data?.message ||
        (err.response?.status === 500 ? "Server error. Please try again later." :
        err.response?.status === 401 ? "Invalid credentials" :
        err.code === 'ERR_NETWORK' ? "Network error. Check your connection." :
        "Login failed. Please try again.");
  
      setError(errorMessage);
      
      // Optional: Track failed login attempts
      if (err.response?.status === 401) {
        console.warn(`Failed login attempt for username: ${loginUsername}`);
      }
    }
  };

  const handlePasswordReset = async () => {
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
  };

  return (
    <div className="relative flex min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="w-1/2 flex justify-center items-center bg-gradient-to-bl from-green-100 via-white to-green-100 z-10 relative">
        <div className={`w-80 h-[500px] z-20 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative w-full h-full">
            <div className="absolute w-full h-[440px] bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl transform transition-transform duration-700 ease-in-out scale-95 hover:scale-100">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="Logo" className="w-28 h-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-center mb-4 text-green-700">Login</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4 text-gray-800"
                  required
                />
                <div className="relative mb-6">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-gray-800"
                    required
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
                  className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
                >
                  Login
                </button>
              </form>

              <div className="text-center mt-4 text-sm text-gray-600">
                <p>
                  Forgot password?{" "}
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => setShowModal(true)}
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
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-600 border border-green-300 p-3 rounded-lg shadow-md z-30">
          {successMessage}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-80 relative">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Logo" className="w-24 h-auto" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              required
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;