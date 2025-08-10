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
    
    // Common generic words that shouldn't be searched alone
    const genericWords = new Set(['love', 'story', 'waiting', 'life', 'time', 'world', 'book', 'best', 'new']);

    for (const line of lines) {
      // Skip content that looks like an author's name (reduces false positives)
      if (this.looksLikePersonName(line)) {
        continue;
      }

      const cleanedTitles = this.extractTitlesFromLine(line);
      
      for (const title of cleanedTitles) {
        const normalizedTitle = this.normalizeTitle(title);
        
        // Skip single generic words
        const titleWords = normalizedTitle.split(' ');
        if (titleWords.length === 1 && genericWords.has(titleWords[0].toLowerCase())) {
          continue;
        }
        
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
    
    // Skip lines that are clearly just author names
    if (this.looksLikePersonName(line)) {
      return [];
    }
    
    // Remove common spine elements that aren't titles
    let cleaned = line
      .replace(/^(THE|A|AN)\s+/i, '') // Remove articles at start
      .replace(/\s+(VOLUME|VOL|BOOK|PART|CHAPTER|CH)\s+\d+/gi, '') // Remove volume numbers
      .replace(/\s+\d{4}$/, '') // Remove years at end
      .replace(/\s+(PAPERBACK|HARDCOVER|EDITION)$/gi, '') // Remove format info
      .trim();

    // Split on common separators that might indicate author/title split
    const authorSeparators = [' by ', ' - ', ' / '];
    
    for (const separator of authorSeparators) {
      if (cleaned.toLowerCase().includes(separator)) {
        // Take only the part before the separator (likely the title)
        const parts = cleaned.split(new RegExp(separator, 'i'));
        const titlePart = parts[0].trim();
        if (this.isLikelyBookTitle(titlePart)) {
          titles.push(titlePart);
          return titles;
        }
      }
    }

    // If no separators, check if the whole line is a likely title
    if (this.isLikelyBookTitle(cleaned)) {
      titles.push(cleaned);
    }

    return titles;
  }

  isLikelyBookTitle(text) {
    if (!text || text.length < 8 || text.length > 80) {
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

    // Exclude lines containing common publisher/imprint or non-title indicators
    const lower = text.toLowerCase();
    const nonTitleIndicators = [
      'knopf', 'vintage', 'doran', 'chronicle books', 'chronicle',
      'lyons', 'carnahan', 'wylie', 'press', 'edition', 'editions',
      'museum', 'smithsonian', 'bulletin', 'dictionary', 'webster',
      'random house', 'merriam', 'pocket', 'grammar', 'usage', 'punctuation',
      'zone', 'guide', 'study', 'summary', 'analysis', 'review of',
      'workbook', 'journal', 'grades', 'primary', 'composition'
    ];
    for (const k of nonTitleIndicators) {
      if (lower.includes(k)) {
        return false;
      }
    }

    // More strict requirements
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 12) {
      return false;
    }
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasReasonableLength = text.length >= 8 && text.length <= 80;
    const notAllCaps = text !== text.toUpperCase() || wordCount <= 3;

    return hasLetters && hasReasonableLength && notAllCaps;
  }

  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Extract candidate titles by grouping OCR blocks into vertical spines
  extractTitlesFromBlocks(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return [];
    }

    const toBox = (b) => {
      const bb = b.boundingBox || b.boundingPoly || b.bounding_box || {};
      const v = bb.vertices || bb.normalizedVertices || bb.points || [];
      if (!Array.isArray(v) || v.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      }
      const xs = v.map(p => p.x || 0);
      const ys = v.map(p => p.y || 0);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
      };
    };

    const items = blocks
      .filter(b => (b.text || '').trim().length > 0)
      .map(b => {
        const box = toBox(b);
        const centerX = (box.minX + box.maxX) / 2;
        const centerY = (box.minY + box.maxY) / 2;
        const width = Math.max(1, box.maxX - box.minX);
        return { text: b.text.trim(), confidence: b.confidence || 0, box, centerX, centerY, width };
      })
      .sort((a, b) => a.centerX - b.centerX);

    if (items.length === 0) return [];

    // Estimate a reasonable gap to split spines using median width
    const widths = items.map(i => i.width).sort((a, b) => a - b);
    const medianWidth = widths[Math.floor(widths.length / 2)] || 40;
    const columnGap = Math.max(40, Math.floor(medianWidth * 0.6));

    // Group into vertical columns (spines)
    const spines = [];
    for (const it of items) {
      const last = spines[spines.length - 1];
      if (!last) {
        spines.push([it]);
      } else {
        const lastCenterX = last[last.length - 1].centerX;
        if (Math.abs(it.centerX - lastCenterX) <= columnGap) {
          last.push(it);
        } else {
          spines.push([it]);
        }
      }
    }

    // For each spine, join blocks from top to bottom and extract likely titles
    const candidates = [];
    for (const spine of spines) {
      const sorted = spine.sort((a, b) => a.centerY - b.centerY);
      const spineText = sorted.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();
      if (!spineText) continue;

      // Try extracting from the whole spine text
      const local = this.extractTitlesFromLine(spineText);
      for (const t of local) {
        if (this.isLikelyBookTitle(t)) {
          candidates.push(t);
        }
      }
    }

    // Deduplicate and return
    const seen = new Set();
    const unique = [];
    for (const c of candidates) {
      const n = this.normalizeTitle(c);
      if (!seen.has(n)) {
        seen.add(n);
        unique.push(c);
      }
    }

    return unique.slice(0, 50);
  }

  // Merge, dedupe and score candidates from multiple sources
  mergeCandidateLists(...lists) {
    const counts = new Map();
    for (const list of lists) {
      for (const t of list || []) {
        const n = this.normalizeTitle(t);
        counts.set(n, (counts.get(n) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([n]) => n)
      .map(n => n) // already normalized; callers can look up original if needed
      .slice(0, 50);
  }

  looksLikePersonName(text) {
    // e.g., "Simon Garfield", "Jack E. Davis", "Jonathan Franzen", "MARK HADDON", "JIM COLLINS"
    const cleaned = text.trim();
    const tokens = cleaned.split(/\s+/);
    
    // Check various author name patterns
    if (tokens.length === 2 || tokens.length === 3) {
      // Check if it's all caps (common on book spines)
      const allCapsName = tokens.every(t => /^[A-Z]+$/.test(t) && t.length > 1);
      if (allCapsName) return true;
      
      // Check standard name pattern
      let capitalizedCount = 0;
      for (const t of tokens) {
        if (/^[A-Z][a-z]+\.?$/.test(t) || /^[A-Z]\.$/.test(t)) {
          capitalizedCount += 1;
        }
      }
      if (capitalizedCount >= 2) return true;
    }
    
    // Check for specific author indicators
    const lower = cleaned.toLowerCase();
    if (lower.includes(' by ') || lower.startsWith('by ')) return true;
    
    return false;
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
      // Use more specific query to avoid false matches and prefer original books
      const url = `${this.googleBooksBaseUrl}?q="${query}"&printType=books&orderBy=relevance&maxResults=10`;
      const response = await axios.get(url, { timeout: 7000 });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const normalizedQueryTokens = this.normalizeTitle(title).split(' ').filter(Boolean);
      const isQueryShort = normalizedQueryTokens.length < 2;
      
      let best = null;
      let bestScore = 0;

      for (const item of response.data.items) {
        const book = item.volumeInfo;
        const resultTitle = book.title || '';
        const normalizedResultTokens = this.normalizeTitle(resultTitle).split(' ').filter(Boolean);

        // Reject summaries/study guides/companions/analysis books
        const lowered = resultTitle.toLowerCase();
        if (
          lowered.startsWith('summary of') ||
          lowered.includes('study guide') ||
          lowered.includes('analysis of') ||
          lowered.includes('summary and analysis') ||
          lowered.includes('companion to') ||
          lowered.includes('sparknotes') ||
          lowered.includes('cliff notes') ||
          lowered.includes('cliffsnotes') ||
          lowered.includes('workbook') ||
          lowered.includes("author's guide") ||
          lowered.includes('teacher guide') ||
          lowered.includes('key takeaways') ||
          lowered.includes('analysis & review') ||
          lowered.includes('| analysis') ||
          lowered.includes('instaread') ||
          lowered.includes('summary by') ||
          lowered.includes('notes on') ||
          lowered.includes('book summary')
        ) {
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
        
        // Require significant overlap: at least 2/3 of query tokens must match
        const requiredOverlap = Math.max(2, Math.ceil(normalizedQueryTokens.length * 0.66));
        if (intersection < requiredOverlap) {
          continue;
        }

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
      const acceptanceThreshold = normalizedQueryTokens.length >= 3 ? 0.7 : 0.85;
      if (!best || bestScore < acceptanceThreshold) {
        return null;
      }

      const book = best.volumeInfo;
      
      // Clean up the title from common issues
      let cleanedTitle = book.title;
      
      // Remove dates in parentheses like "(2006-08-31)"
      cleanedTitle = cleanedTitle.replace(/\s*\([0-9]{4}-[0-9]{2}-[0-9]{2}\)/, '');
      
      // Remove author name if it appears in title (like "James Gleick's Chaos" -> "Chaos")
      if (book.authors && book.authors.length > 0) {
        const authorName = book.authors[0];
        const authorLastName = authorName.split(' ').pop();
        const possessivePattern = new RegExp(`^${authorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'?s\\s+`, 'i');
        const lastNamePattern = new RegExp(`^${authorLastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'?s\\s+`, 'i');
        
        if (possessivePattern.test(cleanedTitle)) {
          cleanedTitle = cleanedTitle.replace(possessivePattern, '');
        } else if (lastNamePattern.test(cleanedTitle)) {
          cleanedTitle = cleanedTitle.replace(lastNamePattern, '');
        }
      }
      
      // Final verification: ensure the result contains most of our query words
      const resultNormalized = this.normalizeTitle(cleanedTitle);
      let queryWordsInResult = 0;
      let resultWordsInQuery = 0;
      
      // Check how many query words appear in result
      for (const qToken of normalizedQueryTokens) {
        if (resultNormalized.includes(qToken)) {
          queryWordsInResult++;
        }
      }
      
      // Also check how many result words appear in query (prevent author-based false matches)
      const resultTokens = resultNormalized.split(' ').filter(Boolean);
      for (const rToken of resultTokens) {
        if (rToken.length > 2) { // Skip small words
          const queryStr = normalizedQueryTokens.join(' ');
          if (queryStr.includes(rToken)) {
            resultWordsInQuery++;
          }
        }
      }
      
      const queryMatchRatio = queryWordsInResult / normalizedQueryTokens.length;
      const resultMatchRatio = resultWordsInQuery / Math.max(1, resultTokens.filter(t => t.length > 2).length);
      
      // Require high match in both directions to prevent false associations
      if (queryMatchRatio < 0.7 || resultMatchRatio < 0.5) {
        return null; // Too much mismatch between query and result
      }
      
      return {
        title: cleanedTitle.trim(),
        author: book.authors ? book.authors.join(', ') : 'Unknown Author',
        isbn: book.industryIdentifiers ? 
          book.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier ||
          book.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
        pages: book.pageCount || null,
        description: book.description || null,
        coverUrl: this.cleanCoverUrl(book.imageLinks?.thumbnail) || null,
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
    if (!genre) return 'cozy';
    
    const genreLower = genre.toLowerCase();
    
    if (genreLower.includes('romance') || genreLower.includes('love')) {
      return 'romantic';
    } else if (genreLower.includes('thriller') || genreLower.includes('mystery') || 
               genreLower.includes('suspense') || genreLower.includes('crime')) {
      return 'thrilling';
    } else if (genreLower.includes('horror') || genreLower.includes('dark') ||
               genreLower.includes('psychological') || genreLower.includes('dystopian')) {
      return 'dark';
    } else if (genreLower.includes('philosophy') || genreLower.includes('literary fiction') ||
               genreLower.includes('biography') || genreLower.includes('classic')) {
      return 'literary';
    } else if (genreLower.includes('comedy') || genreLower.includes('humor') ||
               genreLower.includes('feel-good') || genreLower.includes('inspirational')) {
      return 'uplifting';
    } else if (genreLower.includes('fantasy') || genreLower.includes('cozy mystery') ||
               genreLower.includes('contemporary fiction') || genreLower.includes('family')) {
      return 'cozy';
    }
    
    return 'cozy'; // Default mood
  }

  // Infer mood from title keywords
  inferMoodFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    // Dark mood keywords
    if (titleLower.includes('murder') || titleLower.includes('death') || 
        titleLower.includes('blood') || titleLower.includes('killer') ||
        titleLower.includes('shadow') || titleLower.includes('nightmare')) {
      return 'dark';
    }
    
    // Thrilling mood keywords
    if (titleLower.includes('thriller') || titleLower.includes('mystery') ||
        titleLower.includes('hunt') || titleLower.includes('chase') ||
        titleLower.includes('danger') || titleLower.includes('escape')) {
      return 'thrilling';
    }
    
    // Romantic mood keywords
    if (titleLower.includes('love') || titleLower.includes('heart') ||
        titleLower.includes('wedding') || titleLower.includes('romance') ||
        titleLower.includes('kiss') || titleLower.includes('bride')) {
      return 'romantic';
    }
    
    // Literary mood keywords
    if (titleLower.includes('life') || titleLower.includes('meaning') ||
        titleLower.includes('journey') || titleLower.includes('wisdom') ||
        titleLower.includes('truth') || titleLower.includes('soul')) {
      return 'literary';
    }
    
    // Uplifting mood keywords
    if (titleLower.includes('happy') || titleLower.includes('joy') ||
        titleLower.includes('hope') || titleLower.includes('summer') ||
        titleLower.includes('sunshine') || titleLower.includes('dream')) {
      return 'uplifting';
    }
    
    return 'cozy'; // Default
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

  cleanCoverUrl(url) {
    if (!url) return null;
    
    // Ensure HTTPS
    let cleanUrl = url.replace('http:', 'https:');
    
    // Try to get a larger image if available
    cleanUrl = cleanUrl.replace(/zoom=\d+/, 'zoom=1');
    cleanUrl = cleanUrl.replace(/&edge=curl/, '');
    
    return cleanUrl;
  }
}

module.exports = new BookMatchingService();
