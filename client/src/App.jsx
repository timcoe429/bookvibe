import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
     const [selectedMood, setSelectedMood] = useState('romance');
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);

     const books = [
     { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", mood: "romance" },
     { title: "Beach Read", author: "Emily Henry", mood: "romance" },
     { title: "Gone Girl", author: "Gillian Flynn", mood: "thriller" },
     { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", mood: "thriller" },
     { title: "The Thursday Murder Club", author: "Richard Osman", mood: "mystery" },
     { title: "The Maid", author: "Nita Prose", mood: "mystery" },
     { title: "Lessons in Chemistry", author: "Bonnie Garmus", mood: "comedy" },
     { title: "The Midnight Library", author: "Matt Haig", mood: "comedy" }
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
                 className={`mood-btn ${selectedMood === 'romance' ? 'active' : ''}`}
                 onClick={() => handleMoodChange('romance')}
               >
                 💕 Romance
               </button>
               <button 
                 className={`mood-btn ${selectedMood === 'thriller' ? 'active' : ''}`}
                 onClick={() => handleMoodChange('thriller')}
               >
                 🔥 Thriller
               </button>
               <button 
                 className={`mood-btn ${selectedMood === 'mystery' ? 'active' : ''}`}
                 onClick={() => handleMoodChange('mystery')}
               >
                 🔍 Mystery
               </button>
               <button 
                 className={`mood-btn ${selectedMood === 'comedy' ? 'active' : ''}`}
                 onClick={() => handleMoodChange('comedy')}
               >
                 😄 Comedy
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
                   Next Book ➡️
                 </button>
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
