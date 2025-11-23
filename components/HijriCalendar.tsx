
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PrayerData } from '../types';
import { Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface HijriCalendarProps {
  monthData: PrayerData[];
}

const HijriCalendar: React.FC<HijriCalendarProps> = ({ monthData }) => {
  const { t, isRTL } = useSettings();

  if (!monthData || monthData.length === 0) return (
    <div className="text-center text-zinc-500 py-10">{t('common.loading')}</div>
  );

  // Basic check for white days (13, 14, 15 of Hijri Month)
  const isWhiteDay = (hijriDay: string) => {
    const d = parseInt(hijriDay);
    return d === 13 || d === 14 || d === 15;
  };

  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -20 }}
       className="pb-20"
    >
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-bold text-neon flex items-center gap-2">
            <Moon className="w-6 h-6" />
            {t('common.calendar')}
         </h2>
         <div className="text-sm text-zinc-400">
            {monthData[0].date.hijri.month[isRTL ? 'ar' : 'en']} {monthData[0].date.hijri.year}
         </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-zinc-500 text-xs font-bold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
         {monthData.map((day, idx) => {
           const hijriDay = parseInt(day.date.hijri.day);
           const isWhite = isWhiteDay(day.date.hijri.day);
           const isFri = day.date.gregorian.weekday.en === 'Friday';
           
           return (
             <div 
               key={idx}
               className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative ${
                 isWhite ? 'bg-neon/10 border-neon text-white' : 
                 isFri ? 'bg-zinc-800 border-zinc-600 text-white' : 
                 'bg-card border-zinc-800 text-zinc-400'
               }`}
             >
               {isWhite && (
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-neon rounded-full shadow-[0_0_5px_#53ff4c]"></div>
               )}
               <span className="text-lg font-bold">{hijriDay}</span>
               <span className="text-[10px] opacity-50">{day.date.gregorian.day}</span>
             </div>
           );
         })}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon/10 border border-neon"></div>
          {t('common.whiteDays')}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-600"></div>
          Jumuah
        </div>
      </div>

    </motion.div>
  );
};

export default HijriCalendar;
