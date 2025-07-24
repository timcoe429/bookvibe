import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
     const [selectedMood, setSelectedMood] = useState('pink');
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningText, setSpinningText] = useState('');

           const books = [
      { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "pink" },
      { title: "Beach Read", author: "Emily Henry", mood: "pink" },
      { title: "Lessons in Chemistry", author: "Bonnie Garmus", mood: "pink" },
      { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "mysterious" },
      { title: "Gone Girl", author: "Gillian Flynn", mood: "mysterious" },
      { title: "The Maid", author: "Nita Prose", mood: "mysterious" },
      { title: "The Midnight Library", author: "Matt Haig", mood: "cozy" },
      { title: "The Thursday Murder Club", author: "Richard Osman", mood: "cozy" },
      { title: "Circe", author: "Madeline Miller", mood: "wild" },
      { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", mood: "wild" }
    ];

  const getBooksForMood = (mood) => {
    return books.filter(book => book.mood === mood);
  };

  const nextBook = () => {
    const moodBooks = getBooksForMood(selectedMood);
    if (moodBooks.length > 0) {
      const currentIndex = moodBooks.findIndex(book => book.title === currentBook?.title);
      const nextIndex = (currentIndex + 1) % moodBooks.length;
      setCurrentBook(moodBooks[nextIndex]);
    }
  };

  const surprise = () => {
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
      '🎭 Consulting the muses...'
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      setSpinningText(journeySteps[stepIndex]);
      stepIndex++;
      
      if (stepIndex >= journeySteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          const moodBooks = getBooksForMood(selectedMood);
          if (moodBooks.length > 0) {
            const randomIndex = Math.floor(Math.random() * moodBooks.length);
            setCurrentBook(moodBooks[randomIndex]);
          }
          setIsSpinning(false);
          setSpinningText('');
        }, 1000);
      }
    }, 300);
  };

  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
    const moodBooks = getBooksForMood(mood);
    if (moodBooks.length > 0) {
      setCurrentBook(moodBooks[0]);
    }
  };

  useEffect(() => {
    // Set initial book
    const moodBooks = getBooksForMood(selectedMood);
    if (moodBooks.length > 0) {
      setCurrentBook(moodBooks[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Update book when mood changes
    const moodBooks = getBooksForMood(selectedMood);
    if (moodBooks.length > 0) {
      setCurrentBook(moodBooks[0]);
    }
  }, [selectedMood]);

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
           <div className="mood-section">
             <h2 className="section-title">Pick your vibe! ✨</h2>
                          <div className="mood-buttons">
                <button 
                  className={`mood-btn ${selectedMood === 'pink' ? 'active' : ''}`}
                  onClick={() => handleMoodChange('pink')}
                >
                  💅 Pink vibes
                </button>
                <button 
                  className={`mood-btn ${selectedMood === 'mysterious' ? 'active' : ''}`}
                  onClick={() => handleMoodChange('mysterious')}
                >
                  🌙 Dark & mysterious
                </button>
                <button 
                  className={`mood-btn ${selectedMood === 'cozy' ? 'active' : ''}`}
                  onClick={() => handleMoodChange('cozy')}
                >
                  ☕ Cozy & warm
                </button>
                <button 
                  className={`mood-btn ${selectedMood === 'wild' ? 'active' : ''}`}
                  onClick={() => handleMoodChange('wild')}
                >
                  🌈 Something wild!
                </button>
              </div>
           </div>

                     {isSpinning ? (
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
                 <button className="btn btn-primary" onClick={nextBook}>
                   Show me another! ✨
                 </button>
                 <button className="btn btn-surprise" onClick={surprise}>
                   🎲 Pick for me!
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
