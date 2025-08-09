const axios = require('axios');

class BookMatchingService {
  constructor() {
    this.openLibraryBaseUrl = 'https://openlibrary.org';
    this.googleBooksBaseUrl = 'https://www.googleapis.com/books/v1/volumes';
  }

  // Parse potential book titles from extracted text
  parseBookTitles(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    console.log('Parsing book titles from text...');
    
    // Split text into lines and filter potential titles
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const potentialTitles = [];
    const processedTitles = new Set();

    for (const line of lines) {
      // Skip content that looks like an author's name (reduces false positives)
      if (this.looksLikePersonName(line)) {
        continue;
      }

      const cleanedTitles = this.extractTitlesFromLine(line);
      
      for (const title of cleanedTitles) {
        const normalizedTitle = this.normalizeTitle(title);
        
        // Avoid duplicates and very short titles
        if (normalizedTitle.length >= 3 && !processedTitles.has(normalizedTitle)) {
          potentialTitles.push(title);
          processedTitles.add(normalizedTitle);
        }
      }
    }

    console.log(`Found ${potentialTitles.length} potential titles`);
    return potentialTitles.slice(0, 50); // Limit to avoid API overload
  }

  extractTitlesFromLine(line) {
    const titles = [];
    
    // Remove common spine elements that aren't titles
    let cleaned = line
      .replace(/^(THE|A|AN)\s+/i, '') // Remove articles at start
      .replace(/\s+(VOLUME|VOL|BOOK|PART|CHAPTER|CH)\s+\d+/gi, '') // Remove volume numbers
      .replace(/\s+\d{4}$/, '') // Remove years at end
      .replace(/\s+(PAPERBACK|HARDCOVER|EDITION)$/gi, '') // Remove format info
      .trim();

    // Split on common separators that might indicate multiple titles
    const separators = [' | ', ' / ', ' - ', '  '];
    
    for (const separator of separators) {
      if (cleaned.includes(separator)) {
        const parts = cleaned.split(separator);
        for (const part of parts) {
          const trimmed = part.trim();
          if (this.isLikelyBookTitle(trimmed)) {
            titles.push(trimmed);
          }
        }
        return titles; // Return early if we found separators
      }
    }

    // If no separators, check if the whole line is a likely title
    if (this.isLikelyBookTitle(cleaned)) {
      titles.push(cleaned);
    }

    return titles;
  }

  isLikelyBookTitle(text) {
    if (!text || text.length < 3 || text.length > 100) {
      return false;
    }

    // Filter out obvious non-titles
    const excludePatterns = [
      /^\d+$/, // Just numbers
      /^[A-Z]{1,3}$/, // Just initials
      /^(AUTHOR|PUBLISHER|ISBN|COPYRIGHT|©)$/i,
      /^(NEW|USED|SALE|PRICE)$/i,
      /^\$\d+/, // Prices
      /^(BY|FOR|THE|AND|OR|IN|ON|AT)$/i, // Common words
      /^[^\w\s]+$/, // Only punctuation
    ];

    for (const pattern of excludePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }

    // Heuristics to reduce false positives:
    // - Prefer at least 2 words OR a long single word (>= 6)
    // - Avoid lines that look like a person name (handled earlier)
    const wordCount = text.split(/\s+/).length;
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasReasonableLength = text.length >= 3 && text.length <= 80;
    const notAllCaps = text !== text.toUpperCase() || wordCount <= 3;
    const enoughWordsOrLength = wordCount >= 2 || text.length >= 6;

    return hasLetters && hasReasonableLength && notAllCaps && enoughWordsOrLength;
  }

  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  looksLikePersonName(text) {
    // e.g., "Simon Garfield", "Jack E. Davis", "Jonathan Franzen"
    const tokens = text.trim().split(/\s+/);
    if (tokens.length < 2 || tokens.length > 4) {
      return false;
    }
    // At least two tokens should be capitalized like a name
    let capitalizedCount = 0;
    for (const t of tokens) {
      if (/^[A-Z][a-z]+\.?$/.test(t) || /^[A-Z]\.$/.test(t)) {
        capitalizedCount += 1;
      }
    }
    return capitalizedCount >= 2;
  }

