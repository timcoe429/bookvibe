const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserBook = require('../models/UserBook');
const Book = require('../models/Book');
const { Op } = require('sequelize');

// Get or create user by session ID
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    let user = await User.findOne({ where: { sessionId } });
    
    if (!user) {
      user = await User.create({ 
        sessionId,
        preferences: {
          favoriteGenres: [],
          readingGoal: 52,
          preferredMoods: ['cozy']
        },
        stats: {
          booksThisYear: 0,
          totalBooks: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting/creating user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user's reading statistics
router.get('/:sessionId/stats', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate real-time stats
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    
    const booksThisYear = await UserBook.count({
      where: {
        userId: user.id,
        status: 'read',
        dateFinished: { [Op.gte]: yearStart }
      }
    });

    const totalBooks = await UserBook.count({
      where: {
        userId: user.id,
        status: 'read'
      }
    });

    const inQueue = await UserBook.count({
      where: {
        userId: user.id,
        status: 'to-read'
      }
    });

    const currentlyReading = await UserBook.count({
      where: {
        userId: user.id,
        status: 'reading'
      }
    });

    // Update user stats
    await user.update({
      stats: {
        ...user.stats,
        booksThisYear,
        totalBooks
      }
    });

    const statsResponse = {
      booksThisYear,
      totalBooks,
      inQueue,
      currentlyReading,
      readingStreak: user.stats.currentStreak || 0,
      readingGoal: user.preferences.readingGoal || 52,
      progressToGoal: Math.round((booksThisYear / (user.preferences.readingGoal || 52)) * 100)
    };
    
    res.json(statsResponse);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get user's books with optional filters
router.get('/:sessionId/books', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, mood, limit, offset } = req.query;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = { userId: user.id };
    if (status) whereClause.status = status;

    const bookWhereClause = {};
    if (mood) bookWhereClause.mood = mood;

    const userBooks = await UserBook.findAll({
      where: whereClause,
      include: [{
        model: Book,
        where: Object.keys(bookWhereClause).length > 0 ? bookWhereClause : undefined,
        required: true
      }],
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      order: [['dateAdded', 'DESC']]
    });

    const booksWithStatus = userBooks.map(ub => ({
      ...ub.Book.toJSON(),
      userStatus: ub.status,
      dateAdded: ub.dateAdded,
      dateStarted: ub.dateStarted,
      dateFinished: ub.dateFinished,
      rating: ub.rating,
      source: ub.source
    }));

    res.json(booksWithStatus);
  } catch (error) {
    console.error('Error getting user books:', error);
    res.status(500).json({ error: 'Failed to get user books' });
  }
});

// Add book to user's library
router.post('/:sessionId/books', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { bookId, status = 'to-read', source = 'manual' } = req.body;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book is already in user's library
    let userBook = await UserBook.findOne({
      where: { userId: user.id, bookId }
    });

    if (userBook) {
      // Update existing entry
      await userBook.update({ status, source });
    } else {
      // Create new entry
      userBook = await UserBook.create({
        userId: user.id,
        bookId,
        status,
        source,
        dateAdded: new Date()
      });
    }

    const bookWithStatus = {
      ...book.toJSON(),
      userStatus: userBook.status,
      dateAdded: userBook.dateAdded,
      source: userBook.source
    };

    res.json(bookWithStatus);
  } catch (error) {
    console.error('Error adding book to user library:', error);
    res.status(500).json({ error: 'Failed to add book to library' });
  }
});

// Update book status in user's library
router.put('/:sessionId/books/:bookId', async (req, res) => {
  try {
    const { sessionId, bookId } = req.params;
    const { status, rating } = req.body;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBook = await UserBook.findOne({
      where: { userId: user.id, bookId },
      include: [Book]
    });

    if (!userBook) {
      return res.status(404).json({ error: 'Book not found in user library' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      
      // Set dates based on status changes
      if (status === 'reading' && !userBook.dateStarted) {
        updateData.dateStarted = new Date();
      } else if (status === 'read' && !userBook.dateFinished) {
        updateData.dateFinished = new Date();
      }
    }
    
    if (rating) {
      updateData.rating = rating;
    }

    await userBook.update(updateData);

    const bookWithStatus = {
      ...userBook.Book.toJSON(),
      userStatus: userBook.status,
      dateAdded: userBook.dateAdded,
      dateStarted: userBook.dateStarted,
      dateFinished: userBook.dateFinished,
      rating: userBook.rating,
      source: userBook.source
    };

    res.json(bookWithStatus);
  } catch (error) {
    console.error('Error updating book status:', error);
    res.status(500).json({ error: 'Failed to update book status' });
  }
});

// Update user preferences
router.put('/:sessionId/preferences', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const preferences = req.body;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      preferences: { ...user.preferences, ...preferences }
    });

    res.json(user.preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Connect Goodreads account
router.post('/:sessionId/connect-goodreads', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { goodreadsUserId, goodreadsAccessToken } = req.body;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      goodreadsUserId,
      goodreadsAccessToken
    });

    // Here you would trigger a background job to import Goodreads data
    // For now, we'll just acknowledge the connection
    
    res.json({ 
      message: 'Goodreads account connected successfully',
      goodreadsUserId 
    });
  } catch (error) {
    console.error('Error connecting Goodreads:', error);
    res.status(500).json({ error: 'Failed to connect Goodreads account' });
  }
});

// Delete book from user's library
router.delete('/:sessionId/books/:bookId', async (req, res) => {
  try {
    const { sessionId, bookId } = req.params;
    
    const user = await User.findOne({ where: { sessionId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deleted = await UserBook.destroy({
      where: { userId: user.id, bookId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Book not found in user library' });
    }

    res.json({ message: 'Book removed from library' });
  } catch (error) {
    console.error('Error removing book from library:', error);
    res.status(500).json({ error: 'Failed to remove book from library' });
  }
});

// DEBUG: Show all users with book counts to find her session
router.get('/debug/user-summary', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'sessionId', 'createdAt'],
      order: [['id', 'ASC']]
    });
    
    const summary = [];
    
    for (const user of users) {
      const bookCount = await UserBook.count({ where: { userId: user.id } });
      summary.push({
        id: user.id,
        sessionId: user.sessionId,
        bookCount: bookCount,
        createdAt: user.createdAt
      });
    }
    
    res.json({
      message: 'All users with book counts',
      users: summary,
      tip: 'Look for the user with ~107 books - that\'s her sessionId!'
    });
  } catch (error) {
    console.error('Debug user summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
