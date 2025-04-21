export type OCRProvider = 'tesseract' | 'google-vision';

export interface AppConfig {
  llmProvider: 'google' | 'openai' | 'anthropic';
  googleCloudApiKey?: string;
  googleCloudProjectId?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  ocrProvider: OCRProvider;
  ocrApiKey?: string;
  visionApiKey?: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  llmProvider: 'openai',
  ocrProvider: 'tesseract',
}; 