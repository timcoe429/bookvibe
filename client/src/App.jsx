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
    <div style={{
      maxWidth: '28rem',
      margin: '0 auto',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Water Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dbeafe' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(239, 246, 255, 0.8), rgba(207, 250, 254, 0.6), rgba(239, 246, 255, 0.8))',
        minHeight: '100vh',
        backdropFilter: 'blur(4px)'
      }}>
        
        {/* Simple Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgb(191, 219, 254)',
          padding: '1rem 1.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgb(31, 41, 55)',
            margin: '0 0 0.25rem 0'
          }}>BookVibe</h1>
          <div style={{
            fontSize: '0.875rem',
            color: 'rgb(75, 85, 99)',
            margin: 0
          }}>What should you read next?</div>
        </div>

        {/* Main Content */}
        <div style={{
          padding: '2rem 1.5rem 6rem 1.5rem'
        }}>
                     {currentTab === 'library' ? (
             /* Library View */
             <div style={{paddingTop: '1rem'}}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontFamily: 'serif',
                 color: 'rgb(31, 41, 55)',
                 marginBottom: '1.5rem',
                 textAlign: 'center'
               }}>Your Library 📚</h2>
               {userBooks.length > 0 ? (
                 <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                   {userBooks.map((book, index) => (
                     <div key={book.id || index} style={{
                       background: 'rgba(255, 255, 255, 0.9)',
                       backdropFilter: 'blur(16px)',
                       borderRadius: '1rem',
                       padding: '1rem',
                       boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                       border: '1px solid rgb(191, 219, 254)'
                     }}>
                       <div style={{display: 'flex', alignItems: 'center'}}>
                         <div style={{
                           width: '3rem',
                           height: '4rem',
                           background: 'linear-gradient(to bottom right, rgb(37, 99, 235), rgb(14, 165, 233))',
                           borderRadius: '0.5rem',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: 'white',
                           fontSize: '0.75rem',
                           fontWeight: 'bold',
                           marginRight: '1rem'
                         }}>
                           {book.title.slice(0, 2)}
                         </div>
                         <div style={{flex: 1}}>
                           <h4 style={{
                             fontWeight: '600',
                             color: 'rgb(31, 41, 55)',
                             marginBottom: '0.25rem',
                             fontSize: '1rem'
                           }}>{book.title}</h4>
                           <p style={{
                             color: 'rgb(37, 99, 235)',
                             fontSize: '0.875rem',
                             margin: '0'
                           }}>by {book.author}</p>
                           {book.vibe && <p style={{
                             color: 'rgb(14, 165, 233)',
                             fontSize: '0.75rem',
                             fontStyle: 'italic',
                             marginTop: '0.25rem',
                             margin: '0.25rem 0 0 0'
                           }}>{book.vibe}</p>}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div style={{textAlign: 'center', paddingTop: '4rem'}}>
                   <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📖</div>
                   <h3 style={{
                     fontSize: '1.25rem',
                     fontFamily: 'serif',
                     color: 'rgb(31, 41, 55)',
                     marginBottom: '0.5rem'
                   }}>Your library is empty!</h3>
                   <p style={{
                     color: 'rgb(75, 85, 99)',
                     marginBottom: '2rem'
                   }}>Add some books by taking photos of your bookshelf.</p>
                   <button 
                     onClick={() => {
                       setCurrentTab('add');
                       setShowPhotoUpload(true);
                     }}
                     style={{
                       background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(14, 165, 233))',
                       color: 'white',
                       padding: '0.75rem 1.5rem',
                       borderRadius: '9999px',
                       fontWeight: '500',
                       border: 'none',
                       cursor: 'pointer',
                       transition: 'all 0.2s',
                       boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                     }}
                     onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                     onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                   >
                     📸 Add Books
                   </button>
                 </div>
               )}
             </div>
                     ) : !showVibes && !isSpinning && !currentBook ? (
             /* Water Magic Button */
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem', position: 'relative'}}>
               
               <div 
                 onClick={handleWaterClick}
                 className={`water-button-container ${isExploding ? 'exploding' : ''}`}
               >
                 {/* Water ripple rings that appear on press */}
                 {isExploding && (
                   <>
                     <div className="water-ripple water-ripple-1" />
                     <div className="water-ripple water-ripple-2" />
                     <div className="water-ripple water-ripple-3" />
                   </>
                 )}
                 
                 {/* Magical glow behind button */}
                 <div className="water-magical-glow"></div>
                 
                 {/* Round Water Button with floating effect */}
                 <div className={`water-button animate-gentle-float ${isExploding ? 'exploding' : ''}`}>
                   
                   {/* Multiple water surface layers for depth */}
                   <div className={`water-surface-layer-1 ${isExploding ? 'exploding' : ''}`}></div>
                   <div className={`water-surface-layer-2 ${isExploding ? 'exploding' : ''}`}></div>
                   
                   {/* Inner magical water glow */}
                   <div className={`water-inner-glow ${isExploding ? 'exploding' : ''}`}></div>
                   
                   {/* Sparkle effects around the edge */}
                   <div className="water-sparkles">
                     <div className="sparkle-top animate-twinkle">✨</div>
                     <div className="sparkle-bottom animate-twinkle">✨</div>
                     <div className="sparkle-left animate-twinkle">✨</div>
                     <div className="sparkle-right animate-twinkle">✨</div>
                   </div>
                   
                   <div className={`water-content ${isExploding ? 'exploding' : ''}`}>
                     <div className="water-drop-container">
                       <div className={`water-drop ${isExploding ? 'exploding' : 'animate-gentle-bounce'}`}>
                         💧
                       </div>
                       {/* Tiny sparkles around the water drop */}
                       <div className="tiny-sparkle-1 animate-twinkle">✨</div>
                       <div className="tiny-sparkle-2 animate-twinkle">✨</div>
                     </div>
                     <h2 className="water-adventure-text">Ready for your next adventure?</h2>
                     <div className="water-dive-text animate-gentle-pulse">
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
         <div style={{
           position: 'fixed',
           bottom: 0,
           left: '50%',
           transform: 'translateX(-50%)',
           width: '100%',
           maxWidth: '28rem',
           background: 'rgba(255, 255, 255, 0.9)',
           backdropFilter: 'blur(16px)',
           borderTop: '1px solid rgb(191, 219, 254)',
           padding: '1rem 1.5rem'
         }}>
           <div style={{
             display: 'flex',
             justifyContent: 'space-around',
             alignItems: 'center'
           }}>
             <button 
               onClick={resetToHome}
               style={{
                 padding: '1rem',
                 borderRadius: '50%',
                 border: 'none',
                 background: currentTab === 'home' ? 'rgb(219, 234, 254)' : 'transparent',
                 color: currentTab === 'home' ? 'rgb(37, 99, 235)' : 'rgb(59, 130, 246)',
                 transition: 'all 0.2s',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <Home size={22} />
             </button>
             <button 
               onClick={() => setCurrentTab('library')}
               style={{
                 padding: '1rem',
                 borderRadius: '50%',
                 border: 'none',
                 background: currentTab === 'library' ? 'rgb(219, 234, 254)' : 'transparent',
                 color: currentTab === 'library' ? 'rgb(37, 99, 235)' : 'rgb(59, 130, 246)',
                 transition: 'all 0.2s',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <Library size={22} />
             </button>
             <button 
               onClick={() => {
                 setCurrentTab('add');
                 setShowPhotoUpload(true);
               }}
               style={{
                 padding: '1.25rem',
                 background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(14, 165, 233))',
                 color: 'white',
                 borderRadius: '50%',
                 border: 'none',
                 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                 cursor: 'pointer',
                 transition: 'transform 0.2s',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
               onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
               onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
             >
               <Plus size={22} />
             </button>
           </div>
         </div>
      </div>


    </div>
  );
}

export default App;
