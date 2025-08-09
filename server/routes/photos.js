const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionService = require('../services/googleVisionService');
const claudeVisionService = require('../services/claudeVisionService');
const bookMatchingService = require('../services/bookMatchingService');

// Simple debug endpoint to check environment variables
router.get('/debug-env', (req, res) => {
  res.json({
    hasClaudeApiKey: !!process.env.CLAUDE_API_KEY,
    hasGoogleApiKey: !!process.env.GOOGLE_CLOUD_VISION_API_KEY,
    hasGoogleCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    hasGoogleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT,
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

    // Step 1: Extract books from image using Claude Vision API
    console.log('Processing image with Claude Vision API...');
    let detectedBooks = [];
    
    try {
      console.log('🚀 STARTING: Claude Vision book detection...');
      detectedBooks = await claudeVisionService.extractBooksFromImage(req.file.buffer);
      console.log('✅ CLAUDE: Detection completed successfully');
    } catch (claudeError) {
      console.error('❌ CLAUDE: Vision failed, falling back to Google Vision:', claudeError);
      
      // Fallback to Google Vision if Claude fails
      const extractedText = await visionService.extractTextFromImage(req.file.buffer);
      
      if (!extractedText || extractedText.length === 0) {
        return res.status(400).json({ 
          error: 'No text found in image',
          suggestion: 'Try taking a clearer photo with better lighting'
        });
      }

      // Parse potential book titles from extracted text
      const potentialTitles = bookMatchingService.parseBookTitles(extractedText);
      
      if (potentialTitles.length === 0) {
        return res.status(400).json({ 
          error: 'No book titles detected',
          extractedText: extractedText.slice(0, 500),
          suggestion: 'Make sure book spines are clearly visible and facing the camera'
        });
      }
      
      // Convert to book format for consistency
      detectedBooks = potentialTitles.map(title => ({
        title: title,
        author: null,
        spine_text: title
      }));
    }
    
    if (detectedBooks.length === 0) {
      return res.status(400).json({ 
        error: 'No books detected in image',
        suggestion: 'Make sure book spines are clearly visible and facing the camera'
      });
    }

    console.log(`Claude detected ${detectedBooks.length} books in the image`);
    console.log('Detected books:', JSON.stringify(detectedBooks, null, 2));

    // Step 2: Match detected books against book databases to get metadata
    console.log(`Matching ${detectedBooks.length} detected books against databases...`);
    const matchedBooks = [];
    const failedMatches = [];
    const seenISBNs = new Set();
    const seenTitles = new Set();

    for (const detectedBook of detectedBooks.slice(0, 30)) { // Increased limit since Claude is more accurate
      try {
        // Use title and author if available for better matching
        const searchQuery = detectedBook.author 
          ? `${detectedBook.title} ${detectedBook.author}`
          : detectedBook.title;
        
        console.log(`🔍 SEARCHING for: "${searchQuery}"`);
        let bookData = await bookMatchingService.findBookByTitle(searchQuery);
        
        // If no match with full query, try just the title
        if (!bookData && detectedBook.author) {
          console.log(`🔍 RETRY SEARCH (title only): "${detectedBook.title}"`);
          bookData = await bookMatchingService.findBookByTitle(detectedBook.title);
        }
        
        console.log(`📖 SEARCH RESULT: ${bookData ? 'FOUND' : 'NOT FOUND'} - "${searchQuery}"`);
        
        if (bookData) {
          // Deduplicate by ISBN and normalized title
          const normalizedTitle = bookMatchingService.normalizeTitle(bookData.title);
          const isDuplicate = (bookData.isbn && seenISBNs.has(bookData.isbn)) || 
                              seenTitles.has(normalizedTitle);
          
          if (!isDuplicate) {
            // Preserve original detected info if metadata lookup differs
            const enrichedBook = {
              ...bookData,
              detected_title: detectedBook.title,
              detected_author: detectedBook.author,
              spine_text: detectedBook.spine_text
            };
            matchedBooks.push(enrichedBook);
            if (bookData.isbn) seenISBNs.add(bookData.isbn);
            seenTitles.add(normalizedTitle);
          }
        } else {
          console.log(`❌ FAILED to match: "${detectedBook.title}" by ${detectedBook.author}`);
          
          // For Claude-detected books, create a basic entry even if no database match
          const basicBook = {
            title: detectedBook.title,
            author: detectedBook.author || 'Unknown Author',
            pages: null,
            description: `Detected from book spine: ${detectedBook.spine_text}`,
            coverUrl: null,
            genre: null,
            mood: 'thoughtful', // Default for academic books
            averageRating: null,
            publicationYear: null,
            isbn: null,
            detected_title: detectedBook.title,
            detected_author: detectedBook.author,
            spine_text: detectedBook.spine_text,
            source: 'claude_vision'
          };
          
          matchedBooks.push(basicBook);
          
          failedMatches.push({
            title: detectedBook.title,
            author: detectedBook.author,
            reason: 'No database match - using detected info'
          });
        }
      } catch (error) {
        console.error(`Error matching book "${detectedBook.title}":`, error);
        failedMatches.push({
          title: detectedBook.title,
          author: detectedBook.author,
          reason: error.message
        });
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
      detectedBooks: detectedBooks.length,
      processing: {
        detectedByVision: detectedBooks.length,
        successfulMatches: matchedBooks.length,
        failedMatches: failedMatches.length,
        visionService: 'Claude Vision API'
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

    // Test Claude Vision
    let claudeResult = null;
    let claudeError = null;
    try {
      claudeResult = await claudeVisionService.extractBooksFromImage(req.file.buffer);
    } catch (err) {
      claudeError = err.message;
    }

    // Test Google Vision
    let googleResult = null;
    let googleError = null;
    try {
      const extractedText = await visionService.extractTextFromImage(req.file.buffer);
      const potentialTitles = bookMatchingService.parseBookTitles(extractedText);
      googleResult = {
        extractedText: extractedText.slice(0, 500),
        potentialTitles,
        textLength: extractedText.length,
        titlesFound: potentialTitles.length
      };
    } catch (err) {
      googleError = err.message;
    }

    res.json({
      claude: {
        success: !claudeError,
        error: claudeError,
        books: claudeResult,
        bookCount: claudeResult ? claudeResult.length : 0
      },
      google: {
        success: !googleError,
        error: googleError,
        result: googleResult
      }
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
