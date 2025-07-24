const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  goodreadsUserId: {
    type: DataTypes.STRING,
    unique: true
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      favoriteGenres: [],
      readingGoal: 52,
      preferredMoods: ['escapist']
    }
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      booksThisYear: 0,
      totalBooks: 0,
      currentStreak: 0,
      longestStreak: 0
    }
  }
});

module.exports = User;
