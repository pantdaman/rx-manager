import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AppConfig, DEFAULT_CONFIG, OCRProvider, LLMProvider } from '../types/config';
import { PrescriptionData } from '../types/prescription';
import MedicineSchedule from './MedicineSchedule';

interface SidebarProps {
  onUploadComplete: (data: PrescriptionData) => void;
}

export default function Sidebar({ onUploadComplete }: SidebarProps) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSaving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('rx-manager-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      localStorage.setItem('rx-manager-config', JSON.stringify(config));
      setSaveStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setSaveStatus(null);
      }, 1500);
    } catch (error) {
      setSaveStatus('error');
    }
    setSaving(false);
  };

  const handleGoogleCloudConfigChange = (field: 'apiKey' | 'projectId', value: string) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          googleCloud: {
            ...(prev.apiKeys.googleCloud || { apiKey: '', projectId: '' }),
            [field]: value
          }
        }
      };
      return newConfig as AppConfig;
    });
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8002/api/analyze-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze prescription');
      }

      const data = await response.json();
      setPrescriptionData(data);
      onUploadComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: false,
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-30 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
        </svg>
        Settings
      </button>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40"
           style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-8">
              {/* OCR Provider Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">OCR Provider</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="ocr-provider"
                      value="tesseract"
                      checked={config.ocrProvider === 'tesseract'}
                      onChange={(e) => setConfig(prev => ({ ...prev, ocrProvider: e.target.value as OCRProvider }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Tesseract.js</span>
                      <p className="text-sm text-gray-500">Free, local OCR processing</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="ocr-provider"
                      value="google-vision"
                      checked={config.ocrProvider === 'google-vision'}
                      onChange={(e) => setConfig(prev => ({ ...prev, ocrProvider: e.target.value as OCRProvider }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Google Vision</span>
                      <p className="text-sm text-gray-500">Cloud-based OCR with high accuracy</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* LLM Provider Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">LLM Provider</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="llm-provider"
                      value="google-vertex"
                      checked={config.llmProvider === 'google-vertex'}
                      onChange={(e) => setConfig(prev => ({ ...prev, llmProvider: e.target.value as LLMProvider }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Google Gemini</span>
                      <p className="text-sm text-gray-500">Advanced AI for prescription analysis</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="llm-provider"
                      value="openai"
                      checked={config.llmProvider === 'openai'}
                      onChange={(e) => setConfig(prev => ({ ...prev, llmProvider: e.target.value as LLMProvider }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">OpenAI</span>
                      <p className="text-sm text-gray-500">GPT-4 for detailed prescription analysis</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="llm-provider"
                      value="anthropic"
                      checked={config.llmProvider === 'anthropic'}
                      onChange={(e) => setConfig(prev => ({ ...prev, llmProvider: e.target.value as LLMProvider }))}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Anthropic</span>
                      <p className="text-sm text-gray-500">Claude for medical text understanding</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">API Keys</h3>
                <div className="space-y-4">
                  {/* Google Cloud Configuration */}
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project ID
                      </label>
                      <input
                        type="text"
                        value={config.apiKeys.googleCloud?.projectId || ''}
                        onChange={(e) => handleGoogleCloudConfigChange('projectId', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                        placeholder="Google Cloud Project ID"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={config.apiKeys.googleCloud?.apiKey || ''}
                        onChange={(e) => handleGoogleCloudConfigChange('apiKey', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                        placeholder="Gemini API Key"
                      />
                      <p className="mt-1 text-xs text-gray-600">
                        Get from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Google AI Studio</a>
                      </p>
                    </div>
                  </div>

                  {/* OpenAI Configuration */}
                  {config.llmProvider === 'openai' && (
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={config.apiKeys.openai || ''}
                        onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                        placeholder="OpenAI API Key"
                      />
                    </div>
                  )}

                  {/* Anthropic Configuration */}
                  {config.llmProvider === 'anthropic' && (
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anthropic API Key
                      </label>
                      <input
                        type="password"
                        value={config.apiKeys.anthropic || ''}
                        onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm text-gray-900"
                        placeholder="Anthropic API Key"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Save Button */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            {saveStatus === 'success' && (
              <p className="mt-2 text-sm text-green-600 text-center">Settings saved successfully!</p>
            )}
            {saveStatus === 'error' && (
              <p className="mt-2 text-sm text-red-600 text-center">Failed to save settings</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-[250px] bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-sm text-gray-600">Processing prescription...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'Drop the prescription here'
                    : 'Drag and drop a prescription here, or click to select'}
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, PDF
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-2 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {prescriptionData && (
        <div className="mt-6">
          <MedicineSchedule medicines={prescriptionData.medicines} />
        </div>
      )}
    </>
  );
} 