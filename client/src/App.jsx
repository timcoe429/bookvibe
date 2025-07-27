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
            <div style={{paddingTop: '1rem'}}>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'serif',
                color: 'rgb(31, 41, 55)',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>Choose your adventure! ✨</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, rgb(244, 114, 182), rgb(251, 113, 133))',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    fontSize: '1rem'
                  }}
                  onClick={() => handleMoodChange('romance')}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  💕 Romance & Love
                </button>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, rgb(239, 68, 68), rgb(249, 115, 22))',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    fontSize: '1rem'
                  }}
                  onClick={() => handleMoodChange('thriller')}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  🔥 Thrills & Chills
                </button>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, rgb(251, 191, 36), rgb(245, 158, 11))',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    fontSize: '1rem'
                  }}
                  onClick={() => handleMoodChange('cozy')}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  ☕ Cozy & Warm
                </button>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(to right, rgb(168, 85, 247), rgb(99, 102, 241))',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    fontSize: '1rem'
                  }}
                  onClick={() => handleMoodChange('fantasy')}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  🐉 Fantasy & Magic
                </button>
              </div>
            </div>
          ) : isSpinning ? (
            /* Spinning Animation with Water Theme */
            <div style={{paddingTop: '4rem', textAlign: 'center'}}>
              <div style={{
                position: 'relative',
                width: '16rem',
                height: '16rem',
                margin: '0 auto 2rem auto'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(103, 232, 249))',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  inset: '0.5rem',
                  background: 'linear-gradient(to bottom right, rgb(239, 246, 255), rgb(207, 250, 254))',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>📚</div>
                    <div style={{
                      color: 'rgb(37, 99, 235)',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      padding: '0 1rem'
                    }}>{spinningText}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentBook ? (
            /* Book Display with Water Theme */
            <div style={{paddingTop: '1rem'}} className="animate-book-materialize">
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgb(191, 219, 254)',
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                <div style={{textAlign: 'center'}}>
                  {/* Water-themed Book Cover */}
                  <div style={{
                    position: 'relative',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      width: '9rem',
                      height: '13rem',
                      background: 'linear-gradient(to bottom right, rgb(37, 99, 235), rgb(14, 165, 233), rgb(37, 99, 235))',
                      borderRadius: '1rem',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      transform: 'rotate(3deg)',
                      transition: 'transform 0.5s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'rotate(0deg)'}
                    onMouseLeave={(e) => e.target.style.transform = 'rotate(3deg)'}
                    >
                      <div style={{textAlign: 'center'}}>
                        <Book size={40} style={{margin: '0 auto 0.75rem auto'}} />
                        <div style={{fontSize: '0.75rem', fontFamily: 'serif', letterSpacing: '0.1em'}}>YOUR NEXT</div>
                        <div style={{fontSize: '0.75rem', fontFamily: 'serif', letterSpacing: '0.1em'}}>ADVENTURE</div>
                      </div>
                    </div>
                    {/* Floating water elements around book */}
                    <div style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      left: '-0.5rem',
                      color: 'rgb(103, 232, 249)',
                      fontSize: '1.25rem'
                    }} className="animate-gentle-bounce">
                      💧
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '-0.25rem',
                      right: '-0.75rem',
                      color: 'rgb(96, 165, 250)',
                      fontSize: '1.125rem'
                    }} className="animate-gentle-pulse">
                      ✨
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-0.5rem',
                      left: '0.5rem',
                      color: 'rgb(103, 232, 249)',
                      fontSize: '1.25rem',
                      animationDelay: '0.5s'
                    }} className="animate-gentle-bounce">
                      💧
                    </div>
                  </div>
                  
                  {/* Book Details */}
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontFamily: 'serif',
                    color: 'rgb(31, 41, 55)',
                    marginBottom: '0.75rem',
                    lineHeight: '1.2'
                  }}>{currentBook?.title}</h3>
                  <p style={{
                    fontSize: '1.125rem',
                    color: 'rgb(37, 99, 235)',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>by {currentBook?.author}</p>
                  <p style={{
                    color: 'rgb(14, 165, 233)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    fontStyle: 'italic'
                  }}>{currentBook?.vibe}</p>
                  {currentBook?.pages && (
                    <p style={{
                      color: 'rgb(75, 85, 99)',
                      fontSize: '0.875rem',
                      marginBottom: '2rem'
                    }}>{currentBook.pages} pages of adventure</p>
                  )}
                  
                  {/* Water-themed Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      style={{
                        background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(14, 165, 233))',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      🌊 Dive into this one!
                    </button>
                    <button 
                      onClick={handleWaterClick}
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        color: 'rgb(37, 99, 235)',
                        border: '2px solid rgb(191, 219, 254)',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.background = 'rgb(239, 246, 255)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      }}
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
