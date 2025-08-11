const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const User = require('../models/User');
const bookService = require('../services/bookMatchingService');

// Get book recommendations based on mood and user preferences
router.get('/recommendations', async (req, res) => {
  try {
    const { sessionId, mood = 'cozy', limit = 1 } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Find or create user
    let user = await User.findOne({ where: { sessionId } });
    if (!user) {
      user = await User.create({ sessionId });
    }

    // Get user's books that match the mood and are in 'to-read' status
    const userBooks = await UserBook.findAll({
      where: { 
        userId: user.id,
        status: 'to-read'
      },
      include: [{
        model: Book,
        where: { mood },
        required: true
      }],
      limit: parseInt(limit) * 3 // Get more than needed for randomization
    });

    if (userBooks.length === 0) {
      // If no user books, return some default recommendations
      const defaultBooks = await Book.findAll({
        where: { mood },
        limit: parseInt(limit),
        order: [['averageRating', 'DESC']]
      });
      
      return res.json(defaultBooks);
    }

    // Randomize and return requested number
    const shuffled = userBooks.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, parseInt(limit)).map(ub => ub.Book);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Search books by title or author
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const books = await Book.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { title: { [require('sequelize').Op.iLike]: `%${q}%` } },
          { author: { [require('sequelize').Op.iLike]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['averageRating', 'DESC']]
    });

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
});

// Get book details by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
});

// Add or update a book
router.post('/', async (req, res) => {
  try {
    const bookData = req.body;
    
    // Check if book already exists by ISBN or Goodreads ID
    let book = null;
    if (bookData.isbn) {
      book = await Book.findOne({ where: { isbn: bookData.isbn } });
    } else if (bookData.goodreadsId) {
      book = await Book.findOne({ where: { goodreadsId: bookData.goodreadsId } });
    }

    if (book) {
      // Update existing book
      await book.update(bookData);
    } else {
      // Create new book
      book = await Book.create(bookData);
    }

    res.json(book);
  } catch (error) {
    console.error('Error creating/updating book:', error);
    res.status(500).json({ error: 'Failed to create/update book' });
  }
});

// Bulk import books (for photo upload processing)
router.post('/bulk-import', async (req, res) => {
  try {
    const { books, sessionId } = req.body;
    
    console.log('📥 BULK IMPORT: Starting with data:', { 
      sessionId, 
      bookCount: books?.length,
      requestBody: JSON.stringify(req.body, null, 2)
    });
    
    if (!sessionId) {
      console.error('❌ BULK IMPORT: No sessionId provided');
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!Array.isArray(books) || books.length === 0) {
      console.error('❌ BULK IMPORT: Invalid books array:', { books, isArray: Array.isArray(books), length: books?.length });
      return res.status(400).json({ error: 'Books array required' });
    }

    // Find or create user
    let user = await User.findOne({ where: { sessionId } });
    if (!user) {
      console.log('👤 Creating new user for sessionId:', sessionId);
      user = await User.create({ sessionId });
    } else {
      console.log('👤 Found existing user:', user.id);
    }

    const createdBooks = [];
    const userBooks = [];
    let processedCount = 0;

    for (const bookData of books) {
      try {
        processedCount++;
        console.log(`📖 Processing book ${processedCount}/${books.length}: "${bookData.title}" with mood: ${bookData.mood}`);
        
        // Check if book already exists (deduplication by title and author)
        const existingBook = await Book.findOne({
          where: {
            title: { [require('sequelize').Op.iLike]: bookData.title.trim() },
            author: { [require('sequelize').Op.iLike]: (bookData.author || '').trim() || '%' }
          }
        });

        let book;
        if (existingBook) {
          console.log(`📚 Book "${bookData.title}" already exists, updating mood from "${existingBook.mood}" to "${bookData.mood}"`);
          // Update the existing book with new mood from AI
          await existingBook.update({
            mood: bookData.mood || existingBook.mood // Keep existing mood if new one is missing
          });
          book = existingBook;
          console.log(`✅ Updated existing book: "${book.title}" with mood: ${book.mood}`);
        } else {
          // Create book directly from AI detection (no external API lookup)
          const bookCreateData = {
            title: bookData.title || 'Unknown Title',
            author: bookData.author || 'Unknown Author',
            pages: bookData.pages || null,
            description: bookData.description || null,
            mood: bookData.mood || 'cozy' // FIXED: Use 'cozy' instead of 'escapist'
          };
          
          console.log('🆕 Creating new book with data:', bookCreateData);
          book = await Book.create(bookCreateData);
          console.log(`✅ Created new book: "${book.title}" with mood: ${book.mood}`);
        }

        // Check if this book is already in user's library before adding
        const existingUserBook = await UserBook.findOne({
          where: { userId: user.id, bookId: book.id }
        });

        if (!existingUserBook) {
          // Map source properly - handle new source from photos
          const sourceMapping = {
            'ai_vision': 'photo',
            'claude_vision': 'photo',
            'gpt_vision': 'photo'
          };
          const mappedSource = sourceMapping[bookData.source] || bookData.source || 'photo';
          
          console.log(`📚 Adding book to user library with source: ${mappedSource}`);
          const userBook = await UserBook.create({
            userId: user.id,
            bookId: book.id,
            status: 'to-read',
            source: mappedSource
          });
          
          // Only add to response arrays if it's actually new to the user
          createdBooks.push(book);
          userBooks.push(userBook);
          console.log(`✅ Added "${book.title}" to user library`);
        } else {
          console.log(`🔄 Skipped "${book.title}" - already in your library`);
        }
      } catch (bookError) {
        console.error(`❌ Error processing book ${bookData.title}:`, bookError);
        // Continue with other books
      }
    }

    console.log(`🎉 BULK IMPORT COMPLETE: ${userBooks.length} books added to library, ${createdBooks.length} new books created`);

    res.json({
      message: `Successfully imported ${userBooks.length} books`,
      books: createdBooks,
      addedToLibrary: userBooks.length,
      totalProcessed: processedCount
    });
  } catch (error) {
    console.error('❌ BULK IMPORT ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to import books',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;