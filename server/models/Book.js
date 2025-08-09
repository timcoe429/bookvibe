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
    unique: true,
    field: 'goodreads_id'
  },
  pages: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  coverUrl: {
    type: DataTypes.STRING,
    field: 'cover_url'
  },
  genre: {
    type: DataTypes.STRING
  },
  mood: {
    type: DataTypes.ENUM('escapist', 'intense', 'thoughtful', 'light'),
    defaultValue: 'escapist'
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'average_rating'
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    field: 'publication_year'
  },
  spineText: {
    type: DataTypes.TEXT,
    field: 'spine_text'
  }
}, {
  tableName: 'books',
  underscored: true,
  indexes: [
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['mood'] },
    { fields: ['goodreads_id'] }
  ]
});

module.exports = Book;
