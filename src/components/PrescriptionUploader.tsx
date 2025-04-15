import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PrescriptionData } from '../types/prescription';

interface PrescriptionUploaderProps {
  onUploadComplete: (data: PrescriptionData) => void;
}

export default function PrescriptionUploader({ onUploadComplete }: PrescriptionUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8002/api/analyze-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process prescription');
      }

      const data = await response.json();
      onUploadComplete(data);
    } catch (error) {
      console.error('Error processing prescription:', error);
      setError(error instanceof Error ? error.message : 'Failed to process prescription');
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Processing prescription...</p>
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
            <p className="text-lg text-gray-600">
              {isDragActive
                ? 'Drop the prescription here'
                : 'Drag and drop a prescription here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 