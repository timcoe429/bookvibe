import React, { useState, useEffect } from 'react';
import { Heart, X, BookOpen, Clock, Star, Zap, Moon, Sun, Coffee } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import { userAPI } from './services/api';

const BookPickerApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [currentBook, setCurrentBook] = useState(0);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ inQueue: 0, totalBooks: 0 });

  const moods = [
    { icon: Coffee, label: "Cozy", color: "bg-amber-100 text-amber-800" },
    { icon: Zap, label: "Thrilling", color: "bg-red-100 text-red-800" },
    { icon: Heart, label: "Romantic", color: "bg-pink-100 text-pink-800" },
    { icon: Moon, label: "Dark", color: "bg-purple-100 text-purple-800" },
    { icon: Sun, label: "Uplifting", color: "bg-yellow-100 text-yellow-800" },
    { icon: BookOpen, label: "Literary", color: "bg-blue-100 text-blue-800" }
  ];

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [books, stats] = await Promise.all([
        userAPI.getBooks({ status: 'to-read' }), // Get only books in TBR pile
        userAPI.getStats()
      ]);
      setUserBooks(books);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserBooks([]);
      setUserStats({ inQueue: 0, totalBooks: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleBooksDetected = async (newBooks) => {
    console.log('Books detected:', newBooks);
    try {
      // Add books to user library via the bulk import endpoint
      await userAPI.bulkImport(newBooks);
      // Reload user data to reflect new books
      await loadUserData();
      setShowPhotoUpload(false);
    } catch (error) {
      console.error('Error adding books to library:', error);
    }
  };

  const handlePhotoUploadClose = () => {
    setShowPhotoUpload(false);
  };

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          BookVibe
        </h1>
        <p className="text-gray-600">Pick from your TBR pile ✨</p>
        <div className="flex items-center justify-center mt-4 text-sm">
          <div className="flex items-center space-x-1">
            <BookOpen size={16} className="text-purple-500" />
            <span className="text-gray-700">
              {loading ? 'Loading...' : `${userStats.inQueue} books in your TBR pile`}
            </span>
          </div>
        </div>
      </div>

        <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">What matches your mood?</h3>
        <div className="grid grid-cols-3 gap-3">
          {moods.map((mood, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentView('swipe')}
              className={`${mood.color} p-4 rounded-xl flex flex-col items-center space-y-2 transition-all hover:scale-105 active:scale-95`}
            >
              <mood.icon size={24} />
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">Filter your library by mood</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button 
          onClick={() => setCurrentView('swipe')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          🎲 Pick My Next Read!
        </button>
        <button className="w-full bg-white text-gray-700 p-4 rounded-xl font-medium border-2 border-gray-200 hover:border-purple-300 transition-all">
          📚 Browse My Library ({loading ? '...' : userStats.totalBooks || 0})
        </button>
        <button 
          onClick={() => setShowPhotoUpload(true)}
          className="w-full bg-white text-gray-700 p-4 rounded-xl font-medium border-2 border-gray-200 hover:border-purple-300 transition-all"
        >
          ➕ Add New Books
        </button>
      </div>
    </div>
  );

  const SwipeScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-purple-500 animate-pulse" />
            <p className="text-gray-600">Loading your books...</p>
          </div>
        </div>
      );
    }

    if (userBooks.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No books in your TBR pile!</h3>
            <p className="text-gray-600 mb-6">Add some books by taking a photo of your bookshelf</p>
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              📸 Add Books from Photo
            </button>
          </div>
        </div>
      );
    }

    const book = userBooks[currentBook];
    if (!book) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No book selected</p>
            <button 
              onClick={() => setCurrentView('home')}
              className="mt-4 text-purple-600 hover:text-purple-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      );
    }
    
    const handleSwipe = (direction) => {
      setCurrentBook((prev) => (prev + 1) % userBooks.length);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h2 className="font-semibold text-gray-800">Your Library</h2>
          <div className="w-6"></div>
        </div>

        {/* Book Card */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl h-96 flex flex-col justify-end relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            <div className="relative z-10">
              <div className="mb-4">
                <div className="text-sm font-medium opacity-90 mb-1">📚 From your library</div>
                <h3 className="text-2xl font-bold mb-1 leading-tight">{book.title}</h3>
                <p className="text-lg opacity-90">by {book.author}</p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                {book.pages && (
                  <div className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>{book.pages} pages</span>
                  </div>
                )}
                {book.mood && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {book.mood}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status & Source Info */}
          <div className="flex space-x-2 mt-4">
            <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              To Read
            </span>
            {book.source && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {book.source === 'claude_vision' ? '📸 From Photo' : book.source}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <button 
            onClick={() => handleSwipe('left')}
            className="bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <X size={32} className="text-gray-400" />
          </button>
          
          <button 
            onClick={() => handleSwipe('right')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Heart size={32} className="text-white fill-current" />
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            ❤️ to read next • ✕ to skip for now
          </p>
          <p className="text-gray-500 text-xs mt-1">
            From your personal TBR library
          </p>
        </div>
      </div>
    );
  };

  // Show PhotoUpload as overlay when active
  if (showPhotoUpload) {
    return (
      <PhotoUpload 
        onBooksDetected={handleBooksDetected}
        onClose={handlePhotoUploadClose}
      />
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {currentView === 'home' ? <HomeScreen /> : <SwipeScreen />}
    </div>
  );
};

export default BookPickerApp;
