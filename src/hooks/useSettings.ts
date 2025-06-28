
import { useState, useEffect } from 'react';

export type TranscriptionProvider = 'huggingface' | 'openai' | 'assemblyai';

export interface Settings {
  transcriptionProvider: TranscriptionProvider;
  apiKey: string;
  dataStorage: string;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  transcriptionProvider: 'huggingface',
  apiKey: '',
  dataStorage: 'supabase',
  darkMode: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem('vocalNoteSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('vocalNoteSettings', JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
  };
};
