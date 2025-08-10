const axios = require('axios');

class GPT5VisionService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
    }
  }

  getMediaType(buffer) {
    const signature = buffer.toString('hex', 0, 4);
    if (signature.startsWith('ffd8')) return 'image/jpeg';
    if (signature.startsWith('8950')) return 'image/png';
    if (signature.startsWith('4749')) return 'image/gif';
    if (signature.startsWith('5249')) return 'image/webp';
    return 'image/jpeg'; // Default fallback
  }

  async countBooks(imageBuffer) {
    const base64Image = imageBuffer.toString('base64');
    const mediaType = this.getMediaType(imageBuffer);
    
    const response = await axios.post(
      this.apiUrl,
      {
        model: 'gpt-4o',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: `This is a photograph of physical books on a bookshelf. Count how many individual book spines you can see.

COUNTING INSTRUCTIONS:
- Books may be standing vertically or lying horizontally
- If standing vertically: scan from LEFT to RIGHT
- If lying horizontally: scan from TOP to BOTTOM
- Each distinct spine represents one book
- Look for spine boundaries, title text, and thickness variations
- Count ALL visible spines, even if partially obscured
- Be thorough and methodical

Respond with ONLY the number of distinct book spines you can identify.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    console.log('📊 GPT-5 book count response:', content);
    
    // Extract number from response
    const count = parseInt(content.match(/\d+/)?.[0] || '0');
    return Math.max(1, count); // Ensure at least 1 book
  }

  async extractBooksFromImage(imageBuffer) {
    try {
      console.log('🔍 Starting GPT-5 book extraction...');
      
      // Step 1: Count books
      const expectedCount = await this.countBooks(imageBuffer);
      console.log(`📚 GPT-5 detected ${expectedCount} books`);
      
      // Step 2: Extract book details with count context
      const books = await this.extractWithCount(imageBuffer, expectedCount);
      
      console.log(`✅ GPT-5 extraction complete: ${books.length} books`);
      return books;
    } catch (error) {
      console.error('❌ GPT-5 vision error:', error.response?.data || error.message);
      throw new Error(`GPT-5 Vision API error: ${error.message}`);
    }
  }

  async extractWithCount(imageBuffer, expectedCount) {
    const base64Image = imageBuffer.toString('base64');
    const mediaType = this.getMediaType(imageBuffer);
    
    const response = await axios.post(
      this.apiUrl,
      {
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: `This is a photograph of ${expectedCount} physical books on a bookshelf with their spines visible. You need to identify ALL ${expectedCount} books.

BOOK DETECTION STRATEGY:
1. Determine orientation: Are books standing vertically or lying horizontally?
2. Scan systematically:
   - If VERTICAL (standing): examine from LEFT to RIGHT
   - If HORIZONTAL (lying flat): examine from TOP to BOTTOM
3. Look for spine boundaries to distinguish individual books
4. Extract text from each spine carefully

TASK: Identify each of the ${expectedCount} book spines and extract:

1. TITLE: Complete title as shown on spine (including subtitles)
2. AUTHOR: Full author name if visible on spine
3. MOOD: Classify based on title/content as: "escapist", "intense", "thoughtful", or "light"
   - escapist: Fiction, romance, fantasy, adventure, mysteries, novels
   - intense: Thrillers, horror, dark topics, serious drama, true crime
   - thoughtful: Non-fiction, philosophy, memoirs, self-help, spirituality, psychology, personal development
   - light: Comedy, humor, light romance, feel-good stories, entertainment

CRITICAL REQUIREMENTS:
- Return exactly ${expectedCount} books
- Only extract text actually visible on spines
- Read complete titles, not partial text
- If author unclear, use null
- Work systematically to avoid missing books

MOOD CLASSIFICATION EXAMPLES:
- Business books like "Good to Great" = thoughtful
- Self-help like "Soul without Shame" = thoughtful  
- Psychology like "The Enneagram" = thoughtful
- Spirituality like "Awake in the Wild" = thoughtful
- Science books like "Chaos" = thoughtful
- History like "Tutankhamun" = thoughtful
- Fiction novels like "Waiting", "March", "A Week in December" = escapist
- Thrillers/crime like "L.A. Dead" = intense
- Humor/comedy like "You Suck", "A Spot of Bother", "Snow in May" = light
- Travel stories like "Unsavory Elements", "A Time of Gifts" = light
- Nature writing like "Landmarks", "A Year on the Wing" = escapist

CRITICAL MOOD ASSIGNMENTS:
- "You Suck" by Christopher Moore = light (humor/comedy)
- "A Spot of Bother" by Mark Haddon = light (comedy)
- "Waiting" by Ha Jin = escapist (literary fiction)
- "L.A. Dead" by Stuart Woods = intense (thriller)
- "March" by Geraldine Brooks = escapist (historical fiction)
- "Landmarks" by Robert Macfarlane = escapist (nature writing)
- "Harvest" by Jim Crace = escapist (literary fiction)

Return JSON array in this exact format:
[
  {"title": "Complete Book Title", "author": "Full Author Name or null", "mood": "thoughtful"},
  {"title": "Next Book Title", "author": "Author Name or null", "mood": "escapist"},
  ... (exactly ${expectedCount} books)
]

CRITICAL: Analyze each title carefully and assign the most appropriate mood based on the content type.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();
    console.log('📖 GPT-4o full extraction response:', content);
    
    // Log each individual mood assignment for debugging
    console.log('🎭 MOOD DEBUG - Raw GPT-4o response content:');
    console.log(content);
    
    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in GPT-5 response');
    }
    
    const books = JSON.parse(jsonMatch[0]);
    console.log(`📚 Parsed ${books.length} books from GPT-5 response`);
    
    // Debug each book's mood assignment
    books.forEach((book, index) => {
      console.log(`🎭 Book ${index + 1}: "${book.title}" = mood: "${book.mood}"`);
    });
    
    return books;
  }
}

module.exports = new GPT5VisionService();
