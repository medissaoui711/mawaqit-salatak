
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

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // @ts-ignore
      if (event.webkitCompassHeading) {
        // @ts-ignore
        setDeviceHeading(event.webkitCompassHeading);
        setHasOrientationSupport(true);
      } else if (event.alpha) {
        setDeviceHeading(360 - event.alpha);
        setHasOrientationSupport(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);
  
  const compassRotation = hasOrientationSupport ? -deviceHeading : 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-zinc-800/50 backdrop-blur-sm w-full relative overflow-hidden">
      <h3 className="text-zinc-400 text-sm mb-4 font-bold tracking-wider">{t('common.qibla')} (QIBLA)</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Compass Ring */}
        <div 
          className="absolute w-full h-full rounded-full border-2 border-zinc-700 flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* North Marker */}
          <div className="absolute -top-3 w-2 h-4 bg-red-500 rounded-sm z-10"></div>
          <span className="absolute -top-8 text-xs font-bold text-red-500">N</span>
          
          {/* Qibla Indicator Marker on the Ring */}
          <div 
             className="absolute w-1 h-1/2 top-0 origin-bottom flex flex-col items-center justify-start pt-2"
             style={{ transform: `rotate(${qiblaAngle}deg)` }}
          >
             <div className="w-3 h-3 bg-neon rounded-full shadow-[0_0_10px_#53ff4c]"></div>
             <div className="w-0.5 h-4 bg-neon/50 mt-1"></div>
          </div>

          {/* Degree Ticks */}
          {[0, 90, 180, 270].map((deg) => (
            <div 
              key={deg} 
              className="absolute w-0.5 h-2 bg-zinc-600 top-0 origin-bottom"
              style={{ transform: `rotate(${deg}deg) translateY(-2px)` }} 
            />
          ))}
        </div>

        {/* Center Static Icon */}
        <div className="absolute bg-dark border border-zinc-700 w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-lg">
           <Navigation className={`w-8 h-8 text-zinc-500 ${!hasOrientationSupport ? 'opacity-50' : ''}`} />
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-neon text-2xl font-bold font-mono">{Math.round(qiblaAngle)}°</p>
        <p className="text-xs text-zinc-500 mt-1">
          {hasOrientationSupport 
            ? t('common.rotateDevice')
            : t('common.relativeToNorth')}
        </p>
      </div>
    </div>
  );
};

export default Compass;
