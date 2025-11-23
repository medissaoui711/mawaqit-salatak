
import React, { useEffect, useState } from 'react';
import { VolumeX, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface MasjidModeProps {
  isActive: boolean;
  onClose: () => void;
  durationMinutes?: number;
}

const MasjidMode: React.FC<MasjidModeProps> = ({ isActive, onClose, durationMinutes = 20 }) => {
  const { t } = useSettings();
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durationMinutes * 60);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onClose, durationMinutes]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center">
       <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl shadow-neon/10 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
             <VolumeX className="w-10 h-10 text-neon" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{t('common.masjidModeActive')}</h2>
          <p className="text-zinc-400 mb-8">{t('common.silencePhone')}</p>
          
          <div className="text-6xl font-mono font-bold text-neon mb-8">
            {formatTime(timeLeft)}
          </div>

          <button 
             onClick={onClose}
             className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold transition-colors flex items-center gap-2"
          >
             <X className="w-5 h-5" />
             {t('common.stop')}
          </button>
       </div>
    </div>
  );
};

export default MasjidMode;
