import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 second timeout for photo uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include session ID
api.interceptors.request.use((config) => {
  const sessionId = getSessionId();
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Session management
export const getSessionId = () => {
  let sessionId = localStorage.getItem('bookViveSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bookViveSessionId', sessionId);
  }
  return sessionId;
};

// Book API endpoints
export const bookAPI = {
  // Get book recommendations based on mood
  getRecommendations: async (mood = 'escapist', limit = 1) => {
    const response = await api.get('/books/recommendations', {
      params: { sessionId: getSessionId(), mood, limit }
    });
    return response.data;
  },

  // Search books by title or author
  searchBooks: async (query, limit = 10) => {
    const response = await api.get('/books/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Get book details by ID
  getBook: async (bookId) => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },



  // Add a single book
  addBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  }
};

// User API endpoints
export const userAPI = {
  // Get or create user by session ID
  getUser: async () => {
    const response = await api.get(`/users/session/${getSessionId()}`);
    return response.data;
  },

  // Get user's reading statistics
  getStats: async () => {
    const response = await api.get(`/users/${getSessionId()}/stats`);
    return response.data;
  },

  // Get user's books with optional filters
  getBooks: async (filters = {}) => {
    const response = await api.get(`/users/${getSessionId()}/books`, {
      params: filters
    });
    return response.data;
  },

  // Bulk import books (used by photo upload) - moved here for better organization
  bulkImport: async (books) => {
    const response = await api.post('/books/bulk-import', {
      books,
      sessionId: getSessionId()
    });
    return response.data;
  },

  // Add book to user's library
  addBook: async (bookId, status = 'to-read', source = 'manual') => {
    const response = await api.post(`/users/${getSessionId()}/books`, {
      bookId,
      status,
      source
    });
    return response.data;
  },

  // Update book status in user's library
  updateBookStatus: async (bookId, status, rating = null) => {
    const response = await api.put(`/users/${getSessionId()}/books/${bookId}`, {
      status,
      rating
    });
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put(`/users/${getSessionId()}/preferences`, preferences);
    return response.data;
  },

  // Connect Goodreads account
  connectGoodreads: async (goodreadsUserId, accessToken) => {
    const response = await api.post(`/users/${getSessionId()}/connect-goodreads`, {
      goodreadsUserId,
      goodreadsAccessToken: accessToken
    });
    return response.data;
  },

  // Remove book from user's library
  removeBook: async (bookId) => {
    const response = await api.delete(`/users/${getSessionId()}/books/${bookId}`);
    return response.data;
  }
};

// Photo API endpoints
export const photoAPI = {
  // Upload photo for book detection
  uploadPhoto: async (photoFile, onProgress = null) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('sessionId', getSessionId());

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for photo processing
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await api.post('/photos/upload', formData, config);
    return response.data;
  },

  // Confirm and import selected books from photo detection
  confirmBooks: async (allBooks, selectedBookIds) => {
    const response = await api.post('/photos/confirm-books', {
      books: allBooks,
      selectedBooks: selectedBookIds,
      sessionId: getSessionId()
    });
    return response.data;
  },



  // Get upload information and guidelines
  getUploadInfo: async () => {
    const response = await api.get('/photos/upload-info');
    return response.data;
  },

  // Test vision API (development only)
  testVision: async (photoFile) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Test endpoint not available in production');
    }

    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await api.post('/photos/test-vision', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API health check failed');
  }
};

// Error handling utilities
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Bad request - please check your input';
      case 404:
        return data.error || 'Resource not found';
      case 429:
        return 'Too many requests - please try again later';
      case 500:
        return data.error || 'Server error - please try again';
      default:
        return data.error || `HTTP ${status} error occurred`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error - please check your connection';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

// Utility functions
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default api;
