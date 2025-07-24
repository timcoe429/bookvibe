import React, { useState, useEffect } from 'react';
import './App.css';
import PhotoUpload from './components/PhotoUpload';

function App() {
     const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState('');
  const [showVibes, setShowVibes] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [userBooks, setUserBooks] = useState([]);

                                               const books = [
        // Romance & Love
        { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "romance" },
        { title: "Beach Read", author: "Emily Henry", mood: "romance" },
        { title: "Lessons in Chemistry", author: "Bonnie Garmus", mood: "romance" },
        { title: "Book Lovers", author: "Emily Henry", mood: "romance" },
        { title: "The Love Hypothesis", author: "Ali Hazelwood", mood: "romance" },
        { title: "Red, White & Royal Blue", author: "Casey McQuiston", mood: "romance" },
        { title: "The Hating Game", author: "Sally Thorne", mood: "romance" },
        { title: "It Ends With Us", author: "Colleen Hoover", mood: "romance" },
        
        // Thrills & Chills
        { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "thriller" },
        { title: "Gone Girl", author: "Gillian Flynn", mood: "thriller" },
        { title: "The Maid", author: "Nita Prose", mood: "thriller" },
        { title: "Verity", author: "Colleen Hoover", mood: "thriller" },
        { title: "The Silent Patient", author: "Alex Michaelides", mood: "thriller" },
        { title: "The Guest List", author: "Lucy Foley", mood: "thriller" },
        { title: "Sharp Objects", author: "Gillian Flynn", mood: "thriller" },
        { title: "The Woman in the Window", author: "A.J. Finn", mood: "thriller" },
        
        // Cozy & Warm
        { title: "The Midnight Library", author: "Matt Haig", mood: "cozy" },
        { title: "The Thursday Murder Club", author: "Richard Osman", mood: "cozy" },
        { title: "A Man Called Ove", author: "Fredrik Backman", mood: "cozy" },
        { title: "The House in the Cerulean Sea", author: "TJ Klune", mood: "cozy" },
        { title: "The Reading List", author: "Sara Nisha Adams", mood: "cozy" },
        { title: "The Storied Life of A.J. Fikry", author: "Gabrielle Zevin", mood: "cozy" },
        { title: "The Guernsey Literary and Potato Peel Pie Society", author: "Mary Ann Shaffer", mood: "cozy" },
        { title: "The Little Paris Bookshop", author: "Nina George", mood: "cozy" },
        
        // Fantasy & Magic
        { title: "Circe", author: "Madeline Miller", mood: "fantasy" },
        { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", mood: "fantasy" },
        { title: "The Night Circus", author: "Erin Morgenstern", mood: "fantasy" },
        { title: "Caraval", author: "Stephanie Garber", mood: "fantasy" },
        { title: "The Ten Thousand Doors of January", author: "Alix E. Harrow", mood: "fantasy" },
        { title: "The Starless Sea", author: "Erin Morgenstern", mood: "fantasy" },
        { title: "The Priory of the Orange Tree", author: "Samantha Shannon", mood: "fantasy" },
        { title: "The City of Brass", author: "S.A. Chakraborty", mood: "fantasy" }
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

  const startMagic = () => {
    // Skip the vibe selection and go straight to magic
    const moods = ['romance', 'thriller', 'cozy', 'fantasy'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    surprise(randomMood);
  };

  const surprise = (mood) => {
    setIsSpinning(true);
    setSpinningText('📚 Scanning your bookshelf...');
    
    const journeySteps = [
      '📚 Scanning your bookshelf...',
      '🔍 Looking for hidden gems...',
      '✨ Finding the perfect story...',
      '🌟 Discovering your next adventure...',
      '📖 Reading between the lines...',
      '🎯 Zeroing in on your match...',
      '💫 Almost there...',
      '🎉 Found it!'
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
        }, 1000);
      }
    }, 1500);
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

     return (
     <div className="app-container">
       <div className="phone-container">
         <div className="header">
           <h1>BookVibe</h1>
           <div className="subtitle">What should you read next?</div>
         </div>

         {showPhotoUpload && (
           <PhotoUpload 
             onBooksDetected={handleBooksDetected}
             onClose={handlePhotoUploadClose}
           />
         )}

                                   <div className="main-content">
                         {!showVibes && !isSpinning && !currentBook ? (
               <div className="magic-start">
                 <div className="magic-circle" onClick={startMagic}>
                   <div className="magic-text">✨</div>
                   <div className="magic-text">Ready for your next adventure?</div>
                   <div className="magic-text">Tap to start!</div>
                 </div>
                 
                 {userBooks.length === 0 && (
                   <div className="add-books-section">
                     <div className="add-books-text">📚 Add your books to get personalized recommendations!</div>
                     <button className="add-books-btn" onClick={() => setShowPhotoUpload(true)}>
                       📸 Take Photo of Your Books
                     </button>
                   </div>
                 )}
               </div>
            ) : showVibes && !isSpinning ? (
              <div className="vibe-selection">
                <h2 className="section-title">Choose your adventure! ✨</h2>
                <div className="vibe-buttons">
                  <button 
                    className="vibe-btn"
                    onClick={() => handleMoodChange('romance')}
                  >
                    💕 Romance & Love
                  </button>
                  <button 
                    className="vibe-btn"
                    onClick={() => handleMoodChange('thriller')}
                  >
                    🔥 Thrills & Chills
                  </button>
                  <button 
                    className="vibe-btn"
                    onClick={() => handleMoodChange('cozy')}
                  >
                    ☕ Cozy & Warm
                  </button>
                  <button 
                    className="vibe-btn"
                    onClick={() => handleMoodChange('fantasy')}
                  >
                    🐉 Fantasy & Magic
                  </button>
                </div>
              </div>
                         ) : isSpinning ? (
               <div className="book-card spinning">
                 <div className="spinning-wheel">
                   <div className="wheel-text">{spinningText}</div>
                   <div className="book-icon">📚</div>
                 </div>
               </div>
            ) : currentBook ? (
              <div className="book-card" key={currentBook.title}>
                <div className="book-cover">
                  BOOK<br/>COVER
                </div>
                <div className="book-title">{currentBook.title}</div>
                <div className="book-author">by {currentBook.author}</div>
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={() => setCurrentBook(null)}>
                    🎲 Pick Another!
                  </button>
                </div>
              </div>
            ) : null}

                                                              <div className="stats">
                   <div className="stat">
                     <div className="stat-number">{userBooks.length > 0 ? userBooks.length : books.length}</div>
                     <div className="stat-label">Books on your shelf</div>
                   </div>
                   {userBooks.length > 0 && (
                     <button className="add-more-btn" onClick={() => setShowPhotoUpload(true)}>
                       📸 Add More Books
                     </button>
                   )}
                 </div>
         </div>
       </div>
    </div>
  );
}

export default App;
