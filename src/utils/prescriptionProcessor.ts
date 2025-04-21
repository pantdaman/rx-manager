import { AppConfig } from '../types/config';
import { translateText } from '../services/translationService';

interface OCRResult {
  text: string;
  confidence: number;
}

export async function processPrescription(
  imageFile: File,
  targetLanguage: string,
  config: AppConfig
): Promise<string> {
  if (!config.googleCloudApiKey) {
    throw new Error('Google Cloud API key is required for OCR');
  }

  if (!config.llmProvider) {
    throw new Error('LLM provider must be selected');
  }

  // Check for required API keys based on LLM provider
  switch (config.llmProvider) {
    case 'google':
      if (!config.googleCloudApiKey || !config.googleCloudProjectId) {
        throw new Error('Google Cloud API key and Project ID are required for Google Vertex AI');
      }
      break;
    case 'openai':
      if (!config.openaiApiKey) {
        throw new Error('OpenAI API key is required');
      }
      break;
    case 'anthropic':
      if (!config.anthropicApiKey) {
        throw new Error('Anthropic API key is required');
      }
      break;
  }

  try {
    // First, perform OCR on the image
    const ocrResult = await performOCR(imageFile, config);
    
    // Then translate the text if needed
    const translatedText = await translateText(ocrResult.text, targetLanguage, config);
    
    // Finally, analyze the prescription using the selected LLM
    const analysis = await analyzePrescription(translatedText, config);
    
    return analysis;
  } catch (error) {
    console.error('Error processing prescription:', error);
    throw error;
  }
}

async function performOCR(imageFile: File, config: AppConfig): Promise<OCRResult> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${config.googleCloudApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: await imageFile.arrayBuffer().then(buf => Buffer.from(buf).toString('base64'))
          },
          features: [{
            type: 'TEXT_DETECTION'
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.responses[0]?.fullTextAnnotation?.text || '',
    confidence: data.responses[0]?.textAnnotations?.[0]?.confidence || 0
  };
}

async function analyzePrescription(text: string, config: AppConfig): Promise<string> {
  switch (config.llmProvider) {
    case 'google':
      return await analyzeWithGoogleAI(text, config);
    case 'openai':
      return await analyzeWithOpenAI(text, config);
    case 'anthropic':
      return await analyzeWithAnthropic(text, config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.llmProvider}`);
  }
}

async function analyzeWithGoogleAI(text: string, config: AppConfig): Promise<string> {
  const response = await fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/${config.googleCloudProjectId}/locations/us-central1/publishers/google/models/text-bison:predict`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.googleCloudApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: `Analyze this prescription and extract key information: ${text}`
        }],
        parameters: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.predictions[0]?.content || '';
}

async function analyzeWithOpenAI(text: string, config: AppConfig): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a medical professional analyzing prescriptions. Extract and organize key information.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function analyzeWithAnthropic(text: string, config: AppConfig): Promise<string> {
  if (!config.anthropicApiKey) {
    throw new Error('Anthropic API key is required');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this prescription and extract key information: ${text}`
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
} 