const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionService = require('../services/googleVisionService');
const bookMatchingService = require('../services/bookMatchingService');

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

module.exports = router;
