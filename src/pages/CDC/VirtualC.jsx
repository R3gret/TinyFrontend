import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import axios from "axios";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Stream");

  const tabs = ["Stream", "Classworks", "Students"];

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}></div>
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-10">
          <div className="flex space-x-4 border-b-2 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg ${
                  activeTab === tab ? "bg-green-800 text-white" : "bg-gray-300 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
            {activeTab === "Stream" && <StreamSection />}
            {activeTab === "Classworks" && <ClassworksSection />}
            {activeTab === "Students" && <StudentsSection />}
            {activeTab === "Grades" && <GradesSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    ageFilter: 'all',
    attachment: null,
    attachmentName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);
  

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
  
      const formData = new FormData();
      formData.append('title', newAnnouncement.title);
      formData.append('message', newAnnouncement.message);
      formData.append('ageFilter', newAnnouncement.ageFilter);
      if (newAnnouncement.attachment) {
        formData.append('attachment', newAnnouncement.attachment);
      }
      
      const response = await axios.post('http://localhost:3001/api/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check for successful response
      if (response.data && response.data.success) {
        setAnnouncements([response.data.announcement, ...announcements]);
        setIsCreatingAnnouncement(false);
        setNewAnnouncement({
          title: '',
          message: '',
          ageFilter: 'all',
          attachment: null,
          attachmentName: ''
        });
        setError(null); // Clear any previous errors
      } else {
        throw new Error(response.data?.message || 'Failed to create announcement');
      }

    } catch (err) {
      console.error('Error creating announcement:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login
      } else {
        setError(err.response?.data?.message || 'Failed to create announcement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAnnouncement({
        ...newAnnouncement,
        attachment: file,
        attachmentName: file.name
      });
    }
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAnnouncements = ageFilter === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.ageFilter === ageFilter || ann.ageFilter === 'all');

  return (
    <div className="text-gray-800">
      {/* Header with Create Button and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Filter:</label>
            <select
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
            >
              <option value="all">All Ages</option>
              <option value="3-4">3.0 - 4.0 years</option>
              <option value="4-5">4.1 - 5.0 years</option>
              <option value="5-6">5.1 - 5.11 years</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsCreatingAnnouncement(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Announcement
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !isCreatingAnnouncement && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAnnouncements.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new announcement.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsCreatingAnnouncement(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Announcement
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {!loading && filteredAnnouncements.length > 0 && (
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-700 text-white px-6 py-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <span className="bg-green-800 text-xs px-2 py-1 rounded-full">
                    {announcement.ageFilter === 'all' ? 'All Ages' : `${announcement.ageFilter} years`}
                  </span>
                </div>
                <div className="text-sm text-green-100">
                  Posted by {announcement.author} on {new Date(announcement.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-6">
                <p className="whitespace-pre-line">{announcement.message}</p>
                
                {announcement.attachmentUrl && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{announcement.attachmentName}</span>
                      <button 
                        onClick={() => handleDownload(announcement.attachmentUrl, announcement.attachmentName)}
                        className="ml-auto text-green-700 hover:text-green-900 flex items-center text-sm"
                      >
                        Download
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreatingAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Announcement</h3>
              <button
                onClick={() => setIsCreatingAnnouncement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message*</label>
                  <textarea
                    rows={5}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Age Group*</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newAnnouncement.ageFilter}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, ageFilter: e.target.value})}
                    required
                  >
                    <option value="all">All Ages</option>
                    <option value="3-4">3.0 - 4.0 years</option>
                    <option value="4-5">4.1 - 5.0 years</option>
                    <option value="5-6">5.1 - 5.11 years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                      {newAnnouncement.attachmentName && (
                        <p className="text-xs text-green-700 mt-2">
                          Selected: {newAnnouncement.attachmentName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingAnnouncement(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-green-300"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassworksSection() {
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    category_id: '',
    age_group_id: '',
    file_name: '',
    file_type: '',
    file_data: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCounts, setFileCounts] = useState({}); // New state for file counts

  // Fetch categories and age groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:3001/api/files/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
        
        // Fetch age groups
        const ageGroupsResponse = await fetch('http://localhost:3001/api/files/age-groups');
        if (!ageGroupsResponse.ok) throw new Error('Failed to fetch age groups');
        const ageGroupsData = await ageGroupsResponse.json();
        setAgeGroups(ageGroupsData.ageGroups || []);
        
        // If age group is already selected, fetch file counts
        if (selectedAgeGroup) {
          const countsResponse = await fetch(
            `http://localhost:3001/api/files/counts?age_group_id=${selectedAgeGroup}`
          );
          if (countsResponse.ok) {
            const countsData = await countsResponse.json();
            setFileCounts(countsData.counts || {});
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedAgeGroup]); // Add selectedAgeGroup as dependency

  // Add this useEffect to fetch file counts when age group changes
  useEffect(() => {
    if (selectedAgeGroup && !selectedCategory) {
      const fetchFileCounts = async () => {
        try {
          const response = await fetch(
            `http://localhost:3001/api/files/counts?age_group_id=${selectedAgeGroup}`
          );
          if (response.ok) {
            const data = await response.json();
            setFileCounts(data.counts || {});
          }
        } catch (err) {
          console.error('Error fetching file counts:', err);
        }
      };
      
      fetchFileCounts();
    }
  }, [selectedAgeGroup, selectedCategory]);

  // Fetch files when a category and age group are selected
  useEffect(() => {
    if (selectedCategory && selectedAgeGroup) {
      const fetchFiles = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:3001/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
          );
          if (!response.ok) throw new Error('Failed to fetch files');
          const data = await response.json();
          setFiles(data.files || []);
        } catch (err) {
          console.error('Error fetching files:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFiles();
    }
  }, [selectedCategory, selectedAgeGroup]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', newFile.category_id);
      formData.append('age_group_id', newFile.age_group_id);
      formData.append('file_name', newFile.file_name);
      formData.append('file_data', newFile.file_data);
      
      const response = await fetch('http://localhost:3001/api/files', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      // Refresh files list
      if (selectedCategory && selectedAgeGroup) {
        const filesResponse = await fetch(
          `http://localhost:3001/api/files?category_id=${selectedCategory}&age_group_id=${selectedAgeGroup}`
        );
        const filesData = await filesResponse.json();
        setFiles(filesData.files || []);
      }
      
      // Refresh file counts
      if (selectedAgeGroup) {
        const countsResponse = await fetch(
          `http://localhost:3001/api/files/counts?age_group_id=${selectedAgeGroup}`
        );
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          setFileCounts(countsData.counts || {});
        }
      }
      
      setIsModalOpen(false);
      setNewFile({
        category_id: '',
        age_group_id: '',
        file_name: '',
        file_type: '',
        file_data: null
      });
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile({
        ...newFile,
        file_name: file.name,
        file_type: file.type,
        file_data: file
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/files/download/${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err.message);
    }
  };

  const handleBackClick = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedAgeGroup) {
      setSelectedAgeGroup(null);
    }
  };

  const showBackButton = selectedAgeGroup || selectedCategory;
  const backButtonLabel = selectedCategory ? "Back to Categories" : "Back to Age Groups";

  if (loading && !selectedCategory) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="text-gray-800">
      {/* Main Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {(selectedAgeGroup || selectedCategory) && (
            <button
              onClick={handleBackClick}
              className="flex items-center text-green-700 hover:text-green-900 mr-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {selectedCategory ? "Back to Categories" : "Back to Age Groups"}
            </button>
          )}
          <h2 className="text-2xl font-bold">Developmental Domains</h2>
        </div>

        {/* Age Group Selector - only show when not in a specific category */}
        {!selectedCategory && (
          <div className="flex items-center space-x-4">
            <label className="font-medium">Select Age Group:</label>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              value={selectedAgeGroup || ''}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
            >
              <option value="">Select Age</option>
              {ageGroups.map((ageGroup) => (
                <option key={ageGroup.age_group_id} value={ageGroup.age_group_id}>
                  {ageGroup.age_range}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedAgeGroup ? (
        <div className="text-center py-10 text-gray-500">
          Please select an age group to view categories
        </div>
      ) : selectedCategory ? (
        <div>
          {/* Category Header with Upload Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                {categories.find(c => c.category_id == selectedCategory)?.category_name} - 
                {ageGroups.find(a => a.age_group_id == selectedAgeGroup)?.age_range}
              </h3>
            </div>
            <button
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload File
            </button>
          </div>

          {/* Files Grid with Empty State */}
          {files.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No files uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a new file.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.file_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{file.file_name}</h4>
                      <p className="text-sm text-gray-500">{file.file_type}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(file.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(file.file_id, file.file_name)}
                      className="text-green-700 hover:text-green-900"
                      title="Download"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="border rounded-lg p-6 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all flex flex-col items-center justify-center text-center"
              onClick={() => setSelectedCategory(category.category_id)}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">{category.category_name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {fileCounts[category.category_id] || 0} files
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upload New File</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFileUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newFile.category_id}
                    onChange={(e) => setNewFile({...newFile, category_id: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newFile.age_group_id}
                    onChange={(e) => setNewFile({...newFile, age_group_id: e.target.value})}
                    required
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((ageGroup) => (
                      <option key={ageGroup.age_group_id} value={ageGroup.age_group_id}>
                        {ageGroup.age_range}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    value={newFile.file_name}
                    onChange={(e) => setNewFile({...newFile, file_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-green-300"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentsSection() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `http://localhost:3001/api/students?ageFilter=${ageFilter !== 'all' ? ageFilter : ''}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch students');
        }
        
        setStudents(data.students);
        setFilteredStudents(data.students);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [ageFilter]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  return (
    <div className="text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Student List</h2>
        <div className="w-full md:w-1/2">
          <label htmlFor="search" className="sr-only">Search students</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search students by name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <label className="font-medium">Filter by Age:</label>
          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="all">All Ages</option>
            <option value="3-4">3.0 - 4.0 years</option>
            <option value="4-5">4.1 - 5.0 years</option>
            <option value="5-6">5.1 - 5.11 years</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {searchQuery ? 'No students match your search' : 'No students found'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="relative">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-green-700 text-white sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Age</th>
                  <th className="py-3 px-4 text-left">Gender</th>
                  <th className="py-3 px-4 text-left">Birthdate</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              <table className="min-w-full bg-white">
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{student.student_id}</td>
                      <td className="py-3 px-4">
                        {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                      </td>
                      <td className="py-3 px-4">{student.age}</td>
                      <td className="py-3 px-4">{student.gender}</td>
                      <td className="py-3 px-4">{new Date(student.birthdate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
