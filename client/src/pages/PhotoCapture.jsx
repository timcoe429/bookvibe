import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, X, AlertCircle, Loader, ArrowLeft, BookOpen, Sparkles, Image, Zap, Eye } from 'lucide-react';
import { photoAPI, isValidImageFile, formatFileSize, handleAPIError } from '../services/api';

const PhotoCapture = ({ onNavigate, onBooksDetected }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: intro, 2: upload, 3: processing, 4: results
  const [uploadState, setUploadState] = useState('idle');
  const [detectedBooks, setDetectedBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processingStep, setProcessingStep] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processingSteps = [
    { icon: Eye, text: "Analyzing your image..." },
    { icon: BookOpen, text: "Detecting book spines..." },
    { icon: Sparkles, text: "Extracting titles..." },
    { icon: CheckCircle, text: "Matching books..." }
  ];

  // Simulate processing animation
  useEffect(() => {
    if (currentStep === 3) {
      const interval = setInterval(() => {
        setProcessingStep(prev => (prev + 1) % processingSteps.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleFileSelect = async (file) => {
    if (!file || !isValidImageFile(file)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF) under 10MB');
      return;
    }

    setError(null);
    setUploadedImage(URL.createObjectURL(file));
    setCurrentStep(3);
    setUploadState('processing');

    try {
      const result = await photoAPI.uploadPhoto(file);
      
      if (result.detectedBooks && result.detectedBooks.length > 0) {
        setDetectedBooks(result.detectedBooks);
        setSelectedBooks(new Set(result.detectedBooks.map(book => book.id)));
        setCurrentStep(4);
        setUploadState('results');
      } else {
        setError('No books detected in the image. Try taking a clearer photo with better lighting.');
        setCurrentStep(2);
        setUploadState('idle');
      }
    } catch (err) {
      setError(handleAPIError(err));
      setCurrentStep(2);
      setUploadState('idle');
    }
  };

  const handleConfirmBooks = async () => {
    if (selectedBooks.size === 0) {
      setError('Please select at least one book to add to your library');
      return;
    }

    setUploadState('confirming');
    try {
      const selectedBookIds = Array.from(selectedBooks);
      const result = await photoAPI.confirmBooks(detectedBooks, selectedBookIds);
      
      if (onBooksDetected) {
        onBooksDetected(result.importedBooks || detectedBooks.filter(book => selectedBooks.has(book.id)));
      }
      
      // Success! Navigate back with success message
      onNavigate('home');
    } catch (err) {
      setError(handleAPIError(err));
      setUploadState('results');
    }
  };

  const toggleBookSelection = (bookId) => {
    setSelectedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const resetToStart = () => {
    setCurrentStep(1);
    setUploadState('idle');
    setDetectedBooks([]);
    setSelectedBooks(new Set());
    setError(null);
    setUploadedImage(null);
    setProcessingStep(0);
  };

  // Step 1: Welcome & Instructions
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h1 className="text-xl font-bold text-purple-800">Add Books</h1>
          <div className="w-10"></div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-700" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Snap Your Bookshelf!
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Take a photo of your bookshelf and our AI will automatically detect and add books to your library
          </p>

          {/* Tips */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-md">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              Pro Tips for Best Results
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Good lighting helps text recognition</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Keep book spines straight and readable</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Take photo directly in front of books</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
          >
            <Camera className="w-6 h-6 mr-2" />
            Start Capturing
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Upload Interface
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <button 
            onClick={() => setCurrentStep(1)}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h1 className="text-xl font-bold text-purple-800">Take Photo</h1>
          <div className="w-10"></div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Drag & Drop Area */}
            <div
              className="border-3 border-dashed border-purple-300 rounded-3xl p-12 text-center bg-white/60 backdrop-blur-sm hover:border-purple-400 hover:bg-white/80 transition-all duration-300 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                if (files[0]) handleFileSelect(files[0]);
              }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Drop your photo here
                </h3>
                <p className="text-gray-600 text-sm">
                  or click to browse files
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center"
              >
                <Camera className="w-6 h-6 mr-3" />
                Take Photo
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center border-2 border-purple-200"
              >
                <Image className="w-6 h-6 mr-3" />
                Choose from Gallery
              </button>
            </div>

            {/* File Support Info */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Supports JPEG, PNG, WebP, GIF up to 10MB
            </p>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>
    );
  }

  // Step 3: Processing
  if (currentStep === 3) {
    const currentProcessingStep = processingSteps[processingStep];
    const Icon = currentProcessingStep.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <div className="w-10"></div>
          <h1 className="text-xl font-bold text-purple-800">Processing</h1>
          <div className="w-10"></div>
        </div>

        {/* Processing Animation */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {/* Image Preview */}
          {uploadedImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg max-w-xs">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Processing Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg animate-pulse">
              <Icon className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentProcessingStep.text}
            </h2>
            <p className="text-gray-600">
              Our AI is working its magic...
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            {processingSteps.map((step, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === processingStep 
                    ? 'bg-purple-500 scale-110' 
                    : index < processingStep 
                      ? 'bg-purple-300' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Results & Selection
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
          <button 
            onClick={resetToStart}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h1 className="text-xl font-bold text-purple-800">
            Found {detectedBooks.length} Books
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-b border-green-100 p-4">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              Great! We detected books in your photo
            </span>
          </div>
        </div>

        {/* Book Selection */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-center text-gray-600 mb-6">
            Select the books you want to add to your library:
          </p>

          <div className="space-y-3 max-w-md mx-auto">
            {detectedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => toggleBookSelection(book.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedBooks.has(book.id)
                    ? 'border-purple-400 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedBooks.has(book.id)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedBooks.has(book.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{book.title}</h3>
                    {book.author && (
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={handleConfirmBooks}
              disabled={selectedBooks.size === 0 || uploadState === 'confirming'}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
            >
              {uploadState === 'confirming' ? (
                <>
                  <Loader className="w-6 h-6 mr-3 animate-spin" />
                  Adding to Library...
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6 mr-3" />
                  Add {selectedBooks.size} Book{selectedBooks.size !== 1 ? 's' : ''} to Library
                </>
              )}
            </button>
            
            <button
              onClick={resetToStart}
              className="w-full bg-white text-purple-600 py-3 rounded-2xl font-semibold border-2 border-purple-200 hover:bg-purple-50 transition-colors"
            >
              Take Another Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PhotoCapture;
