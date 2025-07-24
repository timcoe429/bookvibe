import React, { useState, useEffect } from 'react';
import './App.css';

const BookCard = ({ book }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex flex-col md:flex-row gap-4">
      <img 
        src={book.cover} 
        alt={book.title}
        className="w-32 h-48 object-cover rounded-lg mx-auto md:mx-0"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/128x192/e5e7eb/6b7280?text=Book';
        }}
      />
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
        <p className="text-gray-700 font-medium mb-2">by {book.author}</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(book.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-600 text-sm">({book.rating})</span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
      </div>
    </div>
  </div>
);

const MoodSelector = ({ selectedMood, onMoodChange }) => {
  const moods = [
    { value: 'escapist', label: 'Escapist', emoji: '🌟', color: 'bg-purple-500 hover:bg-purple-600' },
    { value: 'intense', label: 'Intense', emoji: '🔥', color: 'bg-red-500 hover:bg-red-600' },
    { value: 'thoughtful', label: 'Thoughtful', emoji: '🤔', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'light', label: 'Light & Fun', emoji: '😄', color: 'bg-green-500 hover:bg-green-600' }
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onMoodChange(mood.value)}
          className={`px-6 py-3 rounded-full text-white font-medium transition-all duration-200 ${
            selectedMood === mood.value 
              ? `${mood.color} ring-4 ring-white ring-opacity-30 scale-105` 
              : `${mood.color} hover:scale-105`
          }`}
        >
          <span className="mr-2">{mood.emoji}</span>
          {mood.label}
        </button>
      ))}
    </div>
  );
};

function App() {
  const [books, setBooks] = useState([]);
  const [selectedMood, setSelectedMood] = useState('escapist');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async (mood) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/recommendations?mood=${mood}&limit=6`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBooks(data.books);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load book recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(selectedMood);
  }, [selectedMood]);

  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            📚 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">BookVibe</span>
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Discover your next great read based on your mood
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mood Selector */}
        <MoodSelector selectedMood={selectedMood} onMoodChange={handleMoodChange} />

        {/* Current Mood Display */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Books for You
          </h2>
          <p className="text-gray-600 mt-1">Perfect reads for your current mood</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Finding perfect books for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => fetchBooks(selectedMood)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {books.length > 0 ? (
              books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No books found for this mood. Try a different mood!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>BookVibe - Find your next favorite book ✨</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
