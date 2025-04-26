import { createWorker, PSM, OEM } from 'tesseract.js';
import { OCRProvider } from '../types/config';
import * as jose from 'jose';
import { AppConfig } from '../types/config';
import { getVisionApiKey } from '../utils/config';

export interface OCRResult {
  text: string;
  confidence: number;
}

export async function performOCR(file: File, provider: OCRProvider, config: AppConfig): Promise<string> {
  switch (provider) {
    case 'tesseract':
      return performTesseractOCR(file);
    case 'google-vision':
      console.log('Debug - Environment Check:', {
        'process.env available': !!process.env,
        'All env variables': process.env,
        'Specific key value': getVisionApiKey(),
        'Config from localStorage': config.apiKeys.googleCloud.visionApiKey,
        'Current working directory': process.cwd(),
        'NODE_ENV': process.env.NODE_ENV
      });

      const apiKey = getVisionApiKey();
      console.log('Final API Key Check:', {
        'Using key from': apiKey === config.apiKeys.googleCloud.visionApiKey ? 'config' : 'env',
        'Key value': apiKey ? 'Present' : 'Missing'
      });

      if (!apiKey) {
        throw new Error('Google Vision API key is required. Please configure it in settings or set NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY in your environment variables.');
      }
      return performGoogleVisionOCR(file, apiKey);
    default:
      throw new Error(`Unsupported OCR provider: ${provider}`);
  }
}

async function performTesseractOCR(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  const worker = await createWorker();
  
  try {
    try {
      // Try to initialize with Hindi language support
      await (worker as any).loadLanguage('eng+hin');
      await (worker as any).initialize('eng+hin');
    } catch (error) {
      console.error('Error loading Hindi language support:', error);
      // Fallback to English only
      await (worker as any).loadLanguage('eng');
      await (worker as any).initialize('eng');
      throw new Error(
        'Hindi language support is not available. To enable Hindi text recognition:\n' +
        '1. Download the Hindi language data from https://github.com/tesseract-ocr/tessdata/blob/main/hin.traineddata\n' +
        '2. Place it in your Tesseract language data directory\n' +
        'For now, falling back to English-only recognition.'
      );
    }
    
    // Configure Tesseract for better text recognition
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      preserve_interword_spaces: '1',
    });
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageUrl);
    return text;
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
  }
}

async function performGoogleVisionOCR(file: File, apiKey: string): Promise<string> {
  // Convert file to base64
  const base64Image = await fileToBase64(file);
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: base64Image.split(',')[1]
          },
          features: [{
            type: 'TEXT_DETECTION'
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to process image with Google Vision API: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.responses[0]?.fullTextAnnotation?.text || '';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 