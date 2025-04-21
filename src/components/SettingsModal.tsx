import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppConfig, DEFAULT_CONFIG } from '../types/config';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  
  &:hover {
    color: #111827;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const SaveButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  width: 100%;
  
  &:hover {
    background-color: #1d4ed8;
  }
`;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const savedConfig = localStorage.getItem('rx-manager-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    onClose();
  };

  const handleGoogleCloudConfigChange = (field: 'apiKey' | 'projectId', value: string) => {
    setConfig(prev => ({
      ...prev,
      googleCloudApiKey: field === 'apiKey' ? value : prev.googleCloudApiKey,
      googleCloudProjectId: field === 'projectId' ? value : prev.googleCloudProjectId
    }));
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>API Settings</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="ocrProvider">OCR Provider</Label>
            <Select
              id="ocrProvider"
              value={config.ocrProvider}
              onChange={(e) => setConfig(prev => ({ ...prev, ocrProvider: e.target.value as 'google' | 'azure' | 'tesseract' }))}
            >
              <option value="tesseract">Tesseract.js (Free, runs locally)</option>
              <option value="google">Google Cloud Vision API (Paid, more accurate)</option>
              <option value="azure">Azure Computer Vision API</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="llmProvider">LLM Provider</Label>
            <Select
              id="llmProvider"
              value={config.llmProvider}
              onChange={(e) => setConfig(prev => ({ ...prev, llmProvider: e.target.value as 'google' | 'openai' | 'anthropic' }))}
            >
              <option value="google">Google Gemini</option>
              <option value="openai">OpenAI GPT-4</option>
              <option value="anthropic">Anthropic Claude</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="googleCloudApiKey">Google Cloud API Key</Label>
            <Input
              type="password"
              id="googleCloudApiKey"
              value={config.googleCloudApiKey || ''}
              onChange={(e) => handleGoogleCloudConfigChange('apiKey', e.target.value)}
              placeholder="Enter Google Cloud API key"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="googleCloudProjectId">Google Cloud Project ID</Label>
            <Input
              type="text"
              id="googleCloudProjectId"
              value={config.googleCloudProjectId || ''}
              onChange={(e) => handleGoogleCloudConfigChange('projectId', e.target.value)}
              placeholder="Enter Google Cloud Project ID"
            />
          </FormGroup>

          {config.llmProvider === 'openai' && (
            <FormGroup>
              <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
              <Input
                type="password"
                id="openaiApiKey"
                value={config.openaiApiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                placeholder="Enter OpenAI API key"
              />
            </FormGroup>
          )}

          {config.llmProvider === 'anthropic' && (
            <FormGroup>
              <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
              <Input
                type="password"
                id="anthropicApiKey"
                value={config.anthropicApiKey || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, anthropicApiKey: e.target.value }))}
                placeholder="Enter Anthropic API key"
              />
            </FormGroup>
          )}

          <SaveButton type="submit">Save Settings</SaveButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SettingsModal; 