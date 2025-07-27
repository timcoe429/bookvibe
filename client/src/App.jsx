import React, { useState, useEffect } from 'react';
import { Home, Library, Plus, Book, Sparkles, BookOpen, Heart } from 'lucide-react';
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#ffffff'
      }}>
        <div style={{
          fontSize: '1.25rem',
          color: '#6366f1',
          fontWeight: '600'
        }}>Loading...</div>
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
      maxWidth: '448px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative'
    }}>
      
      {/* Premium Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        padding: '2rem 1.5rem 1.5rem 1.5rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <Sparkles size={28} style={{
            color: '#6366f1',
            marginRight: '0.75rem'
          }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>BookVibe</h1>
        </div>
        <p style={{
          fontSize: '1rem',
          color: '#64748b',
          margin: 0,
          fontWeight: '500'
        }}>Discover your next great read</p>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '2rem 1.5rem 6rem 1.5rem',
        minHeight: 'calc(100vh - 200px)'
      }}>
                     {currentTab === 'library' ? (
             /* Library View - Premium Design */
             <div style={{paddingTop: '1rem'}}>
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginBottom: '2rem'
               }}>
                 <Library size={24} style={{
                   color: '#6366f1',
                   marginRight: '0.75rem'
                 }} />
                 <h2 style={{
                   fontSize: '1.5rem',
                   fontWeight: '600',
                   color: '#1f2937',
                   margin: 0
                 }}>Your Library</h2>
               </div>
               
               {userBooks.length > 0 ? (
                 <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                   {userBooks.map((book, index) => (
                     <div key={book.id || index} style={{
                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                       backdropFilter: 'blur(16px)',
                       borderRadius: '1.25rem',
                       padding: '1.25rem',
                       boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                       border: '1px solid rgba(99, 102, 241, 0.1)',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-2px)';
                       e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0)';
                       e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                     }}
                     >
                       <div style={{display: 'flex', alignItems: 'center'}}>
                         <div style={{
                           width: '3.5rem',
                           height: '4.5rem',
                           background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                           borderRadius: '0.75rem',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: 'white',
                           fontSize: '0.875rem',
                           fontWeight: '600',
                           marginRight: '1rem',
                           boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                         }}>
                           <BookOpen size={20} />
                         </div>
                         <div style={{flex: 1}}>
                           <h4 style={{
                             fontWeight: '600',
                             color: '#1f2937',
                             marginBottom: '0.25rem',
                             fontSize: '1rem',
                             lineHeight: '1.4'
                           }}>{book.title}</h4>
                           <p style={{
                             color: '#6366f1',
                             fontSize: '0.875rem',
                             margin: '0 0 0.25rem 0',
                             fontWeight: '500'
                           }}>by {book.author}</p>
                           {book.vibe && <p style={{
                             color: '#64748b',
                             fontSize: '0.75rem',
                             fontStyle: 'italic',
                             margin: 0
                           }}>{book.vibe}</p>}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div style={{
                   textAlign: 'center',
                   paddingTop: '4rem',
                   paddingBottom: '2rem'
                 }}>
                   <div style={{
                     fontSize: '4rem',
                     marginBottom: '1.5rem',
                     opacity: 0.6
                   }}>📚</div>
                   <h3 style={{
                     fontSize: '1.25rem',
                     fontWeight: '600',
                     color: '#1f2937',
                     marginBottom: '0.75rem'
                   }}>Your library awaits</h3>
                   <p style={{
                     color: '#64748b',
                     marginBottom: '2rem',
                     fontSize: '1rem',
                     lineHeight: '1.5'
                   }}>Add books by taking photos of your bookshelf and let our AI identify them for you.</p>
                   <button 
                     onClick={() => {
                       setCurrentTab('add');
                       setShowPhotoUpload(true);
                     }}
                     style={{
                       background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                       color: 'white',
                       padding: '1rem 2rem',
                       borderRadius: '9999px',
                       fontWeight: '600',
                       border: 'none',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                       fontSize: '1rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem',
                       margin: '0 auto'
                     }}
                     onMouseEnter={(e) => {
                       e.target.style.transform = 'translateY(-2px) scale(1.02)';
                       e.target.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.4)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.transform = 'translateY(0) scale(1)';
                       e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                     }}
                   >
                     <Plus size={20} />
                     Add Books
                   </button>
                 </div>
               )}
             </div>
                     ) : !showVibes && !isSpinning && !currentBook ? (
             /* Premium Water Magic Button */
             <div style={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               paddingTop: '3rem',
               position: 'relative'
             }}>
               
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
                 
                 {/* Premium Water Button */}
                 <div className={`water-button animate-gentle-float ${isExploding ? 'exploding' : ''}`}>
                   
                   {/* Water surface layers */}
                   <div className={`water-surface-layer-1 ${isExploding ? 'exploding' : ''}`}></div>
                   <div className={`water-surface-layer-2 ${isExploding ? 'exploding' : ''}`}></div>
                   
                   {/* Inner glow */}
                   <div className={`water-inner-glow ${isExploding ? 'exploding' : ''}`}></div>
                   
                   {/* Sparkle effects */}
                   <div className="water-sparkles">
                     <div className="sparkle-top animate-twinkle">✨</div>
                     <div className="sparkle-bottom animate-twinkle">💫</div>
                     <div className="sparkle-left animate-twinkle">⭐</div>
                     <div className="sparkle-right animate-twinkle">✨</div>
                   </div>
                   
                   <div className={`water-content ${isExploding ? 'exploding' : ''}`}>
                     <div className="water-drop-container">
                       <div className={`water-drop ${isExploding ? 'exploding' : 'animate-gentle-bounce'}`}>
                         💎
                       </div>
                       {/* Floating sparkles */}
                       <div className="tiny-sparkle-1 animate-twinkle">✨</div>
                       <div className="tiny-sparkle-2 animate-twinkle">💫</div>
                     </div>
                     <h2 className="water-adventure-text">Ready for your next adventure?</h2>
                     <div className="water-dive-text animate-gentle-pulse">
                       ✨ Discover Magic ✨ 
                     </div>
                   </div>
                 </div>
               </div>
             </div>
          ) : showVibes && !isSpinning ? (
            /* Premium Mood Selection */
            <div style={{paddingTop: '1rem'}}>
              <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <Sparkles size={24} style={{
                  color: '#6366f1',
                  marginBottom: '0.5rem'
                }} />
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>Choose your adventure</h2>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    borderRadius: '1.25rem',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(244, 114, 182, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => handleMoodChange('romance')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(244, 114, 182, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(244, 114, 182, 0.3)';
                  }}
                >
                  <Heart size={24} />
                  Romance & Love
                </button>
                
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    borderRadius: '1.25rem',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => handleMoodChange('thriller')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  🔥
                  Thrills & Chills
                </button>
                
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    borderRadius: '1.25rem',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => handleMoodChange('cozy')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  ☕
                  Cozy & Warm
                </button>
                
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    borderRadius: '1.25rem',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => handleMoodChange('fantasy')}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  🐉
                  Fantasy & Magic
                </button>
              </div>
            </div>
          ) : isSpinning ? (
            /* Premium Spinning Animation */
            <div style={{
              paddingTop: '4rem',
              textAlign: 'center'
            }}>
              <div style={{
                position: 'relative',
                width: '16rem',
                height: '16rem',
                margin: '0 auto 2rem auto'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite',
                  opacity: 0.8
                }}></div>
                <div style={{
                  position: 'absolute',
                  inset: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)'
                }}>
                  <div style={{textAlign: 'center', padding: '1rem'}}>
                    <Sparkles size={40} style={{
                      color: '#6366f1',
                      marginBottom: '1rem'
                    }} className="animate-gentle-pulse" />
                    <div style={{
                      color: '#6366f1',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>{spinningText}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentBook ? (
            /* Premium Book Display */
            <div style={{paddingTop: '1rem'}} className="animate-book-materialize">
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '2rem',
                padding: '2.5rem 2rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                <div style={{textAlign: 'center'}}>
                  {/* Premium Book Cover */}
                  <div style={{
                    position: 'relative',
                    marginBottom: '2.5rem'
                  }}>
                    <div style={{
                      width: '10rem',
                      height: '14rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                      borderRadius: '1.25rem',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
                      transform: 'rotate(2deg)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'rotate(0deg) scale(1.05)';
                      e.target.style.boxShadow = '0 30px 60px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'rotate(2deg) scale(1)';
                      e.target.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
                    }}
                    >
                      {/* Shimmer effect */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                        animation: 'shimmer 3s infinite'
                      }}></div>
                      
                      <div style={{
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        <Sparkles size={32} style={{
                          marginBottom: '1rem',
                          filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))'
                        }} />
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          letterSpacing: '0.1em',
                          opacity: 0.9
                        }}>YOUR NEXT</div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          letterSpacing: '0.1em',
                          opacity: 0.9
                        }}>ADVENTURE</div>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      left: '-1rem',
                      fontSize: '1.5rem'
                    }} className="animate-gentle-bounce">
                      ✨
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '-1rem',
                      fontSize: '1.25rem'
                    }} className="animate-gentle-pulse">
                      💫
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '0rem',
                      left: '0.5rem',
                      fontSize: '1.25rem',
                      animationDelay: '0.5s'
                    }} className="animate-twinkle">
                      ⭐
                    </div>
                  </div>
                  
                  {/* Book Details */}
                  <h3 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '1rem',
                    lineHeight: '1.3'
                  }}>{currentBook?.title}</h3>
                  <p style={{
                    fontSize: '1.25rem',
                    color: '#6366f1',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>by {currentBook?.author}</p>
                  <p style={{
                    color: '#8b5cf6',
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    fontStyle: 'italic'
                  }}>{currentBook?.vibe}</p>
                  {currentBook?.pages && (
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      marginBottom: '2.5rem'
                    }}>{currentBook.pages} pages of adventure await</p>
                  )}
                  
                  {/* Premium Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                      }}
                    >
                      <Sparkles size={18} />
                      Start Reading
                    </button>
                    <button 
                      onClick={handleWaterClick}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#6366f1',
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        padding: '1rem 2rem',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                        e.target.style.background = 'rgba(99, 102, 241, 0.05)';
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                      }}
                    >
                      ✨
                      Show Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

                 {/* Premium Bottom Navigation */}
         <div style={{
           position: 'fixed',
           bottom: 0,
           left: '50%',
           transform: 'translateX(-50%)',
           width: '100%',
           maxWidth: '448px',
           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
           backdropFilter: 'blur(20px)',
           borderTop: '1px solid rgba(99, 102, 241, 0.1)',
           padding: '1rem 1.5rem 1.5rem 1.5rem',
           boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
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
                 borderRadius: '1rem',
                 border: 'none',
                 background: currentTab === 'home' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                 color: currentTab === 'home' ? 'white' : '#64748b',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 gap: '0.25rem',
                 fontSize: '0.75rem',
                 fontWeight: '600',
                 minWidth: '4rem'
               }}
               onMouseEnter={(e) => {
                 if (currentTab !== 'home') {
                   e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                   e.target.style.color = '#6366f1';
                 }
               }}
               onMouseLeave={(e) => {
                 if (currentTab !== 'home') {
                   e.target.style.background = 'transparent';
                   e.target.style.color = '#64748b';
                 }
               }}
             >
               <Home size={20} />
               Home
             </button>
             <button 
               onClick={() => setCurrentTab('library')}
               style={{
                 padding: '1rem',
                 borderRadius: '1rem',
                 border: 'none',
                 background: currentTab === 'library' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                 color: currentTab === 'library' ? 'white' : '#64748b',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 gap: '0.25rem',
                 fontSize: '0.75rem',
                 fontWeight: '600',
                 minWidth: '4rem'
               }}
               onMouseEnter={(e) => {
                 if (currentTab !== 'library') {
                   e.target.style.background = 'rgba(99, 102, 241, 0.1)';
                   e.target.style.color = '#6366f1';
                 }
               }}
               onMouseLeave={(e) => {
                 if (currentTab !== 'library') {
                   e.target.style.background = 'transparent';
                   e.target.style.color = '#64748b';
                 }
               }}
             >
               <Library size={20} />
               Library
             </button>
             <button 
               onClick={() => {
                 setCurrentTab('add');
                 setShowPhotoUpload(true);
               }}
               style={{
                 padding: '1.25rem',
                 background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                 color: 'white',
                 borderRadius: '50%',
                 border: 'none',
                 boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                 cursor: 'pointer',
                 transition: 'all 0.3s ease',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
               onMouseEnter={(e) => {
                 e.target.style.transform = 'scale(1.1) translateY(-2px)';
                 e.target.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.4)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'scale(1) translateY(0)';
                 e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
               }}
             >
               <Plus size={24} />
             </button>
           </div>
         </div>

    </div>
  );
}

export default App;
