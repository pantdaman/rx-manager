export const useEnv = () => {
  console.log('Environment variables check:', {
    translationApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    visionApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    geminiApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY,
    allEnv: process.env
  });
  
  return {
    translationApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    visionApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    geminiApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY
  };
}; 