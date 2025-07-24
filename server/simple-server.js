const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.json({ status: 'OK' });
});

// API test
app.get('/api/test', (req, res) => {
  console.log('API test hit');
  res.json({ message: 'BookVibe API working!' });
});

// Basic book recommendations (no database)
app.get('/api/books/recommendations', (req, res) => {
  console.log('Book recommendations hit');
  const sampleBooks = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', mood: 'escapist' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', mood: 'thoughtful' },
    { id: 3, title: 'Gone Girl', author: 'Gillian Flynn', mood: 'intense' }
  ];
  res.json(sampleBooks);
});

// Serve React build files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    console.log(`Serving React for: ${req.url}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'BookVibe Development Server' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple BookVibe server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 