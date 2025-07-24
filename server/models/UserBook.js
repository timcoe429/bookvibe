const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Book = require('./Book');

const UserBook = sequelize.define('UserBook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  bookId: {
    type: DataTypes.INTEGER,
    references: {
      model: Book,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('to-read', 'reading', 'read', 'dnf'),
    defaultValue: 'to-read'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  dateAdded: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dateStarted: {
    type: DataTypes.DATE
  },
  dateFinished: {
    type: DataTypes.DATE
  },
  source: {
    type: DataTypes.ENUM('goodreads', 'photo', 'manual'),
    defaultValue: 'manual'
  }
});

// Associations
User.belongsToMany(Book, { through: UserBook });
Book.belongsToMany(User, { through: UserBook });
UserBook.belongsTo(User);
UserBook.belongsTo(Book);

module.exports = UserBook;
