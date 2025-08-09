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
                text: `This is a photograph of physical books. The books are stacked horizontally on top of each other, with their spines facing the camera. Each book spine contains the title and often the author's name.

Count how many individual book spines you can see in this stack. Look at the image from top to bottom - each horizontal band/layer is typically one book. Some books may be thicker or thinner than others.

Count carefully and respond with ONLY the number of distinct book spines you can identify.`
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
    const count = parseInt(countText);
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
                text: `This is a photograph of ${expectedCount} physical books stacked horizontally. The books are lying flat with their spines facing the camera. You need to identify ALL ${expectedCount} books.

IMPORTANT CONTEXT:
- These are book spines viewed from the side
- Books are stacked one on top of another
- Each horizontal band/layer in the image represents one book
- Text runs horizontally across each spine
- Book titles are usually the largest/most prominent text
- Author names are typically smaller and may be at either end of the spine
- Publisher logos/names may also be visible

TASK: Examine the image from TOP to BOTTOM and identify each of the ${expectedCount} book spines. For each spine, extract:

1. TITLE: The main title (usually largest text on the spine)
2. AUTHOR: Author's name if visible (often smaller text)
3. SPINE_TEXT: All readable text you can see on that particular spine

Work systematically from top to bottom. Don't skip any layers/bands in the stack.

Return exactly ${expectedCount} books in this JSON format:
[
  {"title": "Complete Title", "author": "Author Name or null", "spine_text": "All visible text on this spine"},
  {"title": "Next Book Title", "author": "Author Name or null", "spine_text": "All visible text"},
  ... (continue for all ${expectedCount} books)
]

CRITICAL: You must return exactly ${expectedCount} books. If text is partially obscured, do your best to read what's visible. If you can't determine an author, use null.`
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
