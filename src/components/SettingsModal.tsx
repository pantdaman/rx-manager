import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppConfig, DEFAULT_CONFIG, OCRProvider, LLMProvider } from '../types/config';

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
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      // Use environment variables as fallbacks
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

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    onSave(config);
    onClose();
  };

  const handleProviderChange = (provider: OCRProvider | LLMProvider, type: 'ocr' | 'llm') => {
    setConfig(prev => ({
      ...prev,
      ...(type === 'ocr' ? { ocrProvider: provider as OCRProvider } : { llmProvider: provider as LLMProvider })
    }));
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

  const handleOpenAIConfigChange = (value: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        openai: value
      }
    }));
  };

  const handleAnthropicConfigChange = (value: string) => {
    setConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        anthropic: value
      }
    }));
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>API Settings</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <form onSubmit={handleSave}>
          <FormGroup>
            <Label htmlFor="ocrProvider">OCR Provider</Label>
            <Select
              id="ocrProvider"
              value="google-vision"
              disabled
              onChange={(e) => handleProviderChange(e.target.value as OCRProvider, 'ocr')}
            >
              <option value="google-vision">Google Cloud Vision API (Paid, more accurate)</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="visionApiKey">Google Vision API Key</Label>
            <Input
              type="password"
              id="visionApiKey"
              value={config.apiKeys.googleCloud.visionApiKey || ''}
              onChange={(e) => handleGoogleCloudConfigChange('visionApiKey', e.target.value)}
              placeholder="Enter Google Vision API key"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="translationApiKey">Google Translation API Key</Label>
            <Input
              type="password"
              id="translationApiKey"
              value={config.apiKeys.googleCloud.translationApiKey || ''}
              onChange={(e) => handleGoogleCloudConfigChange('translationApiKey', e.target.value)}
              placeholder="Enter Google Translation API key"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="llmProvider">LLM Provider</Label>
            <Select
              id="llmProvider"
              value={config.llmProvider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider, 'llm')}
            >
              <option value="google">Google Gemini</option>
              <option value="openai">OpenAI GPT-4</option>
              <option value="anthropic">Anthropic Claude</option>
            </Select>
          </FormGroup>

          {config.llmProvider === 'google' && (
            <FormGroup>
              <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
              <Input
                type="password"
                id="geminiApiKey"
                value={config.apiKeys.googleCloud.geminiApiKey || ''}
                onChange={(e) => handleGoogleCloudConfigChange('geminiApiKey', e.target.value)}
                placeholder="Enter Google Gemini API key"
              />
            </FormGroup>
          )}

          {config.llmProvider === 'openai' && (
            <FormGroup>
              <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
              <Input
                type="password"
                id="openaiApiKey"
                value={config.apiKeys.openai || ''}
                onChange={(e) => handleOpenAIConfigChange(e.target.value)}
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
                value={config.apiKeys.anthropic || ''}
                onChange={(e) => handleAnthropicConfigChange(e.target.value)}
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