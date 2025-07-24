const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING,
    unique: true
  },
  goodreadsId: {
    type: DataTypes.STRING,
    unique: true
  },
  pages: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  coverUrl: {
    type: DataTypes.STRING
  },
  genre: {
    type: DataTypes.STRING
  },
  mood: {
    type: DataTypes.ENUM('escapist', 'intense', 'thoughtful', 'light'),
    defaultValue: 'escapist'
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2)
  },
  publicationYear: {
    type: DataTypes.INTEGER
  }
}, {
  indexes: [
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['mood'] },
    { fields: ['goodreadsId'] }
  ]
});

module.exports = Book;
