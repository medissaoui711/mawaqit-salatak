
import React, { useState, useEffect } from 'react';
import { X, Globe, Calculator, Map as MapIcon, Save, Volume2, Play, Pause, AlertTriangle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { CALCULATION_METHODS, PrayerName } from '../types';
import LocationPicker from './LocationPicker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { latitude: number; longitude: number };
  onUpdateLocation: (coords: { latitude: number; longitude: number }, city: string) => void;
}

type Tab = 'general' | 'calculation' | 'location' | 'audio';

// Helper to get sound URL (matches App.tsx logic)
const getSoundUrl = (sound: string) => {
  switch(sound) {
    case 'makkah': return 'https://www.islamcan.com/audio/adhan/azan1.mp3';
    case 'madina': return 'https://www.islamcan.com/audio/adhan/azan2.mp3';
    case 'alaqsa': return 'https://www.islamcan.com/audio/adhan/azan3.mp3';
    case 'beep': return 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
    default: return '';
  }
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentCoords, onUpdateLocation }) => {
  const { settings, updateSettings, t, isRTL } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // Local state for unsaved changes
  const [localSettings, setLocalSettings] = useState(settings);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number, city: string} | null>(null);

  // Audio preview state
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    if (tempLocation) {
      onUpdateLocation({ latitude: tempLocation.lat, longitude: tempLocation.lng }, tempLocation.city);
    }
    onClose();
  };

  const updateLocal = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateOffset = (prayer: PrayerName, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      offsets: { ...prev.offsets, [prayer]: value }
    }));
  };

  const togglePreview = (sound: string) => {
    if (playingSound === sound && previewAudio) {
      previewAudio.pause();
      setPlayingSound(null);
      return;
    }

    if (previewAudio) {
      previewAudio.pause();
    }

    const url = getSoundUrl(sound);
    if (!url) return;

    const audio = new Audio(url);
    audio.onended = () => setPlayingSound(null);
    audio.play().catch(e => alert("Cannot play sound. Please check connection or permissions. Error: " + e.message));
    setPreviewAudio(audio);
    setPlayingSound(sound);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">{t('common.settings')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-zinc-800 bg-zinc-900/50 overflow-x-auto">
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
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">{t('common.language')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['ar', 'en', 'fr'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateLocal('language', lang)}
                      className={`py-3 rounded-xl border transition-all ${
                        localSettings.language === lang
                          ? 'border-neon bg-neon/10 text-neon'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">{t('common.adhanSound')}</label>
                <div className="space-y-2">
                  {['makkah', 'madina', 'alaqsa', 'beep', 'none'].map((sound) => (
                    <div key={sound} className="flex gap-2">
                        <button
                          onClick={() => updateLocal('adhanSound', sound)}
                          className={`flex-1 py-3 px-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                            localSettings.adhanSound === sound
                              ? 'border-neon bg-neon/10 text-neon'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {/* @ts-ignore */}
                          <span>{t(`common.sounds.${sound}`)}</span>
                          {localSettings.adhanSound === sound && <Volume2 className="w-4 h-4" />}
                        </button>
                        
                        {sound !== 'none' && (
                            <button 
                                onClick={() => togglePreview(sound)}
                                className={`w-12 flex items-center justify-center rounded-xl border transition-all ${
                                    playingSound === sound 
                                    ? 'border-neon bg-neon text-black' 
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white'
                                }`}
                                aria-label="Preview Sound"
                            >
                                {playingSound === sound ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Autoplay Warning */}
              <div className="p-4 bg-zinc-900/80 rounded-xl border border-yellow-500/20 flex gap-3">
                 <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-yellow-500 mb-1">{t('common.audioWarningTitle')}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{t('common.audioWarning')}</p>
                 </div>
              </div>
            </div>
          )}

          {/* Calculation Tab */}
          {activeTab === 'calculation' && (
            <div className="space-y-6">
              {/* Method */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">{t('common.method')}</label>
                <select 
                  value={localSettings.calculationMethod}
                  onChange={(e) => updateLocal('calculationMethod', Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-neon"
                >
                  {CALCULATION_METHODS.map(method => (
                    <option key={method.id} value={method.id}>
                      {/* @ts-ignore */}
                      {method.name[localSettings.language]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Madhab */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">{t('common.madhab')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateLocal('madhab', 0)}
                    className={`py-3 px-4 rounded-xl border text-sm transition-all ${
                      localSettings.madhab === 0
                        ? 'border-neon bg-neon/10 text-neon'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {t('common.shafi')}
                  </button>
                  <button
                    onClick={() => updateLocal('madhab', 1)}
                    className={`py-3 px-4 rounded-xl border text-sm transition-all ${
                      localSettings.madhab === 1
                        ? 'border-neon bg-neon/10 text-neon'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {t('common.hanafi')}
                  </button>
                </div>
              </div>

              {/* Offsets */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h3 className="font-bold text-white">{t('common.adjustments')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).map((prayer) => (
                    <div key={prayer} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                      <span className="text-sm text-zinc-300">{t(`prayers.${prayer}`)}</span>
                      <input 
                        type="number" 
                        value={localSettings.offsets[prayer]} 
                        onChange={(e) => updateOffset(prayer, Number(e.target.value))}
                        className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center text-white focus:border-neon outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
               <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                 <button 
                    onClick={() => updateLocal('locationMode', 'auto')}
                    className={`flex-1 py-2 rounded-md text-sm ${localSettings.locationMode === 'auto' ? 'bg-zinc-800 text-neon font-bold' : 'text-zinc-500'}`}
                 >
                   {t('common.autoLocation')}
                 </button>
                 <button 
                    onClick={() => updateLocal('locationMode', 'manual')}
                    className={`flex-1 py-2 rounded-md text-sm ${localSettings.locationMode === 'manual' ? 'bg-zinc-800 text-neon font-bold' : 'text-zinc-500'}`}
                 >
                   {t('common.manualLocation')}
                 </button>
               </div>

               {localSettings.locationMode === 'manual' && (
                 <LocationPicker 
                    initialCoords={currentCoords} 
                    onLocationSelect={(coords, city) => {
                      setTempLocation({ lat: coords.latitude, lng: coords.longitude, city });
                    }}
                 />
               )}

               {tempLocation && (
                 <div className="text-green-400 text-sm text-center bg-green-400/10 py-2 rounded border border-green-400/20">
                   {t('common.location')}: {tempLocation.city}
                 </div>
               )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
           >
             {t('common.cancel')}
           </button>
           <button 
             onClick={handleSave}
             className="flex-1 py-3 rounded-xl bg-neon text-black font-bold hover:bg-[#42e03c] transition-colors flex items-center justify-center gap-2"
           >
             <Save className="w-5 h-5" />
             {t('common.save')}
           </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
