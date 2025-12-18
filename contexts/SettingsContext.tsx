import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, DEFAULT_SETTINGS, Language, ThemeMode } from '../types';
import { resources } from '../utils/i18n';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('mawaqit_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.warn("Failed to parse settings, resetting to default", e);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mawaqit_settings', JSON.stringify(settings));
      
      const root = document.documentElement;
      
      // Handle Language and RTL
      root.lang = settings.language;
      root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';

      // Handle Theme
      applyTheme(settings.theme);

    } catch (e) {
      console.error("Failed to save settings", e);
    }
  }, [settings]);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', mode === 'dark');
    }
  };

  // Listen for system theme changes if mode is system
  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = resources[settings.language];
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    return current as string;
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      t,
      isRTL: settings.language === 'ar' 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
