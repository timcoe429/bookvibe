const vision = require('@google-cloud/vision');

class GoogleVisionService {
  constructor() {
    // Initialize the client with API key or service account
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      this.client = new vision.ImageAnnotatorClient({
        apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY
      });
    } else {
      // Fallback to service account authentication
      this.client = new vision.ImageAnnotatorClient();
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      console.log('Sending image to Google Vision API...');
      
      const [result] = await this.client.textDetection({
        image: { content: imageBuffer }
      });

      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        console.log('No text detected in image');
        return '';
      }

      // The first detection is the full text
      const fullText = detections[0].description;
      console.log(`Extracted ${fullText.length} characters of text`);
      
      return fullText;
    } catch (error) {
      console.error('Google Vision API error:', error);
      
      if (error.code === 3) { // INVALID_ARGUMENT
        throw new Error('Invalid image format or corrupted image');
      } else if (error.code === 16) { // UNAUTHENTICATED
        throw new Error('Google Vision API authentication failed');
      } else if (error.code === 8) { // RESOURCE_EXHAUSTED
        throw new Error('Google Vision API quota exceeded');
      }
      
      throw new Error(`Vision API error: ${error.message}`);
    }
  }

  async extractStructuredText(imageBuffer) {
    try {
      console.log('Performing document text detection...');
      
      const [result] = await this.client.documentTextDetection({
        image: { content: imageBuffer }
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation) {
        return { text: '', blocks: [] };
      }

      const blocks = fullTextAnnotation.pages[0].blocks.map(block => {
        const blockText = block.paragraphs
          .map(paragraph => 
            paragraph.words
              .map(word => 
                word.symbols.map(symbol => symbol.text).join('')
              )
              .join(' ')
          )
          .join(' ');

        return {
          text: blockText,
          confidence: block.confidence,
          boundingBox: block.boundingBox
        };
      });

      return {
        text: fullTextAnnotation.text,
        blocks: blocks
      };
    } catch (error) {
      console.error('Document text detection error:', error);
      throw error;
    }
  }

  async detectObjects(imageBuffer) {
    try {
      console.log('Detecting objects in image...');
      
      const [result] = await this.client.objectLocalization({
        image: { content: imageBuffer }
      });

      const objects = result.localizedObjectAnnotations;
      
      // Filter for book-related objects
      const bookObjects = objects.filter(obj => 
        obj.name.toLowerCase().includes('book') ||
        obj.name.toLowerCase().includes('publication') ||
        obj.name.toLowerCase().includes('magazine')
      );

      return bookObjects.map(obj => ({
        name: obj.name,
        confidence: obj.score,
        boundingBox: obj.boundingPoly
      }));
    } catch (error) {
      console.error('Object detection error:', error);
      return []; // Non-fatal, return empty array
    }
  }

  // Comprehensive analysis combining text and object detection
  async analyzeBookshelfImage(imageBuffer) {
    try {
      console.log('Performing comprehensive bookshelf analysis...');
      
      const [textResult, objectResult] = await Promise.allSettled([
        this.extractStructuredText(imageBuffer),
        this.detectObjects(imageBuffer)
      ]);

      const analysis = {
        text: '',
        blocks: [],
        objects: [],
        confidence: 0
      };

      if (textResult.status === 'fulfilled') {
        analysis.text = textResult.value.text;
        analysis.blocks = textResult.value.blocks;
        
        // Calculate overall confidence from blocks
        const confidences = textResult.value.blocks.map(block => block.confidence || 0);
        analysis.confidence = confidences.length > 0 
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
          : 0;
      }

      if (objectResult.status === 'fulfilled') {
        analysis.objects = objectResult.value;
      }

      console.log(`Analysis complete - Text: ${analysis.text.length} chars, Objects: ${analysis.objects.length}, Confidence: ${analysis.confidence.toFixed(2)}`);
      
      return analysis;
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw error;
    }
  }
}

module.exports = new GoogleVisionService();
