import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { BookText, Droplets, Info, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuranForWomen: React.FC = () => {
  const { t } = useSettings();
  const [activeTab, setActiveTab] = useState<'mushaf' | 'tracker'>('mushaf');
  
  // State for Purity Tracker
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

  // Calculate current status
  const getPurityStatus = () => {
    const start = new Date(cycleInfo.startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
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

      {/* Tabs */}
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
            <h3 className="font-bold text-white">مصحف التجويد</h3>
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
                 </div>
              ) : (
                <div className="text-center space-y-4">
                    <p className="text-zinc-400 text-sm">{t('common.status')}</p>
                    {status.inCycle ? (
                        <div className="p-4 rounded-xl bg