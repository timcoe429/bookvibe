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
    allowNull: false,
    field: 'session_id'
  },
  goodreadsUserId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'goodreads_user_id'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      favoriteGenres: [],
      readingGoal: 52,
      preferredMoods: ['cozy']
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
}, {
  tableName: 'users',
  underscored: true
});

module.exports = User;
