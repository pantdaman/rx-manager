export const getApiKey = (keyName: string): string => {
  // First try to get from localStorage
  const storedKey = localStorage.getItem(keyName);
  if (storedKey) {
    return storedKey;
  }

  // Then try to get from environment variables
  const envKey = process.env[keyName];
  if (envKey) {
    return envKey;
  }

  // If neither exists, return empty string
  return '';
};

export const API_KEYS = {
  TRANSLATION: 'NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY',
  VISION: 'NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY',
  GEMINI: 'NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY',
} as const;

export const getTranslationApiKey = () => getApiKey(API_KEYS.TRANSLATION);
export const getVisionApiKey = () => getApiKey(API_KEYS.VISION);
export const getGeminiApiKey = () => getApiKey(API_KEYS.GEMINI); 