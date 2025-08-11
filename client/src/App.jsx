import React, { useState, useEffect } from 'react';
import { Heart, X, BookOpen, Clock, Star, Zap, Moon, Sun, Coffee, Trash2 } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import LoginPage from './components/LoginPage';
import { userAPI } from './services/api';

const BookPickerApp = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'swipe', 'library'
  const [currentBook, setCurrentBook] = useState(0);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [currentlyReading, setCurrentlyReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ inQueue: 0, totalBooks: 0, currentlyReading: 0 });
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');
  
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const moods = [
    { icon: Coffee, label: "Cozy", color: "bg-amber-100 text-amber-800" },
    { icon: Zap, label: "Thrilling", color: "bg-red-100 text-red-800" },
    { icon: Heart, label: "Romantic", color: "bg-pink-100 text-pink-800" },
    { icon: Moon, label: "Dark", color: "bg-purple-100 text-purple-800" },
    { icon: Sun, label: "Uplifting", color: "bg-yellow-100 text-yellow-800" },
    { icon: BookOpen, label: "Literary", color: "bg-blue-100 text-blue-800" }
  ];

  const thinkingMessages = [
    // Fantasy book character references
    "🏰 Consulting with Hermione in the Hogwarts library...",
    "🧙‍♂️ Asking Gandalf for his reading recommendations...",
    "🐉 Crawling through dungeons with Dungeon Crawler Carl...",
    "🚪 Opening magical doors with Cassie from The Book of Doors...",
    "💍 Searching the libraries of Rivendell with Elrond...",
    "⚡ Checking Harry's booklist for Defense Against Dark Arts...",
    "🦅 Flying with Fawkes to find the perfect tale...",
    "🗡️ Raiding Smaug's treasure hoard for hidden stories...",
    "🧝‍♀️ Getting book suggestions from Galadriel's wisdom...",
    "🐲 Following Carl and Princess Donut through the dungeon...",
    "📖 Rifling through Tom Riddle's diary collection...",
    "🚪 Stepping through mysterious doors to new worlds...",
    "🏔️ Climbing Mount Doom to find the ultimate story...",
    "🦉 Asking Hedwig to deliver the perfect book...",
    "🌙 Wandering the Forbidden Forest for magical tales...",
    "🔮 Peering into Palantír for glimpses of great stories...",
    
    // More fantasy references
    "🦁 Consulting with Aslan in the Narnia library...",
    "🐺 Running with Jon Snow through the Wall's archives...",
    "🐉 Asking Daenerys about her favorite dragon tales...",
    "🗺️ Following Bilbo's map to hidden book treasures...",
    "⚔️ Training with Arya Stark in literary assassination...",
    "🌊 Diving with Percy Jackson into oceanic stories...",
    "🏛️ Exploring Camp Half-Blood's secret reading nook...",
    "🔥 Warming up with Tyrion Lannister's book collection...",
    "🦄 Galloping with unicorns to enchanted libraries...",
    "🐾 Following Greywind's scent to buried manuscripts...",
    
    // Magical generic ones
    "🌙 Searching through moonlit libraries...",
    "📚 Whispering to ancient tomes...",
    "✨ Casting a perfect book selection spell...",
    "🔮 Gazing into the crystal ball of stories...",
    "🗝️ Unlocking secret literary chambers...",
    "🌟 Following shooting stars to hidden tales...",
    "🦋 Chasing book fairies through enchanted shelves...",
    "🎭 Consulting the dramatic spirits of great authors...",
    "🌊 Diving deep into oceans of prose...",
    "🍄 Discovering books in magical mushroom circles...",
    "🦉 Getting recommendations from wise old owls...",
    "🎪 Asking the circus of characters for advice...",
    "🌈 Following rainbows to pots of golden stories...",
    "🗿 Deciphering ancient reading runes...",
    "🎨 Painting the perfect literary landscape...",
    "🎭 Interviewing fictional characters about their favorites...",
    "🔥 Warming up by the fireplace of great literature..."
  ];

  // Check for existing login on component mount
  useEffect(() => {
    checkExistingLogin();
  }, []);

  // Load user data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadUserData();
    }
  }, [isLoggedIn]);

  const checkExistingLogin = () => {
    try {
      const token = localStorage.getItem('bookVibeToken');
      const user = localStorage.getItem('bookVibeUser');
      
      if (token && user) {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        setIsLoggedIn(true);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking existing login:', error);
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('bookVibeToken');
    localStorage.removeItem('bookVibeUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserBooks([]);
    setCurrentlyReading(null);
    setUserStats({ inQueue: 0, totalBooks: 0, currentlyReading: 0 });
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [toReadBooks, readingBooks, stats] = await Promise.all([
        userAPI.getBooks({ status: 'to-read' }), // Get only books in TBR pile
        userAPI.getBooks({ status: 'reading' }), // Get currently reading books
        userAPI.getStats()
      ]);
      setUserBooks(toReadBooks);
      setCurrentlyReading(readingBooks.length > 0 ? readingBooks[0] : null);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserBooks([]);
      setCurrentlyReading(null);
      setUserStats({ inQueue: 0, totalBooks: 0, currentlyReading: 0 });
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

  // Handle selecting a book to start reading
  const handleStartReading = async (book) => {
    try {
      await userAPI.updateBookStatus(book.id, 'reading');
      setCurrentlyReading(book);
      // Remove from TBR list
      setUserBooks(prev => prev.filter(b => b.id !== book.id));
      setCurrentView('home'); // Go back to home to show currently reading
    } catch (error) {
      console.error('Error starting book:', error);
    }
  };

  // Handle marking current book as finished - always removes from library
  const handleFinishBook = async () => {
    if (!currentlyReading) return;
    
    try {
      // Remove from library entirely - this is a TBR picker, not a permanent library
      await userAPI.removeBook(currentlyReading.id);
      setCurrentlyReading(null);
      // Refresh data to update stats
      await loadUserData();
    } catch (error) {
      console.error('Error finishing book:', error);
    }
  };

  // Handle moving current book back to TBR
  const handleBackToTBR = async () => {
    if (!currentlyReading) return;
    
    try {
      await userAPI.updateBookStatus(currentlyReading.id, 'to-read');
      // Add back to TBR list
      setUserBooks(prev => [...prev, currentlyReading]);
      setCurrentlyReading(null);
    } catch (error) {
      console.error('Error moving book back to TBR:', error);
    }
  };

  // Handle deleting a book from the library
  const handleDeleteBook = async (bookId) => {
    try {
      await userAPI.removeBook(bookId);
      // Remove from local state immediately for better UX
      setUserBooks(prev => prev.filter(book => book.id !== bookId));
      // Update stats
      setUserStats(prev => ({
        ...prev,
        inQueue: prev.inQueue - 1,
        totalBooks: prev.totalBooks - 1
      }));
    } catch (error) {
      console.error('Error deleting book:', error);
      // Optionally reload data if deletion failed
      loadUserData();
    }
  };

  // Handle skipping a book (remove from current view but keep in TBR)
  const handleSkipBook = () => {
    setCurrentBook((prev) => (prev + 1) % userBooks.length);
  };

  // Handle the magical dice roll with fun thinking animation
  const handleDiceRoll = async () => {
    setIsThinking(true);
    setCurrentView('thinking');
    
    // Pick 3 random messages to show
    const shuffledMessages = [...thinkingMessages].sort(() => Math.random() - 0.5);
    const selectedMessages = shuffledMessages.slice(0, 3);
    
    // Show each message for 2 seconds with smooth transitions
    let messageIndex = 0;
    setThinkingMessage(selectedMessages[0]);
    
    const messageInterval = setInterval(() => {
      messageIndex++;
      if (messageIndex < selectedMessages.length) {
        // Fade out current message
        const messageElement = document.querySelector('.thinking-message');
        if (messageElement) {
          messageElement.style.opacity = '0';
          messageElement.style.transform = 'translateY(10px)';
          
          // Fade in new message after short delay
          setTimeout(() => {
            setThinkingMessage(selectedMessages[messageIndex]);
            setTimeout(() => {
              const newMessageElement = document.querySelector('.thinking-message');
              if (newMessageElement) {
                newMessageElement.style.opacity = '1';
                newMessageElement.style.transform = 'translateY(0)';
              }
            }, 50);
          }, 200);
        }
      }
    }, 2000);

    // Show thinking animation for 6 seconds
    setTimeout(() => {
      clearInterval(messageInterval);
      setIsThinking(false);
      setCurrentView('swipe');
      // Randomize the starting book
      setCurrentBook(Math.floor(Math.random() * userBooks.length));
    }, 6000);
  };

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          TBR Roulette
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

      {/* Currently Reading Section */}
      {currentlyReading && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Clock size={20} className="text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Currently Reading</h3>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl mb-4">
            <h4 className="text-2xl font-bold mb-1 leading-tight">{currentlyReading.title}</h4>
            <p className="text-lg opacity-90">by {currentlyReading.author}</p>
            
            <div className="flex items-center space-x-4 text-sm mt-4">
              {currentlyReading.pages && (
                <div className="flex items-center space-x-1">
                  <BookOpen size={16} />
                  <span>{currentlyReading.pages} pages</span>
                </div>
              )}
              {currentlyReading.mood && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {currentlyReading.mood}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleFinishBook}
              className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:bg-green-600 active:scale-95"
            >
              ✅ Finished Reading
            </button>
            <button
              onClick={handleBackToTBR}
              className="w-full bg-white text-gray-700 p-3 rounded-xl font-medium border-2 border-gray-200 hover:border-purple-300 transition-all"
            >
              ↩️ Back to TBR Pile
            </button>
          </div>
        </div>
      )}

        <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">What matches your mood?</h3>
        <div className="grid grid-cols-3 gap-3">
          {moods.map((mood, idx) => (
            <button
              key={idx}
              onClick={handleDiceRoll}
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
        {!currentlyReading && userBooks.length > 0 && (
          <button 
            onClick={handleDiceRoll}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            🎲 Pick My Next Read!
          </button>
        )}
        
        {currentlyReading && (
          <button 
            onClick={() => setCurrentView('swipe')}
            className="w-full bg-gray-400 text-white p-4 rounded-xl font-semibold text-lg shadow-lg"
            disabled
          >
            📖 Finish current book first
          </button>
        )}
        <button 
          onClick={() => setCurrentView('library')}
          className="w-full bg-white text-gray-700 p-4 rounded-xl font-medium border-2 border-gray-200 hover:border-purple-300 transition-all"
        >
          📚 Browse My Library ({loading ? '...' : userStats.inQueue || 0})
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentlyReading ? "All caught up!" : "No books in your TBR pile!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentlyReading 
                ? "Finish your current book, then add more to your TBR pile" 
                : "Add some books by taking a photo of your bookshelf"
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                📸 Add Books from Photo
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="block mx-auto text-purple-600 hover:text-purple-800"
              >
                ← Back to Home
              </button>
            </div>
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
      if (direction === 'right') {
        // Heart = start reading this book
        handleStartReading(book);
      } else {
        // X = skip to next book
        handleSkipBook();
      }
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
            ❤️ start reading • ✕ skip for now
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Choose your next book to read
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

  const LibraryScreen = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-purple-500 animate-pulse" />
            <p className="text-gray-600">Loading your library...</p>
          </div>
        </div>
      );
    }

    if (userBooks.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div className="pt-8 pb-6">
            <button 
              onClick={() => setCurrentView('home')}
              className="text-gray-600 hover:text-gray-800 mb-4"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 text-center">Your Library</h2>
          </div>
          
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No books in your library!</h3>
              <p className="text-gray-600 mb-6">Add some books by taking a photo of your bookshelf</p>
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                📸 Add Books from Photo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="pt-8 pb-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Your Library</h2>
          <p className="text-center text-gray-600 mt-2">{userBooks.length} books in your TBR pile</p>
        </div>

        <div className="grid gap-4 max-w-2xl mx-auto">
          {userBooks.map((book, index) => (
            <div
              key={book.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative"
            >
              {/* Delete button - always visible for mobile */}
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Remove from library"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  📚
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-semibold text-gray-800 text-lg leading-tight mb-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {book.pages && (
                      <span className="text-gray-500">{book.pages} pages</span>
                    )}
                    {book.mood && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        {book.mood}
                      </span>
                    )}
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      To Read
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            ➕ Add More Books
          </button>
        </div>
      </div>
    );
  };

  const ThinkingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex flex-col justify-center">
      <div className="text-center text-white space-y-6">
        {/* Smaller dice and title at top */}
        <div className="space-y-3">
          <div className="text-5xl animate-bounce">🎲</div>
          <h2 className="text-xl font-medium opacity-80">Finding Your Perfect Book...</h2>
        </div>
        
        {/* BIG MAIN FOCUS: The thinking message */}
        <div className="bg-white bg-opacity-25 rounded-3xl p-10 backdrop-blur-sm mx-auto shadow-2xl border border-white border-opacity-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-lg font-medium opacity-90">Thinking...</span>
          </div>
          
          <p className="thinking-message text-3xl font-bold min-h-[4rem] transition-all duration-300 ease-in-out leading-relaxed">
            {thinkingMessage}
          </p>
        </div>
        
        {/* Smaller animated dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white bg-opacity-60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch(currentView) {
      case 'home':
        return <HomeScreen />;
      case 'thinking':
        return <ThinkingScreen />;
      case 'swipe':
        return <SwipeScreen />;
      case 'library':
        return <LibraryScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {renderCurrentView()}
    </div>
  );
};

export default BookPickerApp;
