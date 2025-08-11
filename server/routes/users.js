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

// Create new account endpoint
router.post('/create-account', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Login ID and password required' });
    }
    
    // Check if loginId already exists
    const existingUser = await User.findOne({ where: { goodreadsUserId: loginId } });
    if (existingUser) {
      return res.status(400).json({ error: 'This login ID is already taken. Please choose a different one.' });
    }
    
    // Create new user with a session ID for backward compatibility
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      sessionId: sessionId,
      goodreadsUserId: loginId, // Store loginId here
      passwordHash: passwordHash, // Store password in proper field
      stats: {
        booksThisYear: 0,
        totalBooks: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      preferences: {
        favoriteGenres: [],
        readingGoal: 52,
        preferredMoods: ['cozy']
      }
    });
    
    // Create simple token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      loginId: loginId,
      sessionId: user.sessionId,
      loginTime: Date.now()
    })).toString('base64');
    
    res.json({
      success: true,
      message: `Welcome to BookVibe, ${loginId}! Your library is ready.`,
      token: token,
      user: {
        id: user.id,
        loginId: loginId,
        sessionId: user.sessionId
      }
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Simple login endpoint 
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Login ID and password required' });
    }
    
    // Find user by loginId
    const user = await User.findOne({ where: { goodreadsUserId: loginId } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    
    // Check if user has a password set
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'No password set for this user' });
    }
    
    // Verify password
    const bcrypt = require('bcryptjs');
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    
    // Create simple token (just user info, no JWT complexity for now)
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      loginId: loginId,
      sessionId: user.sessionId,
      loginTime: Date.now()
    })).toString('base64');
    
    res.json({
      success: true,
      message: `Welcome back, ${loginId}!`,
      token: token,
      user: {
        id: user.id,
        loginId: loginId,
        sessionId: user.sessionId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// DEBUG: Set password for a user (add this before the user-summary route)
router.post('/debug/set-password', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
      return res.status(400).json({ error: 'loginId and password required' });
    }
    
    // Find user by loginId (check both goodreads_user_id field and exact match)
    let user = await User.findOne({ where: { goodreadsUserId: loginId } });
    
    // If not found, also try to find user where goodreads_user_id contains the loginId
    if (!user) {
      user = await User.findOne({ 
        where: { 
          goodreadsUserId: { [require('sequelize').Op.iLike]: `%${loginId}%` } 
        } 
      });
    }
    
    if (!user) {
      // Let's also check if there's a user with this sessionId pattern or created recently
      console.log(`🔍 Looking for user with loginId: ${loginId}`);
      const allUsers = await User.findAll({ 
        limit: 10, 
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'sessionId', 'goodreadsUserId', 'createdAt']
      });
      console.log('📋 Recent users found:', JSON.stringify(allUsers, null, 2));
      
      return res.status(404).json({ 
        error: `User not found with loginId: ${loginId}`,
        debug: {
          searchedFor: loginId,
          recentUsers: allUsers.map(u => ({
            id: u.id,
            sessionId: u.sessionId,
            goodreadsUserId: u.goodreadsUserId,
            createdAt: u.createdAt
          }))
        }
      });
    }
    
    // Hash password (simple for now)
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Store password hash in the proper password_hash field
    await user.update({
      passwordHash: passwordHash
    });
    
    res.json({
      success: true,
      message: `Password set for ${loginId}`,
      user: {
        id: user.id,
        loginId: loginId,
        sessionId: user.sessionId,
        hasPassword: true
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG: Show all users with book counts to find her session
// Protected from crawlers and indexing
router.get('/debug/user-summary', async (req, res) => {
  try {
    // Prevent caching and indexing
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
      'Robots': 'noindex, nofollow'
    });
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
