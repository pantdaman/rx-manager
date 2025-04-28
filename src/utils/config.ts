export const getApiKey = (keyName: string): string => {
  // First try to get from localStorage config object
  const configStr = localStorage.getItem('rx-manager-config');
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      if (keyName === API_KEYS.VISION && config.apiKeys?.googleCloud?.visionApiKey) {
        return config.apiKeys.googleCloud.visionApiKey;
      }
    } catch (e) {
      console.error('Error parsing config from localStorage:', e);
    }
  }

  // Then try to get from environment variables
  // In Next.js, public environment variables are available at build time
  // and are embedded in the client-side JavaScript
  if (typeof window !== 'undefined') {
    // We're in the browser
    const envKey = (window as any).__NEXT_DATA__?.props?.pageProps?.env?.[keyName];
    if (envKey) {
      return envKey;
    }
  } else {
    // We're on the server
    const envKey = process.env[keyName];
    if (envKey) {
      return envKey;
    }
  }

  // If neither exists, return empty string
  return '';
};

export const API_KEYS = {
  TRANSLATION: 'NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY',
  VISION: 'NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY',
  GEMINI: 'NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY',
} as const;

export const getVisionApiKey = () => getApiKey(API_KEYS.VISION); 