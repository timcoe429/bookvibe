const path = require('path');
const express = require('express');
require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./config/database');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Health check endpoint (in addition to the one in app.js)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔌 Connecting to database...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database models (use force: false to preserve existing data)
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database models synchronized');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    console.error('📋 Error details:', error.message);
    if (error.original) {
      console.error('🔍 Original error:', error.original.message);
    }
    process.exit(1);
  }
}

startServer();
