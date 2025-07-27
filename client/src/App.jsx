import React, { useState, useEffect } from 'react';
import { Home, Library, Plus, Book } from 'lucide-react';
import './App.css';
import PhotoCapture from './pages/PhotoCapture';

function App() {
     const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState('');
  const [showVibes, setShowVibes] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [currentTab, setCurrentTab] = useState('home'); // home, library, add
  const [currentView, setCurrentView] = useState('home'); // home, library, photo-capture
  const [isExploding, setIsExploding] = useState(false);

                                               const books = [
        // Romance & Love
        { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "romance", pages: 400, vibe: "✨ Glamorous & Captivating" },
        { title: "Beach Read", author: "Emily Henry", mood: "romance", pages: 350, vibe: "☀️ Light & Fun" },
        { title: "Lessons in Chemistry", author: "Bonnie Garmus", mood: "romance", pages: 372, vibe: "🧪 Smart & Engaging" },
        { title: "Book Lovers", author: "Emily Henry", mood: "romance", pages: 368, vibe: "💕 Sweet & Charming" },
        { title: "The Love Hypothesis", author: "Ali Hazelwood", mood: "romance", pages: 432, vibe: "🔬 Academic & Romantic" },
        { title: "Red, White & Royal Blue", author: "Casey McQuiston", mood: "romance", pages: 421, vibe: "👑 Political & Passionate" },
        { title: "The Hating Game", author: "Sally Thorne", mood: "romance", pages: 352, vibe: "💼 Enemies to Lovers" },
        { title: "It Ends With Us", author: "Colleen Hoover", mood: "romance", pages: 376, vibe: "💔 Emotional & Powerful" },
        
        // Thrills & Chills
        { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "thriller", pages: 301, vibe: "🌹 Dark & Atmospheric" },
        { title: "Gone Girl", author: "Gillian Flynn", mood: "thriller", pages: 432, vibe: "🔪 Twisted & Shocking" },
        { title: "The Maid", author: "Nita Prose", mood: "thriller", pages: 304, vibe: "🏨 Mystery & Suspense" },
        { title: "Verity", author: "Colleen Hoover", mood: "thriller", pages: 336, vibe: "📝 Psychological Thriller" },
        { title: "The Silent Patient", author: "Alex Michaelides", mood: "thriller", pages: 336, vibe: "🎭 Mind-Bending" },
        { title: "The Guest List", author: "Lucy Foley", mood: "thriller", pages: 320, vibe: "🏝️ Wedding Gone Wrong" },
        { title: "Sharp Objects", author: "Gillian Flynn", mood: "thriller", pages: 254, vibe: "🗞️ Small Town Secrets" },
        { title: "The Woman in the Window", author: "A.J. Finn", mood: "thriller", pages: 448, vibe: "🪟 Unreliable Narrator" },
        
        // Cozy & Warm
        { title: "The Midnight Library", author: "Matt Haig", mood: "cozy", pages: 288, vibe: "📚 Philosophical & Heartwarming" },
        { title: "The Thursday Murder Club", author: "Richard Osman", mood: "cozy", pages: 368, vibe: "🕵️ Cozy Mystery" },
        { title: "A Man Called Ove", author: "Fredrik Backman", mood: "cozy", pages: 337, vibe: "🏠 Heartfelt & Funny" },
        { title: "The House in the Cerulean Sea", author: "TJ Klune", mood: "cozy", pages: 395, vibe: "🏖️ Whimsical & Magical" },
        { title: "The Reading List", author: "Sara Nisha Adams", mood: "cozy", pages: 368, vibe: "📖 Books About Books" },
        { title: "The Storied Life of A.J. Fikry", author: "Gabrielle Zevin", mood: "cozy", pages: 258, vibe: "📚 Bookshop Charm" },
        { title: "The Guernsey Literary and Potato Peel Pie Society", author: "Mary Ann Shaffer", mood: "cozy", pages: 290, vibe: "✉️ Epistolary & Sweet" },
        { title: "The Little Paris Bookshop", author: "Nina George", mood: "cozy", pages: 336, vibe: "🇫🇷 Parisian & Literary" },
        
        // Fantasy & Magic
        { title: "Circe", author: "Madeline Miller", mood: "fantasy", pages: 393, vibe: "🌙 Mythical & Beautiful" },
        { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", mood: "fantasy", pages: 560, vibe: "💫 Romantic & Mysterious" },
        { title: "The Night Circus", author: "Erin Morgenstern", mood: "fantasy", pages: 387, vibe: "🎪 Atmospheric & Dreamy" },
        { title: "Caraval", author: "Stephanie Garber", mood: "fantasy", pages: 407, vibe: "🎭 Magical & Immersive" },
        { title: "The Ten Thousand Doors of January", author: "Alix E. Harrow", mood: "fantasy", pages: 380, vibe: "🚪 Portal Fantasy" },
        { title: "The Starless Sea", author: "Erin Morgenstern", mood: "fantasy", pages: 512, vibe: "📚 Meta & Mysterious" },
        { title: "The Priory of the Orange Tree", author: "Samantha Shannon", mood: "fantasy", pages: 827, vibe: "🐉 Epic High Fantasy" },
        { title: "The City of Brass", author: "S.A. Chakraborty", mood: "fantasy", pages: 544, vibe: "🏺 Middle Eastern Fantasy" }
      ];

  const getBooksForMood = (mood) => {
    // Use user's actual books if they have any, otherwise fall back to sample books
    const booksToUse = userBooks.length > 0 ? userBooks : books;
    return booksToUse.filter(book => book.mood === mood);
  };

  const nextBook = () => {
    // Get all books and pick a random one
    const booksToUse = userBooks.length > 0 ? userBooks : books;
    if (booksToUse.length > 0) {
      const randomIndex = Math.floor(Math.random() * booksToUse.length);
      setCurrentBook(booksToUse[randomIndex]);
    }
  };

  const handleWaterClick = async () => {
    // Step 1: Button depresses with water ripples
    setIsExploding(true);
    
    // Step 2: After ripples, start the existing magic flow
    setTimeout(() => {
      setIsExploding(false);
      startMagic();
    }, 1000);
  };

  const startMagic = () => {
    // Skip the vibe selection and go straight to magic
    const moods = ['romance', 'thriller', 'cozy', 'fantasy'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    surprise(randomMood);
  };

  const surprise = (mood) => {
    setIsSpinning(true);
    setSpinningText('📚 Scanning your bookshelf...');
    
    const bookReferences = [
      '🏰 Sneaking through Hogwarts after curfew...',
      '🚀 Waking up alone on the Hail Mary...',
      '🚪 Opening doors across infinite worlds...',
      '🏔️ Destroying the One Ring in Mount Doom...',
      '🪐 Walking the desert of Arrakis...',
      '🥔 Growing potatoes on Mars...',
      '🕹️ Logging into the OASIS...',
      '🐋 Don\'t panic! Consulting the Guide...',
      '👁️ Big Brother is watching you...',
      '👩‍🦳 Under His Eye in Gilead...',
      '🐉 Winter is coming to Westeros...',
      '🎵 Calling the Name of the Wind...',
      '⚡ Life before death, Radiant...',
      '🚀 Holden, the Rocinante needs you...',
      '🤖 Psychohistory predicts the future...',
      '👦 The enemy\'s gate is down...',
      '❄️ The left hand of darkness...',
      '🧠 Jacking into the matrix...',
      '⏰ The Time Machine is ready...',
      '🔥 It was a pleasure to burn...',
      '🌙 Following the Moonbeam Roads...',
      '🗡️ Fear is the mind-killer...'
    ];
    
    // Pick 2 random book references
    const shuffled = [...bookReferences].sort(() => 0.5 - Math.random());
    const journeySteps = [
      '📚 Scanning your bookshelf...',
      shuffled[0],
      shuffled[1],
      '🎉 Found your next adventure!'
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      setSpinningText(journeySteps[stepIndex]);
      stepIndex++;
      
      if (stepIndex >= journeySteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          const moodBooks = getBooksForMood(mood);
          if (moodBooks.length > 0) {
            const randomIndex = Math.floor(Math.random() * moodBooks.length);
            setCurrentBook(moodBooks[randomIndex]);
          }
          setIsSpinning(false);
          setSpinningText('');
          setShowVibes(false);
        }, 1500);
      }
    }, 2000);
  };

  const handleMoodChange = (mood) => {
    surprise(mood);
  };

  const handleBooksDetected = (newBooks) => {
    setUserBooks(prev => [...prev, ...newBooks]);
    setShowPhotoUpload(false);
  };

  const handlePhotoUploadClose = () => {
    setShowPhotoUpload(false);
    setCurrentTab('home'); // Reset to home when closing
  };

  const resetToHome = () => {
    setCurrentTab('home');
    setShowPhotoUpload(false);
    setCurrentBook(null);
    setShowVibes(false);
    setIsSpinning(false);
    setIsExploding(false);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className="phone-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // Show PhotoCapture as full page
  if (showPhotoUpload) {
    return (
      <PhotoCapture 
        onBooksDetected={handleBooksDetected}
        onNavigate={(view) => {
          if (view === 'home') {
            handlePhotoUploadClose();
          }
        }}
      />
    );
  }

     return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden">
      {/* Water Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dbeafe' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 bg-gradient-to-b from-blue-50/80 via-cyan-50/60 to-blue-50/80 min-h-screen backdrop-blur-sm">
        
        {/* Simple Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-blue-200 py-4 px-6">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">BookVibe</h1>
          <div className="text-center text-sm text-gray-600">What should you read next?</div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 pb-24">
          {currentTab === 'library' ? (
            /* Library View */
            <div className="pt-4">
              <h2 className="text-2xl font-serif text-gray-800 mb-6 text-center">Your Library 📚</h2>
              {userBooks.length > 0 ? (
                <div className="space-y-4">
                  {userBooks.map((book, index) => (
                    <div key={book.id || index} className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-blue-200">
                      <div className="flex items-center">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-4">
                          {book.title.slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{book.title}</h4>
                          <p className="text-blue-600 text-sm">by {book.author}</p>
                          {book.vibe && <p className="text-cyan-600 text-xs italic mt-1">{book.vibe}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center pt-16">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-serif text-gray-800 mb-2">Your library is empty!</h3>
                  <p className="text-gray-600 mb-8">Add some books by taking photos of your bookshelf.</p>
                  <button 
                    onClick={() => {
                      setCurrentTab('add');
                      setShowPhotoUpload(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    📸 Add Books
                  </button>
                </div>
              )}
            </div>
          ) : !showVibes && !isSpinning && !currentBook ? (
            /* Water Magic Button */
            <div className="flex flex-col items-center justify-center pt-16 relative">
              
              <div 
                onClick={handleWaterClick}
                className={`group cursor-pointer relative ${isExploding ? 'pointer-events-none' : ''}`}
              >
                {/* Water ripple rings that appear on press */}
                {isExploding && (
                  <>
                    <div className="absolute w-96 h-96 border-2 border-blue-300 rounded-full animate-water-ripple" style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}} />
                    <div className="absolute w-96 h-96 border-2 border-cyan-300 rounded-full animate-water-ripple" style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.1s'}} />
                    <div className="absolute w-96 h-96 border-2 border-blue-400 rounded-full animate-water-ripple" style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.2s'}} />
                  </>
                )}
                
                {/* Magical glow behind button */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300/30 via-cyan-300/40 to-blue-400/30 rounded-full blur-3xl animate-pulse opacity-60"></div>
                
                {/* Round Water Button with floating effect */}
                <div className={`relative w-72 h-72 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 shadow-2xl transform transition-all duration-300 backdrop-blur-md animate-gentle-float ${
                  isExploding ? 'scale-85 shadow-none brightness-125 border-cyan-300' : 'group-hover:scale-110 group-hover:shadow-3xl group-active:scale-95'
                }`}>
                  
                  {/* Multiple water surface layers for depth */}
                  <div className={`absolute inset-3 rounded-full bg-gradient-to-br from-blue-100/80 to-cyan-100/80 transition-all duration-300 ${
                    isExploding ? 'animate-pulse scale-110' : 'group-hover:scale-105'
                  }`}></div>
                  
                  <div className={`absolute inset-6 rounded-full bg-gradient-to-br from-blue-200/60 to-cyan-200/60 transition-all duration-300 ${
                    isExploding ? 'animate-pulse scale-110' : 'group-hover:scale-105'
                  }`}></div>
                  
                  {/* Inner magical water glow */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-300/30 to-cyan-300/30 transition-all duration-300 ${
                    isExploding ? 'blur-2xl opacity-100 scale-150' : 'blur-xl group-hover:blur-2xl opacity-70'
                  }`}></div>
                  
                  {/* Sparkle effects around the edge */}
                  <div className="absolute inset-0 rounded-full">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-cyan-300 animate-twinkle text-lg">✨</div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-blue-300 animate-twinkle text-lg" style={{animationDelay: '1s'}}>✨</div>
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-cyan-400 animate-twinkle text-lg" style={{animationDelay: '2s'}}>✨</div>
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-400 animate-twinkle text-lg" style={{animationDelay: '0.5s'}}>✨</div>
                  </div>
                  
                  <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center transition-all duration-300 ${
                    isExploding ? 'scale-110 brightness-125' : ''
                  }`}>
                    <div className="mb-6 relative">
                      <div className={`text-6xl ${isExploding ? 'animate-spin' : 'animate-gentle-bounce'}`}>
                        💧
                      </div>
                      {/* Tiny sparkles around the water drop */}
                      <div className="absolute -top-2 -right-2 text-cyan-300 animate-twinkle text-sm">✨</div>
                      <div className="absolute -bottom-1 -left-2 text-blue-300 animate-twinkle text-sm" style={{animationDelay: '0.7s'}}>✨</div>
                    </div>
                    <h2 className="text-2xl font-serif text-gray-800 mb-3 px-6 leading-tight">Ready for your next adventure?</h2>
                    <div className="text-blue-600 font-semibold tracking-wide text-lg animate-gentle-pulse">
                      🌊 Dive in ✨ 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : showVibes && !isSpinning ? (
            /* Mood Selection with Water Theme */
            <div className="pt-4">
              <h2 className="text-2xl font-serif text-gray-800 mb-8 text-center">Choose your adventure! ✨</h2>
              <div className="space-y-4">
                <button 
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleMoodChange('romance')}
                >
                  💕 Romance & Love
                </button>
                <button 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleMoodChange('thriller')}
                >
                  🔥 Thrills & Chills
                </button>
                <button 
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleMoodChange('cozy')}
                >
                  ☕ Cozy & Warm
                </button>
                <button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                  onClick={() => handleMoodChange('fantasy')}
                >
                  🐉 Fantasy & Magic
                </button>
              </div>
            </div>
          ) : isSpinning ? (
            /* Spinning Animation with Water Theme */
            <div className="pt-16 text-center">
              <div className="relative w-64 h-64 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <div className="text-blue-600 font-medium text-sm px-4">{spinningText}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentBook ? (
            /* Book Display with Water Theme */
            <div className="pt-4 animate-book-materialize">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-blue-200 mb-6 relative">
                <div className="text-center">
                  {/* Water-themed Book Cover */}
                  <div className="relative mb-8">
                    <div className="w-36 h-52 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="text-center">
                        <Book size={40} className="mx-auto mb-3" />
                        <div className="text-xs font-serif tracking-wider">YOUR NEXT</div>
                        <div className="text-xs font-serif tracking-wider">ADVENTURE</div>
                      </div>
                    </div>
                    {/* Floating water elements around book */}
                    <div className="absolute -top-2 -left-2 text-cyan-400 animate-bounce text-xl">
                      💧
                    </div>
                    <div className="absolute -top-1 -right-3 text-blue-400 animate-pulse text-lg">
                      ✨
                    </div>
                    <div className="absolute -bottom-2 left-2 text-cyan-400 animate-bounce text-xl" style={{animationDelay: '0.5s'}}>
                      💧
                    </div>
                  </div>
                  
                  {/* Book Details */}
                  <h3 className="text-2xl font-serif text-gray-800 mb-3 leading-tight">{currentBook?.title}</h3>
                  <p className="text-lg text-blue-600 mb-2 font-medium">by {currentBook?.author}</p>
                  <p className="text-cyan-600 text-sm mb-2 italic">{currentBook?.vibe}</p>
                  {currentBook?.pages && (
                    <p className="text-gray-500 text-sm mb-8">{currentBook.pages} pages of adventure</p>
                  )}
                  
                  {/* Water-themed Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      🌊 Dive into this one!
                    </button>
                    <button 
                      onClick={handleWaterClick}
                      className="bg-white/80 text-blue-600 border-2 border-blue-300 px-8 py-4 rounded-full font-medium hover:scale-105 transition-all duration-200 hover:bg-blue-50"
                    >
                      💧 Show me another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Water-themed Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-blue-200 px-6 py-4">
          <div className="flex justify-around items-center">
            <button 
              onClick={resetToHome}
              className={`p-4 rounded-full transition-colors ${currentTab === 'home' ? 'bg-blue-100 text-blue-600' : 'text-blue-500 hover:bg-blue-100'}`}
            >
              <Home size={22} />
            </button>
            <button 
              onClick={() => setCurrentTab('library')}
              className={`p-4 rounded-full transition-colors ${currentTab === 'library' ? 'bg-blue-100 text-blue-600' : 'text-blue-500 hover:bg-blue-100'}`}
            >
              <Library size={22} />
            </button>
            <button 
              onClick={() => {
                setCurrentTab('add');
                setShowPhotoUpload(true);
              }}
              className="p-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* FLOATING AND MAGICAL ANIMATIONS */
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
        }
        .animate-gentle-float {
          animation: gentle-float 4s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        .animate-gentle-bounce {
          animation: gentle-bounce 2s ease-in-out infinite;
        }
        
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 1.5s ease-in-out infinite;
        }
        
        @keyframes water-ripple {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .animate-water-ripple {
          animation: water-ripple 0.8s ease-out forwards;
        }
        
        /* Book materialization */
        @keyframes book-materialize {
          0% { opacity: 0; transform: scale(0.3) translateY(100px); }
          50% { opacity: 0.7; transform: scale(1.1) translateY(-20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-book-materialize {
          animation: book-materialize 1s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}

export default App;
