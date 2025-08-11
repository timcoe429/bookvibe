const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionService = require('../services/googleVisionService');
const claudeVisionService = require('../services/claudeVisionService');
const gpt5VisionService = require('../services/gpt5VisionService');
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

// Helper function to retry GPT-4o with exponential backoff
async function retryGPTWithBackoff(imageBuffer, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 GPT-4o Attempt ${attempt}/${maxRetries}: Starting book detection...`);
      const result = await gpt5VisionService.extractBooksFromImage(imageBuffer);
      console.log(`✅ GPT-4o: Success on attempt ${attempt}!`);
      return { success: true, books: result, serviceName: `GPT-4o Vision (attempt ${attempt})` };
    } catch (error) {
      console.error(`❌ GPT-4o Attempt ${attempt} failed:`, error.message);
      
      // Don't retry on authentication errors
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        console.log('🚫 GPT-4o: Authentication error, not retrying');
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.log(`🚫 GPT-4o: All ${maxRetries} attempts failed`);
        throw error;
      }
      
      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ GPT-4o: Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Helper function to check if we should try Claude (avoid rate limits)
function shouldTryClaud() {
  // Simple rate limiting: only try Claude if we haven't hit it recently
  const lastClaudeAttempt = global.lastClaudeAttempt || 0;
  const timeSinceLastAttempt = Date.now() - lastClaudeAttempt;
  const cooldownPeriod = 60000; // 1 minute cooldown
  
  return timeSinceLastAttempt > cooldownPeriod;
}

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

    let detectedBooks = [];
    let visionServiceName = 'Unknown';
    
    // STEP 1: Try GPT-4o with retries (should handle 99% of cases)
    try {
      const gptResult = await retryGPTWithBackoff(req.file.buffer, 3);
      detectedBooks = gptResult.books;
      visionServiceName = gptResult.serviceName;
    } catch (gpt4oError) {
      console.error('❌ GPT-4o: All retry attempts failed:', gpt4oError.message);
      
      // STEP 2: Only try Claude if we should (rate limit protection)
      if (shouldTryClaud()) {
        try {
          console.log('🔄 FALLBACK: Trying Claude Vision (GPT-4o completely failed)...');
          global.lastClaudeAttempt = Date.now(); // Track attempt time
          detectedBooks = await claudeVisionService.extractBooksFromImage(req.file.buffer);
          console.log('✅ CLAUDE: Success as fallback!');
          visionServiceName = 'Claude Vision API (GPT-4o failed)';
        } catch (claudeError) {
          console.error('❌ CLAUDE: Also failed:', claudeError.message);
          
          // Check if it's a rate limit error
          if (claudeError.message.includes('rate limit') || claudeError.message.includes('429')) {
            console.log('🚫 CLAUDE: Rate limited, will avoid for 1 minute');
            global.lastClaudeAttempt = Date.now(); // Set cooldown
            
            // Return a user-friendly message about trying again
            return res.status(429).json({
              error: 'Our AI services are currently busy. Please wait a moment and try again.',
              suggestion: 'Try again in about 30-60 seconds for best results.',
              retryAfter: 60
            });
          }
          
          // STEP 3: Last resort - Google Vision OCR
          try {
            console.log('🔄 LAST RESORT: Trying Google Vision OCR...');
            const extractedText = await visionService.extractTextFromImage(req.file.buffer);
            
            if (!extractedText || extractedText.length === 0) {
              return res.status(400).json({ 
                error: 'No text found in image',
                suggestion: 'Try taking a clearer photo with better lighting'
              });
            }

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
              mood: 'cozy', // Default mood for OCR-only detection
              spine_text: title
            }));
            visionServiceName = 'Google Vision OCR (final fallback)';
            console.log('✅ GOOGLE: OCR fallback worked');
          } catch (googleError) {
            console.error('❌ ALL SERVICES FAILED:', googleError.message);
            return res.status(500).json({
              error: 'Unable to process the image right now. Please try again in a few minutes.',
              suggestion: 'Make sure the image is clear and book spines are visible.'
            });
          }
        }
      } else {
        // Claude is in cooldown, skip directly to Google Vision
        console.log('🚫 CLAUDE: In cooldown, skipping to Google Vision...');
        
        try {
          const extractedText = await visionService.extractTextFromImage(req.file.buffer);
          const potentialTitles = bookMatchingService.parseBookTitles(extractedText);
          
          if (potentialTitles.length === 0) {
            return res.status(400).json({ 
              error: 'Unable to detect books in this image',
              suggestion: 'Try again in a minute for better AI processing, or ensure book spines are clearly visible'
            });
          }
          
          detectedBooks = potentialTitles.map(title => ({
            title: title,
            author: null,
            mood: 'cozy',
            spine_text: title
          }));
          visionServiceName = 'Google Vision OCR (Claude in cooldown)';
        } catch (googleError) {
          return res.status(500).json({
            error: 'Our AI services are temporarily busy. Please try again in a minute.',
            retryAfter: 60
          });
        }
      }
    }
    
    if (detectedBooks.length === 0) {
      return res.status(400).json({ 
        error: 'No books detected in image',
        suggestion: 'Make sure book spines are clearly visible and facing the camera'
      });
    }

    console.log(`📚 Successfully detected ${detectedBooks.length} books using ${visionServiceName}`);

    // Convert to our app format
    const matchedBooks = detectedBooks.map(detectedBook => ({
      title: detectedBook.title || 'Unknown Title',
      author: detectedBook.author || 'Unknown Author',
      pages: null,
      description: null,
      coverUrl: null,
      genre: null,
      mood: detectedBook.mood || 'cozy',
      averageRating: null,
      publicationYear: null,
      isbn: null,
      spine_text: detectedBook.spine_text,
      source: 'ai_vision',
      id: `ai_${Math.random().toString(36).substr(2, 9)}`
    }));

    res.json({
      success: true,
      message: `Found ${matchedBooks.length} books from your photo`,
      books: matchedBooks,
      processing: {
        detectedByVision: detectedBooks.length,
        totalBooks: matchedBooks.length,
        visionService: visionServiceName,
        timestamp: new Date().toISOString()
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

    // Generic error for anything else
    res.status(500).json({ 
      error: 'Unable to process the photo right now. Please try again.',
      suggestion: 'If the problem persists, try a different photo with clearer book spines.'
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

    // Import books using the bulk import endpoint
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

module.exports = router;
