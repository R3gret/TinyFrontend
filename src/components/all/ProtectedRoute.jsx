import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // If you're using context

const ProtectedRoute = ({ allowedTypes, children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (!user) {
          navigate("/", { 
            state: { 
              from: location.pathname,
              message: "Please login to access this page"
            },
            replace: true
          });
          return;
        }

        if (!allowedTypes.includes(user.type)) {
          navigate("/unauthorized", { replace: true });
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/error", { state: { error: "Authentication failed" }, replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedTypes, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Navigation is already handled in the effect
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;