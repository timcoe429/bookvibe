import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, X, AlertCircle, Loader } from 'lucide-react';
import { photoAPI, isValidImageFile, formatFileSize, handleAPIError } from '../services/api';

const PhotoUpload = ({ onBooksDetected, onClose }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, results, confirming
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedBooks, setDetectedBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [error, setError] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Load upload info on component mount
  React.useEffect(() => {
    const loadUploadInfo = async () => {
      try {
        const info = await photoAPI.getUploadInfo();
        setUploadInfo(info);
      } catch (err) {
        console.error('Failed to load upload info:', err);
      }
    };
    loadUploadInfo();
  }, []);

  const handleFileSelect = async (file) => {
    setError(null);
    
    if (!file) return;
    
    if (!isValidImageFile(file)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF) under 10MB');
      return;
    }

    console.log(`Selected file: ${file.name} (${formatFileSize(file.size)})`);
    
    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // Upload and process the photo
      const result = await photoAPI.uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setUploadState('processing');
        }
      });

      console.log('Photo processing result:', result);

      if (result.success && result.books && result.books.length > 0) {
        setDetectedBooks(result.books);
        setSelectedBooks(new Set(result.books.map(book => book.id || book.title)));
        setUploadState('results');
      } else {
        setError(result.error || 'No books were detected in the image. Try taking a clearer photo with better lighting.');
        setUploadState('idle');
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      setError(handleAPIError(err));
      setUploadState('idle');
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const toggleBookSelection = (bookId, bookTitle) => {
    const identifier = bookId || bookTitle;
    const newSelected = new Set(selectedBooks);
    
    if (newSelected.has(identifier)) {
      newSelected.delete(identifier);
    } else {
      newSelected.add(identifier);
    }
    
    setSelectedBooks(newSelected);
  };

  const confirmSelection = async () => {
    if (selectedBooks.size === 0) {
      setError('Please select at least one book to add to your library');
      return;
    }

    setUploadState('confirming');
    setError(null);

    try {
      const selectedBookIds = Array.from(selectedBooks);
      const result = await photoAPI.confirmBooks(detectedBooks, selectedBookIds);
      
      console.log('Books confirmation result:', result);
      
      if (result.success) {
        // Notify parent component
        if (onBooksDetected) {
          onBooksDetected(result.importedBooks);
        }
        
        // Close the upload modal
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || 'Failed to add books to your library');
        setUploadState('results');
      }
    } catch (err) {
      console.error('Book confirmation failed:', err);
      setError(handleAPIError(err));
      setUploadState('results');
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setDetectedBooks([]);
    setSelectedBooks(new Set());
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const renderUploadArea = () => (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-indigo-300 rounded-3xl p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="mx-auto mb-4 text-indigo-600" />
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Drop your photo here</h3>
        <p className="text-gray-600 mb-4">or click to browse files</p>
        <p className="text-sm text-gray-500">
          Supports JPEG, PNG, WebP, GIF up to 10MB
        </p>
      </div>

      {/* Camera Button */}
      <div className="text-center">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg inline-flex items-center gap-3"
        >
          <Camera size={24} />
          Take Photo
        </button>
      </div>

      {/* Tips */}
      {uploadInfo && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold mb-3 text-gray-800">📸 Photo Tips</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {uploadInfo.recommendations.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•
