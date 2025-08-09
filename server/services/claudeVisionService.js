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
      console.log('Sending image to Claude Vision API...');
      
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Determine image type from buffer
      let mediaType = 'image/jpeg';
      if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
        mediaType = 'image/png';
      } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
        mediaType = 'image/gif';
      } else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) {
        mediaType = 'image/webp';
      }
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'claude-3-5-sonnet-20241022', // Sonnet is more accurate for detailed vision tasks
          max_tokens: 1000,
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
                  text: `Look at this image carefully and identify ALL the books you can see. These are book spines stacked on top of each other.

I can see multiple books in this stack. Please examine each book spine from top to bottom and identify:
1. The title (main text, usually largest)
2. The author name (if visible)
3. Any publisher information

Look carefully at each individual book spine - don't miss any books in the stack.

Return ONLY a JSON array with ALL books you can identify. Format:
[
  {"title": "Museums in a Troubled World", "author": "Robert R. Janes", "spine_text": "Museums in a Troubled World Robert R. Janes"},
  {"title": "Letting Go", "author": "Author Name", "spine_text": "Letting Go Sharing Historical Authority in a User-Generated World"},
  {"title": "Engaging Art", "author": null, "spine_text": "ENGAGING ART"}
]

Be thorough - examine each book spine individually. Return an empty array [] only if you truly cannot see any books.`
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
      console.log('Claude response:', content);
      
      // Try to parse the JSON response
      try {
        // Extract JSON array from the response (in case there's any extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('No JSON array found in Claude response');
          return [];
        }
        
        const books = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the response
        if (!Array.isArray(books)) {
          console.error('Claude response is not an array');
          return [];
        }
        
        // Ensure each book has required fields
        const validBooks = books.filter(book => 
          book && typeof book === 'object' && book.title
        ).map(book => ({
          title: book.title.trim(),
          author: book.author ? book.author.trim() : null,
          spine_text: book.spine_text ? book.spine_text.trim() : book.title.trim()
        }));
        
        console.log(`Successfully extracted ${validBooks.length} books from image`);
        return validBooks;
        
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', parseError);
        console.error('Response was:', content);
        return [];
      }
      
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
}

module.exports = new ClaudeVisionService();
