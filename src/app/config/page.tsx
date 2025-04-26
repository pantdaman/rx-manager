'use client';

import { useState, useEffect } from 'react';
import { AppConfig, DEFAULT_CONFIG, OCRProvider, LLMProvider } from '../../types/config';

export default function ConfigPage() {
  const [config, setConfig] = useState<AppConfig>({
    ...DEFAULT_CONFIG,
    apiKeys: {
      googleCloud: { 
        visionApiKey: '', 
        translationApiKey: '',
        geminiApiKey: '' 
      }
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('rx-manager-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig({
        ...DEFAULT_CONFIG,
        ...parsedConfig,
        apiKeys: {
          googleCloud: { 
            visionApiKey: parsedConfig.apiKeys?.googleCloud?.visionApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '', 
            translationApiKey: parsedConfig.apiKeys?.googleCloud?.translationApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY || '',
            geminiApiKey: parsedConfig.apiKeys?.googleCloud?.geminiApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY || ''
          },
          openai: parsedConfig.apiKeys?.openai || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          anthropic: parsedConfig.apiKeys?.anthropic || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || ''
        }
      });
    } else {
      // If no saved config, use environment variables
      setConfig({
        ...DEFAULT_CONFIG,
        apiKeys: {
          googleCloud: {
            visionApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '',
            translationApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY || '',
            geminiApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY || ''
          },
          openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          anthropic: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || ''
        }
      });
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      localStorage.setItem('rx-manager-config', JSON.stringify(config));
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save config:', error);
    }
    setIsSaving(false);
  };

  const handleGoogleCloudConfigChange = (field: 'visionApiKey' | 'translationApiKey' | 'geminiApiKey', value: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        googleCloud: {
          ...prev.apiKeys.googleCloud,
          [field]: value
        }
      }
    }));
  };

  const handleApiKeyChange = (provider: 'openai' | 'anthropic', value: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuration</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* OCR Provider Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">OCR Provider</h2>
            <div className="space-y-4">
              <label className="block">
                <input
                  type="radio"
                  name="ocr-provider"
                  value="tesseract"
                  checked={config.ocrProvider === 'tesseract'}
                  onChange={(e) => setConfig(prev => ({ ...prev, ocrProvider: e.target.value as OCRProvider }))}
                  className="mr-2"
                />
                Tesseract.js (Free, runs locally)
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="ocr-provider"
                  value="google-vision"
                  checked={config.ocrProvider === 'google-vision'}
                  onChange={(e) => setConfig(prev => ({ ...prev, ocrProvider: e.target.value as OCRProvider }))}
                  className="mr-2"
                />
                Google Cloud Vision API (Paid, more accurate)
              </label>
              {config.ocrProvider === 'google-vision' && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Vision API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.googleCloud.visionApiKey || ''}
                    onChange={(e) => handleGoogleCloudConfigChange('visionApiKey', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter your Google Vision API key"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get this from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Translation Provider Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Language Translation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Translation API Key
                </label>
                <input
                  type="password"
                  value={config.apiKeys.googleCloud.translationApiKey || ''}
                  onChange={(e) => handleGoogleCloudConfigChange('translationApiKey', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your Google Translation API key"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Get this from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google Cloud Console</a>
                </p>
              </div>
            </div>
          </div>

          {/* LLM Provider Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">LLM Provider</h2>
            <div className="space-y-4">
              <label className="block">
                <input
                  type="radio"
                  name="llm-provider"
                  value="google"
                  checked={config.llmProvider === 'google'}
                  onChange={(e) => setConfig(prev => ({ ...prev, llmProvider: e.target.value as LLMProvider }))}
                  className="mr-2"
                />
                Google Gemini
              </label>
              {config.llmProvider === 'google' && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.googleCloud.geminiApiKey || ''}
                    onChange={(e) => handleGoogleCloudConfigChange('geminiApiKey', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter your Gemini API key from Google AI Studio"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get this from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google AI Studio</a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Keys</h2>
            <div className="space-y-4">
              {/* OpenAI Configuration */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">OpenAI Configuration</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.openai}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter your OpenAI API key"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get this from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">OpenAI Dashboard</a>
                  </p>
                </div>
              </div>

              {/* Anthropic Configuration */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Anthropic Configuration</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter your Anthropic API key"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get this from <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Anthropic Console</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`mt-4 p-4 rounded-md ${
              saveStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {saveStatus === 'success' ? 'Configuration saved successfully!' : 'Failed to save configuration'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 