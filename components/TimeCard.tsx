
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
      className="w-full bg-card rounded-3xl p-8 mb-6 border border-zinc-800 shadow-xl relative overflow-hidden min-h-[250px] flex flex-col justify-center"
      role="region"
      aria-label={t('common.timeRemainingFor') + ' ' + nextPrayerName}
    >
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[100px] rounded-full pointer-events-none -mr-20 -mt-20" aria-hidden="true"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-zinc-400 text-lg mb-2 font-medium tracking-wide" aria-live="polite">
           {t('common.remaining')} {nextPrayerName}
        </h2>
        
        {/* Huge Timer */}
        <div 
          className="text-6xl md:text-7xl font-mono font-bold text-white mb-4 tracking-tighter drop-shadow-lg" 
          dir="ltr"
          aria-live="off" // We don't want screen readers announcing every second automatically, user can check manually
        >
          {timeToNext}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
           <div className="bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800 backdrop-blur-md">
              <span className="text-zinc-400 text-sm mx-2">{t('common.gregorian')}</span>
              <span className="text-neon font-bold">{gregorianDate}</span>
           </div>
           <div className="bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800 backdrop-blur-md">
              <span className="text-zinc-400 text-sm mx-2">{t('common.hijri')}</span>
              <span className="text-white font-bold">{hijriDate}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCard;
