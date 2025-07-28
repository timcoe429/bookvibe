const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionService = require('../services/googleVisionService');
const bookMatchingService = require('../services/bookMatchingService');

// Simple debug endpoint to check environment variables
router.get('/debug-env', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GOOGLE_CLOUD_VISION_API_KEY,
    hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT,
    nodeEnv: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString()
  });
});

// Browser-friendly debug page
router.get('/debug-page', async (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Google Vision API Debug</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .success { background-color: #d4edda; border-color: #c3e6cb; }
            .error { background-color: #f8d7da; border-color: #f5c6cb; }
            .info { background-color: #d1ecf1; border-color: #bee5eb; }
            pre { background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>Google Vision API Debug Results</h1>
        <p>Generated at: ${new Date().toISOString()}</p>
  `;

  // Test 1: Environment Variables
  const envCheck = {
    hasApiKey: !!process.env.GOOGLE_CLOUD_VISION_API_KEY,
    hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT,
    nodeEnv: process.env.NODE_ENV || 'not set'
  };

  html += `
        <div class="test ${envCheck.hasCredentialsJson ? 'success' : 'error'}">
            <h2>🔧 Environment Variables</h2>
            <p><strong>GOOGLE_APPLICATION_CREDENTIALS_JSON:</strong> ${envCheck.hasCredentialsJson ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>GOOGLE_CLOUD_VISION_API_KEY:</strong> ${envCheck.hasApiKey ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>GOOGLE_CLOUD_PROJECT:</strong> ${envCheck.hasProjectId ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>NODE_ENV:</strong> ${envCheck.nodeEnv}</p>
        </div>
  `;

  // Test 2: Service Initialization
  let serviceCheck = { initialized: false, error: null };
  try {
    const testVisionService = require('../services/googleVisionService');
    serviceCheck.initialized = true;
  } catch (error) {
    serviceCheck.error = error.message;
  }

  html += `
        <div class="test ${serviceCheck.initialized ? 'success' : 'error'}">
            <h2>⚙️ Service Initialization</h2>
            ${serviceCheck.initialized 
              ? '<p>✅ Google Vision service initialized successfully</p>' 
              : `<p>❌ Failed to initialize service</p><pre>${serviceCheck.error}</pre>`
            }
        </div>
  `;

  // Test 3: API Call Test
  let apiCheck = { success: false, error: null };
  try {
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const visionService = require('../services/googleVisionService');
    const result = await visionService.extractTextFromImage(testImageBuffer);
    apiCheck.success = true;
    apiCheck.result = 'API call successful';
  } catch (error) {
    apiCheck.error = error.message;
    apiCheck.errorCode = error.code;
  }

  html += `
        <div class="test ${apiCheck.success ? 'success' : 'error'}">
            <h2>🔍 API Test Call</h2>
            ${apiCheck.success 
              ? '<p>✅ Google Vision API call successful!</p>' 
              : `<p>❌ API call failed</p>
                 <p><strong>Error:</strong> ${apiCheck.error}</p>
                 <p><strong>Error Code:</strong> ${apiCheck.errorCode || 'N/A'}</p>`
            }
        </div>
  `;

  // Test 4: Photo Upload Form
  html += `
        <div class="test info">
            <h2>📸 Test Photo Upload</h2>
            <p>Use this form to test actual photo upload:</p>
            <form action="/api/photos/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="photo" accept="image/*" required>
                <input type="hidden" name="sessionId" value="debug-test">
                <br><br>
                <button type="submit">Upload Test Photo</button>
            </form>
        </div>
  `;

  html += `
    </body>
    </html>
  `;

  res.send(html);
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload and process photo for book detection
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Step 1: Extract text from image using Google Vision API
    console.log('Processing image with Google Vision API...');
    const extractedText = await visionService.extractTextFromImage(req.file.buffer);
    
    if (!extractedText || extractedText.length === 0) {
      return res.status(400).json({ 
        error: 'No text found in image',
        suggestion: 'Try taking a clearer photo with better lighting'
      });
    }

    // Step 2: Parse potential book titles from extracted text
    console.log('Parsing book titles from extracted text...');
    const potentialTitles = bookMatchingService.parseBookTitles(extractedText);
    
    if (potentialTitles.length === 0) {
      return res.status(400).json({ 
        error: 'No book titles detected',
        extractedText: extractedText.slice(0, 500), // Return sample for debugging
        suggestion: 'Make sure book spines are clearly visible and facing the camera'
      });
    }

    // Step 3: Match titles against book databases
    console.log(`Found ${potentialTitles.length} potential titles, matching against databases...`);
    const matchedBooks = [];
    const failedMatches = [];

    for (const title of potentialTitles.slice(0, 20)) { // Limit to first 20 to avoid rate limits
      try {
        const bookData = await bookMatchingService.findBookByTitle(title);
        if (bookData) {
          matchedBooks.push(bookData);
        } else {
          failedMatches.push(title);
        }
      } catch (error) {
        console.error(`Error matching book "${title}":`, error);
        failedMatches.push(title);
      }
      
      // Small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Successfully matched ${matchedBooks.length} books`);

    res.json({
      success: true,
      message: `Found ${matchedBooks.length} books from your photo`,
      books: matchedBooks,
      failedMatches: failedMatches.slice(0, 10), // Return sample of failed matches
      totalPotentialTitles: potentialTitles.length,
      processing: {
        extractedTextLength: extractedText.length,
        potentialTitlesFound: potentialTitles.length,
        successfulMatches: matchedBooks.length,
        failedMatches: failedMatches.length
      }
    });

  } catch (error) {
    console.error('Error processing photo upload:', error);
    
    if (error.message.includes('Only image files')) {
      return res.status(400).json({ error: 'Please upload a valid image file' });
    }
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({ error: 'Image file is too large. Please use an image under 10MB.' });
    }

    res.status(500).json({ 
      error: 'Failed to process photo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Process and confirm books from photo upload
router.post('/confirm-books', async (req, res) => {
  try {
    const { sessionId, books, selectedBooks } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!Array.isArray(selectedBooks) || selectedBooks.length === 0) {
      return res.status(400).json({ error: 'No books selected for import' });
    }

    // Filter books to only include selected ones
    const booksToImport = books.filter(book => 
      selectedBooks.includes(book.id) || selectedBooks.includes(book.title)
    );

    if (booksToImport.length === 0) {
      return res.status(400).json({ error: 'Selected books not found in original list' });
    }

    // Import books using the bulk import endpoint - use axios instead of fetch
    const axios = require('axios');
    const importResponse = await axios.post(`${req.protocol}://${req.get('host')}/api/books/bulk-import`, {
      books: booksToImport,
      sessionId
    });

    if (importResponse.status !== 200) {
      throw new Error('Failed to import books');
    }

    const importResult = importResponse.data;

    res.json({
      success: true,
      message: `Successfully added ${importResult.addedToLibrary} books to your library`,
      importedBooks: importResult.books,
      totalImported: importResult.addedToLibrary
    });

  } catch (error) {
    console.error('Error confirming books from photo:', error);
    res.status(500).json({ 
      error: 'Failed to confirm and import books',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get supported image formats and limits
router.get('/upload-info', (req, res) => {
  res.json({
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: '10MB',
    recommendations: [
      'Take photos in good lighting',
      'Ensure book spines are clearly visible',
      'Keep the camera steady',
      'Avoid shadows and glare',
      'Position books so titles are readable'
    ],
    tips: [
      'Horizontal book spines work best',
      'Multiple books in one photo is fine',
      'Close-up shots give better results than wide shots'
    ]
  });
});

// Test endpoint for development
router.post('/test-vision', upload.single('photo'), async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const extractedText = await visionService.extractTextFromImage(req.file.buffer);
    const potentialTitles = bookMatchingService.parseBookTitles(extractedText);

    res.json({
      extractedText,
      potentialTitles,
      textLength: extractedText.length,
      titlesFound: potentialTitles.length
    });

  } catch (error) {
    console.error('Error in test vision endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test Google Vision API configuration
router.get('/debug-vision', async (req, res) => {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      hasApiKey: !!process.env.GOOGLE_CLOUD_VISION_API_KEY,
      hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT,
      nodeEnv: process.env.NODE_ENV
    };

    // Test 2: Try to initialize the service
    let serviceCheck = { initialized: false, error: null };
    try {
      const testVisionService = require('../services/googleVisionService');
      serviceCheck.initialized = true;
    } catch (error) {
      serviceCheck.error = error.message;
    }

    // Test 3: Try a simple API call with a test image (small base64 encoded image)
    let apiCheck = { success: false, error: null };
    try {
      // Create a simple 1x1 pixel PNG in base64
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      );
      
      const visionService = require('../services/googleVisionService');
      const result = await visionService.extractTextFromImage(testImageBuffer);
      apiCheck.success = true;
      apiCheck.result = 'API call successful (no text expected in test image)';
    } catch (error) {
      apiCheck.error = error.message;
      apiCheck.errorCode = error.code;
      apiCheck.errorDetails = error.details;
    }

    res.json({
      environment: envCheck,
      service: serviceCheck,
      apiTest: apiCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in debug vision endpoint:', error);
    res.status(500).json({ 
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
