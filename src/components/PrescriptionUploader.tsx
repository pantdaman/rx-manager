import React, { useState, useRef } from 'react';
import { PrescriptionData } from '../types/prescription';
import '../styles/PrescriptionUploader.css';

interface PrescriptionUploaderProps {
  onUploadComplete: (data: PrescriptionData) => void;
}

const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-prescription`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to process prescription');
      }
      const data = await response.json();
      onUploadComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="prescription-uploader">
      <div className="upload-options">
        <div className="file-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="file-input"
            ref={fileInputRef}
          />
          <button 
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Prescription'}
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
          ref={photoInputRef}
        />
        <button 
          className="camera-button"
          onClick={() => photoInputRef.current?.click()}
          disabled={isUploading}
        >
          Take Photo
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PrescriptionUploader; 