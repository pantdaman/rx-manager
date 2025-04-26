import { AppConfig } from '../types/config';

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

export async function translateText(text: string | undefined, targetLanguage: string, config: AppConfig): Promise<string> {
  // Return empty string if text is undefined or empty
  console.log("Translation service debug:", {
    config,
    envTranslationKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    configTranslationKey: config?.apiKeys?.googleCloud?.translationApiKey
  });

  if (!text || text.trim() === '') {
    return '';
  }

  if (targetLanguage.toLowerCase() === 'en') {
    return text;
  }

  // Try to get API key from config or fall back to environment variable
  const apiKey = config?.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY;

  if (!apiKey) {
    throw new Error('Google Translation API key is not configured. Please set it in settings or environment variables.');
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text.trim(),
          source: 'en',
          target: targetLanguage,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Translation API error details:', errorData);
      throw new Error(
        `Translation API error: ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`
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