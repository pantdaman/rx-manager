export type LLMProvider = 'google' | 'openai' | 'anthropic';

export type OCRProvider = 'tesseract' | 'google-vision';

export interface AppConfig {
  llmProvider: LLMProvider;
  ocrProvider: OCRProvider;
  apiKeys: {
    googleCloud: {
      visionApiKey?: string;
      translationApiKey?: string;
      geminiApiKey?: string;
    };
    openai?: string;
    anthropic?: string;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  llmProvider: 'google',
  ocrProvider: 'tesseract',
  apiKeys: {
    googleCloud: {
      visionApiKey: '',
      translationApiKey: '',
      geminiApiKey: ''
    },
    openai: '',
    anthropic: ''
  }
}; 