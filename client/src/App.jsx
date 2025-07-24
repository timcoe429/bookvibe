import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedMood, setSelectedMood] = useState('escapist');
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const books = [
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "escapist" },
    { title: "Circe", author: "Madeline Miller", mood: "thoughtful" },
    { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", mood: "escapist" },
    { title: "Klara and the Sun", author: "Kazuo Ishiguro", mood: "thoughtful" },
    { title: "The Midnight Library", author: "Matt Haig", mood: "thoughtful" },
    { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "intense" },
    { title: "Gone Girl", author: "Gillian Flynn", mood: "intense" },
    { title: "Beach Read", author: "Emily Henry", mood: "light" },
    { title: "The Thursday Murder Club", author: "Richard Osman", mood: "light" }
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
    const moodBooks = getBooksForMood(selectedMood);
    if (moodBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * moodBooks.length);
      setCurrentBook(moodBooks[randomIndex]);
    }
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
            <h2 className="section-title">How are you feeling?</h2>
            <div className="mood-buttons">
              <button 
                className={`mood-btn ${selectedMood === 'escapist' ? 'active' : ''}`}
                onClick={() => handleMoodChange('escapist')}
              >
                ✨ Escapist
              </button>
              <button 
                className={`mood-btn ${selectedMood === 'intense' ? 'active' : ''}`}
                onClick={() => handleMoodChange('intense')}
              >
                🔥 Intense
              </button>
              <button 
                className={`mood-btn ${selectedMood === 'thoughtful' ? 'active' : ''}`}
                onClick={() => handleMoodChange('thoughtful')}
              >
                💭 Thoughtful
              </button>
              <button 
                className={`mood-btn ${selectedMood === 'light' ? 'active' : ''}`}
                onClick={() => handleMoodChange('light')}
              >
                😊 Light & Fun
              </button>
            </div>
          </div>

          {currentBook && (
            <div className="book-card" key={currentBook.title}>
              <div className="book-cover">
                BOOK<br/>COVER
              </div>
              <div className="book-title">{currentBook.title}</div>
              <div className="book-author">by {currentBook.author}</div>
                             <div className="action-buttons">
                 <button className="btn btn-primary" onClick={nextBook}>
                   Read This! 📖
                 </button>
                 <button className="btn btn-secondary" onClick={nextBook}>
                   Skip ➡️
                 </button>
               </div>
               <div className="surprise-button">
                 <button className="btn btn-surprise" onClick={surprise}>
                   🎲 Surprise Me!
                 </button>
               </div>
             </div>
           )}

                      <div className="stats">
             <div className="stat">
               <div className="stat-number">12</div>
               <div className="stat-label">In Queue</div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
}

export default App;
