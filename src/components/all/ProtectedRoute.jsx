import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ProtectedRoute component checks if the user is allowed to access the route
const ProtectedRoute = ({ children, allowedTypes }) => {
  const [warning, setWarning] = useState(null);
  const navigate = useNavigate(); // To navigate back to the previous page
  const user = JSON.parse(localStorage.getItem("user")); // Get the user from localStorage

  useEffect(() => {
    // Show warning if the user is not logged in or doesn't have the correct access type
    if (!user) {
      setWarning("You must be logged in to access this page.");
      setTimeout(() => navigate(-1), 3000); // Go back to the previous page after 3 seconds
    } else if (!allowedTypes.includes(user.type)) {
      setWarning("You do not have permission to access this page.");
      setTimeout(() => navigate(-1), 3000); // Go back to the previous page after 3 seconds
    }
  }, [user, allowedTypes, navigate]);

  // If there's a warning message, show it
  if (warning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white to-green-400 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center text-red-500">
          <h1 className="text-xl font-semibold">{warning}</h1>
        </div>
      </div>
    );
  }

  return children; // If allowed, render the child components (route)
};

export default ProtectedRoute;
