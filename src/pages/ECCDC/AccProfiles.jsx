import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "../../components/all/Navbar";
import ECCDCSidebar from "../../components/ECCDC/ECCDCSidebar";
import defaultProfile from "../../assets/default-profile.png";
import { Mail, Phone, MapPin, Globe, Users, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

import { apiRequest } from "../../utils/api";

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

  const handleBack = () => {
    navigate('/eccdc-list');
  };

  const parseSocialMedia = (text) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      if (typeof text !== 'string') return null;
      
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
            onClick={() => navigate('/eccdc-list')}
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
    <div className="flex h-screen bg-gray-100">
      <ECCDCSidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Account Profile</h1>
                <button
                  onClick={() => navigate('/eccdc-list')}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Back to Accounts
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                  <img
                    src={userData.profile_pic || defaultProfile}
                    alt="Profile"
                    className="w-40 h-40 rounded-full border-4 border-gray-300"
                  />
                  <h2 className="text-2xl font-bold mt-4">{userData.other_info?.full_name || userData.username}</h2>
                  <p className="text-gray-600">{typeMapping[userData.type] || userData.type}</p>
                  {userData.other_info?.organization && (
                    <p className="text-gray-500 mt-2 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {userData.other_info.organization}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{userData.other_info?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{userData.other_info?.contact_number || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{userData.other_info?.address || 'Not provided'}</span>
                    </div>
                  </div>
                  {socialMediaLinks && (
                    <>
                      <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Social Media</h3>
                      <div className="flex space-x-4">
                        {socialMediaLinks.map(({ platform, url }, index) => (
                          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                            {platform === 'facebook' && <Facebook />}
                            {platform === 'twitter' && <Twitter />}
                            {platform === 'linkedin' && <Linkedin />}
                            {platform === 'instagram' && <Instagram />}
                            {platform === 'website' && <Globe />}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccProfiles;