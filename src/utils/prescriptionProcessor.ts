import { PrescriptionData } from '../types/prescription';
import { AppConfig } from '../types/config';
import { performOCR } from '../services/ocrService';
import { analyzePrescription } from '../services/llmService';

export async function processPrescription(file: File): Promise<PrescriptionData> {
  try {
    // Get user configuration
    const configStr = localStorage.getItem('rx-manager-config');
    const config: AppConfig = configStr ? JSON.parse(configStr) : null;

    if (!config) {
      throw new Error('Please configure OCR and LLM providers in the settings page');
    }

    // Perform OCR based on selected provider
    const extractedText = await performOCR(
      file,
      config.ocrProvider,
      config.apiKeys.googleCloud?.apiKey
    );

    console.log('Extracted Text:', extractedText);

    // Process with selected LLM
    let apiKey: string;
    let projectId: string | undefined;
    switch (config.llmProvider) {
      case 'google-vertex':
        if (!config.apiKeys.googleCloud?.apiKey || !config.apiKeys.googleCloud?.projectId) {
          throw new Error('Google Cloud API key and Project ID are required. Please check your settings.');
        }
        apiKey = config.apiKeys.googleCloud.apiKey;
        projectId = config.apiKeys.googleCloud.projectId;
        break;
      case 'openai':
        if (!config.apiKeys.openai) {
          throw new Error('OpenAI API key is required');
        }
        apiKey = config.apiKeys.openai;
        break;
      case 'anthropic':
        if (!config.apiKeys.anthropic) {
          throw new Error('Anthropic API key is required');
        }
        apiKey = config.apiKeys.anthropic;
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${config.llmProvider}`);
    }

    const prescriptionData = await analyzePrescription(
      extractedText,
      config.llmProvider,
      apiKey,
      projectId
    );

    return prescriptionData;

  } catch (error) {
    console.error('Error processing prescription:', error);
    throw error;
  }
} 