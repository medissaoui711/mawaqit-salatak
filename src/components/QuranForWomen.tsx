
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { BookText, Droplets, Info, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component for Women's specific Quranic and purity tracking needs
const QuranForWomen: React.FC = () => {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<'mushaf' | 'tracker'>('mushaf');
  
  // State for Purity Tracker using localStorage for persistence
  const [cycleInfo, setCycleInfo] = useState(() => {
    const saved = localStorage.getItem('mawaqit_purity_tracker');
    if (saved) return JSON.parse(saved);
    const today = new Date();
    return {
      startDate: today.toISOString().split('T')[0],
      duration: 7,
    };
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('mawaqit_purity_tracker', JSON.stringify(cycleInfo));
  }, [cycleInfo]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCycleInfo({ ...cycleInfo, [e.target.name]: e.target.value });
  };

  // Calculate current purity status based on cycle information
  const getPurityStatus = () => {
    const start = new Date(cycleInfo.startDate);
    const now = new Date();
    // Normalize to start of day for accurate day counting
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if within the menstrual period duration
    if (diffDays >= 0 && diffDays < cycleInfo.duration) {
      return { inCycle: true, day: diffDays + 1 };
    }
    return { inCycle: false, day: 0 };
  };

  const status = getPurityStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neon">{t('common.quranWomen')}</h2>
      </div>

      {/* Mode Selection Tabs */}
      <div className="flex p-1 gap-1 bg-zinc-900 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('mushaf')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'mushaf' ? 'bg-card text-neon' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
          <BookText className="w-4 h-4" /> {t('common.mushaf')}
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'tracker' ? 'bg-card text-neon' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
          <Droplets className="w-4 h-4" /> {t('common.rulingsAndTracker')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mushaf' && (
          <motion.div
            key="mushaf"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center p-10 bg-card rounded-2xl border border-zinc-800"
          >
            <BookText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="font-bold text-white">{t('common.mushaf')}</h3>
            <p className="text-sm text-zinc-500 mt-2">
              قريباً... واجهة تفاعلية لقراءة القرآن مع أحكام التجويد الملونة والفهرس الموضوعي.
            </p>
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-card p-6 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-white text-lg">{t('common.purityTracker')}</h3>
                 <button onClick={() => setIsEditing(!isEditing)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
                   <Edit3 className="w-4 h-4"/>
                 </button>
              </div>

              {isEditing ? (
                 <div className="space-y-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                    <h4 className="text-sm font-bold text-neon">{t('common.setCycleInfo')}</h4>
                    <div>
                       <label className="text-xs text-zinc-400 mb-1 block">{t('common.cycleStartDate')}</label>
                       <input type="date" name="startDate" value={cycleInfo.startDate} onChange={handleInfoChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white" />
                    </div>
                    <div>
                       <label className="text-xs text-zinc-400 mb-1 block">{t('common.cycleDuration')}</label>
                       <div className="flex items-center gap-2">
                          <input type="number" name="duration" value={cycleInfo.duration} onChange={handleInfoChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white" />
                          <span className="text-zinc-500 text-sm">{t('common.days')}</span>
                       </div>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="w-full mt-2 bg-neon text-black py-2 rounded-lg font-bold text-xs">
                      {t('common.save')}
                    </button>
                 </div>
              ) : (
                <div className="text-center space-y-4">
                    <p className="text-zinc-400 text-sm">{t('common.status')}</p>
                    {status.inCycle ? (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <h4 className="font-bold text-red-500 mb-1">{t('common.menstrualPeriod')}</h4>
                            <p className="text-xs text-zinc-400">اليوم {status.day} من الدورة</p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <h4 className="font-bold text-green-500 mb-1">{t('common.purityPeriod')}</h4>
                            <p className="text-xs text-zinc-400">أنتِ على طهارة الآن</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                           <span className="text-xs text-zinc-500 block mb-1">{t('common.cycleDuration')}</span>
                           <span className="font-bold text-white">{cycleInfo.duration} {t('common.days')}</span>
                        </div>
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                           <span className="text-xs text-zinc-500 block mb-1">{t('common.cycleStartDate')}</span>
                           <span className="font-bold text-white">{cycleInfo.startDate}</span>
                        </div>
                    </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-2 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                 <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-zinc-500 leading-relaxed">
                   {t('common.trackerDisclaimer')}
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuranForWomen;
