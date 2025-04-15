export type OCRProvider = 'google-vision' | 'tesseract';
export type LLMProvider = 'google-vertex' | 'openai' | 'anthropic';

export interface GoogleCloudConfig {
  apiKey: string;
  projectId: string;
}

export interface APIKeys {
  googleCloud?: GoogleCloudConfig;
  openai?: string;
  anthropic?: string;
}

export interface AppConfig {
  ocrProvider: OCRProvider;
  llmProvider: LLMProvider;
  apiKeys: APIKeys;
}

export const DEFAULT_CONFIG: AppConfig = {
  ocrProvider: 'tesseract',
  llmProvider: 'google-vertex',
  apiKeys: {}
}; 