
import React from 'react';
import { PrayerName } from '../types';
import { formatTimeShort } from '../utils/timeUtils';
import { useSettings } from '../contexts/SettingsContext';

interface PrayerCardProps {
  name: PrayerName;
  time: string;
  isActive: boolean;
  isNext: boolean;
  className?: string;
}

const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isActive, isNext }) => {
  const { t } = useSettings();
  const formattedTime = formatTimeShort(time);
  const translatedName = t(`prayers.${name}`);

  return (
    <div
      role="article"
      aria-label={`${translatedName} ${t('common.at')} ${formattedTime} ${isActive ? t('common.active') : ''}`}
      className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-300 group
        flex flex-col items-center justify-between min-h-[120px]
        ${isActive 
          ? 'bg-zinc-800/80 border-neon/50 border shadow-neon scale-[1.02]' 
          : 'bg-card border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'}
      `}
    >
      {/* Active Glow Background Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-neon/5 pointer-events-none animate-pulse" aria-hidden="true" />
      )}

      <div className="w-full flex justify-between items-center mb-2 relative z-10">
        <span className={`text-sm font-bold ${isActive ? 'text-neon' : 'text-zinc-400'}`}>
          {translatedName}
        </span>
        {isActive && (
          <span className="flex h-2 w-2 relative" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
          </span>
        )}
      </div>

      <div className={`text-2xl font-mono font-semibold tracking-wider relative z-10 ${isActive ? 'text-white' : 'text-zinc-300'}`}>
        {formattedTime}
      </div>

      {/* Decorative subtle line */}
      <div className={`w-8 h-0.5 mt-3 rounded-full ${isActive ? 'bg-neon' : 'bg-zinc-700 group-hover:bg-zinc-600'}`} aria-hidden="true" />
    </div>
  );
};

export default PrayerCard;
