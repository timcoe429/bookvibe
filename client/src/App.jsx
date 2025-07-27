import React, { useState } from 'react';
import { Heart, X, BookOpen, Clock, Star, Zap, Moon, Sun, Coffee } from 'lucide-react';

const BookPickerApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [currentBook, setCurrentBook] = useState(0);

  const sampleBooks = [
    {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      cover: "bg-gradient-to-b from-pink-400 to-purple-600",
      genre: "Contemporary Fiction",
      mood: "Glamorous & Emotional",
      readTime: "4.2 hours",
      rating: 4.8,
      vibe: "✨ Drama Queen Energy"
    },
    {
      title: "Mexican Gothic",
      author: "Silvia Moreno-Garcia",
      cover: "bg-gradient-to-b from-emerald-800 to-gray-900",
      genre: "Gothic Horror",
      mood: "Dark & Atmospheric",
      readTime: "5.1 hours",
      rating: 4.6,
      vibe: "🌙 Mysterious Vibes"
    },
    {
      title: "Beach Read",
      author: "Emily Henry",
      cover: "bg-gradient-to-b from-yellow-400 to-orange-400",
      genre: "Romance",
      mood: "Light & Flirty",
      readTime: "3.8 hours",
      rating: 4.7,
      vibe: "☀️ Sunshine Energy"
    }
  ];

  const moods = [
    { icon: Coffee, label: "Cozy", color: "bg-amber-100 text-amber-800" },
    { icon: Zap, label: "Thrilling", color: "bg-red-100 text-red-800" },
    { icon: Heart, label: "Romantic", color: "bg-pink-100 text-pink-800" },
    { icon: Moon, label: "Dark", color: "bg-purple-100 text-purple-800" },
    { icon: Sun, label: "Uplifting", color: "bg-yellow-100 text-yellow-800" },
    { icon: BookOpen, label: "Literary", color: "bg-blue-100 text-blue-800" }
  ];

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
            <span className="text-gray-700">47 books in your library</span>
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
          📚 Browse My Library (47)
        </button>
        <button className="w-full bg-white text-gray-700 p-4 rounded-xl font-medium border-2 border-gray-200 hover:border-purple-300 transition-all">
          ➕ Add New Books
        </button>
      </div>
    </div>
  );

  const SwipeScreen = () => {
    const book = sampleBooks[currentBook];
    
    const handleSwipe = (direction) => {
      setCurrentBook((prev) => (prev + 1) % sampleBooks.length);
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
          <div className={`${book.cover} rounded-2xl p-6 text-white shadow-2xl h-96 flex flex-col justify-end relative overflow-hidden`}>
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            <div className="relative z-10">
              <div className="mb-4">
                <div className="text-sm font-medium opacity-90 mb-1">{book.vibe}</div>
                <h3 className="text-2xl font-bold mb-1 leading-tight">{book.title}</h3>
                <p className="text-lg opacity-90">by {book.author}</p>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{book.readTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star size={16} className="fill-current" />
                  <span>{book.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Genre & Mood Tags */}
          <div className="flex space-x-2 mt-4">
            <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {book.genre}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {book.mood}
            </span>
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

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {currentView === 'home' ? <HomeScreen /> : <SwipeScreen />}
    </div>
  );
};

export default BookPickerApp;
