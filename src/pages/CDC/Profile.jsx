import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink } from "react-icons/fa";

export default function Profile() {
  const [fadeIn, setFadeIn] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 200);
  }, []);

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />

        <div className="flex justify-center items-start min-h-screen mt-8">
          <div
            className={`bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl min-h-[450px] transform transition-all duration-500 ${
              fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-4">
                {["profile", "edit", "password"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-lg font-semibold ${
                      activeTab === tab
                        ? "border-b-4 border-green-700 text-green-700"
                        : "text-gray-600"
                    } transition-all`}
                  >
                    {tab === "profile" && "Profile"}
                    {tab === "edit" && "Edit Profile"}
                    {tab === "password" && "Change Password"}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area with Fixed Height */}
            <div className="min-h-[300px]">
              {activeTab === "profile" && (
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  {/* Left Side: Profile Image and Name */}
                  <div className="flex flex-col items-center md:items-start w-full md:w-1/3 p-4">
                    <img
                      src="https://via.placeholder.com/150"
                      alt="Profile"
                      className="w-36 h-36 rounded-full shadow-md border-4 border-green-700"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                      Maria Dela Cruz
                    </h2>
                    <p className="text-green-700 font-medium">
                      Child Development Worker
                    </p>
                  </div>

                  {/* Right Side: Contact Details */}
                  <div className="w-full md:w-2/3 p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <FaMapMarkerAlt className="text-green-600 mr-2" />
                        <span>123 Barangay St., Manila, Philippines</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaPhone className="text-green-600 mr-2" />
                        <span>+63 912 345 6789</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaEnvelope className="text-green-600 mr-2" />
                        <span>maria.delacruz@email.com</span>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <h3 className="text-lg font-semibold text-gray-800 mt-6">
                      Quick Links
                    </h3>
                    <div className="mt-3 space-y-2">
                      <a
                        href="#"
                        className="flex items-center text-green-600 hover:text-green-800 transition-all"
                      >
                        <FaLink className="mr-2" />
                        Child Development Resources
                      </a>
                      <a
                        href="#"
                        className="flex items-center text-green-600 hover:text-green-800 transition-all"
                      >
                        <FaLink className="mr-2" />
                        Training & Workshops
                      </a>
                      <a
                        href="#"
                        className="flex items-center text-green-600 hover:text-green-800 transition-all"
                      >
                        <FaLink className="mr-2" />
                        Community Support Groups
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Profile */}
              {activeTab === "edit" && (
  <div className="p-4">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h3>
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Full Name */}
      <div>
        <label className="block text-gray-700 font-medium">Full Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="Maria Dela Cruz"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-700 font-medium">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded-md"
          defaultValue="maria.delacruz@email.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-gray-700 font-medium">Phone</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="+63 912 345 6789"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-gray-700 font-medium">Address</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="123 Barangay St., Manila, Philippines"
        />
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-gray-700 font-medium">Job Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="Child Development Worker"
        />
      </div>

      {/* Organization */}
      <div>
        <label className="block text-gray-700 font-medium">Organization</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="Community Outreach Program"
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-gray-700 font-medium">Website</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="www.childdevelopment.org"
        />
      </div>

      {/* Social Media Link */}
      <div>
        <label className="block text-gray-700 font-medium">Social Media</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          defaultValue="facebook.com/maria.dela.cruz"
        />
      </div>

      {/* Submit Button (Full Width) */}
      <div className="col-span-1 md:col-span-2 flex justify-end">
        <button className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-all">
          Save Changes
        </button>
      </div>
    </form>
  </div>
)}


              {/* Change Password */}
              {activeTab === "password" && (
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Change Password
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <button className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-all">
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
