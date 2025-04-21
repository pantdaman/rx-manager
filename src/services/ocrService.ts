import { createWorker, PSM, OEM } from 'tesseract.js';
import { OCRProvider } from '../types/config';
import * as jose from 'jose';

export interface OCRResult {
  text: string;
  confidence: number;
}

export async function performOCR(file: File, provider: OCRProvider, serviceAccountKey?: string): Promise<string> {
  switch (provider) {
    case 'tesseract':
      return performTesseractOCR(file);
    case 'google-vision':
      if (!serviceAccountKey) throw new Error('Google Cloud service account key is required');
      return performGoogleVisionOCR(file, serviceAccountKey);
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
      await worker.loadLanguage('eng+hin');
      await worker.initialize('eng+hin');
    } catch (error) {
      console.error('Error loading Hindi language support:', error);
      // Fallback to English only
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
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

async function performGoogleVisionOCR(file: File, serviceAccountKey: string): Promise<string> {
  let serviceAccount;
  try {
    console.log('Received service account key:', serviceAccountKey.substring(0, 100) + '...');
    serviceAccount = JSON.parse(serviceAccountKey);
    console.log('Parsed service account:', {
      hasClientEmail: !!serviceAccount.client_email,
      hasPrivateKey: !!serviceAccount.private_key,
      hasPrivateKeyId: !!serviceAccount.private_key_id,
      type: serviceAccount.type
    });
    
    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.private_key_id) {
      console.error('Missing required fields:', {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key ? 'present' : 'missing',
        private_key_id: serviceAccount.private_key_id
      });
      throw new Error('Invalid service account key format');
    }
  } catch (error) {
    console.error('Error parsing service account key:', error);
    throw new Error('Invalid service account key. Please make sure you have pasted the correct JSON key file from Google Cloud Console.');
  }

  // Create JWT token
  const now = Math.floor(Date.now() / 1000);
  let token: string;
  try {
    const privateKey = await jose.importPKCS8(serviceAccount.private_key, 'RS256');
    token = await new jose.SignJWT({
      scope: 'https://www.googleapis.com/auth/cloud-platform',
    })
      .setProtectedHeader({ alg: 'RS256', kid: serviceAccount.private_key_id })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(serviceAccount.client_email)
      .setSubject(serviceAccount.client_email)
      .setAudience('https://oauth2.googleapis.com/token')
      .sign(privateKey);
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw new Error('Failed to create authentication token');
  }

  // Get an access token using the service account
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(`Failed to get Google Cloud access token: ${errorData.error?.message || tokenResponse.statusText}`);
  }

  const { access_token } = await tokenResponse.json();

  // Convert file to base64
  const base64Image = await fileToBase64(file);
  
  const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
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
  });

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