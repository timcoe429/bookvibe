import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
     const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState('');
  const [showVibes, setShowVibes] = useState(false);

                       const books = [
       { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "romance" },
       { title: "Beach Read", author: "Emily Henry", mood: "romance" },
       { title: "Lessons in Chemistry", author: "Bonnie Garmus", mood: "romance" },
       { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "thriller" },
       { title: "Gone Girl", author: "Gillian Flynn", mood: "thriller" },
       { title: "The Maid", author: "Nita Prose", mood: "thriller" },
       { title: "The Midnight Library", author: "Matt Haig", mood: "cozy" },
       { title: "The Thursday Murder Club", author: "Richard Osman", mood: "cozy" },
       { title: "Circe", author: "Madeline Miller", mood: "fantasy" },
       { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", mood: "fantasy" }
     ];

  const getBooksForMood = (mood) => {
    return books.filter(book => book.mood === mood);
  };

  const nextBook = () => {
    // Get all books and pick a random one
    const allBooks = books;
    if (allBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * allBooks.length);
      setCurrentBook(allBooks[randomIndex]);
    }
  };

  const startMagic = () => {
    setShowVibes(true);
  };

  const surprise = (mood) => {
    setIsSpinning(true);
    setSpinningText('🧙‍♀️ Mixing magical potions...');
    
    const journeySteps = [
      '🧙‍♀️ Mixing magical potions...',
      '🏔️ Climbing the mountains of Mordor...',
      '🌊 Sailing through the seven seas...',
      '🔮 Consulting the ancient oracles...',
      '✨ Channeling bookish energy...',
      '📚 Searching through enchanted libraries...',
      '🌟 Following the North Star...',
      '🎭 Consulting the muses...',
      '🌈 Finding your perfect book...'
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
    }, 500);
  };

  const handleMoodChange = (mood) => {
    surprise(mood);
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

                                   <div className="main-content">
            {!showVibes && !isSpinning && !currentBook ? (
              <div className="magic-start">
                <div className="magic-circle">
                  <div className="magic-text">✨</div>
                  <div className="magic-text">Ready for your next adventure?</div>
                  <button className="magic-btn" onClick={startMagic}>
                    🎲 Start the Magic!
                  </button>
                </div>
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
                  <div className="spinner">🎲</div>
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
                <div className="stat-number">📚</div>
                <div className="stat-label">Books on your shelf</div>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
}

export default App;
