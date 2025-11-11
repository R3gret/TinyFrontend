import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/all/Navbar";
import ECCDCSidebar from "../../components/ECCDC/ECCDCSidebar";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink, FaUserEdit } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { apiRequest } from "../../utils/api";

export default function UserProfile() {
  const { id: userId } = useParams();
  const [fadeIn, setFadeIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
  
      if (!userId) {
        throw new Error('No user ID provided');
      }
  
      const data = await apiRequest(`/api/account/${userId}/details`);
      setUserData(data.user);
    } catch (err) {
      console.error('Error fetching user data:', err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    if (err.message.includes('Unauthorized')) {
      navigate('/login');
    } else {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center h-full">
      <ImSpinner8 className="animate-spin text-5xl text-green-600" />
    </div>
  );

  const renderError = () => (
    <div className="text-center text-red-500">
      <p>Error: {error || 'Could not load user data.'}</p>
      <button onClick={fetchUserData} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Retry
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <img
          src={userData.profile_pic || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
        />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{userData.other_info?.full_name || userData.username}</h2>
          <p className="text-gray-500 capitalize">{userData.type}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <InfoItem icon={<FaEnvelope />} label="Email" value={userData.other_info?.email || userData.email} />
        <InfoItem icon={<FaPhone />} label="Phone" value={userData.other_info?.contact_number} />
        <InfoItem icon={<FaMapMarkerAlt />} label="Address" value={userData.other_info?.address} />
        <InfoItem icon={<FaUserEdit />} label="Organization" value={userData.other_info?.organization} />
        <InfoItem icon={<FaLink />} label="Website" value={userData.other_info?.website} isLink={true} />
        <InfoItem icon={<FaLink />} label="Social Media" value={userData.other_info?.social_media} isLink={true} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ECCDCSidebar />
      <div className="ml-64">
        <Navbar />
        <main className={`p-8 pt-24 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="border-b border-gray-200 mb-8">
                <h1 className="text-2xl font-bold">Profile</h1>
            </div>
            
            {loading && !userData ? renderLoading() : null}
            {error && !userData ? renderError() : null}
            
            {userData && renderProfile()}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value, isLink = false }) => (
  <div className="flex items-start space-x-4 text-gray-700">
    <div className="text-green-600 mt-1">{icon}</div>
    <div>
      <p className="font-semibold">{label}</p>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
          {value}
        </a>
      ) : (
        <p className="text-gray-600">{value || "Not provided"}</p>
      )}
    </div>
  </div>
);
