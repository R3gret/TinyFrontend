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
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: loginUsername,
        password: loginPassword
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        console.log("Logged in user type:", response.data.user.type);

        setTimeout(() => {
          switch(response.data.user.type) {
            case 'admin':
              navigate("/admin-dashboard");
              break;
            case 'president':
              navigate("/president-dashboard");
              break;
            case 'worker':
              navigate("/dashboard");
              break;
            default:
              navigate("/");
          }
        }, 2000);
      } else {
        setError(response.data.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
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