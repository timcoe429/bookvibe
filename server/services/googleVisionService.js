const vision = require('@google-cloud/vision');
const axios = require('axios');

class GoogleVisionService {
  constructor() {
    // We support two auth strategies:
    // 1) Service Account via client libraries
    // 2) API Key via REST (works well on Railway)

    this.useRestWithApiKey = Boolean(process.env.GOOGLE_CLOUD_VISION_API_KEY);

    if (!this.useRestWithApiKey) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        this.client = new vision.ImageAnnotatorClient({
          credentials,
          projectId: credentials.project_id
        });
      } else if (process.env.GOOGLE_CLOUD_PROJECT) {
        this.client = new vision.ImageAnnotatorClient({
          projectId: process.env.GOOGLE_CLOUD_PROJECT
        });
      } else {
        throw new Error('Google Vision API authentication not configured. Set GOOGLE_CLOUD_VISION_API_KEY (recommended for Railway) or GOOGLE_APPLICATION_CREDENTIALS_JSON.');
      }
    }
  }

  async callRestAnnotate(features, imageBuffer) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const requests = [
      {
        image: { content: imageBuffer.toString('base64') },
        features
      }
    ];

    try {
      const { data } = await axios.post(endpoint, { requests }, { timeout: 20000 });

      if (!data.responses || !data.responses[0]) {
        const error = new Error('Empty response from Vision API');
        error.code = 'EMPTY_RESPONSE';
        throw error;
      }

      return data.responses[0];
    } catch (err) {
      // Bubble up helpful error info for debugging 403/401/etc
      const details = err.response?.data?.error || {};
      const message = details.message || err.message || 'Vision API request failed';
      const error = new Error(`Vision API error: ${message}`);
      error.code = details.code || err.code;
      error.status = err.response?.status;
      error.details = details;
      throw error;
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      console.log('Sending image to Google Vision API...');
      
      let detections;
      if (this.useRestWithApiKey) {
        const resp = await this.callRestAnnotate([
          { type: 'TEXT_DETECTION' }
        ], imageBuffer);
        detections = resp.textAnnotations || [];
      } else {
        const [result] = await this.client.textDetection({ image: { content: imageBuffer } });
        detections = result.textAnnotations;
      }
      
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
      
      let fullTextAnnotation;
      if (this.useRestWithApiKey) {
        const resp = await this.callRestAnnotate([
          { type: 'DOCUMENT_TEXT_DETECTION' }
        ], imageBuffer);
        fullTextAnnotation = resp.fullTextAnnotation;
      } else {
        const [result] = await this.client.documentTextDetection({ image: { content: imageBuffer } });
        fullTextAnnotation = result.fullTextAnnotation;
      }
      
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
      
      let objects;
      if (this.useRestWithApiKey) {
        const resp = await this.callRestAnnotate([
          { type: 'OBJECT_LOCALIZATION' }
        ], imageBuffer);
        objects = resp.localizedObjectAnnotations || [];
      } else {
        const [result] = await this.client.objectLocalization({ image: { content: imageBuffer } });
        objects = result.localizedObjectAnnotations;
      }
      
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
