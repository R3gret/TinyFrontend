import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    setIsLoggingOut(true);
    // Simulate a delay for the user to see the logout indicator
    setTimeout(() => {
      // Clear all user data from localStorage to ensure a clean session
      localStorage.clear();

      // Redirect to login page with a full page reload
      window.location.href = "/";
    }, 1500);
  };

  // Define the link based on the user type
  const dashboardLink =
    userType === "admin"
      ? "/admin-dashboard"
      : userType === "worker"
      ? "/dashboard"
      : null;

  const profileLink =
    userType === "admin"
      ? "/admin-profile"
      : userType === "worker"
      ? "/profile"
      : userType === "president"
      ? "/president-profile"
      : userType === "parent"
      ? "/parent-profile"
      : userType === "eccdc"
      ? "/eccdc-profile"
      : "/";

  const userProfilePic = "/default-profile.png"; // static fallback

  return (
    <>
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
                  <Link to={profileLink}>
                    <img src={userProfilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover cursor-pointer" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Log Out"}
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

      {isLoggingOut && (
        <div className="fixed inset-0 flex justify-center items-center z-[100]" style={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}>
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-24 h-auto mb-4" />
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-green-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging out...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Navbar);