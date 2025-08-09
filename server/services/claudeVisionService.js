const axios = require('axios');

class ClaudeVisionService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
  }

  async extractBooksFromImage(imageBuffer) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please set CLAUDE_API_KEY environment variable.');
    }
    
    try {
      console.log('🔍 CLAUDE: Using multi-step book detection...');
      
      // Step 1: Count books first
      const bookCount = await this.countBooks(imageBuffer);
      console.log(`🔢 CLAUDE: Counted ${bookCount} books in the image`);
      
      // Step 2: Extract each book with the count as context
      const books = await this.extractWithCount(imageBuffer, bookCount);
      
      return books;
      
    } catch (error) {
      console.error('Claude Vision API error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Claude API authentication failed. Check your API key.');
      } else if (error.response?.status === 429) {
        throw new Error('Claude API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request to Claude API. Image may be too large or in an unsupported format.');
      }
      
      throw new Error(`Claude Vision API error: ${error.message}`);
    }
  }

  async countBooks(imageBuffer) {
    const base64Image = imageBuffer.toString('base64');
    const mediaType = this.getMediaType(imageBuffer);
    
    const response = await axios.post(
      this.apiUrl,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `This is a photograph of physical books with their spines visible. Count how many individual book spines you can see.

COUNTING INSTRUCTIONS:
- Books may be arranged VERTICALLY (standing upright) or HORIZONTALLY (lying flat)
- If VERTICAL: Look from LEFT to RIGHT across the image
- If HORIZONTAL: Look from TOP to BOTTOM 
- Each distinct spine represents one book
- Look for title text, author names, and spine boundaries to distinguish individual books
- Some books may be thicker or thinner than others
- Count ALL visible book spines, even if partially obscured

Count very carefully and respond with ONLY the number of distinct book spines you can identify.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 20000
      }
    );

    const countText = response.data.content[0].text.trim();
    console.log(`🔢 CLAUDE: Count response: "${countText}"`);
    
    // Extract the highest number from the response (likely the final count)
    const numbers = countText.match(/\d+/g);
    const count = numbers ? Math.max(...numbers.map(n => parseInt(n))) : 5;
    const finalCount = isNaN(count) ? 5 : count;
    console.log(`🔢 CLAUDE: Parsed count: ${finalCount}`);
    return finalCount;
  }

  async extractWithCount(imageBuffer, expectedCount) {
    const base64Image = imageBuffer.toString('base64');
    const mediaType = this.getMediaType(imageBuffer);
    
    const response = await axios.post(
      this.apiUrl,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `This is a photograph of ${expectedCount} physical books with their spines visible. You need to identify ALL ${expectedCount} books.

IMPORTANT CONTEXT:
- These are book spines that may be oriented in different ways:
  * VERTICAL: Books standing upright (spines read left to right across the image)
  * HORIZONTAL: Books lying flat stacked on top of each other (spines read top to bottom)
- Book titles are usually the largest/most prominent text on the spine
- Author names are typically smaller and may be at either end of the spine
- Publisher logos/names may also be visible

DETECTION STRATEGY:
1. First determine the orientation - are books standing vertically or lying horizontally?
2. If VERTICAL (standing upright): Examine the image from LEFT to RIGHT
3. If HORIZONTAL (lying flat): Examine the image from TOP to BOTTOM
4. Look for distinct spine boundaries - each spine represents one book
5. Count carefully to ensure you find all ${expectedCount} books

TASK: Systematically identify each of the ${expectedCount} book spines. For each spine, extract:

1. TITLE: The COMPLETE title including subtitles (e.g., "You Suck: A Love Story" not just "You Suck")
2. AUTHOR: Full author name if clearly visible on the spine (first and last name when possible)
3. MOOD: Based on the title and any visible content, classify as one of: "escapist", "intense", "thoughtful", "light"
   - escapist: Fiction, romance, fantasy, adventure, mysteries
   - intense: Thrillers, horror, dark topics, serious drama
   - thoughtful: Non-fiction, philosophy, memoirs, literary fiction, self-help
   - light: Comedy, humor, light romance, feel-good stories
4. SPINE_TEXT: All readable text you can see on that particular spine

Work systematically from top to bottom. Don't skip any layers/bands in the stack.

IMPORTANT: Only transcribe text that is ACTUALLY VISIBLE on each spine. Do not guess or substitute similar titles.

Return exactly ${expectedCount} books in this JSON format:
[
  {"title": "Complete Title", "author": "Full Author Name or null", "mood": "thoughtful", "spine_text": "All visible text on this spine"},
  {"title": "Next Book Title", "author": "Full Author Name or null", "mood": "escapist", "spine_text": "All visible text"},
  ... (continue for all ${expectedCount} books)
]

CRITICAL RULES:
1. You must return exactly ${expectedCount} books
2. ONLY extract text that is ACTUALLY VISIBLE on the spine - do not guess or infer
3. Read the COMPLETE title as shown on the spine, including subtitles (like "You Suck: A Love Story")
4. If text is partially obscured, include only what you can actually see
5. If you can't determine an author from the spine, use null
6. DO NOT make assumptions about what a book might be based on partial text
7. DO NOT substitute similar book titles - only use exactly what you see`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.content[0].text;
    console.log('Claude detailed response:', content);
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in Claude response');
        return [];
      }
      
      const books = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(books)) {
        console.error('Claude response is not an array');
        return [];
      }
      
      const validBooks = books.filter(book => 
        book && typeof book === 'object' && book.title
      ).map(book => ({
        title: book.title.trim(),
        author: book.author ? book.author.trim() : null,
        spine_text: book.spine_text ? book.spine_text.trim() : book.title.trim()
      }));
      
      console.log(`📚 CLAUDE: Successfully extracted ${validBooks.length} books from image`);
      console.log(`📚 CLAUDE: Books found:`, validBooks.map(b => b.title));
      return validBooks;
      
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      console.error('Response was:', content);
      return [];
    }
  }

  getMediaType(imageBuffer) {
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      return 'image/png';
    } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
      return 'image/gif';
    } else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }
}

module.exports = new ClaudeVisionService();
