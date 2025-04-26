import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PrescriptionData } from '../types/prescription';
import styled from 'styled-components';

interface PrescriptionUploaderProps {
  onUploadComplete: (data: PrescriptionData) => void;
}

const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    setError(null);

    try {
      // Get user configuration from localStorage
      const configStr = localStorage.getItem('appConfig');
      const config = configStr ? JSON.parse(configStr) : null;

      // Log the source of API keys
      console.log('API Key Sources:', {
        visionApiKey: {
          fromLocalStorage: config?.apiKeys?.googleCloud?.visionApiKey || 'Not set',
          fromEnv: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || 'Not set',
          using: config?.apiKeys?.googleCloud?.visionApiKey ? 'LocalStorage' : 'Environment'
        }
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('ocrProvider', config?.ocrProvider || 'google-vision');
      
      // Use localStorage key or fallback to env variable
      const visionApiKey = config?.apiKeys?.googleCloud?.visionApiKey || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
      if (config?.ocrProvider === 'google-vision') {
        formData.append('apiKey', visionApiKey || '');
      }

      const response = await fetch(`https://rx-manager-backend-193388977136.us-central1.run.app/api/analyze-prescription`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze prescription');
      }

      const data = await response.json();
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
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Prescription</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-600">Processing prescription...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                {isDragActive
                  ? 'Drop the prescription here'
                  : 'Drag and drop a prescription here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: JPG, PNG, PDF
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PrescriptionUploader; 