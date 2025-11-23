
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { PrayerName } from '../types';

interface LiveBackgroundProps {
  nextPrayer: PrayerName;
  timeLeft: number;
  themeMode: 'auto' | 'manual';
}

const LiveBackground: React.FC<LiveBackgroundProps> = ({ nextPrayer, timeLeft, themeMode }) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    // Simulate position based on time. 
    // In a real app, calculate percent between previous and next prayer.
    // Here, we just use a sine wave effect for demo or simple linear.
    const interval = setInterval(() => {
       const date = new Date();
       const totalMinutes = date.getHours() * 60 + date.getMinutes();
       const percentOfDay = (totalMinutes / 1440) * 100;
       setPosition(percentOfDay);
    }, 60000); // Update every minute
    
    const date = new Date();
    const totalMinutes = date.getHours() * 60 + date.getMinutes();
    setPosition((totalMinutes / 1440) * 100);

    return () => clearInterval(interval);
  }, []);

  // Determine if day or night
  const isDay = nextPrayer === 'Dhuhr' || nextPrayer === 'Asr' || nextPrayer === 'Maghrib';
  
  if (themeMode === 'manual') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
       <div 
         className="absolute top-20 transition-all duration-[1000ms]"
         style={{ 
           left: `${position}%`, 
           transform: `translateY(${Math.sin((position / 100) * Math.PI) * 50}px)` 
         }}
       >
          {isDay ? (
             <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl">
                <Sun className="w-16 h-16 text-yellow-500 opacity-50 animate-pulse" />
             </div>
          ) : (
             <div className="w-32 h-32 bg-blue-500/20 rounded-full blur-3xl">
                <Moon className="w-16 h-16 text-blue-300 opacity-50" />
             </div>
          )}
       </div>
       
       {/* Gradient Overlay */}
       <div className={`absolute inset-0 bg-gradient-to-b ${isDay ? 'from-orange-500/5' : 'from-blue-900/10'} to-transparent`}></div>
    </div>
  );
};

export default LiveBackground;
