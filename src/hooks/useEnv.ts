export const useEnv = () => {
  // In Next.js, public environment variables are available through window.__NEXT_DATA__
  const env = typeof window !== 'undefined' 
    ? (window as any).__NEXT_DATA__?.props?.pageProps?.env || {}
    : {};

  console.log('Environment variables check:', {
    translationApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    visionApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    geminiApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY,
    allEnv: env
  });
  
  return {
    translationApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    visionApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    geminiApiKey: env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
  };
}; 