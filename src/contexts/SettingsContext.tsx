import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Settings } from '../types';
import { SettingsService } from '../services/settings.service';
import { useDatabase } from './DatabaseContext';

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  updateSettings: (data: Partial<Omit<Settings, 'id'>>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isReady } = useDatabase();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!isReady) return;
      try {
        const loaded = await SettingsService.get();
        setSettings(loaded);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [isReady]);

  const updateSettings = useCallback(async (data: Partial<Omit<Settings, 'id'>>) => {
    try {
      const updated = await SettingsService.update(data);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      const reset = await SettingsService.reset();
      setSettings(reset);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
