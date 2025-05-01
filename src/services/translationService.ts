import { AppConfig } from '../types/config';
import { getApiKey, API_KEYS } from '../utils/config';

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

export async function translateText(text: string | undefined, targetLanguage: string, config: AppConfig, sourceLanguage: string = 'en'): Promise<string> {

  if (!text || text.trim() === '') {
    return '';
  }

  if (targetLanguage.toLowerCase() === sourceLanguage.toLowerCase()) {
    return text;
  }

  // Get API key from centralized config
  const apiKey = getApiKey(API_KEYS.TRANSLATION) || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;

  if (!apiKey) {
    throw new Error('Google Translation API key is not configured. Please set it in settings or environment variables.');
  }

  try {
    // Build request body, omitting 'source' if sourceLanguage is 'auto'
    const body: any = {
      q: text.trim(),
      target: targetLanguage,
    };
    if (sourceLanguage !== 'auto') {
      body.source = sourceLanguage;
    }
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Translation API error details:', errorText);
      throw new Error(
        `Translation API error: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    const data: TranslationResponse = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to translate text');
  }
}

export function getEstimatedCharacterCount(text: string): number {
  return text.length;
}

export function getEstimatedCost(characterCount: number): number {
  const ratePerMillion = 20; // $20 per million characters
  return (characterCount / 1_000_000) * ratePerMillion;
} 