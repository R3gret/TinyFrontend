import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in by getting their info from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // If the user exists and has a 'type' of 'admin', 'worker', or 'user', set userType accordingly
    if (user) {
      setUserType(user.type);
    } else {
      setUserType(null); // User is not logged in
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage or session storage
    localStorage.removeItem("user");

    // Redirect to login page after logging out
    navigate("/");
  };

  // Define the link based on the user type
  const dashboardLink =
    userType === "admin" ? "/admin-dashboard" : userType === "worker" ? "/dashboard" : null;
  const userProfilePic = "/default-profile.png"; // static fallback

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 -ml-5">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <Link to={dashboardLink || "/"} className="text-2xl font-bold text-gray-800">
              TinyTrack
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {userType && (
              <>
                <img src={userProfilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Log Out
                </button>
              </>
            )}
            {!userType && (
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-semibold">
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);