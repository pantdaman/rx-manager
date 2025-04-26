import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig } from '../types/config';

interface AppConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const defaultConfig: AppConfig = {
  apiKeys: {
    googleCloud: {
      translationApiKey: '',
      visionApiKey: '',
      geminiApiKey: '',
    },
    openai: '',
    anthropic: '',
  },
  llmProvider: 'google',
  ocrProvider: 'tesseract',
};

const AppConfigContext = createContext<AppConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
});

export const useAppConfig = () => useContext(AppConfigContext);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    // Load config from localStorage on mount
    const savedConfig = localStorage.getItem('rx-manager-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error loading config from localStorage:', e);
      }
    }
  }, []);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('rx-manager-config', JSON.stringify(updatedConfig));
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}; 