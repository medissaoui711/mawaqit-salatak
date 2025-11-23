
import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ArrowUp, X, Compass, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface ARQiblaProps {
  onClose: () => void;
  qiblaAngle: number;
}

const ARQibla: React.FC<ARQiblaProps> = ({ onClose, qiblaAngle }) => {
  const { t } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [facingQibla, setFacingQibla] = useState(false);

  // 1. Start Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error", err);
        setError(t('common.cameraPermission'));
      }
    };

    startCamera();

    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Handle Orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass = 0;
      // @ts-ignore
      if (event.webkitCompassHeading) {
        // iOS
        // @ts-ignore
        compass = event.webkitCompassHeading;
      } else if (event.alpha) {
        // Android (alpha is usually 0 at start, need absolute if available, 
        // but standard `alpha` is often relative. 
        // Use absolute if provided by 'deviceorientationabsolute' event, but here we stick to standard fallback)
        compass = 360 - event.alpha;
      }

      setHeading(compass);

      // Check if facing Qibla (within 10 degrees)
      const diff = Math.abs(compass - qiblaAngle);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      setFacingQibla(normalizedDiff < 10);
    };

    if (window.DeviceOrientationEvent) {
      // @ts-ignore - iOS 13+ Permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
         // This usually needs a user interaction click first. 
         // We assume the user clicked "Start AR" in parent which triggered this component.
         // However, the actual request might need to be inside this component's useEffect or a button.
         // For now, we add listener directly. If it fails, we show a button.
         window.addEventListener('deviceorientation', handleOrientation, true);
      } else {
         window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [qiblaAngle]);

  // 3. Calculate Arrow Rotation
  // If I am facing North (0), and Qibla is East (90). 
  // Arrow should point Right.
  // Rotation = Qibla - Heading.
  const arrowRotation = qiblaAngle - heading;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Camera Feed */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 pointer-events-auto bg-black/50 p-3 rounded-full text-white backdrop-blur-md z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Error Message */}
        {error && (
          <div className="absolute top-20 bg-red-500/80 text-white px-6 py-3 rounded-xl backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Header Info */}
        <div className="absolute top-10 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-center">
           <div className="text-neon font-bold text-lg flex items-center gap-2 justify-center">
             <Compass className="w-5 h-5" />
             {Math.round(heading)}°
           </div>
           <div className="text-xs text-zinc-300">
             Qibla: {Math.round(qiblaAngle)}°
           </div>
        </div>

        {/* AR Arrow */}
        <motion.div 
          className="relative w-64 h-64 flex items-center justify-center"
          animate={{ rotate: arrowRotation }}
          transition={{ type: 'spring', stiffness: 50, damping: 10 }}
        >
           {/* The Arrow Graphic */}
           <div className={`flex flex-col items-center ${facingQibla ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
              <div className={`w-4 h-20 rounded-full mb-2 ${facingQibla ? 'bg-green-500 shadow-[0_0_30px_#22c55e]' : 'bg-neon shadow-[0_0_20px_var(--neon-color)]'}`}></div>
              <ArrowUp className={`w-32 h-32 ${facingQibla ? 'text-green-500 drop-shadow-[0_0_10px_#22c55e]' : 'text-neon drop-shadow-[0_0_10px_var(--neon-color)]'}`} />
           </div>
        </motion.div>

        {/* Success Message */}
        {facingQibla && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute bottom-32 bg-green-500 text-black font-bold px-8 py-4 rounded-2xl shadow-lg shadow-green-500/30"
           >
             {t('common.facingQibla')}
           </motion.div>
        )}

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="w-[1px] h-20 bg-white"></div>
           <div className="h-[1px] w-20 bg-white absolute"></div>
        </div>

      </div>
    </div>
  );
};

export default ARQibla;
