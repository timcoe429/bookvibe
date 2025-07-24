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
                <span className="text-green-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );

  const renderUploadProgress = () => (
    <div className="text-center space-y-4">
      <Loader size={48} className="mx-auto animate-spin text-indigo-600" />
      <h3 className="text-xl font-semibold">
        {uploadState === 'uploading' ? 'Uploading Photo...' : 'Processing Image...'}
      </h3>
      {uploadState === 'uploading' && (
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      <p className="text-gray-600">
        {uploadState === 'uploading' 
          ? `${uploadProgress}% uploaded`
          : 'Detecting books in your photo...'
        }
      </p>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-2">Found {detectedBooks.length} Books!</h3>
        <p className="text-gray-600">Select which books to add to your library:</p>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {detectedBooks.map((book, index) => {
          const identifier = book.id || book.title;
          const isSelected = selectedBooks.has(identifier);
          
          return (
            <div
              key={identifier}
              onClick={() => toggleBookSelection(book.id, book.title)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-indigo-500 border-indigo-500' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircle size={16} className="text-white" />}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{book.title}</h4>
                  <p className="text-gray-600">by {book.author}</p>
                  {book.pages && (
                    <p className="text-sm text-gray-500">{book.pages} pages</p>
                  )}
                </div>
                
                {book.coverUrl && (
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={resetUpload}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
        >
          Try Another Photo
        </button>
        <button
          onClick={confirmSelection}
          disabled={selectedBooks.size === 0}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Add {selectedBooks.size} Book{selectedBooks.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );

  const renderConfirming = () => (
    <div className="text-center space-y-4">
      <Loader size={48} className="mx-auto animate-spin text-indigo-600" />
      <h3 className="text-xl font-semibold">Adding Books to Your Library...</h3>
      <p className="text-gray-600">Please wait while we save your selected books.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-light">Add Books from Photo</h2>
          <p className="opacity-90 mt-1">Snap your bookshelf and we'll detect your books!</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Upload Error</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {uploadState === 'idle' && renderUploadArea()}
          {(uploadState === 'uploading' || uploadState === 'processing') && renderUploadProgress()}
          {uploadState === 'results' && renderResults()}
          {uploadState === 'confirming' && renderConfirming()}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
