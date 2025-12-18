import React, { useEffect, useState } from 'react';
import { Navigation } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface CompassProps {
  qiblaAngle: number;
}

const Compass: React.FC<CompassProps> = ({ qiblaAngle }) => {
  const { t } = useSettings();
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasOrientationSupport, setHasOrientationSupport] = useState<boolean>(false);
  const [isFacingQibla, setIsFacingQibla] = useState<boolean>(false);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      // @ts-ignore
      if (event.webkitCompassHeading) {
        // @ts-ignore
        heading = event.webkitCompassHeading;
        setHasOrientationSupport(true);
      } else if (event.alpha) {
        heading = 360 - event.alpha;
        setHasOrientationSupport(true);
      }

      setDeviceHeading(heading);

      // Check if user is facing Qibla (tolerance of 10 degrees)
      const diff = Math.abs(heading - qiblaAngle);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      setIsFacingQibla(normalizedDiff < 10);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [qiblaAngle]);
  
  const compassRotation = hasOrientationSupport ? -deviceHeading : 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm w-full relative overflow-hidden transition-colors">
      <h3 className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 font-bold tracking-wider">{t('common.qibla')}</h3>
      
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Glowing Background Effect when facing Qibla */}
        <div className={`absolute inset-0 rounded-full blur-[40px] transition-all duration-1000 ${isFacingQibla ? 'bg-neon/30 opacity-100' : 'bg-transparent opacity-0'}`}></div>

        {/* Compass Ring */}
        <div 
          className="absolute w-full h-full rounded-full border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* North Marker */}
          <div className="absolute -top-3 w-2.5 h-6 bg-red-500 rounded-sm z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span className="absolute -top-10 text-sm font-black text-red-500">N</span>
          
          {/* Qibla Indicator Marker on the Ring */}
          <div 
             className="absolute w-1 h-1/2 top-0 origin-bottom flex flex-col items-center justify-start pt-2"
             style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
             <div className="w-4 h-4 bg-neon rounded-full shadow-[0_0_15px_var(--neon-color)] animate-pulse"></div>
             <div className="w-0.5 h-8 bg-neon/30 mt-1"></div>
          </div>

          {/* Compass Ticks */}
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-0.5 ${i % 6 === 0 ? 'h-4 bg-zinc-400' : 'h-2 bg-zinc-200 dark:bg-zinc-800'} top-0 origin-bottom`}
              style={{ transform: `rotate(${i * 15}deg)` }} 
            />
          ))}
        </div>

        {/* Center Static Icon */}
        <div className={`absolute bg-zinc-50 dark:bg-dark border border-zinc-200 dark:border-zinc-700 w-20 h-20 rounded-full flex items-center justify-center z-20 shadow-xl transition-all ${isFacingQibla ? 'scale-110 border-neon ring-4 ring-neon/20' : ''}`}>
           <Navigation className={`w-10 h-10 transition-colors ${isFacingQibla ? 'text-neon' : 'text-zinc-300 dark:text-zinc-600'}`} />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2">
           <p className={`text-4xl font-black font-mono transition-colors ${isFacingQibla ? 'text-neon' : 'text-zinc-900 dark:text-white'}`}>{Math.round(qiblaAngle)}°</p>
           {isFacingQibla && <span className="text-neon text-xs font-black animate-bounce">QIBLA!</span>}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mt-2 font-bold">
          {hasOrientationSupport 
            ? t('common.rotateDevice')
            : t('common.relativeToNorth')}
        </p>
      </div>
    </div>
  );
};

export default Compass;
