import React, { useState, useEffect } from 'react';
import { Camera, Book, Shuffle, Heart, BookOpen, Settings } from 'lucide-react';
import { bookAPI, userAPI, getSessionId } from './services/api';
import PhotoUpload from './components/PhotoUpload';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedMood, setSelectedMood] = useState('escapist');
  const [currentBook, setCurrentBook] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [readingStats, setReadingStats] = useState({
    booksThisYear: 0,
    inQueue: 0,
    readingStreak: 0,
    totalBooks: 0
  });
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const moods = [
    { id: 'escapist', label: '✨ Escapist', emoji: '✨' },
    { id: 'intense', label: '🔥 Intense', emoji: '🔥' },
    { id: 'thoughtful', label: '💭 Thoughtful', emoji: '💭' },
    { id: 'light', label: '😊 Light & Fun', emoji: '😊' }
  ];

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Get or create user
        const userData = await userAPI.getUser();
        setUser(userData);
        
        // Load user stats
        const stats = await userAPI.getStats();
        setReadingStats(stats);
        
        // Load user's books
        const books = await userAPI.getBooks({ status: 'to-read' });
        setUserBooks(books);
        
        // If no books, load sample data
        if (books.length === 0) {
          await loadSampleBooks();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load your library. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load sample books for demo
  const loadSampleBooks = async () => {
    const sampleBooks = [
      { 
        title: "The Seven Husbands of Evelyn Hugo", 
        author: "Taylor Jenkins Reid",
        mood: "escapist",
        pages: 400
      },
      { 
        title: "Circe", 
        author: "Madeline Miller",
        mood: "thoughtful",
        pages: 393
      },
      { 
        title: "The Invisible Life of Addie LaRue", 
        author: "V.E. Schwab",
        mood: "escapist",
        pages: 560
      },
      { 
        title: "Mexican Gothic", 
        author: "Silvia Moreno-Garcia",
        mood: "intense",
        pages: 301
      },
      { 
        title: "The Midnight Library", 
        author: "Matt Haig",
        mood: "thoughtful",
        pages: 288
      },
      { 
        title: "Beach Read", 
        author: "Emily Henry",
        mood: "light",
        pages: 352
      }
    ];

    try {
      const result = await bookAPI.bulkImport(sampleBooks);
      if (result.books) {
        const books = await userAPI.getBooks({ status: 'to-read' });
        setUserBooks(books);
      }
    } catch (err) {
      console.error('Failed to load sample books:', err);
    }
  };

  // Get book recommendation based on current mood
  useEffect(() => {
    const getRecommendation = async () => {
      if (userBooks.length === 0) return;
      
      try {
        const recommendations = await bookAPI.getRecommendations(selectedMood, 1);
        if (recommendations && recommendations.length > 0) {
          setCurrentBook(recommendations[0]);
        }
      } catch (err) {
        console.error('Failed to get recommendation:', err);
      }
    };

    getRecommendation();
  }, [selectedMood, userBooks]);

  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
  };

  const handleBookAction = async (action) => {
    if (!currentBook) return;
    
    try {
      if (action === 'read') {
        await userAPI.updateBookStatus(currentBook.id, 'reading');
        
        // Update stats
        const newStats = await userAPI.getStats();
        setReadingStats(newStats);
      }
      
      // Get next recommendation
      const recommendations = await bookAPI.getRecommendations(selectedMood, 1);
      if (recommendations && recommendations.length > 0) {
        setCurrentBook(recommendations[0]);
      }
    } catch (err) {
      console.error('Failed to handle book action:', err);
    }
  };

  const shuffleBook = async () => {
    try {
      const recommendations = await bookAPI.getRecommendations(selectedMood, 5);
      if (recommendations && recommendations.length > 0) {
        const randomBook = recommendations[Math.floor(Math.random() * recommendations.length)];
        setCurrentBook(randomBook);
      }
    } catch (err) {
      console.error('Failed to shuffle book:', err);
    }
  };

  const handlePhotoBooksDetected = async (books) => {
    try {
      // Refresh user's book list
      const updatedBooks = await userAPI.getBooks({ status: 'to-read' });
      setUserBooks(updatedBooks);
      
      // Update stats
      const newStats = await userAPI.getStats();
      setReadingStats(newStats);
      
      // Show success message or update UI as needed
      console.log(`Added ${books.length} books from photo!`);
    } catch (err) {
      console.error('Failed to refresh after photo upload:', err);
    }
  };

  const BookCard = ({ book }) => (
    <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl p-6 text-center shadow-lg mb-6 animate-fadeIn">
      <div className="w-32 h-48 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-sm shadow-lg">
        {book?.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="text-center">
          <Book size={32} className="mx-auto mb-2" />
          <div className="text-xs">BOOK COVER</div>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{book?.title}</h3>
      <p className="text-gray-600 text-lg mb-2">by {book?.author}</p>
      {book?.pages && <p className="text-sm text-gray-500 mb-6">{book.pages} pages</p>}
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => handleBookAction('read')}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          Read This! 📖
        </button>
        <button 
          onClick={() => handleBookAction('skip')}
          className="bg-white text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
        >
          Skip ➡️
        </button>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="p-6">
      <h2 className="text-2xl font-light text-gray-800 mb-6">Settings</h2>
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Session ID</h3>
          <p className="text-gray-600 text-sm mb-3">Your unique session: {getSessionId()}</p>
          <p className="text-xs text-gray-500">Books are stored locally for this session</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Connect Goodreads</h3>
          <p className="text-gray-600 text-sm mb-3">Import your books and reading progress</p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            Coming Soon
          </button>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Reading Goals</h3>
          <p className="text-gray-600 text-sm mb-3">Set your annual reading target</p>
          <input 
            type="number" 
            placeholder="52" 
            className="border rounded-lg px-3 py-2 w-20 text-center"
            defaultValue={user?.preferences?.readingGoal || 52}
          />
          <span className="ml-2 text-gray-600">books per year</span>
        </div>
      </div>
      <button 
        onClick={() => setCurrentView('home')}
        className="w-full bg-gray-200 text-gray-700 py-3 rounded-full font-semibold mt-6"
      >
        Back to Home
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Book size={48} className="mx-auto mb-4 text-indigo-600 animate-pulse" />
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-5 py-3 flex justify-between items-center text-sm font-semibold">
        <span>9:41</span>
        <span>📚 BookVibe</span>
        <span>100%</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-6">
        <h1 className="text-3xl font-light tracking-wide">BookVibe</h1>
        <p className="opacity-90 mt-2">What should you read next?</p>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
        {currentView === 'home' && (
          <div className="p-6">
            {/* Mood Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-light text-gray-800 mb-4">How are you feeling?</h2>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodChange(mood.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center font-medium ${
                      selectedMood === mood.id
                        ? 'border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-700 text-white transform -translate-y-1 shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Recommendation */}
            {currentBook && <BookCard book={currentBook} />}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{readingStats.booksThisYear}</div>
                <div className="text-sm text-gray-600">This Year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{readingStats.inQueue}</div>
                <div className="text-sm text-gray-600">In Queue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{readingStats.readingStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && <SettingsView />}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-around items-center">
            <button 
              onClick={() => setCurrentView('home')}
              className={`p-3 rounded-full ${currentView === 'home' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
            >
              <BookOpen size={24} />
            </button>
            <button 
              onClick={() => setShowPhotoUpload(true)}
              className="p-3 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <Camera size={24} />
            </button>
            <button 
              onClick={shuffleBook}
              className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Shuffle size={24} />
            </button>
            <button 
              onClick={() => setCurrentView('settings')}
              className={`p-3 rounded-full ${currentView === 'settings' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
            >
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* Spacing for fixed bottom nav */}
        <div className="h-20"></div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload 
          onBooksDetected={handlePhotoBooksDetected}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  );
}

export default App;
