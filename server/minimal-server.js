const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Log everything
console.log('Starting minimal server...');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV);
console.log('All environment variables:');
console.log('PORT:', process.env.PORT);
console.log('HOST:', process.env.HOST);

// Serve static files from the React build
const publicPath = path.join(__dirname, 'public');
console.log('📁 Public directory path:', publicPath);
console.log('📁 Checking if public directory exists...');

const fs = require('fs');
if (fs.existsSync(publicPath)) {
  console.log('✅ Public directory exists');
  const files = fs.readdirSync(publicPath);
  console.log('📄 Files in public directory:', files);
} else {
  console.log('❌ Public directory does not exist!');
}

app.use(express.static(publicPath));

// Book recommendations API
app.get('/api/books/recommendations', (req, res) => {
  console.log(`📚 Book recommendations requested`);
    const { mood = 'cozy', limit = 3 } = req.query;

  const allBooks = [
    { id: 1, title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', mood: 'romantic', rating: 4.3, cover: 'https://images-na.ssl-images-amazon.com/images/I/81SpokCrwwL.jpg', description: 'A reclusive Hollywood icon finally tells her story to a young journalist.' },
    { id: 2, title: 'Circe', author: 'Madeline Miller', mood: 'literary', rating: 4.4, cover: 'https://images-na.ssl-images-amazon.com/images/I/81D3jJoqRxL.jpg', description: 'The story of the goddess who defied the gods and transformed Odysseus.' },
    { id: 3, title: 'Gone Girl', author: 'Gillian Flynn', mood: 'dark', rating: 4.1, cover: 'https://images-na.ssl-images-amazon.com/images/I/41rK6Z8LhML.jpg', description: 'A psychological thriller about a marriage gone terribly wrong.' },
    { id: 4, title: 'Beach Read', author: 'Emily Henry', mood: 'uplifting', rating: 4.0, cover: 'https://images-na.ssl-images-amazon.com/images/I/91B1K0Lq9LL.jpg', description: 'Two rival writers challenge each other to write outside their comfort zones.' },
    { id: 5, title: 'The Invisible Life of Addie LaRue', author: 'V.E. Schwab', mood: 'cozy', rating: 4.2, cover: 'https://images-na.ssl-images-amazon.com/images/I/81J65tMXP9L.jpg', description: 'A woman cursed to be forgotten by everyone she meets.' },
    { id: 6, title: 'The Midnight Library', author: 'Matt Haig', mood: 'literary', rating: 4.2, cover: 'https://images-na.ssl-images-amazon.com/images/I/81VXuH0dS6L.jpg', description: 'Between life and death is a library with infinite books and infinite regrets.' },
    { id: 7, title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', mood: 'dark', rating: 3.9, cover: 'https://images-na.ssl-images-amazon.com/images/I/81Eqhw0IOQL.jpg', description: 'A gothic horror novel set in 1950s Mexico.' },
    { id: 8, title: 'The Thursday Murder Club', author: 'Richard Osman', mood: 'uplifting', rating: 4.0, cover: 'https://images-na.ssl-images-amazon.com/images/I/81J7lCZkBHL.jpg', description: 'Four unlikely friends meet weekly to investigate cold cases.' }
  ];
  
  const filteredBooks = allBooks.filter(book => book.mood === mood);
  const randomBooks = filteredBooks.sort(() => 0.5 - Math.random()).slice(0, parseInt(limit));
  
  res.json({
    mood,
    books: randomBooks,
    total: randomBooks.length
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check');
  res.json({ status: 'OK' });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  console.log(`📋 Serving React for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
}); 