  // Find book data by title using multiple APIs
  async findBookByTitle(title) {
    console.log(`Searching for book: "${title}"`);
    
    try {
      // Try Google Books API first (more reliable)
      let bookData = await this.searchGoogleBooks(title);
      
      if (!bookData) {
        // Fallback to Open Library
        bookData = await this.searchOpenLibrary(title);
      }

      if (bookData) {
        console.log(`Found match: "${bookData.title}" by ${bookData.author}`);
        return bookData;
      }

      console.log(`No match found for: "${title}"`);
      return null;
    } catch (error) {
      console.error(`Error searching for "${title}":`, error.message);
      return null;
    }
  }

  async searchGoogleBooks(title) {
    try {
      const query = encodeURIComponent(title);
      // Fetch a few candidates and choose best match by token overlap
      const url = `${this.googleBooksBaseUrl}?q=intitle:"${query}"&printType=books&orderBy=relevance&maxResults=3`;
      const response = await axios.get(url, { timeout: 7000 });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const normalizedQueryTokens = this.normalizeTitle(title).split(' ');
      const isQueryShort = normalizedQueryTokens.length < 2;
      
      let best = null;
      let bestScore = 0;

      for (const item of response.data.items) {
        const book = item.volumeInfo;
        const resultTitle = book.title || '';
        const normalizedResultTokens = this.normalizeTitle(resultTitle).split(' ');

        // Reject summaries/study guides/companions
        const lowered = resultTitle.toLowerCase();
        if (lowered.startsWith('summary of') || lowered.includes('study guide') || lowered.includes('analysis of')) {
          continue;
        }

        // Compute token overlap score (Jaccard)
        const setQ = new Set(normalizedQueryTokens);
        const setR = new Set(normalizedResultTokens);
        let intersection = 0;
        for (const t of setQ) {
          if (setR.has(t)) intersection += 1;
        }
        const union = new Set([...setQ, ...setR]).size || 1;
        const score = intersection / union;

        // For very short queries (1 word), require exact word match and minimum length
        if (isQueryShort) {
          if (normalizedQueryTokens[0].length < 4) {
            continue; // too short, likely an author/word
          }
          if (!setR.has(normalizedQueryTokens[0])) {
            continue;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      }

      // Require a reasonable similarity to accept
      const acceptanceThreshold = normalizedQueryTokens.length >= 2 ? 0.4 : 0.8;
      if (!best || bestScore < acceptanceThreshold) {
        return null;
      }

      const book = best.volumeInfo;
      return {
        title: book.title,
        author: book.authors ? book.authors.join(', ') : 'Unknown Author',
        isbn: book.industryIdentifiers ? 
          book.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
          book.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
        pages: book.pageCount || null,
        description: book.description || null,
        coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
        genre: book.categories ? book.categories[0] : null,
        mood: this.inferMoodFromGenre(book.categories?.[0] || ''),
        averageRating: book.averageRating || null,
        publicationYear: book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : null,
        googleBooksId: best.id
      };
    } catch (error) {
      console.error(`Google Books API error for "${title}":`, error.message);
      return null;
    }
  }

  async searchOpenLibrary(title) {
    try {
      const query = encodeURIComponent(title);
      const searchUrl = `${this.openLibraryBaseUrl}/search.json?title=${query}&limit=1`;
      
      const response = await axios.get(searchUrl, { timeout: 5000 });
      
      if (!response.data.docs || response.data.docs.length === 0) {
        return null;
      }

      const book = response.data.docs[0];
      
      return {
        title: book.title,
        author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
        isbn: book.isbn ? book.isbn[0] : null,
        pages: book.number_of_pages_median || null,
        description: null, // Open Library search doesn't include descriptions
        coverUrl: book.cover_i ? 
          `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        genre: book.subject ? book.subject[0] : null,
        mood: this.inferMoodFromGenre(book.subject?.[0] || ''),
        averageRating: null,
        publicationYear: book.first_publish_year || null,
        openLibraryId: book.key
      };
    } catch (error) {
      console.error(`Open Library API error for "${title}":`, error.message);
      return null;
    }
  }

  // Enrich basic book data with additional information
  async enrichBookData(basicBookData) {
    try {
      // If we have minimal data, try to find more complete information
      if (basicBookData.title && basicBookData.author) {
        const searchQuery = `${basicBookData.title} ${basicBookData.author}`;
        const enrichedData = await this.findBookByTitle(searchQuery);
        
        if (enrichedData) {
          // Merge the data, preferring enriched data but keeping original where available
          return {
            ...enrichedData,
            ...basicBookData, // Original data takes precedence
            mood: enrichedData.mood || this.inferMoodFromTitle(basicBookData.title)
          };
        }
      }

      // If no enrichment found, return original data with inferred mood
      return {
        ...basicBookData,
        mood: basicBookData.mood || this.inferMoodFromTitle(basicBookData.title || ''),
        pages: basicBookData.pages || null,
        averageRating: basicBookData.averageRating || null
      };
    } catch (error) {
      console.error('Error enriching book data:', error);
      return basicBookData;
    }
  }

  // Infer reading mood from genre
  inferMoodFromGenre(genre) {
    if (!genre) return 'escapist';
    
    const genreLower = genre.toLowerCase();
    
    if (genreLower.includes('romance') || genreLower.includes('contemporary fiction')) {
      return 'light';
    } else if (genreLower.includes('thriller') || genreLower.includes('mystery') || 
               genreLower.includes('horror') || genreLower.includes('crime')) {
      return 'intense';
    } else if (genreLower.includes('philosophy') || genreLower.includes('literary fiction') ||
               genreLower.includes('biography') || genreLower.includes('history')) {
      return 'thoughtful';
    } else if (genreLower.includes('fantasy') || genreLower.includes('science fiction') ||
               genreLower.includes('adventure') || genreLower.includes('young adult')) {
      return 'escapist';
    }
    
    return 'escapist'; // Default mood
  }

  // Infer mood from title keywords
  inferMoodFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    // Intense mood keywords
    if (titleLower.includes('murder') || titleLower.includes('death') || 
        titleLower.includes('blood') || titleLower.includes('war') ||
        titleLower.includes('killer') || titleLower.includes('dark')) {
      return 'intense';
    }
    
    // Light mood keywords
    if (titleLower.includes('love') || titleLower.includes('wedding') ||
        titleLower.includes('summer') || titleLower.includes('beach') ||
        titleLower.includes('romance') || titleLower.includes('happy')) {
      return 'light';
    }
    
    // Thoughtful mood keywords
    if (titleLower.includes('life') || titleLower.includes('meaning') ||
        titleLower.includes('journey') || titleLower.includes('wisdom') ||
        titleLower.includes('truth') || titleLower.includes('soul')) {
      return 'thoughtful';
    }
    
    return 'escapist'; // Default
  }

  // Batch process multiple titles
  async batchFindBooks(titles, maxConcurrent = 3) {
    const results = [];
    const failed = [];
    
    // Process in batches to avoid overwhelming APIs
    for (let i = 0; i < titles.length; i += maxConcurrent) {
      const batch = titles.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (title) => {
        try {
          const result = await this.findBookByTitle(title);
          return { title, result };
        } catch (error) {
          console.error(`Batch error for "${title}":`, error);
          return { title, result: null };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const { title, result } of batchResults) {
        if (result) {
          results.push(result);
        } else {
          failed.push(title);
        }
      }
      
      // Small delay between batches to be nice to APIs
      if (i + maxConcurrent < titles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return { results, failed };
  }
}

module.exports = new BookMatchingService();
