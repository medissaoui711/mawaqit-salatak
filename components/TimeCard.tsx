import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface TimeCardProps {
  currentTime: Date;
  hijriDate: string;
  gregorianDate: string;
  nextPrayerName: string;
  timeToNext: string;
}

const TimeCard: React.FC<TimeCardProps> = ({ currentTime, hijriDate, gregorianDate, nextPrayerName, timeToNext }) => {
  const { t } = useSettings();
  
  return (
    <div 
      className="w-full bg-white dark:bg-card rounded-3xl p-8 mb-6 border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden min-h-[250px] flex flex-col justify-center transition-colors"
      role="region"
      aria-label={t('common.timeRemainingFor') + ' ' + nextPrayerName}
    >
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[100px] rounded-full pointer-events-none -mr-20 -mt-20" aria-hidden="true"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-zinc-500 dark:text-zinc-400 text-lg mb-2 font-medium tracking-wide" aria-live="polite">
           {t('common.remaining')} {nextPrayerName}
        </h2>
        
        {/* Huge Timer */}
        <div 
          className="text-6xl md:text-7xl font-mono font-black text-zinc-900 dark:text-white mb-4 tracking-tighter drop-shadow-sm dark:drop-shadow-lg" 
          dir="ltr"
          aria-live="off"
        >
          {timeToNext}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
           <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm mx-2">{t('common.gregorian')}</span>
              <span className="text-neon font-black">{gregorianDate}</span>
           </div>
           <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm mx-2">{t('common.hijri')}</span>
              <span className="text-zinc-900 dark:text-white font-black">{hijriDate}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCard;
