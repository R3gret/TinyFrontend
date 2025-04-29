import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Admin/AdminSidebar";
import bgImage from "../../assets/bg1.jpg";
import defaultProfile from "../../assets/default-profile.png";
import { Mail, Phone, MapPin, Edit, Globe, Users, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

const typeMapping = {
  admin: 'Administrator',
  worker: 'CD Worker',
  parent: 'Parent',
  president: 'President'
};

const AccProfiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiRequest(`/api/account/${id}/details`);
        console.log("Fetched user data:", data.user);
        setUserData(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id]);

  const parseSocialMedia = (text) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text.split(',').map(item => {
        const trimmed = item.trim();
        if (trimmed.includes(':')) {
          const [platform, url] = trimmed.split(':').map(s => s.trim());
          return { platform, url };
        }
        return { platform: 'link', url: trimmed };
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-8 text-red-500">
          <div className="text-xl font-semibold mb-2">Error loading profile</div>
          <div className="mb-4">{error}</div>
          <button 
            onClick={() => navigate('/account-list')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center py-8 text-red-500">
          User not found
        </div>
      </div>
    );
  }

  const socialMediaLinks = parseSocialMedia(userData.other_info?.social_media);

  return (
    <div className="w-screen min-h-screen flex bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="z-10"> {/* Wrap Navbar in a z-index container */}
    <Sidebar />
  </div>
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/60 backdrop-blur">
      <div className="z-20"> {/* Wrap Navbar in a z-index container */}
    <Navbar />
  </div>
        

        <button 
          onClick={() => navigate('/account-list')}
          className="absolute bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition z-10"
        >
          Back to Accounts
        </button>

        <div className="flex flex-col lg:flex-row gap-10 p-10 h-full">
          {/* Left: Profile Info */}
          <div className="flex flex-col items-center bg-white shadow-xl rounded-2xl p-8 w-full lg:w-1/3">
            <img
              src={userData.profile_pic || defaultProfile}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-green-500 shadow-md hover:scale-105 transition"
            />
            <h2 className="text-2xl font-bold text-green-800 mt-6 text-center">
              {userData.other_info?.full_name || userData.username}
            </h2>
            <p className="text-green-600 mt-2">
              {typeMapping[userData.type] || userData.type}
            </p>
            {userData.other_info?.organization && (
              <div className="mt-4 flex items-center text-gray-700">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <span>{userData.other_info.organization}</span>
              </div>
            )}
          </div>

          {/* Right: Contact + Social */}
          <div className="flex flex-col gap-6 w-full lg:w-2/3">
            {/* Contact Info */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-600 mr-2" />
                  <span>{userData.other_info?.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-green-600 mr-2" />
                  <span>{userData.other_info?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center col-span-2">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span>{userData.other_info?.address || 'Not provided'}</span>
                </div>
                {userData.other_info?.website && (
                  <div className="flex items-center col-span-2">
                    <Globe className="h-5 w-5 text-green-600 mr-2" />
                    <a 
                      href={userData.other_info.website.startsWith('http') ? 
                        userData.other_info.website : 
                        `https://${userData.other_info.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {userData.other_info.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Social Media</h3>
              {socialMediaLinks ? (
                <div className="flex flex-wrap gap-3">
                  {socialMediaLinks.map((social, index) => {
                    const url = social.url.startsWith('http') ? social.url : `https://${social.url}`;
                    let icon, color;

                    switch (true) {
                      case social.platform.toLowerCase().includes('face'):
                        icon = <Facebook className="h-5 w-5" />;
                        color = 'text-blue-600';
                        break;
                      case social.platform.toLowerCase().includes('twit'):
                        icon = <Twitter className="h-5 w-5" />;
                        color = 'text-blue-400';
                        break;
                      case social.platform.toLowerCase().includes('insta'):
                        icon = <Instagram className="h-5 w-5" />;
                        color = 'text-pink-600';
                        break;
                      case social.platform.toLowerCase().includes('link'):
                        icon = <Linkedin className="h-5 w-5" />;
                        color = 'text-blue-700';
                        break;
                      default:
                        icon = <Globe className="h-5 w-5" />;
                        color = 'text-gray-700';
                    }

                    return (
                      <a 
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition ${color}`}
                      >
                        {icon}
                        <span className="ml-2 capitalize">
                          {social.platform.replace(/(facebook|twitter|instagram|linkedin)/gi, match => match.charAt(0).toUpperCase() + match.slice(1))}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No social media links provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccProfiles;         