const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const User = require('../models/User');
const bookService = require('../services/bookMatchingService');

// Get book recommendations based on mood and user preferences
router.get('/recommendations', async (req, res) => {
  try {
    const { sessionId, mood = 'escapist', limit = 1 } = req.query;
    
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
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'Books array required' });
    }

    // Find or create user
    let user = await User.findOne({ where: { sessionId } });
    if (!user) {
      user = await User.create({ sessionId });
    }

    const createdBooks = [];
    const userBooks = [];

    for (const bookData of books) {
      try {
        // Try to find book by title and author first
        let book = await Book.findOne({
          where: {
            title: { [require('sequelize').Op.iLike]: bookData.title },
            author: { [require('sequelize').Op.iLike]: bookData.author }
          }
        });

        if (!book) {
          // Try to enrich book data from external APIs
          const enrichedData = await bookService.enrichBookData(bookData);
          book = await Book.create(enrichedData);
        }

        createdBooks.push(book);

        // Add to user's library if not already there
        const existingUserBook = await UserBook.findOne({
          where: { userId: user.id, bookId: book.id }
        });

        if (!existingUserBook) {
          const userBook = await UserBook.create({
            userId: user.id,
            bookId: book.id,
            status: 'to-read',
            source: 'photo'
          });
          userBooks.push(userBook);
        }
      } catch (bookError) {
        console.error(`Error processing book ${bookData.title}:`, bookError);
        // Continue with other books
      }
    }

    res.json({
      message: `Successfully imported ${createdBooks.length} books`,
      books: createdBooks,
      addedToLibrary: userBooks.length
    });
  } catch (error) {
    console.error('Error bulk importing books:', error);
    res.status(500).json({ error: 'Failed to import books' });
  }
});

module.exports = router;
