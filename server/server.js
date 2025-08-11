const path = require('path');
const express = require('express');
require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./config/database');

// DIRECT API TEST - bypassing all other routing
app.get('/api/vision-test', async (req, res) => {
  try {
    // Test environment variables
    const envCheck = {
      hasClaudeApiKey: !!process.env.CLAUDE_API_KEY,
      hasGoogleApiKey: !!process.env.GOOGLE_CLOUD_VISION_API_KEY,
      hasGoogleCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      hasGoogleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT,
      nodeEnv: process.env.NODE_ENV || 'not set'
    };

    // Test Claude Vision service
    let claudeCheck = { initialized: false, error: null, apiTest: { success: false, error: null } };
    try {
      const claudeService = require('./services/claudeVisionService');
      claudeCheck.initialized = true;
      
      // Skip API test for Claude (requires real image with books)
      claudeCheck.apiTest.skipped = true;
      claudeCheck.apiTest.message = 'Claude Vision requires a real book image to test';
    } catch (error) {
      claudeCheck.error = error.message;
    }

    // Test Google Vision service
    let googleCheck = { initialized: false, error: null, apiTest: { success: false, error: null } };
    try {
      const visionService = require('./services/googleVisionService');
      googleCheck.initialized = true;
      
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      );
      
      try {
        const result = await visionService.extractTextFromImage(testImageBuffer);
        googleCheck.apiTest.success = true;
        googleCheck.apiTest.result = 'API call successful';
      } catch (apiError) {
        googleCheck.apiTest.error = apiError.message;
      }
    } catch (error) {
      googleCheck.error = error.message;
    }

    res.json({
      message: 'VISION API TEST RESULTS',
      environment: envCheck,
      claude: claudeCheck,
      google: googleCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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

// Health check alias under /api to match client base URL
app.get('/api/health', (req, res) => {
  console.log('🏥 API HEALTH CHECK HIT!');
  res.status(200).json({ status: 'OK', message: 'Server running' });
});

// Robots.txt to block ALL crawlers from ENTIRE site
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /

# Block AI crawlers specifically  
User-agent: ChatGPT-User
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Bingbot
Disallow: /

User-agent: Slurp
Disallow: /`);
});

// Add a catch-all logger to see ALL requests (before static/SPA serving)
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

// Final 404 handler for unmatched routes (API only)
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

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
