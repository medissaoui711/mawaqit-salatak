import React, { useState, useRef } from 'react';
import { ATHKAR_DATA } from '../utils/athkarData';
import { useSettings } from '../contexts/SettingsContext';
import { Pause, RotateCcw, CheckCircle2, CloudRain, Copy, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AthkarWidget: React.FC = () => {
  const { t } = useSettings();
  const [activeCategory, setActiveCategory] = useState<string>('morning');
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const athkarList = ATHKAR_DATA.filter(a => a.category === activeCategory || a.category === 'common');
  
  const categories = ['morning', 'evening', 'sleep', 'travel', 'food', 'sadness'];

  const handleIncrement = (id: number, target: number) => {
    setCounters(prev => ({ ...prev, [id]: Math.min((prev[id] || 0) + 1, target) }));
  };

  const handleReset = () => {
    if (window.confirm(t('common.reset') + '?')) setCounters({});
  };

  const toggleAmbient = () => {
    if (!audioRef.current) audioRef.current = new Audio("https://actions.google.com/sounds/v1/nature/rain_heavy_loud.ogg");
    if (isAmbientPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.error(e));
    }
    setIsAmbientPlaying(!isAmbientPlaying);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Athkar', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert(t('common.copied'));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neon">{t('common.athkar')}</h2>
        <button onClick={toggleAmbient} className={`p-2 rounded-full border transition-all flex items-center gap-2 px-4 ${isAmbientPlaying ? 'bg-neon/20 border-neon text-neon' : 'border-zinc-700 text-zinc-400'}`}>
          {isAmbientPlaying ? <Pause className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
          <span className="text-xs font-bold">{isAmbientPlaying ? t('common.stopAmbient') : t('common.playAmbient')}</span>
        </button>
      </div>
      <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-neon text-black border-neon shadow-[0_0_10px_rgba(83,255,76,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
              {t(`common.${cat}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {athkarList.map((thikr) => {
            const count = counters[thikr.id] || 0;
            const progress = (count / thikr.count) * 100;
            const isCompleted = count >= thikr.count;

            return (
              <motion.div key={thikr.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`relative overflow-hidden rounded-xl border ${isCompleted ? 'border-neon/30 bg-neon/5' : 'border-zinc-800 bg-card'} p-4 transition-colors`}>
                <div className="absolute bottom-0 left-0 h-1 bg-neon transition-all duration-300" style={{ width: `${progress}%` }} />
                <div className="flex justify-between items-start gap-4 mb-3 relative z-10">
                  <p className={`text-lg leading-loose font-quran ${isCompleted ? 'text-zinc-400' : 'text-white'}`}>{thikr.text}</p>
                  <div className="flex flex-col items-center min-w-[60px]"><span className={`text-2xl font-mono font-bold ${isCompleted ? 'text-neon' : 'text-white'}`}>{count}/{thikr.count}</span></div>
                </div>
                {thikr.description && <p className="text-xs text-zinc-500 mb-4 relative z-10">{thikr.description}</p>}
                <div className="flex items-center gap-2 relative z-10">
                   <button onClick={() => handleIncrement(thikr.id, thikr.count)} disabled={isCompleted} className={`flex-1 py-3 rounded-lg text-center font-bold transition-all active:scale-95 ${isCompleted ? 'bg-transparent text-neon cursor-default' : 'bg-zinc-800 hover:bg-zinc-700 text-white hover:text-neon shadow-lg'}`}>
                      {isCompleted ? <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" />{t('common.completed')}</div> : t('common.athkar')}
                   </button>
                   <button onClick={() => handleCopy(thikr.text, thikr.id)} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">{copiedId === thikr.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}</button>
                   <button onClick={() => handleShare(thikr.text)} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <button onClick={handleReset} className="w-full mt-8 py-3 text-zinc-500 hover:text-white flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />{t('common.reset')}</button>
    </motion.div>
  );
};

export default AthkarWidget;
