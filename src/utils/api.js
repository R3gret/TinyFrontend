// src/utils/api.js

const handleUnauthorized = () => {
  // Clear user data from local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login page
  // We can't use react-router-dom hooks here, so update the hash for HashRouter
  // This avoids triggering a full server navigation which would cause 404s
  window.location.hash = '#/';
  alert('Your session has expired. Please log in again.');
};

export const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let configBody = body;

  if (isFormData) {
    // For FormData, let the browser set the Content-Type header
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    configBody = JSON.stringify(body);
  }

  const config = {
    method,
    headers,
    ...(body && { body: configBody })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
    if (response.status === 401) {
      handleUnauthorized();
      // Return a promise that will not resolve to prevent further processing
      return new Promise(() => {}); 
    }
  
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Request failed');
      // Attach full error data to the error object for better error handling
      error.responseData = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const apiDownload = async (endpoint) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method: 'GET',
    headers,
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
    if (response.status === 401) {
      handleUnauthorized();
      return new Promise(() => {}); 
    }
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
  
    return response.blob();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
