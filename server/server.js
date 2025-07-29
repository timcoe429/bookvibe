const path = require('path');
const express = require('express');
require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./config/database');

// Simple test endpoints
app.get('/api/test', (req, res) => {
  console.log('🧪 API TEST HIT!');
  res.json({ 
    message: 'BookVibe API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

app.get('/health', (req, res) => {
  console.log('🏥 HEALTH CHECK HIT!');
  res.status(200).json({ status: 'OK', message: 'Server running' });
});

// Add a catch-all to see ALL requests
app.use('*', (req, res, next) => {
  console.log(`📋 INCOMING: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Catch-all for React routing - but EXCLUDE API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    console.log(`📋 Serving React app for: ${req.url}`);
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log(`📂 Looking for index.html at: ${indexPath}`);
    res.sendFile(indexPath);
  });
} else {
  // Development fallback - but EXCLUDE API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    console.log(`📋 Development mode - no React build`);
    res.json({ message: 'API server running', path: req.url });
  });
}

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('🚀 ========== BOOKVIBE SERVER STARTING ==========');
  console.log('📊 Node.js version:', process.version);
  console.log('📊 Environment:', process.env.NODE_ENV || 'development');
  console.log('📊 Port:', PORT);
  console.log('📊 Working directory:', process.cwd());
  
  try {
    console.log('🔌 Connecting to database...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database models (use force: false to preserve existing data)
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database models synchronized');
    
    // Test a simple query
    console.log('🧪 Testing database query...');
    await sequelize.query('SELECT 1 as test');
    console.log('✅ Database query test passed');
    
    // Start server
    console.log('🌐 Starting HTTP server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
      console.log('✅ ========== SERVER STARTED SUCCESSFULLY ==========');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`🚫 Port ${PORT} is already in use`);
      }
    });
    
  } catch (error) {
    console.error('❌ ========== SERVER STARTUP FAILED ==========');
    console.error('❌ Unable to start server:', error);
    console.error('📋 Error name:', error.name);
    console.error('📋 Error message:', error.message);
    console.error('📋 Error code:', error.code);
    if (error.original) {
      console.error('🔍 Original error:', error.original);
    }
    if (error.sql) {
      console.error('🔍 SQL error:', error.sql);
    }
    console.error('📋 Full error stack:', error.stack);
    process.exit(1);
  }
}

startServer();
