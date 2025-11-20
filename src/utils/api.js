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
      // Try to parse error response as JSON, but handle cases where response might be empty
      let errorData;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json') && text) {
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          // If JSON parsing fails, use status text
          errorData = { message: response.statusText || 'Request failed' };
        }
      } else {
        // Try to parse text as JSON even if content-type doesn't say so
        if (text) {
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            errorData = { message: text || response.statusText || 'Request failed' };
          }
        } else {
          errorData = { message: response.statusText || 'Request failed' };
        }
      }
      const error = new Error(errorData.message || 'Request failed');
      // Attach full error data to the error object for better error handling
      error.responseData = errorData;
      throw error;
    }

    // Handle 204 No Content (common for DELETE requests)
    if (response.status === 204) {
      return null;
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      // If JSON parsing fails, return the text as-is
      return text;
    }
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
      // Try to parse as JSON first (for structured error responses)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        // If not JSON, use status text
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
    }
  
    return response.blob();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
