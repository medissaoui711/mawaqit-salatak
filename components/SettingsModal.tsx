import React, { useState } from 'react';
import { X, Globe, Calculator, Map as MapIcon, Save, Volume2, Sun, Moon, Laptop } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CALCULATION_METHODS, PrayerName, AppSettings, Coordinates } from '../types';
import LocationPicker from './LocationPicker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { latitude: number; longitude: number };
  onUpdateLocation: (coords: { latitude: number; longitude: number }, city: string) => void;
}

type Tab = 'general' | 'calculation' | 'location' | 'audio';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentCoords, onUpdateLocation }) => {
  const { settings, updateSettings, t } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // Local state for unsaved changes
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number, city: string} | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    if (tempLocation) {
      onUpdateLocation({ latitude: tempLocation.lat, longitude: tempLocation.lng }, tempLocation.city);
    }
    onClose();
  };

  const updateLocal = (key: keyof AppSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('common.settings')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-2 gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-x-auto">
          {[
            { id: 'general', icon: Globe, label: t('common.general') },
            { id: 'calculation', icon: Calculator, label: t('common.calculation') },
            { id: 'audio', icon: Volume2, label: t('common.audio') },
            { id: 'location', icon: MapIcon, label: t('common.location') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-neon text-black shadow-lg shadow-neon/20' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{t('common.language')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ar', 'en', 'fr'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateLocal('language', lang)}
                      className={`py-3 rounded-xl border transition-all ${
                        localSettings.language === lang
                          ? 'border-neon bg-neon/10 text-neon'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">{t('common.themeMode')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { mode: 'light', icon: Sun, label: 'فاتح' },
                    { mode: 'dark', icon: Moon, label: 'داكن' },
                    { mode: 'system', icon: Laptop, label: 'تلقائي' }
                  ] as const).map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => updateLocal('theme', mode)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                        localSettings.theme === mode
                          ? 'border-neon bg-neon/10 text-neon'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-6">
               <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                 <button 
                    onClick={() => updateLocal('locationMode', 'auto')}
                    className={`flex-1 py-2 rounded-md text-sm ${localSettings.locationMode === 'auto' ? 'bg-white dark:bg-zinc-800 text-neon font-bold' : 'text-zinc-500'}`}
                 >
                   {t('common.autoLocation')}
                 </button>
                 <button 
                    onClick={() => updateLocal('locationMode', 'manual')}
                    className={`flex-1 py-2 rounded-md text-sm ${localSettings.locationMode === 'manual' ? 'bg-white dark:bg-zinc-800 text-neon font-bold' : 'text-zinc-500'}`}
                 >
                   {t('common.manualLocation')}
                 </button>
               </div>

               {localSettings.locationMode === 'manual' && (
                 <LocationPicker initialCoords={currentCoords} onLocationSelect={(coords: Coordinates, city: string) => {
                    setTempLocation({ lat: coords.latitude, lng: coords.longitude, city });
                 }} />
               )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">{t('common.cancel')}</button>
           <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-neon text-black font-bold hover:bg-[#42e03c] transition-colors flex items-center justify-center gap-2"><Save className="w-5 h-5" />{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;